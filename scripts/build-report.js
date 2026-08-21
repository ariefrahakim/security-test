#!/usr/bin/env node
// build-report.js — assemble report.html + report.json + report.md.
// v2 (2026-08-21): module-organized report. Reads walkthrough.json for module
// structure + scenarios and merges findings.recon.json / findings.verified.json /
// findings.final.json.
//
// Later artifacts override earlier ones by finding id. If no walkthrough.json
// exists, falls back to flat-findings mode (backwards compat with v1).

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
  run_dir: dir,
};

const sevRank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4, OK: 5 };
findings.sort((a, b) => (sevRank[a.sev ?? "INFO"] ?? 9) - (sevRank[b.sev ?? "INFO"] ?? 9));
const counts = findings.reduce((a, f) => { a[f.sev] = (a[f.sev] || 0) + 1; return a; }, {});

// Group findings by module (falls back to "infrastructure" for legacy recon findings).
const modules = walkthrough && Array.isArray(walkthrough.modules) ? walkthrough.modules.map(m => ({ ...m })) : [];
const modBySlug = new Map(modules.map(m => [m.slug, m]));
if (!modBySlug.has('infrastructure')) {
  modBySlug.set('infrastructure', { slug:'infrastructure', name:'Infrastructure / Transport', routes:[], features:['TLS + edge headers observed on public origin'], scenarios:[], findings:[], coverage:'Passive header + TLS probe.' });
  modules.push(modBySlug.get('infrastructure'));
}
for (const f of findings) {
  const mSlug = f.module && modBySlug.has(f.module) ? f.module : 'infrastructure';
  const m = modBySlug.get(mSlug);
  if (!m.findings.includes(f.id)) m.findings.push(f.id);
}
const scenarioTotal = modules.reduce((a,m)=>a+(m.scenarios?.length||0), 0);

// --- write JSON ---
fs.writeFileSync(
  path.join(dir, "report.json"),
  JSON.stringify({ meta, counts, modules, findings, hypotheses: (hypothesesDoc && hypothesesDoc.hypotheses) || [] }, null, 2)
);

// --- write Markdown (module-organized) ---
const findingById = new Map(findings.map(f => [f.id, f]));
function fmtFinding(f) {
  return [
    `#### ${f.id} — [${f.sev}] ${f.title}`,
    ``,
    `- **Category:** ${f.category ?? f.owasp ?? "—"}`,
    f.cwe ? `- **CWE:** ${f.cwe}` : null,
    f.confidence ? `- **Confidence:** ${f.confidence}` : null,
    f.cvss4?.vector ? `- **CVSS 4.0:** ${f.cvss4.score} (${f.cvss4.vector})` : null,
    f.evidence_path ? `- **Evidence file:** \`${f.evidence_path}\`` : null,
    ``,
    `**Evidence**`,
    ``,
    "```",
    (f.evidence || "").trim(),
    "```",
    ``,
    `**Recommendation:** ${f.recommendation || f.remediation?.patch || "—"}`,
    ``,
  ].filter(x => x !== null).join("\n");
}

const md = [];
md.push(`# Security Assessment Report — ${meta.target}`);
md.push('');
md.push(`- **Date:** ${meta.date}`);
md.push(`- **Tester:** ${meta.tester}`);
md.push(`- **Authorization:** ${meta.authorization}`);
md.push(`- **Run:** \`${meta.run_dir}\``);
md.push(`- **Modules covered:** ${modules.length}`);
md.push(`- **Scenarios executed:** ${scenarioTotal}`);
md.push('');
md.push('## Executive summary');
md.push('');
md.push(`Authenticated walk-through as owner covered ${modules.length} module(s) with ${scenarioTotal} test scenarios. Findings by severity: ` + Object.entries(counts).map(([k,v])=>`${k}=${v}`).join(', ') + '.');
md.push('');
md.push('## Findings by severity');
md.push('');
for (const [k,v] of Object.entries(counts)) md.push(`- ${k}: ${v}`);
md.push('');

