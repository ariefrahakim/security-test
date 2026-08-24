#!/usr/bin/env node
// compare-reports.js — side-by-side comparison of two or more run reports.
// Usage: node scripts/compare-reports.js <out-dir> <run-a> <run-b> [<run-c> ...]

const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
if (argv.length < 3) {
  console.error("usage: compare-reports.js <out-dir> <run-dir-a> <run-dir-b> [<run-dir-c> ...]");
  process.exit(2);
}
const outDir = argv[0];
const runs = argv.slice(1).map((d) => {
  const p = path.join(d, "report.json");
  if (!fs.existsSync(p)) { console.error("missing", p); process.exit(2); }
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  return { dir: d, name: path.basename(d), data };
});

const SEV_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO", "OK"];
const SEV_WEIGHT = { CRITICAL: 10, HIGH: 7, MEDIUM: 3, LOW: 1, INFO: 0, OK: 0 };
const RISK_ORDER = ["CLEAN", "LOW", "MODERATE", "HIGH", "CRITICAL"];

function riskScore(r) {
  return SEV_ORDER.reduce((a, k) => a + (r.data.counts[k] || 0) * SEV_WEIGHT[k], 0);
}
function catCounts(r) {
  const m = {};
  for (const f of r.data.findings) {
    const k = (f.category || f.owasp || "Uncategorized").replace(/^[A-Z]\d+:\d+\s*/, "").trim() || "Uncategorized";
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}
function findingKey(f) {
  // Normalize to compare across runs — strip specific IDs / URLs / values.
  return (f.title || "")
    .toLowerCase()
    .replace(/\b\d+\b/g, "N")
    .replace(/`[^`]+`/g, "X")
    .replace(/https?:\/\/\S+/g, "URL")
    .replace(/\s+/g, " ")
    .trim();
}

const scored = runs.map((r) => ({ ...r, score: riskScore(r) }));
scored.sort((a, b) => a.score - b.score);
const winner = scored[0]; // lowest score = best posture
const loser = scored[scored.length - 1];

// Find shared vs unique finding themes across the compared runs.
const themes = new Map(); // theme -> per-run count array
runs.forEach((r, i) => {
  for (const f of r.data.findings) {
    const k = findingKey(f);
    if (!themes.has(k)) themes.set(k, { title: f.title || k, counts: runs.map(() => 0), sev: f.sev });
    themes.get(k).counts[i]++;
  }
});
const shared = [...themes.values()].filter((t) => t.counts.every((c) => c > 0));
const uniques = runs.map((r, i) =>
  [...themes.values()].filter((t) => t.counts[i] > 0 && t.counts.every((c, j) => (j === i ? true : c === 0)))
);

// ---------- MARKDOWN ----------
const md = [];
md.push("# Security Comparison Report");
md.push("");
md.push(`Comparing ${runs.length} run(s) side by side. Lower risk-score is better.`);
md.push("");
md.push("## Verdict");
md.push("");
md.push(`**Winner (best security posture): \`${winner.data.meta.target}\`** (risk-score ${winner.score}).`);
if (scored.length > 1 && loser.score > winner.score) {
  md.push(`Worst posture: \`${loser.data.meta.target}\` (risk-score ${loser.score}).`);
}
md.push("");

md.push("## Side by side");
md.push("");
md.push("| Metric | " + runs.map((r) => `\`${r.data.meta.target}\``).join(" | ") + " |");
md.push("|---|" + runs.map(() => "---").join("|") + "|");
md.push("| Run dir | " + runs.map((r) => "`" + r.name + "`").join(" | ") + " |");
md.push("| Date | " + runs.map((r) => r.data.meta.date).join(" | ") + " |");
md.push("| Authorization | " + runs.map((r) => r.data.meta.authorization).join(" | ") + " |");
md.push("| Overall risk | " + runs.map((r) => r.data.risk.level).join(" | ") + " |");
md.push("| Risk-score (lower=better) | " + runs.map((r) => riskScore(r)).join(" | ") + " |");
md.push("| Modules explored | " + runs.map((r) => r.data.modules.length).join(" | ") + " |");
md.push(
  "| Scenarios executed | " +
    runs.map((r) => r.data.modules.reduce((a, m) => a + (m.scenarios || []).length, 0)).join(" | ") +
    " |"
);
md.push("| Findings (total) | " + runs.map((r) => r.data.findings.length).join(" | ") + " |");
for (const k of SEV_ORDER) {
  md.push(`| ${k} | ` + runs.map((r) => r.data.counts[k] || 0).join(" | ") + " |");
}
md.push("| HITL-pending | " + runs.map((r) => (r.data.hypotheses || []).length).join(" | ") + " |");
md.push("");

md.push("## Categories present in each run");
md.push("");
const allCats = new Set();
const perRunCats = runs.map((r) => {
  const c = catCounts(r);
  Object.keys(c).forEach((k) => allCats.add(k));
  return c;
});
md.push("| Category | " + runs.map((r) => "`" + r.name + "`").join(" | ") + " |");
md.push("|---|" + runs.map(() => "---").join("|") + "|");
for (const cat of [...allCats].sort()) {
  md.push(`| ${cat} | ` + perRunCats.map((c) => c[cat] || 0).join(" | ") + " |");
}
md.push("");

if (shared.length) {
  md.push("## Findings present in ALL runs (systemic issues)");
  md.push("");
  md.push("| Severity | Title | " + runs.map((r, i) => "count " + (i + 1)).join(" | ") + " |");
  md.push("|---|---|" + runs.map(() => "---").join("|") + "|");
  for (const t of shared.sort((a, b) => (SEV_WEIGHT[b.sev] || 0) - (SEV_WEIGHT[a.sev] || 0))) {
    md.push(`| ${t.sev} | ${t.title} | ${t.counts.join(" | ")} |`);
  }
  md.push("");
}

runs.forEach((r, i) => {
  const list = uniques[i];
  if (!list.length) return;
  md.push(`## Only in \`${r.data.meta.target}\``);
  md.push("");
  md.push("| Severity | Title |");
  md.push("|---|---|");
  for (const t of list.sort((a, b) => (SEV_WEIGHT[b.sev] || 0) - (SEV_WEIGHT[a.sev] || 0))) {
    md.push(`| ${t.sev} | ${t.title} |`);
  }
  md.push("");
});

md.push("## Interpretation notes");
md.push("");
md.push("- **Risk-score** weights: CRITICAL=10, HIGH=7, MEDIUM=3, LOW=1, INFO/OK=0. Sum across all findings per run.");
md.push("- Fewer findings alone does not mean better security — coverage differs. Compare **severity mix** and **shared-category** rows first.");
md.push("- Findings marked as present-in-all-runs are systemic patterns that likely stem from the same platform/team choices (e.g. missing security headers at the edge).");
md.push("- Run counts reflect what the walker exercised on that date. State-changing PoCs are HITL-queued in `hypotheses.json` and are NOT counted as findings.");
md.push("");

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "comparison.md"), md.join("\n"));
fs.writeFileSync(
  path.join(outDir, "comparison.json"),
  JSON.stringify(
    {
      compared_at: new Date().toISOString(),
      runs: runs.map((r) => ({ name: r.name, target: r.data.meta.target, risk: r.data.risk, counts: r.data.counts, score: riskScore(r) })),
      winner: winner.data.meta.target,
      shared: shared.map((s) => ({ sev: s.sev, title: s.title, counts: s.counts })),
      uniques: runs.map((r, i) => ({ target: r.data.meta.target, findings: uniques[i].map((t) => ({ sev: t.sev, title: t.title })) })),
    },
    null,
    2
  )
);

