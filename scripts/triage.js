#!/usr/bin/env node
// triage.js — merge recon+verified, dedupe by (title+category), drop findings whose evidence file is missing,
// downgrade probable→heuristic when PoC absent. Writes findings.final.json.
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
if (!dir) { console.error('usage: triage.js <run-dir>'); process.exit(2); }

function load(name) { const p = path.join(dir, name); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p,'utf8')) : { findings: [] }; }
const recon = load('findings.recon.json').findings || [];
const verified = load('findings.verified.json').findings || [];

// Normalize recon findings: tag confidence heuristic if no evidence_path.
for (const f of recon) {
  f.confidence = f.confidence || 'heuristic';
  f.module = f.module || 'infrastructure';
}

// Verified wins over recon on duplicate (title match on lowercase substring).
const key = f => (f.title || '').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const bestByKey = new Map();
function rank(f) {
  const cRank = { verified: 0, probable: 1, heuristic: 2 };
  return (cRank[f.confidence] ?? 3);
}
for (const f of [...verified, ...recon]) {
  const k = key(f);
  const cur = bestByKey.get(k);
  if (!cur || rank(f) < rank(cur)) bestByKey.set(k, f);
}
let final = [...bestByKey.values()];

// Drop findings whose evidence_path is set but missing on disk.
final = final.filter(f => {
  if (!f.evidence_path) return true;
  const exists = fs.existsSync(f.evidence_path);
  if (!exists) console.warn('[triage] dropping', f.id, '— missing evidence:', f.evidence_path);
  return exists;
});

// Downgrade probable → heuristic if no PoC evidence.
for (const f of final) {
  if (f.confidence === 'probable' && !f.evidence_path) f.confidence = 'heuristic';
}

// Renumber IDs stably as F-01..F-NN sorted by severity.
const sevRank = { CRITICAL:0, HIGH:1, MEDIUM:2, LOW:3, INFO:4, OK:5 };
final.sort((a,b)=>(sevRank[a.sev]??9)-(sevRank[b.sev]??9));

fs.writeFileSync(path.join(dir,'findings.final.json'), JSON.stringify({
  meta:{ generated_at:new Date().toISOString(), generator:'triage.js v1', run_dir:dir },
  findings: final,
}, null, 2));

const counts = final.reduce((a,f)=>{a[f.sev]=(a[f.sev]||0)+1;return a},{});
console.log('triage done:', final.length, 'findings after dedupe;', 'counts:', counts);
