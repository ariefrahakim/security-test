#!/usr/bin/env node
/*
 * authenticated-walkthrough.js
 *
 * sec-verify worker: log in as owner, enumerate every reachable authenticated
 * feature via Playwright, group by module, and run read-only exploratory
 * security checks per module. State-changing PoCs are recorded as hypotheses
 * (requires_hitl: true) but NOT executed.
 *
 * Rails:
 *   - scope-check.sh on every URL before navigation
 *   - max 60 rpm request cap (600ms min interval)
 *   - killswitch: abort if SEC_AGENT_KILL=1
 *   - evidence: screenshot + DOM snapshot + response headers per route
 *
 * Output artifacts (in <RUN_DIR>):
 *   walkthrough.json           — modules[], scenarios[], routes[], requests[]
 *   findings.verified.json     — per-finding CVSS + evidence path
 *   hypotheses.json            — state-changing tests deferred to HITL
 *   evidence/<module>/*        — screenshots, DOM, response headers
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RUN_DIR = process.argv[2];
if (!RUN_DIR) { console.error('usage: authenticated-walkthrough.js <run-dir>'); process.exit(2); }

const EV_DIR = path.join(RUN_DIR, 'evidence');
fs.mkdirSync(EV_DIR, { recursive: true });

// --- env ---
const envPath = path.join(__dirname, '..', '.env');
const env = {};
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["'](.*)["']$/, '$1');
}
if (env.SEC_AGENT_KILL === '1') { console.error('killswitch on'); process.exit(1); }

const TARGET = env.TARGET_WEB;
const EMAIL = env.EMAIL;
const PASSWORD = env.PASSWORD;
const MIN_INTERVAL_MS = Math.floor(60000 / Number(env.MAX_RPM || 60));

const scopeCheck = path.join(__dirname, 'scope-check.sh');
function inScope(url) {
  try { execSync(`bash "${scopeCheck}" "${url}"`, { stdio: 'pipe' }); return true; }
  catch { return false; }
}

async function main() {
  let chromium;
  try { chromium = require('playwright').chromium; }
  catch { console.error('playwright not installed. run: npm i playwright && npx playwright install chromium'); process.exit(2); }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'sec-verify/1.0 (+authenticated walk-through; authorized owner test)',
    ignoreHTTPSErrors: false,
  });
  const page = await context.newPage();

  // Rate cap.
  let lastReq = 0;
  const requestLog = [];
  page.on('request', r => {
    requestLog.push({ ts: Date.now(), method: r.method(), url: r.url() });
  });
  const responseHeaders = {};
  page.on('response', async r => {
    const u = r.url();
    if (!responseHeaders[u]) {
      try { responseHeaders[u] = { status: r.status(), headers: r.headers() }; }
      catch {}
    }
  });

  async function go(url) {
    if (!inScope(url)) throw new Error('out-of-scope: ' + url);
    const wait = MIN_INTERVAL_MS - (Date.now() - lastReq);
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    lastReq = Date.now();
    return page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(e => ({ err: e.message }));
  }

  const walkthrough = { target: TARGET, started_at: new Date().toISOString(), modules: [], routes_visited: [], scenarios: [] };
  const findings = [];
  const hypotheses = [];
  let fid = 1;
  function addFinding(f) {
    findings.push({ id: 'V-' + String(fid++).padStart(2, '0'), ...f });
  }

  async function snapshot(moduleSlug, name) {
    const dir = path.join(EV_DIR, moduleSlug);
    fs.mkdirSync(dir, { recursive: true });
    const png = path.join(dir, name + '.png');
    const html = path.join(dir, name + '.html');
    const headersFile = path.join(dir, name + '.headers.json');
    try { await page.screenshot({ path: png, fullPage: true }); } catch {}
    try { fs.writeFileSync(html, await page.content()); } catch {}
    try { fs.writeFileSync(headersFile, JSON.stringify(responseHeaders[page.url()] || {}, null, 2)); } catch {}
    return { screenshot: png, dom: html, headers: headersFile, url: page.url() };
  }

  // ---------- MODULE: Landing (pre-auth) ----------
  const modLanding = { slug: 'landing', name: 'Landing (pre-auth)', routes: [], features: [], scenarios: [], findings: [], coverage: '' };
  await go(TARGET + '/');
  modLanding.routes.push(page.url());
  const landingEv = await snapshot('landing', 'home');
  modLanding.features.push('Public landing page; links to /login, /signup');
  modLanding.scenarios.push({ id: 'S-L1', desc: 'Load landing, capture headers', result: 'pass', evidence: landingEv });

  // Header checks (verified) — re-observe.
  const lh = responseHeaders[TARGET + '/'] || responseHeaders[page.url()] || {};
  const H = lh.headers || {};
  const missing = ['strict-transport-security','content-security-policy','x-frame-options','x-content-type-options','referrer-policy','permissions-policy'].filter(h => !H[h]);
  if (missing.length) {
    for (const h of missing) {
      const sevMap = { 'strict-transport-security':'MEDIUM','content-security-policy':'MEDIUM','x-frame-options':'LOW','x-content-type-options':'LOW','referrer-policy':'LOW','permissions-policy':'LOW' };
      addFinding({
        module: 'landing',
        sev: sevMap[h],
        confidence: 'verified',
        category: 'A05:2021 Security Misconfiguration',
        cwe: 'CWE-693',
        title: `Missing security header: ${h}`,
        evidence: `Header \`${h}\` absent on ${page.url()}. See ${landingEv.headers}`,
        evidence_path: landingEv.headers,
        cvss4: { vector: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N', score: 2.3 },
        recommendation: `Add \`${h}\` at edge (Caddy/Next config).`,
      });
    }
  }
  if (H['x-powered-by']) {
    addFinding({ module:'landing', sev:'LOW', confidence:'verified', category:'A05:2021 Security Misconfiguration', cwe:'CWE-200',
      title:'Framework fingerprinting via X-Powered-By',
      evidence:`x-powered-by: ${H['x-powered-by']} on ${page.url()}. See ${landingEv.headers}`,
      evidence_path: landingEv.headers,
      cvss4:{vector:'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N', score:2.3},
      recommendation:'Strip banner (poweredByHeader:false in next.config.js).' });
  }
  modLanding.findings = findings.filter(f => f.module === 'landing').map(f => f.id);
  modLanding.coverage = 'Read-only: header capture, DOM snapshot. Skipped: signup form fuzz (state-changing, HITL).';
  walkthrough.modules.push(modLanding);

  // ---------- MODULE: Auth (login/logout/reset) ----------
  const modAuth = { slug: 'auth', name: 'Authentication', routes: [], features: [], scenarios: [], findings: [], coverage: '' };
  await go(TARGET + '/login');
  modAuth.routes.push(page.url());
  const loginEv = await snapshot('auth', 'login-page');
  modAuth.features.push('Email + password login; links to /forgot-password, /signup, /login/2fa');

  // Scenario: empty submit
  try {
    await page.fill('input[type=email], input[name=email], input#email', '');
    modAuth.scenarios.push({ id:'S-A0', desc:'Locate email/password inputs', result:'pass', evidence: loginEv });
  } catch { modAuth.scenarios.push({ id:'S-A0', desc:'Locate email/password inputs', result:'fail', note:'selectors not found; capturing DOM' }); }

  // Scenario: wrong password (read-only probe of error handling / user enumeration)
  await page.fill('input[type=email], input[name=email], input#email', EMAIL).catch(()=>{});
  await page.fill('input[type=password], input[name=password], input#password', 'wrong-password-xyz').catch(()=>{});
  await Promise.all([
    page.waitForLoadState('networkidle', { timeout: 8000 }).catch(()=>{}),
    page.click('button[type=submit], button:has-text("Sign in"), button:has-text("Log in")').catch(()=>{}),
  ]);
  const wrongEv = await snapshot('auth', 'login-wrong-password');
  const bodyWrong = await page.content();
  const enumHint = /no (such )?user|user not found|email (is )?not registered/i.test(bodyWrong);
  modAuth.scenarios.push({
    id: 'S-A1',
    desc: 'Submit valid email + wrong password; observe error message for user-enumeration',
    result: enumHint ? 'finding' : 'pass',
    evidence: wrongEv,
    observed: enumHint ? 'Error message distinguishes user-exists vs user-not-found' : 'Generic error / no user-enumeration hint detected',
  });
  if (enumHint) {
    addFinding({ module:'auth', sev:'LOW', confidence:'verified', category:'A07:2021 Identification & Auth Failures', cwe:'CWE-204',
      title:'User enumeration via login error message',
      evidence:`Distinct error text on wrong-password vs unknown-email. See ${wrongEv.dom}`,
      evidence_path: wrongEv.dom,
      cvss4:{vector:'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N', score:5.3},
      recommendation:'Return a single generic message for all authentication failures.' });
  }

  // Scenario: successful login
  await page.fill('input[type=password], input[name=password], input#password', PASSWORD).catch(()=>{});
  const before = page.url();
  await Promise.all([
    page.waitForLoadState('networkidle', { timeout: 15000 }).catch(()=>{}),
    page.click('button[type=submit], button:has-text("Sign in"), button:has-text("Log in")').catch(()=>{}),
  ]);
  await page.waitForTimeout(1500);
  const after = page.url();
  const loginOk = after !== before && !/\/login(\?|$)/.test(after);
  const postLoginEv = await snapshot('auth', 'post-login');
  modAuth.scenarios.push({
    id: 'S-A2',
    desc: 'Login with correct credentials',
    result: loginOk ? 'pass' : 'fail',
    evidence: postLoginEv,
    observed: loginOk ? `Redirected to ${after}` : `Still at ${after}; no session established`,
  });

  // Cookie flag check on session cookies
  const cookies = await context.cookies();
  const sessionCookies = cookies.filter(c => /session|auth|token|sid|jwt|next-auth/i.test(c.name));
  const badCookies = sessionCookies.filter(c => !(c.httpOnly && c.secure && (c.sameSite === 'Lax' || c.sameSite === 'Strict')));
  fs.writeFileSync(path.join(EV_DIR,'auth','cookies.json'), JSON.stringify(cookies, null, 2));
  modAuth.scenarios.push({ id:'S-A3', desc:'Inspect session cookie flags', result: badCookies.length ? 'finding' : 'pass', evidence:{ headers: path.join(EV_DIR,'auth','cookies.json') } });
  if (badCookies.length) {
    addFinding({ module:'auth', sev:'MEDIUM', confidence:'verified', category:'A05:2021 Security Misconfiguration', cwe:'CWE-1004',
      title:'Session cookie missing hardening flags',
      evidence:`Cookies without HttpOnly+Secure+SameSite: ${badCookies.map(c=>c.name).join(', ')}. See ${path.join(EV_DIR,'auth','cookies.json')}`,
      evidence_path: path.join(EV_DIR,'auth','cookies.json'),
      cvss4:{vector:'CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:P/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N', score:4.6},
      recommendation:'Set HttpOnly, Secure, SameSite=Lax (or Strict) on all session cookies.' });
  }
  modAuth.coverage = 'Read-only: login form, wrong-password error, session cookies. Deferred (HITL): password reset flow, 2FA enrolment.';

  // Hypotheses for HITL (state-changing)
  hypotheses.push({ id:'H-A1', title:'Password reset token reuse / no expiry', based_on:['/forgot-password route enumerated'], test_plan:'Request reset email twice, attempt to reuse first token after second issued', requires_hitl:true });
  hypotheses.push({ id:'H-A2', title:'Login rate-limit bypass', based_on:['login endpoint'], test_plan:'50 rapid wrong-password attempts; observe lockout', requires_hitl:true });

  walkthrough.modules.push(modAuth);

  // ---------- Post-login: enumerate all reachable modules ----------
  if (loginOk) {
    // Extract nav links from current DOM.
    const links = await page.$$eval('a[href]', els => els.map(e => ({ href: e.getAttribute('href'), text: (e.textContent || '').trim().slice(0, 80) })));
    const seen = new Set();
    const authedRoutes = [];
    for (const l of links) {
      if (!l.href || l.href.startsWith('#') || l.href.startsWith('mailto:') || l.href.startsWith('tel:')) continue;
      let abs;
      try { abs = new URL(l.href, page.url()).toString(); } catch { continue; }
      if (!abs.startsWith(TARGET)) continue;
      if (seen.has(abs)) continue;
      seen.add(abs);
      authedRoutes.push({ url: abs, text: l.text });
    }
    fs.writeFileSync(path.join(RUN_DIR, 'authed-links.json'), JSON.stringify(authedRoutes, null, 2));
    walkthrough.discovered_links = authedRoutes;

    // Group by top-level path segment → module.
    const byModule = {};
    for (const r of authedRoutes) {
      const p = new URL(r.url).pathname;
      const seg = (p.split('/').filter(Boolean)[0] || 'root').toLowerCase();
      if (/^(login|logout|signup|forgot-password|reset-password|verify|verify-email)$/.test(seg)) continue;
      (byModule[seg] = byModule[seg] || []).push(r);
    }

    const modNames = {
      dashboard:'Dashboard', projects:'Projects', users:'Users', teams:'Teams', settings:'Settings',
      billing:'Billing', 'api-keys':'API Keys', account:'Account', admin:'Admin', profile:'Profile',
      notifications:'Notifications', reports:'Reports', integrations:'Integrations', workspace:'Workspace',
      organizations:'Organizations', org:'Organization', app:'App', home:'Home', root:'Root',
    };

    for (const [slug, rs] of Object.entries(byModule)) {
      const mod = { slug, name: modNames[slug] || (slug.charAt(0).toUpperCase()+slug.slice(1)), routes: [], features: [], scenarios: [], findings: [], coverage: '' };
      let scenarioN = 0;
      for (const r of rs.slice(0, 10)) { // cap 10 routes/module for run-time
        const res = await go(r.url);
        if (res && res.err) {
          mod.scenarios.push({ id:`S-${slug.toUpperCase()}-${++scenarioN}`, desc:`Navigate ${r.url}`, result:'fail', note:res.err });
          continue;
        }
        mod.routes.push(page.url());
        const evName = 'route-' + (mod.routes.length);
        const ev = await snapshot(slug, evName);
        mod.scenarios.push({ id:`S-${slug.toUpperCase()}-${++scenarioN}`, desc:`Navigate ${r.url} (nav text: "${r.text}")`, result:'pass', evidence:ev });

        // Read-only exploratory probes on the loaded page.
        const html = await page.content();
        // 1. Reflected input? — check if URL query keys appear unencoded in DOM.
        const u = new URL(page.url());
        for (const [k, v] of u.searchParams) {
          if (v && html.includes(v)) {
            mod.scenarios.push({ id:`S-${slug.toUpperCase()}-${++scenarioN}`, desc:`Query param "${k}" value reflected in DOM at ${page.url()}`, result:'finding', evidence:ev });
            hypotheses.push({ id:`H-${slug}-refl-${k}`, title:`Reflected XSS candidate: ${k} on ${u.pathname}`, based_on:[page.url()], test_plan:`Send payload <svg/onload=alert(1)> in ?${k}=`, requires_hitl:true });
          }
        }
        // 2. CSRF token presence on forms.
        const forms = await page.$$eval('form', fs => fs.map(f => ({
          action: f.getAttribute('action'),
          method: (f.getAttribute('method')||'GET').toUpperCase(),
          hasCsrf: !!f.querySelector('input[name*="csrf" i], input[name*="_token" i], meta[name="csrf-token"]'),
        })));
        for (const f of forms) {
          if (f.method !== 'GET' && !f.hasCsrf) {
            mod.scenarios.push({ id:`S-${slug.toUpperCase()}-${++scenarioN}`, desc:`Form action=${f.action} method=${f.method} lacks visible CSRF token`, result:'finding', evidence:ev });
            addFinding({ module:slug, sev:'LOW', confidence:'probable', category:'A01:2021 Broken Access Control', cwe:'CWE-352',
              title:`Form on ${u.pathname} has no visible CSRF token`,
              evidence:`Form action=${f.action} method=${f.method}. Framework may use SameSite/double-submit; needs verification. See ${ev.dom}`,
              evidence_path: ev.dom,
              cvss4:{vector:'CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N', score:2.3},
              recommendation:'Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.' });
          }
        }
        // 3. Sensitive data in response body.
        const sensitiveHits = [];
        if (/-----BEGIN (RSA|EC|PRIVATE) KEY-----/.test(html)) sensitiveHits.push('private-key');
        if (/AKIA[0-9A-Z]{16}/.test(html)) sensitiveHits.push('aws-access-key');
        if (/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/.test(html)) sensitiveHits.push('jwt-in-html');
        if (sensitiveHits.length) {
          addFinding({ module:slug, sev:'HIGH', confidence:'verified', category:'A02:2021 Cryptographic Failures', cwe:'CWE-200',
            title:`Sensitive data in HTML at ${u.pathname}: ${sensitiveHits.join(', ')}`,
            evidence:`Pattern matches: ${sensitiveHits.join(', ')}. See ${ev.dom}`,
            evidence_path: ev.dom,
            cvss4:{vector:'CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N', score:6.9},
            recommendation:'Remove secrets from server-rendered HTML; move to server-side session/API.' });
        }
        // 4. Numeric IDs in path → IDOR hypothesis (HITL to test other tenants).
        const idMatch = u.pathname.match(/\/(\d+)(?:\/|$)/);
        if (idMatch) {
          hypotheses.push({ id:`H-${slug}-idor-${idMatch[1]}`, title:`IDOR candidate: numeric id ${idMatch[1]} in ${u.pathname}`, based_on:[page.url()], test_plan:`Fetch ${u.pathname.replace(idMatch[1], String(Number(idMatch[1])-1))} unauth and cross-tenant`, requires_hitl:true });
          mod.scenarios.push({ id:`S-${slug.toUpperCase()}-${++scenarioN}`, desc:`Numeric object id in path (${idMatch[1]}) — IDOR hypothesis logged`, result:'pending-hitl' });
        }
        // 5. External script origins vs CSP.
        const externalScripts = await page.$$eval('script[src]', ss => ss.map(s => s.src).filter(src => {
          try { return new URL(src).host !== location.host; } catch { return false; }
        }));
        if (externalScripts.length && !(responseHeaders[page.url()] && responseHeaders[page.url()].headers['content-security-policy'])) {
          mod.scenarios.push({ id:`S-${slug.toUpperCase()}-${++scenarioN}`, desc:`${externalScripts.length} external script(s) loaded, no CSP`, result:'note', evidence:ev, note:externalScripts.slice(0,5).join(', ') });
        }

        // Feature description guess from title + h1.
        const title = await page.title();
        const h1 = await page.$eval('h1', e => e.textContent.trim()).catch(()=>null);
        if (title || h1) mod.features.push(`${title || ''}${h1 ? ' — '+h1 : ''}`.trim());
      }
      mod.coverage = `Visited ${mod.routes.length}/${rs.length} discovered route(s). State-changing actions (create/edit/delete) deferred to HITL.`;
      mod.findings = findings.filter(f => f.module === slug).map(f => f.id);
      walkthrough.modules.push(mod);
    }
  } else {
    walkthrough.login_failed = true;
  }

  walkthrough.finished_at = new Date().toISOString();
  walkthrough.scenarios = walkthrough.modules.flatMap(m => m.scenarios.map(s => ({ module: m.slug, ...s })));
  walkthrough.routes_visited = walkthrough.modules.flatMap(m => m.routes);

  fs.writeFileSync(path.join(RUN_DIR, 'walkthrough.json'), JSON.stringify(walkthrough, null, 2));
  fs.writeFileSync(path.join(RUN_DIR, 'findings.verified.json'), JSON.stringify({
    meta: { generated_at: new Date().toISOString(), generator: 'authenticated-walkthrough.js v1' },
    findings,
  }, null, 2));
  fs.writeFileSync(path.join(RUN_DIR, 'hypotheses.json'), JSON.stringify({ hypotheses }, null, 2));
  fs.writeFileSync(path.join(RUN_DIR, 'requests.log.json'), JSON.stringify(requestLog, null, 2));

  await browser.close();
  console.log(`walkthrough done: ${walkthrough.modules.length} modules, ${walkthrough.scenarios.length} scenarios, ${findings.length} findings, ${hypotheses.length} hypotheses`);
}

main().catch(e => { console.error('walkthrough fatal:', e.message); process.exit(1); });