md.push('## Modules');
md.push('');
for (const m of modules) {
  md.push(`### Module: ${m.name} (\`${m.slug}\`)`);
  md.push('');
  if (m.routes && m.routes.length) {
    md.push('**Routes / URLs**');
    md.push('');
    for (const r of m.routes) md.push(`- \`${r}\``);
    md.push('');
  }
  if (m.features && m.features.length) {
    md.push('**Feature description (observed)**');
    md.push('');
    for (const f of m.features) md.push(`- ${f}`);
    md.push('');
  }
  if (m.scenarios && m.scenarios.length) {
    md.push('**Test scenarios executed**');
    md.push('');
    md.push('| ID | Description | Result | Evidence |');
    md.push('|---|---|---|---|');
    for (const s of m.scenarios) {
      const ev = s.evidence && (s.evidence.screenshot || s.evidence.dom || s.evidence.headers) || '';
      md.push(`| ${s.id||''} | ${(s.desc||'').replace(/\|/g,'\\|')} | ${s.result||''} | ${(ev||'').toString().replace(/\|/g,'\\|')} |`);
    }
    md.push('');
  }
  if (m.findings && m.findings.length) {
    md.push('**Findings in this module**');
    md.push('');
    for (const fid of m.findings) {
      const f = findingById.get(fid);
      if (f) md.push(fmtFinding(f));
    }
  } else {
    md.push('_No findings recorded for this module._');
    md.push('');
  }
  if (m.coverage) {
    md.push(`**Coverage notes:** ${m.coverage}`);
    md.push('');
  }
}

if (hypothesesDoc && hypothesesDoc.hypotheses && hypothesesDoc.hypotheses.length) {
  md.push('## Deferred hypotheses (HITL required)');
  md.push('');
  md.push('| ID | Title | Based on | Test plan |');
  md.push('|---|---|---|---|');
  for (const h of hypothesesDoc.hypotheses) {
    md.push(`| ${h.id} | ${(h.title||'').replace(/\|/g,'\\|')} | ${(h.based_on||[]).join('; ')} | ${(h.test_plan||'').replace(/\|/g,'\\|')} |`);
  }
  md.push('');
}

md.push('## Out-of-scope observations');
md.push('');
md.push('- Third-party CDNs and analytics: not tested (out of authorization scope).');
md.push('- Backend infrastructure (host OS, DB): not probed.');
md.push('- Password reset and 2FA enrolment flows: deferred to HITL.');
md.push('');

fs.writeFileSync(path.join(dir, "report.md"), md.join('\n'));

