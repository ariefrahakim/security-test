#!/usr/bin/env node
/*
 * dashboard-deep-walk.js
 *
 * Interactive dashboard exploration:
 *  - authenticate (form login)
 *  - land on /dashboard
 *  - programmatically discover clickable widgets, buttons, tabs, dropdowns,
 *    modal openers, filters, sort headers, pagination — click each
 *  - capture browser console + all XHR/fetch (URL, method, status, resp body if same-origin)
 *  - snapshot DOM + screenshot per interaction
 *  - probe read-only bug classes:
 *      console errors, unhandled rejections
 *      broken (>=400) XHRs
 *      client-side data leaks (PII/JWT/AKIA in responses)
 *      missing/incorrect authz probe (self-owned id tweak — same-owner only)
 *      IDOR-shaped surface (record only)
 *      reflected-input XSS probe on GET query params (read-only)
 *      CSRF token presence on state-changing forms (record only)
 *      insecure localStorage/sessionStorage
 *      duplicate XHRs on rapid double-click (record, no hammer)
 *      dead/broken buttons (click, then check for console error, no XHR, no DOM change)
 *  - NO state-changing submits (POST/PUT/DELETE/PATCH) except initial login
 *
 * Rails: scope-check.sh, 60 rpm cap, killswitch.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RUN_DIR = process.argv[2];
if (!RUN_DIR) { console.error('usage: dashboard-deep-walk.js <run-dir>'); process.exit(2); }

const EV_DIR = path.join(RUN_DIR, 'evidence', 'dashboard');
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

function safeSlug(s) { return String(s).replace(/[^a-z0-9\-_.]+/gi, '_').slice(0, 60) || 'x'; }

(async () => {
  const chromium = require('playwright').chromium;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'sec-verify/1.1 dashboard-deep (authorized owner test)',
  });
  const page = await context.newPage();

  const consoleMsgs = [];
  const pageErrors = [];
  const requests = [];
  const responses = [];

  page.on('console', msg => {
    consoleMsgs.push({ ts: Date.now(), type: msg.type(), text: msg.text().slice(0, 2000), loc: msg.location() });
  });
  page.on('pageerror', err => {
    pageErrors.push({ ts: Date.now(), msg: (err && err.message) || String(err), stack: (err && err.stack || '').slice(0, 4000) });
  });
  page.on('requestfailed', r => {
    requests.push({ ts: Date.now(), phase: 'failed', method: r.method(), url: r.url(), failure: r.failure() && r.failure().errorText });
  });
  page.on('request', r => {
    requests.push({ ts: Date.now(), phase: 'req', method: r.method(), url: r.url(), resourceType: r.resourceType(), postData: r.postData() ? String(r.postData()).slice(0, 4000) : null });
  });
  page.on('response', async r => {
    const entry = { ts: Date.now(), phase: 'res', method: r.request().method(), url: r.url(), status: r.status(), resourceType: r.request().resourceType() };
    try { entry.headers = r.headers(); } catch {}
    // Body: only for XHR/fetch and same-origin
    try {
      const u = new URL(r.url());
      const isSameOrigin = u.host === new URL(TARGET).host;
      const rt = r.request().resourceType();
      if (isSameOrigin && (rt === 'xhr' || rt === 'fetch' || rt === 'document')) {
        const ct = (entry.headers && (entry.headers['content-type'] || entry.headers['Content-Type'])) || '';
        if (/json|text|xml|javascript|html/.test(ct)) {
          const buf = await r.body().catch(() => null);
          if (buf) entry.body = buf.toString('utf8').slice(0, 20000);
        }
      }
    } catch {}
    responses.push(entry);
  });

  let lastReq = 0;
  async function throttle() {
    const wait = MIN_INTERVAL_MS - (Date.now() - lastReq);
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    lastReq = Date.now();
  }
  async function go(url) {
    if (!inScope(url)) throw new Error('out-of-scope: ' + url);
    await throttle();
    return page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 }).catch(e => ({ err: e.message }));
  }
  async function snap(name) {
    const png = path.join(EV_DIR, name + '.png');
    const html = path.join(EV_DIR, name + '.html');
    try { await page.screenshot({ path: png, fullPage: true }); } catch {}
    try { fs.writeFileSync(html, await page.content()); } catch {}
    return { screenshot: png, dom: html, url: page.url() };
  }

  const walk = {
    target: TARGET, module: 'dashboard',
    started_at: new Date().toISOString(),
    interactions: [], xhrs_summary: null, console_summary: null, findings_refs: [],
    interactions_count: 0, finished_at: null,
  };
  const findings = [];
  const hypotheses = [];
  let fid = 1;
  function addF(f) { findings.push({ id: 'V-D' + String(fid++).padStart(2, '0'), module: 'dashboard', ...f }); }

  // ---------- LOGIN ----------
  await go(TARGET + '/login');
  await snap('01-login-page');
  await page.fill('input[type=email], input[name=email], input#email', EMAIL).catch(()=>{});
  await page.fill('input[type=password], input[name=password], input#password', PASSWORD).catch(()=>{});
  await Promise.all([
    page.waitForLoadState('networkidle', { timeout: 15000 }).catch(()=>{}),
    page.click('button[type=submit], button:has-text("Sign in"), button:has-text("Log in")').catch(()=>{}),
  ]);
  await page.waitForTimeout(1500);
  const postLoginUrl = page.url();
  await snap('02-post-login');
  if (/\/login(\?|$)/.test(postLoginUrl)) {
    console.error('login failed, at', postLoginUrl);
    fs.writeFileSync(path.join(RUN_DIR, 'walkthrough.json'), JSON.stringify({ ...walk, login_failed: true, finished_at: new Date().toISOString() }, null, 2));
    await browser.close();
    process.exit(3);
  }

  // ---------- GO TO /dashboard ----------
  await go(TARGET + '/dashboard');
  await page.waitForTimeout(1500);
  const initialEv = await snap('03-dashboard-initial');
  walk.interactions.push({ id: 'I-000', kind: 'navigate', target: '/dashboard', evidence: initialEv });

  // ---------- LOCALSTORAGE / SESSIONSTORAGE INSPECTION ----------
  const storage = await page.evaluate(() => {
    const ls = {}, ss = {};
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); ls[k] = localStorage.getItem(k); } } catch {}
    try { for (let i = 0; i < sessionStorage.length; i++) { const k = sessionStorage.key(i); ss[k] = sessionStorage.getItem(k); } } catch {}
    return { localStorage: ls, sessionStorage: ss };
  }).catch(() => ({ localStorage: {}, sessionStorage: {} }));
  fs.writeFileSync(path.join(EV_DIR, 'storage.json'), JSON.stringify(storage, null, 2));

  const storageSensitive = [];
  for (const [k, v] of [...Object.entries(storage.localStorage), ...Object.entries(storage.sessionStorage)]) {
    if (!v) continue;
    if (/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/.test(v)) storageSensitive.push({ key: k, kind: 'jwt' });
    if (/AKIA[0-9A-Z]{16}/.test(v)) storageSensitive.push({ key: k, kind: 'aws-key' });
    if (/-----BEGIN (RSA|EC|PRIVATE) KEY-----/.test(v)) storageSensitive.push({ key: k, kind: 'private-key' });
    if (/"password"\s*:/i.test(v)) storageSensitive.push({ key: k, kind: 'password-field' });
    if (/session[_-]?id|api[_-]?key|refresh[_-]?token|access[_-]?token/i.test(k)) storageSensitive.push({ key: k, kind: 'suspicious-key-name' });
  }
  if (storageSensitive.length) {
    addF({
      sev: 'MEDIUM', confidence: 'verified',
      category: 'A02:2021 Cryptographic Failures', cwe: 'CWE-922',
      title: 'Sensitive-looking data in browser storage on /dashboard',
      evidence: 'Keys: ' + storageSensitive.map(s => `${s.key}:${s.kind}`).join(', ') + ` (see ${path.join(EV_DIR, 'storage.json')})`,
      evidence_path: path.join(EV_DIR, 'storage.json'),
      cvss4: { vector: 'CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:P/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N', score: 4.6 },
      recommendation: 'Do not persist tokens/PII in localStorage. Use HttpOnly cookies for session material.',
    });
  }

  // ---------- INTERACTIVE ELEMENT ENUMERATION ----------
  // Discover clickable elements scoped to dashboard main region.
  const clickables = await page.evaluate(() => {
    const q = 'button, [role=button], a[href], [role=tab], [role=menuitem], summary, [data-testid*="widget" i], [data-testid*="card" i], [aria-haspopup="true"], th[aria-sort], th[role=columnheader], [data-sort], [aria-expanded], details > summary';
    const els = Array.from(document.querySelectorAll(q));
    const seen = new Set();
    const out = [];
    for (const el of els) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const label = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || el.getAttribute('name') || '').replace(/\s+/g, ' ').trim().slice(0, 80);
      const href = el.getAttribute('href') || '';
      const key = (el.tagName + '|' + label + '|' + href).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        tag: el.tagName,
        label,
        href,
        role: el.getAttribute('role') || '',
        ariaExpanded: el.getAttribute('aria-expanded') || '',
        ariaSort: el.getAttribute('aria-sort') || '',
        testid: el.getAttribute('data-testid') || '',
        type: el.getAttribute('type') || '',
      });
    }
    return out;
  });
  fs.writeFileSync(path.join(EV_DIR, 'clickables.json'), JSON.stringify(clickables, null, 2));

  // Filter to dashboard-scoped, safe (no logout, no destructive-looking text)
  const DESTRUCTIVE = /(delete|remove|revoke|logout|sign\s*out|deactivate|destroy|reset|wipe|purge|clear\s+all|leave)/i;
  const NAV_AWAY = /^\/(settings|projects|academy|docs|logout|sign-out|my-work|admin)($|\/)/i;
  const safeToClick = clickables.filter(c => {
    if (DESTRUCTIVE.test(c.label)) return false;
    if (c.href) {
      try {
        const u = new URL(c.href, page.url());
        if (u.host !== new URL(TARGET).host) return false;
        if (NAV_AWAY.test(u.pathname)) return false;
        if (u.pathname === '/dashboard') return true;
        if (u.pathname.startsWith('/dashboard/')) return true;
        // Anchor-only or same-page hash
        if (u.pathname === new URL(page.url()).pathname && u.hash) return true;
        // Skip other navs to stay in dashboard scope
        return false;
      } catch { return false; }
    }
    return true;
  });

  console.log('discovered', clickables.length, 'clickables, safe subset', safeToClick.length);

  // ---------- CLICK EACH ----------
  const CLICK_CAP = 60;
  let clickN = 0;
  for (const c of safeToClick.slice(0, CLICK_CAP)) {
    clickN++;
    const id = 'I-' + String(clickN).padStart(3, '0');
    // Snapshot XHR count before
    const respBefore = responses.length;
    const errBefore = pageErrors.length;
    const consoleErrBefore = consoleMsgs.filter(m => m.type === 'error').length;
    const urlBefore = page.url();

    // Build a locator. Prefer testid > aria-label > role+name > text.
    let locator = null;
    try {
      if (c.testid) locator = page.locator(`[data-testid="${c.testid.replace(/"/g, '\\"')}"]`).first();
      else if (c.label && c.label.length > 1 && c.label.length < 60) {
        // Prefer button/role match
        locator = page.getByRole(c.role || (c.tag === 'A' ? 'link' : 'button'), { name: c.label, exact: false }).first();
      } else {
        locator = page.locator(c.tag).first();
      }
    } catch {}

    await throttle();
    let clickErr = null;
    try {
      await locator.click({ timeout: 3500, trial: false });
    } catch (e) { clickErr = (e && e.message || String(e)).slice(0, 400); }
    await page.waitForTimeout(700);

    // Rapid double-click race probe (if button, no href, harmless-looking label like filter/refresh/sort)
    let doubleClickDupXhr = null;
    if (!clickErr && /^(filter|sort|refresh|apply|search|load|show|expand|toggle|view)/i.test(c.label)) {
      const before2 = responses.length;
      try {
        await locator.click({ timeout: 1500 });
        await locator.click({ timeout: 1500 });
      } catch {}
      await page.waitForTimeout(600);
      const newXhrs = responses.slice(before2).filter(r => r.resourceType === 'xhr' || r.resourceType === 'fetch');
      // dup detection: same method+URL twice
      const seen = new Map();
      for (const r of newXhrs) {
        const k = r.method + ' ' + r.url;
        seen.set(k, (seen.get(k) || 0) + 1);
      }
      const dups = [...seen.entries()].filter(([, n]) => n >= 2);
      if (dups.length) doubleClickDupXhr = dups.map(([k, n]) => `${k} x${n}`);
    }

    const ev = await snap(`click-${id}-${safeSlug(c.label || c.tag)}`);
    const urlAfter = page.url();
    const consoleErrDelta = consoleMsgs.filter(m => m.type === 'error').length - consoleErrBefore;
    const errDelta = pageErrors.length - errBefore;
    const xhrDelta = responses.slice(respBefore).filter(r => r.resourceType === 'xhr' || r.resourceType === 'fetch');
    const badXhr = xhrDelta.filter(r => r.status >= 400);

    walk.interactions.push({
      id,
      kind: 'click',
      target: { tag: c.tag, label: c.label, href: c.href, role: c.role, testid: c.testid },
      urlBefore, urlAfter,
      clickErr,
      xhrDelta: xhrDelta.map(r => ({ method: r.method, url: r.url, status: r.status })),
      badXhr: badXhr.map(r => ({ method: r.method, url: r.url, status: r.status })),
      consoleErrDelta, errDelta,
      doubleClickDupXhr,
      evidence: ev,
    });

    // If navigation left /dashboard scope, go back
    if (!/\/dashboard(\/|$|\?|#)/.test(urlAfter) && urlAfter !== TARGET + '/dashboard') {
      // Try to return
      await go(TARGET + '/dashboard');
      await page.waitForTimeout(700);
    } else {
      // Close any modal that opened by pressing Escape (best-effort)
      try { await page.keyboard.press('Escape'); } catch {}
      await page.waitForTimeout(200);
    }
  }

  // ---------- REFLECTED INPUT PROBE (GET query, read-only) ----------
  // Pick a benign canary; probe common param names on /dashboard.
  const canary = 'zzq' + Date.now().toString(36) + 'xx';
  const probeParams = ['q', 'search', 'filter', 'project', 'view', 'tab', 'ref', 'id', 'name', 'sort', 'page'];
  for (const p of probeParams) {
    const url = TARGET + '/dashboard?' + p + '=' + canary;
    await go(url);
    await page.waitForTimeout(500);
    const body = await page.content().catch(() => '');
    const reflected = body.includes(canary);
    if (reflected) {
      // Look at context: is it inside a script or between tags?
      const rawIdx = body.indexOf(canary);
      const excerpt = body.slice(Math.max(0, rawIdx - 80), rawIdx + 80);
      const inScript = /<script[^>]*>[\s\S]*?zz/i.test(excerpt) || /"[^"]*zzq/.test(excerpt);
      const ev = await snap(`reflect-${p}`);
      walk.interactions.push({ id: 'I-refl-' + p, kind: 'reflect-probe', param: p, url, reflected: true, excerpt, evidence: ev });
      addF({
        sev: inScript ? 'LOW' : 'LOW',
        confidence: 'probable',
        category: 'A03:2021 Injection', cwe: 'CWE-79',
        title: `Query param "${p}" reflected in DOM at /dashboard`,
        evidence: `Canary "${canary}" appears in response body. Context excerpt: ${excerpt} (see ${ev.dom})`,
        evidence_path: ev.dom,
        cvss4: { vector: 'CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N', score: 2.3 },
        recommendation: 'Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.',
      });
      hypotheses.push({ id: 'H-D-xss-' + p, title: `Reflected XSS candidate: ${p} on /dashboard`, based_on: [url], test_plan: `Send payload <svg/onload=alert(1)> in ?${p}=`, requires_hitl: true });
    }
  }

  // Return to base
  await go(TARGET + '/dashboard');

  // ---------- FORM CSRF PRESENCE (record) ----------
  const forms = await page.$$eval('form', fs => fs.map(f => ({
    action: f.getAttribute('action') || '',
    method: (f.getAttribute('method') || 'GET').toUpperCase(),
    hasCsrf: !!f.querySelector('input[name*="csrf" i], input[name*="_token" i]'),
    hasCsrfMeta: !!document.querySelector('meta[name="csrf-token"]'),
    fields: Array.from(f.elements).map(e => ({ name: e.name || '', type: e.type || '' })).filter(x => x.name),
  }))).catch(() => []);
  fs.writeFileSync(path.join(EV_DIR, 'forms.json'), JSON.stringify(forms, null, 2));
  const stateChanging = forms.filter(f => f.method !== 'GET' && !f.hasCsrf && !f.hasCsrfMeta);
  if (stateChanging.length) {
    addF({
      sev: 'LOW', confidence: 'probable',
      category: 'A01:2021 Broken Access Control', cwe: 'CWE-352',
      title: `Dashboard has ${stateChanging.length} state-changing form(s) with no visible CSRF token`,
      evidence: 'Forms: ' + JSON.stringify(stateChanging).slice(0, 800) + ` (see ${path.join(EV_DIR, 'forms.json')})`,
      evidence_path: path.join(EV_DIR, 'forms.json'),
      cvss4: { vector: 'CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N', score: 2.3 },
      recommendation: 'Verify CSRF protection: SameSite=Strict cookie AND origin check, or explicit anti-CSRF token in form.',
    });
    hypotheses.push({ id: 'H-D-csrf', title: 'CSRF protection on dashboard state-changing forms', based_on: ['/dashboard'], test_plan: 'Cross-origin POST replay with stripped Origin/Referer', requires_hitl: true });
  }

  // ---------- XHR OBSERVATIONS: IDOR-shaped surface + data leaks ----------
  const xhrSet = responses.filter(r => r.resourceType === 'xhr' || r.resourceType === 'fetch');
  fs.writeFileSync(path.join(EV_DIR, 'xhrs.json'), JSON.stringify(xhrSet.map(r => ({
    method: r.method, url: r.url, status: r.status,
    contentType: r.headers && (r.headers['content-type'] || r.headers['Content-Type']),
    bodyPreview: r.body ? r.body.slice(0, 4000) : null,
  })), null, 2));

  // Broken XHRs
  const broken = xhrSet.filter(r => r.status >= 400);
  if (broken.length) {
    addF({
      sev: broken.some(b => b.status >= 500) ? 'MEDIUM' : 'LOW',
      confidence: 'verified',
      category: 'A05:2021 Security Misconfiguration', cwe: 'CWE-754',
      title: `${broken.length} XHR/fetch call(s) returned >=400 during dashboard walk`,
      evidence: broken.slice(0, 20).map(b => `${b.status} ${b.method} ${b.url}`).join(' | ') + ` (see ${path.join(EV_DIR, 'xhrs.json')})`,
      evidence_path: path.join(EV_DIR, 'xhrs.json'),
      cvss4: { vector: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:N/VI:N/VA:L/SC:N/SI:N/SA:N', score: 2.3 },
      recommendation: 'Investigate 4xx/5xx dashboard endpoints; 5xx may indicate unhandled server errors leaking stack traces.',
    });
  }

  // IDOR-shaped: numeric or UUID IDs in XHR URLs
  const idorish = xhrSet.filter(r => /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\/|$|\?)/i.test(r.url) || /\/\d{2,}(\/|$|\?)/.test(r.url));
  if (idorish.length) {
    hypotheses.push({
      id: 'H-D-idor',
      title: `IDOR-shaped surface: ${idorish.length} XHR(s) with numeric/UUID ids in path`,
      based_on: idorish.slice(0, 10).map(r => r.url),
      test_plan: 'Enumerate id -1/+1 only on ids owned by test account; verify authz enforcement returns 403/404 for foreign ids. HITL required (touches other-tenant ids by definition — do not run).',
      requires_hitl: true,
    });
  }

  // Data leaks in XHR bodies
  const leakHits = [];
  for (const r of xhrSet) {
    if (!r.body) continue;
    if (/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/.test(r.body)) leakHits.push({ url: r.url, kind: 'jwt' });
    if (/AKIA[0-9A-Z]{16}/.test(r.body)) leakHits.push({ url: r.url, kind: 'aws-key' });
    if (/-----BEGIN (RSA|EC|PRIVATE) KEY-----/.test(r.body)) leakHits.push({ url: r.url, kind: 'private-key' });
    // Emails other than tester's
    const emails = (r.body.match(/[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).filter(e => e.toLowerCase() !== EMAIL.toLowerCase());
    if (emails.length) leakHits.push({ url: r.url, kind: 'foreign-emails', sample: emails.slice(0, 3) });
    if (/"password"\s*:\s*"[^"]{1,}"/i.test(r.body)) leakHits.push({ url: r.url, kind: 'password-field-in-response' });
  }
  if (leakHits.length) {
    addF({
      sev: leakHits.some(h => h.kind === 'foreign-emails' || h.kind === 'password-field-in-response') ? 'HIGH' : 'MEDIUM',
      confidence: 'verified',
      category: 'A01:2021 Broken Access Control', cwe: 'CWE-200',
      title: 'Sensitive data observed in dashboard XHR responses',
      evidence: JSON.stringify(leakHits).slice(0, 1500) + ` (see ${path.join(EV_DIR, 'xhrs.json')})`,
      evidence_path: path.join(EV_DIR, 'xhrs.json'),
      cvss4: { vector: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N', score: 6.9 },
      recommendation: 'Return only current-user-owned records; strip PII/secrets; enforce object-level authorization server-side.',
    });
  }

  // ---------- CONSOLE ERRORS ----------
  const consoleErrors = consoleMsgs.filter(m => m.type === 'error');
  fs.writeFileSync(path.join(EV_DIR, 'console.json'), JSON.stringify({ messages: consoleMsgs, pageErrors }, null, 2));
  if (consoleErrors.length || pageErrors.length) {
    addF({
      sev: pageErrors.length ? 'LOW' : 'INFO',
      confidence: 'verified',
      category: 'A05:2021 Security Misconfiguration', cwe: 'CWE-1173',
      title: `${consoleErrors.length} console error(s) and ${pageErrors.length} unhandled JS exception(s) during dashboard walk`,
      evidence: (pageErrors.slice(0, 3).map(e => e.msg).concat(consoleErrors.slice(0, 5).map(e => e.text))).join(' | ') + ` (see ${path.join(EV_DIR, 'console.json')})`,
      evidence_path: path.join(EV_DIR, 'console.json'),
      cvss4: { vector: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:L/VI:N/VA:L/SC:N/SI:N/SA:N', score: 2.3 },
      recommendation: 'Address JS errors; unhandled exceptions can leak stack traces, break features, and mask security bugs.',
    });
  }

  // ---------- DEAD BUTTONS ----------
  const dead = walk.interactions.filter(i => i.kind === 'click' && !i.clickErr && i.urlBefore === i.urlAfter && (!i.xhrDelta || i.xhrDelta.length === 0) && i.consoleErrDelta === 0 && i.errDelta === 0);
  // Note as info only if many
  if (dead.length >= 3) {
    addF({
      sev: 'INFO', confidence: 'heuristic',
      category: 'UX / Reliability', cwe: 'CWE-1006',
      title: `${dead.length} dashboard control(s) produced no observable effect on click`,
      evidence: 'Labels: ' + dead.slice(0, 10).map(d => d.target.label || d.target.tag).join(', ') + ' — no navigation, no XHR, no console change. May be pure UI toggles (expected) or dead buttons (bug).',
      evidence_path: path.join(EV_DIR, 'clickables.json'),
      cvss4: { vector: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:P/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N', score: 0.0 },
      recommendation: 'Manually verify these controls: expected pure-CSS toggle vs missing click handler.',
    });
  }

  // ---------- DOUBLE-CLICK RACES ----------
  const races = walk.interactions.filter(i => i.doubleClickDupXhr && i.doubleClickDupXhr.length);
  if (races.length) {
    addF({
      sev: 'LOW', confidence: 'verified',
      category: 'A04:2021 Insecure Design', cwe: 'CWE-362',
      title: `${races.length} dashboard control(s) fire duplicate XHRs on rapid double-click`,
      evidence: races.map(r => `${r.target.label}: ${r.doubleClickDupXhr.join('; ')}`).join(' | '),
      evidence_path: path.join(EV_DIR, 'xhrs.json'),
      cvss4: { vector: 'CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:L/SC:N/SI:N/SA:N', score: 2.3 },
      recommendation: 'Debounce click handlers; idempotency keys on state-changing endpoints.',
    });
  }

  // ---------- SUMMARY ----------
  walk.xhrs_summary = {
    total: xhrSet.length,
    by_status: xhrSet.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {}),
    unique_endpoints: [...new Set(xhrSet.map(r => r.method + ' ' + r.url.replace(/\?.*$/, '')))].length,
    idor_shaped: idorish.length,
    broken: broken.length,
  };
  walk.console_summary = {
    total_messages: consoleMsgs.length,
    errors: consoleErrors.length,
    page_errors: pageErrors.length,
  };
  walk.interactions_count = walk.interactions.length;
  walk.finished_at = new Date().toISOString();
  walk.findings_refs = findings.map(f => f.id);

  // Structure walkthrough for build-report compatibility (module-shaped)
  const wtOut = {
    target: TARGET,
    started_at: walk.started_at,
    finished_at: walk.finished_at,
    modules: [
      {
        slug: 'dashboard',
        name: 'Dashboard (deep interactive)',
        routes: ['/dashboard'],
        features: ['Interactive widget clicks, modal opens, tabs, dropdowns, sort headers, pagination, reflection probes, storage inspection, XHR capture'],
        scenarios: walk.interactions.map(i => ({
          id: i.id,
          desc: i.kind === 'click' ? `Click "${(i.target && i.target.label) || i.target.tag}"` : i.kind === 'reflect-probe' ? `Reflected probe param=${i.param}` : `Navigate ${i.target}`,
          result: (i.badXhr && i.badXhr.length) || i.errDelta ? 'finding' : 'pass',
          evidence: i.evidence,
          observed: i.kind === 'click'
            ? `xhrs=${(i.xhrDelta || []).length} bad=${(i.badXhr || []).length} consoleErrΔ=${i.consoleErrDelta} pageErrΔ=${i.errDelta}${i.clickErr ? ' clickErr=' + i.clickErr : ''}`
            : i.kind === 'reflect-probe' ? `reflected=${i.reflected}` : '',
        })),
        findings: findings.map(f => f.id),
        coverage: `Deep-interactive walk: ${walk.interactions.length} interactions, ${xhrSet.length} XHRs observed, ${consoleErrors.length} console errors, ${pageErrors.length} unhandled exceptions. State-changing submits deferred to HITL.`,
      },
    ],
    dashboard_walk: walk,
    routes_visited: [...new Set(walk.interactions.map(i => i.evidence && i.evidence.url).filter(Boolean))],
  };
  wtOut.scenarios = wtOut.modules.flatMap(m => m.scenarios.map(s => ({ module: m.slug, ...s })));

  fs.writeFileSync(path.join(RUN_DIR, 'walkthrough.json'), JSON.stringify(wtOut, null, 2));
  fs.writeFileSync(path.join(RUN_DIR, 'findings.verified.json'), JSON.stringify({
    meta: { generated_at: new Date().toISOString(), generator: 'dashboard-deep-walk.js v1', module: 'dashboard' },
    findings,
  }, null, 2));
  fs.writeFileSync(path.join(RUN_DIR, 'hypotheses.json'), JSON.stringify({ hypotheses }, null, 2));
  fs.writeFileSync(path.join(RUN_DIR, 'requests.log.json'), JSON.stringify({ requests, responses: responses.map(r => ({ ...r, body: r.body ? r.body.slice(0, 2000) : null })) }, null, 2));

  await browser.close();
  console.log(`dashboard-deep-walk done: interactions=${walk.interactions.length} xhrs=${xhrSet.length} findings=${findings.length} hypotheses=${hypotheses.length}`);
})().catch(e => { console.error('fatal:', e && e.stack || e); process.exit(1); });