// ---------- HTML ----------
const dataJson = JSON.stringify({
  runs: runs.map((r) => ({
    name: r.name,
    target: r.data.meta.target,
    date: r.data.meta.date,
    auth: r.data.meta.authorization,
    risk: r.data.risk,
    counts: r.data.counts,
    modules: r.data.modules.length,
    scenarios: r.data.modules.reduce((a, m) => a + (m.scenarios || []).length, 0),
    findings: r.data.findings.length,
    hypotheses: (r.data.hypotheses || []).length,
    score: riskScore(r),
    categories: catCounts(r),
  })),
  shared: shared.map((s) => ({ sev: s.sev, title: s.title, counts: s.counts })),
  uniques: runs.map((r, i) => ({ target: r.data.meta.target, findings: uniques[i].map((t) => ({ sev: t.sev, title: t.title })) })),
  winner: winner.data.meta.target,
}).replace(/</g, "\\u003c");

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<title>Security Comparison Report</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
:root{--bg:#0b1020;--panel:#141a2e;--panel2:#1c2340;--text:#e6ecff;--muted:#8b93b8;--sub:#a7b0d6;--accent:#66d9ef;--border:#2a3255;--card:#151b31;
--ok:#4ade80;--info:#60a5fa;--low:#fbbf24;--med:#fb923c;--high:#ef4444;--crit:#b91c1c;}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--text);font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
header{padding:22px 40px;border-bottom:1px solid var(--border);background:linear-gradient(180deg,#0e1530,#0b1020)}
h1{margin:0;font-size:22px}.sub{color:var(--muted);font-size:13px}
main{padding:22px 40px 80px;max-width:1240px;margin:0 auto}
section{background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:20px 22px;margin:16px 0}
section h2{margin:0 0 12px;font-size:15px;color:var(--accent);text-transform:uppercase;letter-spacing:.8px}
.grid{display:grid;gap:14px}
.runs{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:16px}
.card.winner{border-color:var(--ok);box-shadow:0 0 0 1px var(--ok) inset}
.card .t{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px}
.card .tgt{font-size:15px;font-weight:700;margin:4px 0 8px;word-break:break-all}
.card .score{font-size:34px;font-weight:800;line-height:1}
.card .badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:10.5px;font-weight:700;margin-top:8px;letter-spacing:.5px}
.card .badge.win{background:var(--ok);color:#052e16}
.card .badge.lose{background:var(--high);color:#fff}
.card .badge.tie{background:var(--muted);color:#0b1020}
.metrics{display:grid;grid-template-columns:repeat(2,1fr);gap:6px 12px;margin-top:10px;font-size:12.5px}
.metrics span{color:var(--muted)}
.sev{padding:2px 8px;border-radius:999px;font-size:10.5px;font-weight:800;display:inline-block}
.sev.INFO{background:#1e3a8a55;color:var(--info)}.sev.LOW{background:#78350f66;color:var(--low)}
.sev.MEDIUM{background:#7c2d1266;color:var(--med)}.sev.HIGH{background:#7f1d1d66;color:var(--high)}
.sev.CRITICAL{background:#450a0a;color:#fecaca}.sev.OK{background:#14532d66;color:var(--ok)}
table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--border);vertical-align:top}
th{color:var(--muted);background:var(--panel2);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
.bar{height:8px;background:#0a0f22;border-radius:4px;overflow:hidden;display:flex}
.bar span{display:block;height:100%}
.legend{display:flex;flex-wrap:wrap;gap:12px;font-size:11px;color:var(--muted);margin-top:6px}
.legend b{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:4px;vertical-align:middle}
.verdict{background:linear-gradient(90deg,#14532d66,#141a2e);border:1px solid var(--ok);border-radius:12px;padding:16px 20px;margin-bottom:0}
.verdict .h{font-weight:800;font-size:15px;color:var(--ok);margin-bottom:2px}
</style></head><body>
<header><h1>Security Comparison</h1>
<div class="sub">Comparing ${runs.length} runs. Lower risk-score is better (CRIT×10 + HIGH×7 + MED×3 + LOW×1).</div>
</header>
<main>

<section class="verdict"><div class="h">✓ Winner: ${escapeHtml(winner.data.meta.target)}</div>
<div class="sub">Lowest risk-score (${winner.score}) across the compared runs. See side-by-side for context — coverage differs.</div></section>

<section><h2>Runs at a glance</h2>
<div class="grid runs" id="runCards"></div>
</section>

<section><h2>Severity breakdown</h2>
<div class="legend"><span><b style="background:#b91c1c"></b>Critical</span><span><b style="background:#ef4444"></b>High</span><span><b style="background:#fb923c"></b>Medium</span><span><b style="background:#fbbf24"></b>Low</span><span><b style="background:#60a5fa"></b>Info</span><span><b style="background:#4ade80"></b>OK</span></div>
<table><thead><tr><th>Target</th><th>Bar</th><th>Total</th></tr></thead><tbody id="barBody"></tbody></table>
</section>

<section><h2>Side by side</h2>
<table><thead><tr><th>Metric</th>${runs.map((r) => `<th>${escapeHtml(r.data.meta.target)}</th>`).join("")}</tr></thead><tbody id="sxsBody"></tbody></table>
</section>

<section><h2>Categories touched</h2>
<table><thead><tr><th>Category</th>${runs.map((r) => `<th>${escapeHtml(r.data.meta.target)}</th>`).join("")}</tr></thead><tbody id="catBody"></tbody></table>
</section>

${
  shared.length
    ? `<section><h2>Systemic — present in ALL runs</h2>
<table><thead><tr><th>Severity</th><th>Title</th>${runs.map((r, i) => `<th>Run ${i + 1}</th>`).join("")}</tr></thead>
<tbody>${shared.sort((a, b) => (SEV_WEIGHT[b.sev] || 0) - (SEV_WEIGHT[a.sev] || 0)).map((t) => `<tr><td><span class="sev ${escapeHtml(t.sev)}">${escapeHtml(t.sev)}</span></td><td>${escapeHtml(t.title)}</td>${t.counts.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></section>`
    : ""
}

<section><h2>Unique to each target</h2>
<div class="grid runs">
${runs
  .map((r, i) => {
    const list = uniques[i];
    if (!list.length) return `<div class="card"><div class="t">Only in</div><div class="tgt">${escapeHtml(r.data.meta.target)}</div><div class="sub">No unique findings.</div></div>`;
    return `<div class="card"><div class="t">Only in</div><div class="tgt">${escapeHtml(r.data.meta.target)}</div>
    <table style="margin-top:8px"><thead><tr><th style="width:70px">Sev</th><th>Title</th></tr></thead>
    <tbody>${list.sort((a, b) => (SEV_WEIGHT[b.sev] || 0) - (SEV_WEIGHT[a.sev] || 0)).map((t) => `<tr><td><span class="sev ${escapeHtml(t.sev)}">${escapeHtml(t.sev)}</span></td><td>${escapeHtml(t.title)}</td></tr>`).join("")}</tbody></table></div>`;
  })
  .join("")}
</div>
</section>

<section><h2>How to read this</h2>
<ul class="sub">
  <li><b>Risk-score</b> weights: CRITICAL=10, HIGH=7, MEDIUM=3, LOW=1, INFO/OK=0. Sum across all findings per run.</li>
  <li>Fewer findings alone ≠ better security. Coverage differs. Compare severity mix and systemic rows first.</li>
  <li>Findings present in all runs point to systemic issues in the shared platform (e.g. edge headers).</li>
  <li>State-changing PoCs are HITL-queued in <code>hypotheses.json</code> and NOT counted as findings.</li>
</ul>
</section>

</main>
<script>
const D=${dataJson};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const SEV_ORDER=['CRITICAL','HIGH','MEDIUM','LOW','INFO','OK'];
const SEV_COLOR={CRITICAL:'#b91c1c',HIGH:'#ef4444',MEDIUM:'#fb923c',LOW:'#fbbf24',INFO:'#60a5fa',OK:'#4ade80'};

// Run cards
const rc=document.getElementById('runCards');
const minScore=Math.min(...D.runs.map(r=>r.score));
const maxScore=Math.max(...D.runs.map(r=>r.score));
rc.innerHTML=D.runs.map(r=>{
  const isWin=r.target===D.winner && r.score===minScore;
  const isLose=r.score===maxScore && minScore!==maxScore && !isWin;
  const badge=isWin?'<span class="badge win">Best posture</span>':isLose?'<span class="badge lose">Worst posture</span>':'<span class="badge tie">—</span>';
  return \`<div class="card \${isWin?'winner':''}">
    <div class="t">Target</div>
    <div class="tgt">\${esc(r.target)}</div>
    <div class="t">Risk-score</div>
    <div class="score">\${r.score}</div>
    \${badge}
    <div class="metrics">
      <span>Overall risk</span><b>\${esc(r.risk.level)}</b>
      <span>Modules</span><b>\${r.modules}</b>
      <span>Scenarios</span><b>\${r.scenarios}</b>
      <span>Findings</span><b>\${r.findings}</b>
      <span>HITL-pending</span><b>\${r.hypotheses}</b>
      <span>Date</span><b>\${esc(r.date)}</b>
    </div>
  </div>\`;
}).join('');

// Bars
const barBody=document.getElementById('barBody');
const totals=D.runs.map(r=>SEV_ORDER.reduce((a,k)=>a+(r.counts[k]||0),0));
const maxTotal=Math.max(1,...totals);
barBody.innerHTML=D.runs.map((r,i)=>{
  const total=totals[i];
  const widthPct=(total/maxTotal)*100;
  const segs=SEV_ORDER.map(k=>{const v=r.counts[k]||0;if(!v)return '';const p=(v/(total||1))*100;return '<span title="'+k+' '+v+'" style="width:'+p+'%;background:'+SEV_COLOR[k]+'"></span>'}).join('');
  return \`<tr><td>\${esc(r.target)}</td><td><div class="bar" style="width:\${widthPct}%">\${segs}</div></td><td>\${total}</td></tr>\`;
}).join('');

// Side-by-side
const rows=[
  ['Overall risk',D.runs.map(r=>r.risk.level)],
  ['Risk-score (lower=better)',D.runs.map(r=>r.score)],
  ['Modules',D.runs.map(r=>r.modules)],
  ['Scenarios',D.runs.map(r=>r.scenarios)],
  ['Total findings',D.runs.map(r=>r.findings)],
  ['HITL-pending',D.runs.map(r=>r.hypotheses)],
  ...SEV_ORDER.map(k=>[k+' findings',D.runs.map(r=>r.counts[k]||0)]),
];
document.getElementById('sxsBody').innerHTML=rows.map(([label,vals])=>\`<tr><td><b>\${esc(label)}</b></td>\${vals.map(v=>'<td>'+esc(String(v))+'</td>').join('')}</tr>\`).join('');

// Categories
const cats=new Set();D.runs.forEach(r=>Object.keys(r.categories).forEach(c=>cats.add(c)));
document.getElementById('catBody').innerHTML=[...cats].sort().map(c=>\`<tr><td>\${esc(c)}</td>\${D.runs.map(r=>'<td>'+(r.categories[c]||0)+'</td>').join('')}</tr>\`).join('');
</script>
</body></html>`;

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

fs.writeFileSync(path.join(outDir, "comparison.html"), html);

console.log(`wrote:
  ${path.join(outDir, "comparison.html")}
  ${path.join(outDir, "comparison.json")}
  ${path.join(outDir, "comparison.md")}`);
console.log(`winner=${winner.data.meta.target} (score=${winner.score})`);
