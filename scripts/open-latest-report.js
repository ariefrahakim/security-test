#!/usr/bin/env node
// Opens the most recent reports/<run>/report.html in the OS default browser.
// Usage: npm run report          (opens latest)
//        npm run report -- <run> (opens a specific run directory name)

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPORTS = path.join(__dirname, '..', 'reports');
const arg = process.argv[2];

function listRuns() {
  return fs.readdirSync(REPORTS)
    .filter((d) => d !== '_agent-log')
    .filter((d) => fs.statSync(path.join(REPORTS, d)).isDirectory())
    .sort();
}

const runs = listRuns();
if (runs.length === 0) {
  console.error('No reports found under reports/. Run `npm run sec-test` first.');
  process.exit(1);
}

const run = arg || runs[runs.length - 1];
const htmlPath = path.join(REPORTS, run, 'report.html');
if (!fs.existsSync(htmlPath)) {
  console.error(`report.html not found at ${htmlPath}`);
  console.error('Available runs:');
  runs.forEach((r) => console.error('  ' + r));
  process.exit(1);
}

const opener =
  process.platform === 'darwin' ? 'open' :
  process.platform === 'win32' ? 'start ""' :
  'xdg-open';

console.log(`Opening ${htmlPath}`);
execSync(`${opener} ${JSON.stringify(htmlPath)}`);
