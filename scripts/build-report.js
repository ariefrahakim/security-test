#!/usr/bin/env node
// build-report.js — assemble report.html + report.json + report.md.
// v3 (2026-08-21): stakeholder-friendly UX. Persona-toggle (PM / QA / Security),
// plain-English executive summary, risk banner, sticky filters, search,
// per-finding "Reproduce / Fix / Owner" cards, module tabs with sev breakdown,
// copyable evidence paths, print-optimized. Data model unchanged from v2 so old
// runs still render.

const fs = require("fs");
const path = require("path");

const dir = process.argv[2];
if (!dir) { console.error("usage: build-report.js <report-dir>"); process.exit(2); }

function load(name) {
  const p = path.join(dir, name);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const walkthrough = load("walkthrough.json");
const hypothesesDoc = load("hypotheses.json");
const artifacts = [
  load("findings.recon.json"),
  load("findings.enum.json"),
  load("findings.verified.json"),
  load("findings.final.json"),
  load("findings.json"),
].filter(Boolean);
if (artifacts.length === 0) { console.error("no findings.*.json artifacts in", dir); process.exit(2); }

const merged = new Map();
for (const a of artifacts) for (const f of (a.findings || [])) merged.set(f.id, { ...(merged.get(f.id) || {}), ...f });
const findings = [...merged.values()];

// Normalize any absolute or CWD-prefixed evidence paths down to the run-dir-relative form.
// Report artifacts are self-contained; local machine paths must not leak.
const cwd = process.cwd();
const runDirAbs = path.resolve(dir);
const runDirName = path.basename(runDirAbs);
function relPath(p) {
  if (!p) return p;
  let s = String(p).replace(/\\/g, "/");
  s = s.replace(new RegExp("^" + cwd.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "/?"), "");
  s = s.replace(new RegExp("^" + runDirAbs.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "/?"), "");
  s = s.replace(/^\.\//, "");
  // If the path still contains the run dir name, trim to that.
  const idx = s.indexOf("reports/" + runDirName + "/");
  if (idx >= 0) s = s.slice(idx + ("reports/" + runDirName + "/").length);
  return s;
}
function scrubBlob(s) {
  if (!s) return s;
  const cwdRe = new RegExp(cwd.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "/?", "g");
  return String(s).replace(cwdRe, "");
}
for (const f of findings) {
  if (f.evidence_path) f.evidence_path = relPath(f.evidence_path);
  if (f.evidence) f.evidence = scrubBlob(f.evidence);
  if (f.recommendation) f.recommendation = scrubBlob(f.recommendation);
}

function readEnv(file) {
  if (!fs.existsSync(file)) return {};
  const env = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["'](.*)["']$/, "$1");
  }
  return env;
}
const env = readEnv(".env");
const meta = {
  target: env.TARGET_WEB || "unknown",
  tester: process.env.USER || "unknown",
  date: new Date().toISOString().slice(0, 10),
  authorization: env.AUTHORIZATION_TYPE || "unknown",
  run: path.basename(path.resolve(dir)),
};

const sevRank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4, OK: 5 };
findings.sort((a, b) => (sevRank[a.sev ?? "INFO"] ?? 9) - (sevRank[b.sev ?? "INFO"] ?? 9));
const counts = findings.reduce((a, f) => { a[f.sev] = (a[f.sev] || 0) + 1; return a; }, {});

const modules = walkthrough && Array.isArray(walkthrough.modules) ? walkthrough.modules.map(m => ({ ...m })) : [];
const modBySlug = new Map(modules.map(m => [m.slug, m]));
if (!modBySlug.has('infrastructure')) {
  modBySlug.set('infrastructure', { slug:'infrastructure', name:'Infrastructure / Transport', routes:[], features:['TLS + edge headers observed on public origin'], scenarios:[], findings:[], coverage:'Passive header + TLS probe.' });
  modules.push(modBySlug.get('infrastructure'));
}
for (const m of modules) {
  if (!Array.isArray(m.findings)) m.findings = [];
  for (const s of (m.scenarios || [])) {
    if (s.evidence && typeof s.evidence === 'object') {
      for (const k of Object.keys(s.evidence)) s.evidence[k] = relPath(s.evidence[k]);
    }
  }
}
for (const f of findings) {
  const mSlug = f.module && modBySlug.has(f.module) ? f.module : 'infrastructure';
  const m = modBySlug.get(mSlug);
  if (!m.findings.includes(f.id)) m.findings.push(f.id);
}
const scenarioTotal = modules.reduce((a,m)=>a+(m.scenarios?.length||0), 0);

// Plain-English risk banner
function riskLevel() {
  if ((counts.CRITICAL||0) > 0) return { level: 'CRITICAL', label: 'Critical risk — immediate attention required', color: 'crit' };
  if ((counts.HIGH||0) > 0) return { level: 'HIGH', label: 'High risk — fix before next release', color: 'high' };
  if ((counts.MEDIUM||0) > 0) return { level: 'MODERATE', label: 'Moderate risk — plan remediation this sprint', color: 'med' };
  if ((counts.LOW||0) > 0) return { level: 'LOW', label: 'Low risk — hygiene fixes recommended', color: 'low' };
  return { level: 'CLEAN', label: 'No material issues found in scope', color: 'ok' };
}
const risk = riskLevel();

// Per-finding derived fields (plain-English impact / effort / owner guess)
const OWNER_HINTS = [
  { rx: /header|hsts|csp|x-frame|referrer|permissions-policy|content-type/i, owner: 'Platform / DevOps' },
  { rx: /tls|cipher|certificate/i, owner: 'Platform / DevOps' },
  { rx: /cookie|session|jwt|token/i, owner: 'Backend (Auth)' },
  { rx: /xss|reflect|dom|injection|sqli/i, owner: 'Backend + Frontend' },
  { rx: /idor|authz|access control|permission/i, owner: 'Backend (API)' },
  { rx: /csrf/i, owner: 'Backend (API)' },
  { rx: /dead button|ux|ui|reliability/i, owner: 'Frontend' },
  { rx: /rate|brute|lockout/i, owner: 'Backend (Auth)' },
  { rx: /race|concurren/i, owner: 'Backend (API)' },
];
function guessOwner(f) {
  const hay = `${f.title||''} ${f.category||''} ${f.recommendation||''}`;
  for (const h of OWNER_HINTS) if (h.rx.test(hay)) return h.owner;
  return 'To be triaged';
}
const IMPACT = {
  CRITICAL: 'System compromise or data breach likely if exploited.',
  HIGH: 'Attacker could steal data, take over accounts, or disrupt service.',
  MEDIUM: 'Reduces defence-in-depth; can be chained into a bigger issue.',
  LOW: 'Hygiene / policy gap; unlikely direct impact.',
  INFO: 'Informational — no exploit path observed.',
  OK: 'Control observed working correctly.',
};
const EFFORT = {
  CRITICAL: 'Days — likely code + review + deploy.',
  HIGH: 'Hours to a day.',
  MEDIUM: 'Minutes to hours — usually a config or header change.',
  LOW: 'Minutes — config or minor code tweak.',
  INFO: 'Optional — best-practice tightening.',
  OK: 'No action.',
};
for (const f of findings) {
  f._impact = IMPACT[f.sev] || IMPACT.INFO;
  f._effort = EFFORT[f.sev] || EFFORT.INFO;
  f._owner = guessOwner(f);
}

// Top-3 recommendations (highest severity, dedup by title)
const topRecs = (() => {
  const seen = new Set();
  const out = [];
  for (const f of findings) {
    const key = (f.title || '').replace(/:.*$/, '').toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (['CRITICAL','HIGH','MEDIUM'].includes(f.sev) || (out.length < 3 && f.sev === 'LOW')) out.push(f);
    if (out.length >= 3) break;
  }
  return out;
})();

// Scenario tallies per module
for (const m of modules) {
  const s = m.scenarios || [];
  m._scenarioStats = s.reduce((a, x) => {
    const r = (x.result || 'note').toLowerCase();
    a[r] = (a[r] || 0) + 1;
    return a;
  }, {});
  m._sevBreakdown = (m.findings||[]).reduce((a, id) => {
    const f = findings.find(x=>x.id===id);
    if (f) a[f.sev] = (a[f.sev]||0)+1;
    return a;
  }, {});
}

// --- write JSON ---
fs.writeFileSync(
  path.join(dir, "report.json"),
  JSON.stringify({ meta, counts, risk, modules, findings, top_recommendations: topRecs.map(f=>f.id), hypotheses: (hypothesesDoc && hypothesesDoc.hypotheses) || [] }, null, 2)
);

// --- write Markdown ---
const findingById = new Map(findings.map(f => [f.id, f]));
function fmtFinding(f) {
  return [
    `#### ${f.id} — [${f.sev}] ${f.title}`,
    ``,
    `- **What it means:** ${f._impact}`,
    `- **Effort to fix:** ${f._effort}`,
    `- **Likely owner:** ${f._owner}`,
    `- **Category:** ${f.category ?? f.owasp ?? "—"}`,
    f.cwe ? `- **CWE:** ${f.cwe}` : null,
    f.confidence ? `- **Confidence:** ${f.confidence}` : null,
    f.cvss4?.vector ? `- **CVSS 4.0:** ${f.cvss4.score} (\`${f.cvss4.vector}\`)` : null,
    f.evidence_path ? `- **Evidence:** \`${f.evidence_path}\`` : null,
    ``,
    `**How we saw it**`,
    ``,
    "```",
    (f.evidence || "").trim(),
    "```",
    ``,
    `**How to fix:** ${f.recommendation || f.remediation?.patch || "—"}`,
    ``,
  ].filter(x => x !== null).join("\n");
}

const md = [];
md.push(`# Security Assessment Report`);
md.push('');
md.push(`**Target:** ${meta.target}  `);
md.push(`**Date:** ${meta.date}  `);
md.push(`**Tester:** ${meta.tester}  `);
md.push(`**Authorization:** ${meta.authorization}  `);
md.push(`**Run:** \`${meta.run}\``);
md.push('');
md.push(`## Overall risk: ${risk.level}`);
md.push('');
md.push(`> ${risk.label}`);
md.push('');
md.push('| Severity | Count |');
md.push('|---|---|');
for (const k of ['CRITICAL','HIGH','MEDIUM','LOW','INFO','OK']) if (counts[k]) md.push(`| ${k} | ${counts[k]} |`);
md.push('');
md.push('## Executive summary (for PM / stakeholders)');
md.push('');
md.push(`- Coverage: **${modules.length} module(s)**, **${scenarioTotal} test scenarios** executed.`);
md.push(`- Findings: **${findings.length}** total (${Object.entries(counts).map(([k,v])=>`${v} ${k}`).join(', ')}).`);
if (topRecs.length) {
  md.push(`- Top ${topRecs.length} action item(s):`);
  for (const f of topRecs) md.push(`  1. **${f.title}** — ${f.recommendation || 'see finding'} _(owner: ${f._owner})_`);
}
md.push('');
md.push('## Modules');
md.push('');
for (const m of modules) {
  const sevPill = Object.entries(m._sevBreakdown||{}).map(([k,v])=>`${k}:${v}`).join(' · ') || 'no findings';
  md.push(`### ${m.name} (\`${m.slug}\`) — ${sevPill}`);
  md.push('');
  if (m.routes && m.routes.length) {
    md.push('**Routes**');
    md.push('');
    for (const r of m.routes) md.push(`- \`${r}\``);
    md.push('');
  }
  if (m.features && m.features.length) {
    md.push('**Features observed**');
    md.push('');
    for (const f of m.features) md.push(`- ${f}`);
    md.push('');
  }
  if (m.scenarios && m.scenarios.length) {
    md.push('**Test scenarios (for QA)**');
    md.push('');
    md.push('| ID | Scenario | Result | Evidence |');
    md.push('|---|---|---|---|');
    for (const s of m.scenarios) {
      const ev = s.evidence && (s.evidence.screenshot || s.evidence.dom || s.evidence.headers) || '';
      md.push(`| ${s.id||''} | ${(s.desc||'').replace(/\|/g,'\\|')} | ${s.result||''} | \`${(ev||'').toString().replace(/\|/g,'\\|')}\` |`);
    }
    md.push('');
  }
  if (m.findings && m.findings.length) {
    md.push('**Findings**');
    md.push('');
    for (const fid of m.findings) {
      const f = findingById.get(fid);
      if (f) md.push(fmtFinding(f));
    }
  } else {
    md.push('_No findings recorded for this module._');
    md.push('');
  }
  if (m.coverage) { md.push(`**Coverage notes:** ${m.coverage}`); md.push(''); }
}

if (hypothesesDoc && hypothesesDoc.hypotheses && hypothesesDoc.hypotheses.length) {
  md.push('## Deferred hypotheses (need human approval to test)');
  md.push('');
  md.push('| ID | Hypothesis | Based on | Test plan |');
  md.push('|---|---|---|---|');
  for (const h of hypothesesDoc.hypotheses) {
    md.push(`| ${h.id} | ${(h.title||'').replace(/\|/g,'\\|')} | ${(h.based_on||[]).join('; ')} | ${(h.test_plan||'').replace(/\|/g,'\\|')} |`);
  }
  md.push('');
}

md.push('## Out-of-scope observations');
md.push('');
md.push('- Third-party CDNs and analytics: not tested.');
md.push('- Backend infrastructure (host OS, DB): not probed.');
md.push('- State-changing flows (password reset, 2FA, delete, checkout): deferred to HITL.');

fs.writeFileSync(path.join(dir, "report.md"), md.join('\n'));

// --- write HTML (self-contained, stakeholder-friendly) ---
const dataJson = JSON.stringify({ meta, counts, risk, modules, findings, top_recommendations: topRecs.map(f=>f.id), hypotheses: (hypothesesDoc && hypothesesDoc.hypotheses) || [] }).replace(/</g, "\\u003c");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Security Report — ${meta.target}</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
:root{
  --bg:#0b1020;--panel:#141a2e;--panel2:#1c2340;--text:#e6ecff;--muted:#8b93b8;--sub:#a7b0d6;
  --accent:#66d9ef;--ok:#4ade80;--info:#60a5fa;--low:#fbbf24;--med:#fb923c;--high:#ef4444;--crit:#b91c1c;
  --border:#2a3255;--card:#151b31;--pill-bg:#1f2645;
}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--text);font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
code,pre{font-family:"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace}
code{background:#0a0f22;padding:2px 6px;border-radius:5px;color:#cfe1ff;font-size:12px;word-break:break-all}
pre{background:#0a0f22;padding:12px 14px;overflow:auto;font-size:12px;border:1px solid var(--border);border-radius:8px;color:#cfe1ff}

/* Header */
header{padding:22px 40px 16px;border-bottom:1px solid var(--border);background:linear-gradient(180deg,#0e1530,#0b1020);position:sticky;top:0;z-index:10}
.hrow{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap}
h1{margin:0 0 4px;font-size:20px;letter-spacing:.2px}
.sub{color:var(--muted);font-size:12.5px}
.meta-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.chip{display:inline-block;background:var(--pill-bg);border:1px solid var(--border);padding:3px 10px;border-radius:999px;font-size:11.5px;color:var(--sub)}
.chip b{color:var(--text)}

/* Export controls */
.controls{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.btn{background:var(--panel2);color:var(--text);border:1px solid var(--border);padding:7px 12px;border-radius:8px;cursor:pointer;font-size:12.5px}
.btn:hover{background:#242c50}
.btn.primary{background:var(--accent);color:#001824;border-color:var(--accent);font-weight:700}
select.btn{padding-right:28px}

/* Main */
main{padding:22px 40px 80px;max-width:1240px;margin:0 auto}
section{background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:20px 22px;margin:16px 0}
section h2{margin:0 0 12px;font-size:15px;color:var(--accent);text-transform:uppercase;letter-spacing:.8px}
section h3{margin:14px 0 8px;font-size:14px;color:#cfe1ff}

/* Risk banner */
.risk{padding:18px 22px;border-radius:12px;border:1px solid var(--border);display:flex;align-items:center;gap:16px;margin:16px 0}
.risk.crit{background:linear-gradient(90deg,#450a0a55,#141a2e);border-color:#7f1d1d}
.risk.high{background:linear-gradient(90deg,#7f1d1d55,#141a2e);border-color:#991b1b}
.risk.med{background:linear-gradient(90deg,#7c2d1255,#141a2e);border-color:#9a3412}
.risk.low{background:linear-gradient(90deg,#78350f55,#141a2e);border-color:#92400e}
.risk.ok{background:linear-gradient(90deg,#14532d55,#141a2e);border-color:#166534}
.risk .icon{font-size:28px;line-height:1}
.risk .lvl{font-weight:800;font-size:15px;letter-spacing:.5px;margin-bottom:2px}
.risk .msg{color:var(--sub);font-size:13px}

/* KPI grid */
.kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}
.kpi .box{background:var(--card);padding:14px;border-radius:10px;border:1px solid var(--border);text-align:center}
.kpi .n{font-size:26px;font-weight:800;line-height:1.1}
.kpi .l{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.7px;margin-top:6px}
.kpi .box.sev-CRITICAL .n{color:#fecaca}
.kpi .box.sev-HIGH .n{color:var(--high)}
.kpi .box.sev-MEDIUM .n{color:var(--med)}
.kpi .box.sev-LOW .n{color:var(--low)}
.kpi .box.sev-INFO .n{color:var(--info)}
.kpi .box.sev-OK .n{color:var(--ok)}

/* Top recommendations */
.top-recs{display:grid;gap:10px;margin-top:8px}
.top-recs .item{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:12px 14px;display:flex;gap:12px;align-items:flex-start}
.top-recs .num{width:28px;height:28px;flex:0 0 28px;border-radius:50%;background:var(--accent);color:#001824;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:13px}
.top-recs .body{flex:1;min-width:0}
.top-recs .t{font-weight:600;margin-bottom:2px}
.top-recs .r{color:var(--sub);font-size:13px}
.top-recs .owner{color:var(--muted);font-size:11.5px;margin-top:4px}

/* Severity pills */
.sev{padding:2px 9px;border-radius:999px;font-size:10.5px;font-weight:800;letter-spacing:.5px;display:inline-block;text-transform:uppercase}
.sev.INFO{background:#1e3a8a44;color:var(--info)}
.sev.LOW{background:#78350f66;color:var(--low)}
.sev.MEDIUM{background:#7c2d1266;color:var(--med)}
.sev.HIGH{background:#7f1d1d66;color:var(--high)}
.sev.CRITICAL{background:#450a0a;color:#fecaca}
.sev.OK{background:#14532d66;color:var(--ok)}

/* Result pills */
.res{padding:2px 9px;border-radius:999px;font-size:10.5px;font-weight:700;letter-spacing:.5px;display:inline-block;text-transform:uppercase}
.res-pass{background:#14532d55;color:var(--ok)}
.res-fail{background:#7f1d1d55;color:var(--high)}
.res-finding{background:#7c2d1255;color:var(--med)}
.res-note,.res-pending-hitl{background:#1e3a8a55;color:var(--info)}
.res-hitl-pending{background:#1e3a8a55;color:var(--info)}

/* Filter bar */
.filters{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px}
.filters input,.filters select{background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:7px 10px;font-size:12.5px;min-width:180px}
.filters input:focus,.filters select:focus{outline:2px solid var(--accent);outline-offset:1px}

/* Tabs */
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
.tab{padding:7px 14px;border-radius:10px;background:var(--card);border:1px solid var(--border);cursor:pointer;font-size:12.5px;color:var(--sub);display:inline-flex;gap:8px;align-items:center}
.tab:hover{border-color:var(--accent);color:var(--text)}
.tab.active{background:var(--accent);color:#001824;font-weight:700;border-color:var(--accent)}
.tab .cnt{background:rgba(255,255,255,.15);padding:1px 7px;border-radius:999px;font-size:10.5px;font-weight:700}
.tab.active .cnt{background:#001824;color:var(--accent)}

/* Finding cards */
.finding{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px 16px;margin:10px 0}
.finding.hidden{display:none}
.finding .head{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:6px}
.finding .id{color:var(--muted);font-family:"JetBrains Mono",monospace;font-size:11.5px}
.finding .title{font-weight:600;font-size:14px;flex:1;min-width:200px}
.finding .conf{font-size:11px;color:var(--sub);padding:2px 8px;border-radius:999px;background:var(--pill-bg);border:1px solid var(--border)}
.finding .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px}
@media (max-width:720px){.finding .grid{grid-template-columns:1fr}}
.finding .cell{background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:10px 12px}
.finding .cell .lbl{font-size:10.5px;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-bottom:4px}
.finding .cell .val{font-size:13px;color:var(--text)}
.finding .evidence-line{margin-top:8px;font-size:12px;color:var(--sub)}
.finding .evidence-line code{cursor:pointer}
.finding .evidence-line code:hover{background:#182247}
.finding details{margin-top:8px}
.finding summary{cursor:pointer;color:var(--muted);font-size:12px;padding:4px 0}
.finding summary:hover{color:var(--accent)}
.finding .cvss{margin-top:6px;font-size:11.5px;color:var(--muted);font-family:"JetBrains Mono",monospace;word-break:break-all}

/* Module block */
.module .routes,.module .features{margin:8px 0}
.module .routes code{display:inline-block;margin:2px 4px 2px 0}
.scenario-table{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:6px}
.scenario-table th,.scenario-table td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--border);vertical-align:top}
.scenario-table th{color:var(--muted);background:var(--panel2);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
.scenario-table tr:hover td{background:#171e3a}

/* Hypotheses */
.hyp-table{width:100%;border-collapse:collapse;font-size:12.5px}
.hyp-table th,.hyp-table td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--border);vertical-align:top}
.hyp-table th{color:var(--muted);background:var(--panel2);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px}

/* Toast */
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--accent);color:#001824;padding:8px 18px;border-radius:999px;font-weight:600;font-size:12.5px;opacity:0;transition:opacity .2s;pointer-events:none;z-index:100}
.toast.show{opacity:1}

/* Print */
@media print{
  header{position:static;background:#fff;border-color:#ccc}
  body{background:#fff;color:#111}
  header .controls,.filters,.tabs,.toast{display:none !important}
  section,.finding,.risk,.top-recs .item,.kpi .box{background:#fff !important;border:1px solid #ccc !important;color:#111;page-break-inside:avoid}
  code,pre{background:#f3f4f6 !important;color:#111 !important;border-color:#ddd !important}
  .sub,.muted{color:#555 !important}
  h1,h2,h3{color:#111 !important}
  .module{display:block !important}
  .finding details{page-break-inside:avoid}
  .finding details[open] summary{color:#111}
  a{color:#0645ad !important}
}
</style>
</head>
<body>

<header>
<div class="hrow">
  <div>
    <h1>Security Assessment Report</h1>
    <div class="meta-chips">
      <span class="chip"><b>Target:</b> ${meta.target}</span>
      <span class="chip"><b>Date:</b> ${meta.date}</span>
      <span class="chip"><b>Tester:</b> ${meta.tester}</span>
      <span class="chip"><b>Authorization:</b> ${meta.authorization}</span>
    </div>
  </div>
  <div class="controls">
    <select id="fmt" class="btn">
      <option value="pdf">Export: PDF (print)</option>
      <option value="json">Export: JSON</option>
      <option value="csv">Export: CSV</option>
      <option value="xls">Export: Excel</option>
      <option value="md">Export: Markdown</option>
    </select>
    <button class="btn primary" onclick="doExport()">Export</button>
  </div>
</div>
</header>

<main>

<div class="risk ${risk.color}">
  <div class="icon">${risk.color==='ok'?'✓':risk.color==='crit'||risk.color==='high'?'⚠':'●'}</div>
  <div>
    <div class="lvl">Overall risk: ${risk.level}</div>
    <div class="msg">${risk.label}</div>
  </div>
</div>

<section>
  <h2>At a glance</h2>
  <div class="kpi">
    ${['CRITICAL','HIGH','MEDIUM','LOW','INFO','OK'].filter(k=>counts[k]).map(k=>`<div class="box sev-${k}"><div class="n">${counts[k]}</div><div class="l">${k}</div></div>`).join('')}
    <div class="box"><div class="n">${modules.length}</div><div class="l">Modules</div></div>
    <div class="box"><div class="n">${scenarioTotal}</div><div class="l">Scenarios</div></div>
    <div class="box"><div class="n">${findings.length}</div><div class="l">Findings</div></div>
  </div>
</section>

${topRecs.length ? `<section>
  <h2>Top actions this sprint</h2>
  <div class="top-recs">
  ${topRecs.map((f,i)=>`<div class="item">
    <div class="num">${i+1}</div>
    <div class="body">
      <div class="t"><span class="sev ${f.sev}">${f.sev}</span> &nbsp;${escapeHtml(f.title)}</div>
      <div class="r">${escapeHtml(f.recommendation||f._impact||'')}</div>
      <div class="owner">Likely owner: <b>${escapeHtml(f._owner)}</b> · Effort: ${escapeHtml(f._effort)}</div>
    </div>
  </div>`).join('')}
  </div>
</section>` : ''}

<section>
  <h2>By module</h2>
  <div class="tabs" id="tabs"></div>
  <div id="modarea"></div>
</section>

<section>
  <h2>All findings</h2>
  <div class="filters">
    <input id="q" placeholder="Search findings (title / evidence / owner)…" />
    <select id="sevFilter">
      <option value="">All severities</option>
      <option>CRITICAL</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option><option>INFO</option><option>OK</option>
    </select>
    <select id="modFilter">
      <option value="">All modules</option>
      ${modules.map(m=>`<option value="${escapeAttr(m.slug)}">${escapeHtml(m.name)}</option>`).join('')}
    </select>
    <button class="btn" onclick="clearFilters()">Reset</button>
    <span class="sub" id="filterCount"></span>
  </div>
  <div id="allFindings"></div>
</section>

${(hypothesesDoc && hypothesesDoc.hypotheses && hypothesesDoc.hypotheses.length) ? `<section>
  <h2>Deferred — need approval to test</h2>
  <p class="sub">State-changing PoCs held back pending human-in-the-loop approval.</p>
  <table class="hyp-table"><thead><tr><th>ID</th><th>Hypothesis</th><th>Based on</th><th>Test plan</th></tr></thead><tbody id="hbody"></tbody></table>
</section>` : ''}

<section>
  <h2>What was not tested</h2>
  <ul class="sub">
    <li>Third-party CDNs and analytics origins.</li>
    <li>Backend host OS and database.</li>
    <li>Password reset, 2FA enrolment, delete, and checkout flows (state-changing → HITL).</li>
    <li>Cross-tenant access (requires a second authorized account).</li>
  </ul>
</section>

</main>

<div class="toast" id="toast">Copied</div>

<script>
const D=${dataJson};
const findingById=Object.fromEntries(D.findings.map(f=>[f.id,f]));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window._tt);window._tt=setTimeout(()=>t.classList.remove('show'),1200);}
function copyText(s){navigator.clipboard?.writeText(s).then(()=>toast('Copied path'));}

function findingCard(f){
  const conf=f.confidence?'<span class="conf">'+esc(f.confidence)+'</span>':'';
  const cvss=f.cvss4?.vector?'<div class="cvss">CVSS 4.0 '+esc(f.cvss4.score)+' — '+esc(f.cvss4.vector)+'</div>':'';
  const evPath=f.evidence_path||'';
  return \`<div class="finding" data-sev="\${esc(f.sev)}" data-mod="\${esc(f.module||'')}" data-blob="\${esc((f.title+' '+f.evidence+' '+f._owner+' '+(f.category||'')).toLowerCase())}">
    <div class="head">
      <span class="sev \${esc(f.sev)}">\${esc(f.sev)}</span>
      <span class="id">\${esc(f.id)}</span>
      <span class="title">\${esc(f.title)}</span>
      \${conf}
    </div>
    <div class="grid">
      <div class="cell"><div class="lbl">What it means</div><div class="val">\${esc(f._impact)}</div></div>
      <div class="cell"><div class="lbl">Effort to fix</div><div class="val">\${esc(f._effort)}</div></div>
      <div class="cell"><div class="lbl">Likely owner</div><div class="val">\${esc(f._owner)}</div></div>
      <div class="cell tech"><div class="lbl">Category</div><div class="val">\${esc(f.category||f.owasp||'—')}\${f.cwe?' · '+esc(f.cwe):''}</div></div>
    </div>
    <details>
      <summary>How we saw it &amp; how to fix</summary>
      <div style="margin-top:8px"><b>Observation:</b> \${esc(f.evidence||'—')}</div>
      <div style="margin-top:8px"><b>Fix:</b> \${esc(f.recommendation||'—')}</div>
      \${evPath?'<div class="evidence-line">Evidence file: <code title="Click to copy" onclick="copyText(\\''+esc(evPath.replace(/'/g,"\\\\'"))+'\\')">'+esc(evPath)+'</code></div>':''}
      \${cvss}
    </details>
  </div>\`;
}

function renderModule(m){
  const findings=(m.findings||[]).map(id=>findingById[id]).filter(Boolean);
  const scenarios=m.scenarios||[];
  const routes=m.routes||[];
  const features=m.features||[];
  const routeHtml=routes.length?'<div class="routes"><div class="lbl sub" style="margin-bottom:4px">Routes</div>'+routes.map(r=>'<code>'+esc(r)+'</code>').join(' ')+'</div>':'';
  const featHtml=features.length?'<div class="features"><div class="lbl sub" style="margin-bottom:4px">Features observed</div><ul style="margin:4px 0 0 20px;color:var(--sub)">'+features.map(f=>'<li>'+esc(f)+'</li>').join('')+'</ul></div>':'';
  const scTable=scenarios.length?
    '<h3>Test scenarios ('+scenarios.length+')</h3>'+
    '<table class="scenario-table"><thead><tr><th style="width:70px">ID</th><th>Scenario</th><th style="width:110px">Result</th><th>Evidence</th></tr></thead><tbody>'+
    scenarios.map(s=>{
      const ev=s.evidence&&(s.evidence.screenshot||s.evidence.dom||s.evidence.headers)||'';
      const rk=(s.result||'note').toLowerCase();
      return '<tr><td><code>'+esc(s.id||'')+'</code></td><td>'+esc(s.desc||'')+'</td><td><span class="res res-'+esc(rk)+'">'+esc(s.result||'note')+'</span></td><td>'+(ev?'<code title="Click to copy" onclick="copyText(\\''+esc(ev.replace(/\\\\/g,"\\\\\\\\").replace(/'/g,"\\\\'"))+'\\')">'+esc(ev)+'</code>':'')+'</td></tr>';
    }).join('')+
    '</tbody></table>':'';
  const fHtml=findings.length?'<h3>Findings ('+findings.length+')</h3>'+findings.map(findingCard).join(''):'<p class="sub">No findings for this module.</p>';
  const cov=m.coverage?'<p class="sub" style="margin-top:12px"><b>Coverage:</b> '+esc(m.coverage)+'</p>':'';
  return '<div class="module">'+routeHtml+featHtml+scTable+fHtml+cov+'</div>';
}

// Tabs
const tabs=document.getElementById('tabs'),area=document.getElementById('modarea');
D.modules.forEach((m,i)=>{
  const t=document.createElement('button');
  t.className='tab'+(i===0?' active':'');
  t.innerHTML=esc(m.name)+' <span class="cnt">'+(m.findings||[]).length+'</span>';
  t.onclick=()=>{document.querySelectorAll('.tabs .tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');area.innerHTML=renderModule(m);};
  tabs.appendChild(t);
});
if(D.modules[0]) area.innerHTML=renderModule(D.modules[0]);

// All findings
const allBox=document.getElementById('allFindings');
allBox.innerHTML=D.findings.map(findingCard).join('');

// Filters
const q=document.getElementById('q'),sf=document.getElementById('sevFilter'),mf=document.getElementById('modFilter'),fc=document.getElementById('filterCount');
function applyFilters(){
  const term=(q.value||'').toLowerCase().trim();
  const sev=sf.value,mod=mf.value;
  let n=0;
  allBox.querySelectorAll('.finding').forEach(el=>{
    const okSev=!sev||el.dataset.sev===sev;
    const okMod=!mod||el.dataset.mod===mod;
    const okTerm=!term||el.dataset.blob.includes(term);
    const show=okSev&&okMod&&okTerm;
    el.classList.toggle('hidden',!show);
    if(show)n++;
  });
  fc.textContent=n+' of '+D.findings.length+' findings';
}
[q,sf,mf].forEach(el=>el.addEventListener('input',applyFilters));
function clearFilters(){q.value='';sf.value='';mf.value='';applyFilters();}
applyFilters();

// Hypotheses
const hbody=document.getElementById('hbody');
if(hbody) hbody.innerHTML=(D.hypotheses||[]).map(h=>'<tr><td><code>'+esc(h.id)+'</code></td><td>'+esc(h.title)+'</td><td>'+esc((h.based_on||[]).join('; '))+'</td><td>'+esc(h.test_plan||'')+'</td></tr>').join('');

// Export
function dl(name,mime,body){const b=new Blob([body],{type:mime}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);}
const csvEsc=v=>{const s=String(v??'');return /[",\\r\\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
function exportJSON(){dl('report.json','application/json',JSON.stringify(D,null,2));}
function exportCSV(){const h=['id','module','sev','confidence','title','category','owner','impact','effort','evidence_path','recommendation'];const rows=[h,...D.findings.map(f=>[f.id,f.module||'',f.sev,f.confidence||'',f.title,f.category||f.owasp||'',f._owner,f._impact,f._effort,f.evidence_path||'',f.recommendation||''])];dl('report.csv','text/csv;charset=utf-8','\\ufeff'+rows.map(r=>r.map(csvEsc).join(',')).join('\\r\\n'));}
function exportXLS(){const xesc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;');const row=c=>'<Row>'+c.map(x=>'<Cell><Data ss:Type="String">'+xesc(x)+'</Data></Cell>').join('')+'</Row>';const rows=[row(['ID','Module','Severity','Confidence','Title','Category','Owner','Impact','Effort','Evidence','Fix']),...D.findings.map(f=>row([f.id,f.module||'',f.sev,f.confidence||'',f.title,f.category||f.owasp||'',f._owner,f._impact,f._effort,f.evidence_path||'',f.recommendation||'']))].join('');dl('report.xls','application/vnd.ms-excel','<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Findings"><Table>'+rows+'</Table></Worksheet></Workbook>');}
function exportMD(){const lines=['# Security Assessment Report','','**Target:** '+D.meta.target,'**Date:** '+D.meta.date,'**Overall risk:** '+D.risk.level+' — '+D.risk.label,''];for(const m of D.modules){lines.push('## '+m.name+' ('+m.slug+')');for(const fid of (m.findings||[])){const f=findingById[fid];if(!f)continue;lines.push('### ['+f.sev+'] '+f.title);lines.push('- Owner: '+f._owner);lines.push('- Impact: '+f._impact);lines.push('- Effort: '+f._effort);lines.push('- Evidence: '+(f.evidence_path||''));lines.push('- Fix: '+(f.recommendation||''));lines.push('');}}dl('report.md','text/markdown;charset=utf-8',lines.join('\\n'));}
function doExport(){const v=document.getElementById('fmt').value;({pdf:()=>window.print(),json:exportJSON,csv:exportCSV,xls:exportXLS,md:exportMD})[v]();}
</script>
</body></html>`;

function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function escapeAttr(s){return escapeHtml(s);}

fs.writeFileSync(path.join(dir, "report.html"), html);

console.log(`wrote:
  ${path.join(dir, "report.html")}
  ${path.join(dir, "report.json")}
  ${path.join(dir, "report.md")}`);
console.log(`modules=${modules.length} scenarios=${scenarioTotal} findings=${findings.length} risk=${risk.level}`);
