#!/usr/bin/env node
// build-report.js — assemble report.html + report.json + report.md from findings.*.json artifacts.
// Usage: node scripts/build-report.js reports/<date>-<slug>
//
// Merges findings.recon.json, findings.enum.json (optional), findings.verified.json (optional),
// findings.final.json (optional). Later artifacts override earlier ones by finding id.

const fs = require("fs");
const path = require("path");

const dir = process.argv[2];
if (!dir) { console.error("usage: build-report.js <report-dir>"); process.exit(2); }

function load(name) {
  const p = path.join(dir, name);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const artifacts = [
  load("findings.recon.json"),
  load("findings.enum.json"),
  load("findings.verified.json"),
  load("findings.final.json"),
  load("findings.json"), // fallback for standalone recon
].filter(Boolean);

if (artifacts.length === 0) {
  console.error("no findings.*.json artifacts in", dir);
  process.exit(2);
}

const merged = new Map();
for (const a of artifacts) {
  for (const f of (a.findings || [])) merged.set(f.id, { ...(merged.get(f.id) || {}), ...f });
}
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
};

const sevRank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4, OK: 5 };
findings.sort((a, b) => (sevRank[a.sev ?? "INFO"] ?? 9) - (sevRank[b.sev ?? "INFO"] ?? 9));
const counts = findings.reduce((a, f) => { a[f.sev] = (a[f.sev] || 0) + 1; return a; }, {});

// --- write JSON ---
fs.writeFileSync(
  path.join(dir, "report.json"),
  JSON.stringify({ meta, counts, findings }, null, 2)
);

// --- write Markdown ---
const md = [
  `# Security Assessment Report — ${meta.target}`,
  ``,
  `- **Date:** ${meta.date}`,
  `- **Tester:** ${meta.tester}`,
  `- **Authorization:** ${meta.authorization}`,
  ``,
  `## Summary`,
  ``,
  Object.entries(counts).map(([k, v]) => `- ${k}: ${v}`).join("\n"),
  ``,
  `## Findings`,
  ``,
  ...findings.map(f => [
    `### ${f.id} — [${f.sev}] ${f.title}`,
    ``,
    `- **Category:** ${f.category ?? f.owasp ?? "—"}`,
    f.confidence ? `- **Confidence:** ${f.confidence}` : null,
    f.cvss4?.vector ? `- **CVSS 4.0:** ${f.cvss4.score} (${f.cvss4.vector})` : null,
    ``,
    `**Evidence**`, "", "```", (f.evidence || "").trim(), "```", "",
    `**Recommendation:** ${f.recommendation || f.remediation?.patch || "—"}`,
    "",
  ].filter(Boolean).join("\n")),
].join("\n");
fs.writeFileSync(path.join(dir, "report.md"), md);

// --- write HTML (self-contained; export buttons for CSV/PDF/Excel/JSON) ---
const findingsJson = JSON.stringify(findings).replace(/</g, "\\u003c");
const metaJson = JSON.stringify(meta).replace(/</g, "\\u003c");
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
section h2{margin:0 0 12px;font-size:16px;color:var(--accent)}
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
@media print{body{background:#fff;color:#111}header .toolbar,footer{display:none}section{background:#fff;border:1px solid #ccc;page-break-inside:avoid}code,pre{background:#f3f4f6;color:#111}tr:hover td{background:transparent}}
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
</div></section>
<section><h2>Findings</h2>
<table><thead><tr><th>ID</th><th>Severity</th><th>Title</th><th>Category</th><th>Confidence</th><th>Evidence</th><th>Recommendation</th></tr></thead>
<tbody id="fbody"></tbody></table>
</section></main>
<script>
const F=${findingsJson},M=${metaJson};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
document.getElementById("fbody").innerHTML=F.map(f=>\`<tr><td><code>\${esc(f.id)}</code></td><td><span class="sev \${esc(f.sev)}">\${esc(f.sev)}</span></td><td><b>\${esc(f.title)}</b></td><td>\${esc(f.category||f.owasp||"")}</td><td>\${esc(f.confidence||"")}</td><td>\${esc(f.evidence||"")}</td><td>\${esc(f.recommendation||"")}</td></tr>\`).join("");
function dl(name,mime,body){const b=new Blob([body],{type:mime}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);}
const csvEsc=v=>{const s=String(v??"");return /[",\\r\\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
function exportJSON(){dl("report.json","application/json",JSON.stringify({meta:M,findings:F},null,2));}
function exportCSV(){const h=["id","sev","title","category","confidence","evidence","recommendation"];const rows=[h,...F.map(f=>h.map(k=>f[k]??""))];dl("report.csv","text/csv;charset=utf-8","\\ufeff"+rows.map(r=>r.map(csvEsc).join(",")).join("\\r\\n"));}
function exportXLS(){const xesc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;");const row=c=>"<Row>"+c.map(x=>'<Cell><Data ss:Type="String">'+xesc(x)+"</Data></Cell>").join("")+"</Row>";const rows=[row(["ID","Severity","Title","Category","Confidence","Evidence","Recommendation"]),...F.map(f=>row([f.id,f.sev,f.title,f.category||f.owasp||"",f.confidence||"",f.evidence||"",f.recommendation||""]))].join("");dl("report.xls","application/vnd.ms-excel",'<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Findings"><Table>'+rows+"</Table></Worksheet></Workbook>");}
function exportMD(){const lines=["# Security Assessment Report",""," - Target: "+M.target," - Date: "+M.date," - Tester: "+M.tester," - Authorization: "+M.authorization,"","## Findings",""];for(const f of F){lines.push("### "+f.id+" — ["+f.sev+"] "+f.title);lines.push("");lines.push("- Category: "+(f.category||f.owasp||"—"));if(f.confidence)lines.push("- Confidence: "+f.confidence);if(f.cvss4)lines.push("- CVSS 4.0: "+(f.cvss4.score||"")+" ("+(f.cvss4.vector||"")+")");lines.push("");lines.push("**Evidence**\\n\\n\`\`\`\\n"+(f.evidence||"").trim()+"\\n\`\`\`");lines.push("");lines.push("**Recommendation:** "+(f.recommendation||"—"));lines.push("");}dl("report.md","text/markdown;charset=utf-8",lines.join("\\n"));}
function doExport(){const v=document.getElementById("fmt").value;({pdf:()=>window.print(),json:exportJSON,csv:exportCSV,xls:exportXLS,md:exportMD})[v]();}
</script></body></html>`;
fs.writeFileSync(path.join(dir, "report.html"), html);

console.log(`wrote:\n  ${path.join(dir, "report.html")}\n  ${path.join(dir, "report.json")}\n  ${path.join(dir, "report.md")}`);