// --- write HTML (self-contained; module tabs + export buttons) ---
const dataJson = JSON.stringify({ meta, counts, modules, findings, hypotheses: (hypothesesDoc && hypothesesDoc.hypotheses) || [] }).replace(/</g, "\\u003c");
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<title>Security Report — ${meta.target}</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
:root{--bg:#0b1020;--panel:#141a2e;--panel2:#1c2340;--text:#e6ecff;--muted:#8b93b8;--accent:#66d9ef;--ok:#4ade80;--info:#60a5fa;--low:#fbbf24;--med:#fb923c;--high:#ef4444;--crit:#b91c1c;--border:#2a3255;}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--text);font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
header{padding:32px 40px 20px;border-bottom:1px solid var(--border);background:linear-gradient(180deg,#0e1530,#0b1020);position:sticky;top:0;z-index:5}
h1{margin:0 0 4px;font-size:22px}.sub{color:var(--muted);font-size:13px}
.toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
.btn{background:var(--panel2);color:var(--text);border:1px solid var(--border);padding:8px 12px;border-radius:8px;cursor:pointer;font-size:13px}
.btn:hover{background:#242c50}.btn.primary{background:var(--accent);color:#001824;border-color:var(--accent);font-weight:600}
main{padding:24px 40px 80px;max-width:1240px;margin:0 auto}
section{background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:20px 22px;margin:18px 0}
section h2{margin:0 0 12px;font-size:16px;color:var(--accent)} section h3{margin:14px 0 8px;font-size:14px;color:#cfe1ff}
table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;padding:9px 10px;border-bottom:1px solid var(--border);vertical-align:top}
th{color:var(--muted);background:var(--panel2)}tr:hover td{background:#171e3a}
.sev{padding:3px 9px;border-radius:999px;font-size:11px;font-weight:700;display:inline-block}
.sev.INFO{background:#1e3a8a44;color:var(--info)}.sev.LOW{background:#78350f44;color:var(--low)}
.sev.MEDIUM{background:#7c2d1244;color:var(--med)}.sev.HIGH{background:#7f1d1d44;color:var(--high)}
.sev.CRITICAL{background:#450a0a;color:#fecaca}.sev.OK{background:#14532d44;color:var(--ok)}
code,pre{font-family:"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;background:#0a0f22;padding:2px 6px;border-radius:5px;color:#cfe1ff}pre{padding:12px 14px;overflow:auto;font-size:12px;border:1px solid var(--border)}
.kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}
.kpi .box{background:var(--panel2);padding:14px;border-radius:10px;border:1px solid var(--border)}
.kpi .n{font-size:26px;font-weight:700}.kpi .l{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.6px}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
.tab{padding:6px 12px;border-radius:999px;background:var(--panel2);border:1px solid var(--border);cursor:pointer;font-size:12px;color:var(--muted)}
.tab.active{background:var(--accent);color:#001824;font-weight:600;border-color:var(--accent)}
.result-pass{color:var(--ok)}.result-fail{color:var(--high)}.result-finding{color:var(--med);font-weight:700}.result-note,.result-pending-hitl{color:var(--info)}
@media print{body{background:#fff;color:#111}header .toolbar,footer,.tabs{display:none}section{background:#fff;border:1px solid #ccc;page-break-inside:avoid}code,pre{background:#f3f4f6;color:#111}tr:hover td{background:transparent}.module{display:block !important}}
</style></head><body>
<header>
<h1>Security Assessment Report</h1>
<div class="sub"><b>Target:</b> ${meta.target} · <b>Date:</b> ${meta.date} · <b>Tester:</b> ${meta.tester} · <b>Authorization:</b> ${meta.authorization}</div>
<div class="toolbar">
<label class="sub" for="fmt" style="align-self:center;margin-right:4px">Export as</label>
<select id="fmt" class="btn" style="padding-right:32px">
  <option value="pdf">PDF (print)</option>
  <option value="json">JSON</option>
  <option value="csv">CSV</option>
  <option value="xls">Excel (.xls)</option>
  <option value="md">Markdown</option>
</select>
<button class="btn primary" onclick="doExport()">Export</button>
</div></header>
<main>
<section><h2>Summary</h2>
<div class="kpi">
${Object.entries(counts).map(([k,v])=>`<div class="box"><div class="l">${k}</div><div class="n">${v}</div></div>`).join("")}
<div class="box"><div class="l">Modules</div><div class="n">${modules.length}</div></div>
<div class="box"><div class="l">Scenarios</div><div class="n">${scenarioTotal}</div></div>
</div></section>

<section><h2>Modules</h2>
<div class="tabs" id="tabs"></div>
<div id="modarea"></div>
</section>

<section><h2>All findings (flat)</h2>
<table><thead><tr><th>ID</th><th>Module</th><th>Severity</th><th>Title</th><th>Category</th><th>Confidence</th><th>Evidence</th></tr></thead>
<tbody id="fbody"></tbody></table>
</section>

<section><h2>Deferred hypotheses (HITL)</h2>
<table><thead><tr><th>ID</th><th>Title</th><th>Test plan</th></tr></thead><tbody id="hbody"></tbody></table>
</section>
</main>
<script>
const D=${dataJson};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const findingById=Object.fromEntries(D.findings.map(f=>[f.id,f]));
const tabs=document.getElementById("tabs"),area=document.getElementById("modarea");
function renderModule(m){
  const findings=(m.findings||[]).map(id=>findingById[id]).filter(Boolean);
  return \`<div class="module">
    <h3>\${esc(m.name)} <span class="sub">(\${esc(m.slug)})</span></h3>
    \${m.routes&&m.routes.length?'<b>Routes</b><pre>'+m.routes.map(esc).join("\\n")+'</pre>':''}
    \${m.features&&m.features.length?'<b>Features observed</b><ul>'+m.features.map(f=>'<li>'+esc(f)+'</li>').join("")+'</ul>':''}
    <b>Test scenarios (\${(m.scenarios||[]).length})</b>
    <table><thead><tr><th>ID</th><th>Description</th><th>Result</th><th>Evidence</th></tr></thead><tbody>\${(m.scenarios||[]).map(s=>{const ev=s.evidence&&(s.evidence.screenshot||s.evidence.dom||s.evidence.headers)||'';return '<tr><td><code>'+esc(s.id||'')+'</code></td><td>'+esc(s.desc||'')+'</td><td class="result-'+esc(s.result||'')+'">'+esc(s.result||'')+'</td><td><code>'+esc(ev)+'</code></td></tr>'}).join("")}</tbody></table>
    <b>Findings (\${findings.length})</b>
    \${findings.length?'<table><thead><tr><th>ID</th><th>Sev</th><th>Title</th><th>Confidence</th><th>CVSS 4.0</th><th>Evidence file</th></tr></thead><tbody>'+findings.map(f=>'<tr><td><code>'+esc(f.id)+'</code></td><td><span class="sev '+esc(f.sev)+'">'+esc(f.sev)+'</span></td><td><b>'+esc(f.title)+'</b><br><span class="sub">'+esc(f.evidence||'')+'</span><br><i>Fix:</i> '+esc(f.recommendation||'')+'</td><td>'+esc(f.confidence||'')+'</td><td>'+esc(f.cvss4?(f.cvss4.score+' '+(f.cvss4.vector||'')):'')+'</td><td><code>'+esc(f.evidence_path||'')+'</code></td></tr>').join("")+'</tbody></table>':'<p class="sub">No findings for this module.</p>'}
    \${m.coverage?'<p class="sub"><b>Coverage:</b> '+esc(m.coverage)+'</p>':''}
  </div>\`;
}
D.modules.forEach((m,i)=>{
  const t=document.createElement("button");t.className="tab"+(i===0?" active":"");t.textContent=m.name+" ("+(m.findings||[]).length+")";t.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));t.classList.add("active");area.innerHTML=renderModule(m);};tabs.appendChild(t);
});
if(D.modules[0]) area.innerHTML=renderModule(D.modules[0]);

document.getElementById("fbody").innerHTML=D.findings.map(f=>\`<tr><td><code>\${esc(f.id)}</code></td><td>\${esc(f.module||'')}</td><td><span class="sev \${esc(f.sev)}">\${esc(f.sev)}</span></td><td><b>\${esc(f.title)}</b></td><td>\${esc(f.category||f.owasp||"")}</td><td>\${esc(f.confidence||"")}</td><td><code>\${esc(f.evidence_path||'')}</code></td></tr>\`).join("");
document.getElementById("hbody").innerHTML=(D.hypotheses||[]).map(h=>\`<tr><td><code>\${esc(h.id)}</code></td><td>\${esc(h.title)}</td><td>\${esc(h.test_plan)}</td></tr>\`).join("");

function dl(name,mime,body){const b=new Blob([body],{type:mime}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);}
const csvEsc=v=>{const s=String(v??"");return /[",\\r\\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
function exportJSON(){dl("report.json","application/json",JSON.stringify(D,null,2));}
function exportCSV(){const h=["id","module","sev","title","category","confidence","evidence_path","recommendation"];const rows=[h,...D.findings.map(f=>h.map(k=>f[k]??""))];dl("report.csv","text/csv;charset=utf-8","\\ufeff"+rows.map(r=>r.map(csvEsc).join(",")).join("\\r\\n"));}
function exportXLS(){const xesc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;");const row=c=>"<Row>"+c.map(x=>'<Cell><Data ss:Type="String">'+xesc(x)+"</Data></Cell>").join("")+"</Row>";const rows=[row(["ID","Module","Severity","Title","Category","Confidence","Evidence","Recommendation"]),...D.findings.map(f=>row([f.id,f.module||"",f.sev,f.title,f.category||f.owasp||"",f.confidence||"",f.evidence_path||"",f.recommendation||""]))].join("");dl("report.xls","application/vnd.ms-excel",'<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Findings"><Table>'+rows+"</Table></Worksheet></Workbook>");}
function exportMD(){const lines=["# Security Assessment Report",""," - Target: "+D.meta.target," - Date: "+D.meta.date," - Modules: "+D.modules.length,""];for(const m of D.modules){lines.push("## "+m.name+" ("+m.slug+")");if(m.routes)for(const r of m.routes)lines.push("- "+r);lines.push("");for(const fid of (m.findings||[])){const f=findingById[fid];if(!f)continue;lines.push("### "+f.id+" ["+f.sev+"] "+f.title);lines.push("- Evidence: "+(f.evidence_path||""));lines.push("- Fix: "+(f.recommendation||""));lines.push("");}}dl("report.md","text/markdown;charset=utf-8",lines.join("\\n"));}
function doExport(){const v=document.getElementById("fmt").value;({pdf:()=>window.print(),json:exportJSON,csv:exportCSV,xls:exportXLS,md:exportMD})[v]();}
</script></body></html>`;
fs.writeFileSync(path.join(dir, "report.html"), html);

console.log(`wrote:\n  ${path.join(dir, "report.html")}\n  ${path.join(dir, "report.json")}\n  ${path.join(dir, "report.md")}`);
console.log(`modules=${modules.length} scenarios=${scenarioTotal} findings=${findings.length}`);
