#!/usr/bin/env node
// analyze-recon.js — reads raw/ evidence from a recon run and emits findings.json.
// Rule-based, deterministic. Add checks here as the agent matures.
//
// Usage: node scripts/analyze-recon.js reports/<date>-<slug>

const fs = require("fs");
const path = require("path");

const OUT_DIR = process.argv[2];
if (!OUT_DIR) {
  console.error("usage: analyze-recon.js <report-dir>");
  process.exit(2);
}
const RAW = path.join(OUT_DIR, "raw");
if (!fs.existsSync(RAW)) {
  console.error(`no raw/ evidence directory in ${OUT_DIR}`);
  process.exit(2);
}

const readOr = (f, d = "") => (fs.existsSync(f) ? fs.readFileSync(f, "utf8") : d);
const parseHeaders = (text) => {
  const map = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z0-9-]+):\s*(.*)$/);
    if (m) map[m[1].toLowerCase()] = m[2].trim();
  }
  return map;
};

const findings = [];
const push = (f) => findings.push({ id: `F-${String(findings.length + 1).padStart(2, "0")}`, ...f });

const rootHeadersRaw = readOr(path.join(RAW, "headers-root.txt"));
const rootHeaders = parseHeaders(rootHeadersRaw);

// --- Security header checks ---
const headerChecks = [
  { key: "strict-transport-security", sev: "MEDIUM", cat: "A02 Security Misconfiguration",
    title: "Missing HSTS", rec: "Add Strict-Transport-Security: max-age=63072000; includeSubDomains; preload after verifying every subdomain is HTTPS-only." },
  { key: "content-security-policy", sev: "MEDIUM", cat: "A02 Security Misconfiguration",
    title: "Missing Content-Security-Policy", rec: "Ship a nonce-based CSP: default-src 'self'; script-src 'self' 'nonce-<N>'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'." },
  { key: "x-frame-options", sev: "LOW", cat: "A02 Security Misconfiguration",
    title: "Missing clickjacking protection (X-Frame-Options)", rec: "Prefer CSP frame-ancestors 'none'; or X-Frame-Options: DENY." },
  { key: "x-content-type-options", sev: "LOW", cat: "A02 Security Misconfiguration",
    title: "Missing X-Content-Type-Options", rec: "Add X-Content-Type-Options: nosniff globally." },
  { key: "referrer-policy", sev: "LOW", cat: "A02 Security Misconfiguration",
    title: "Missing Referrer-Policy", rec: "Add Referrer-Policy: strict-origin-when-cross-origin." },
  { key: "permissions-policy", sev: "LOW", cat: "A02 Security Misconfiguration",
    title: "Missing Permissions-Policy", rec: "Deny unused features, e.g. Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()." },
];
for (const c of headerChecks) {
  if (!rootHeaders[c.key]) {
    push({ sev: c.sev, category: c.cat, title: c.title,
      evidence: `Header \`${c.key}\` absent on GET /.`,
      recommendation: c.rec });
  }
}

// --- X-Powered-By fingerprint ---
if (rootHeaders["x-powered-by"]) {
  push({ sev: "LOW", category: "A05 Injection / Info Disclosure",
    title: "Framework fingerprinting via X-Powered-By",
    evidence: `x-powered-by: ${rootHeaders["x-powered-by"]}`,
    recommendation: "Strip framework banner (Next.js: `poweredByHeader:false` in next.config.js). Enforce at Caddy too as belt-and-braces." });
}

// --- robots.txt route enumeration ---
const robots = readOr(path.join(RAW, "robots.txt"));
if (robots) {
  const disallow = [...robots.matchAll(/^Disallow:\s*(\S+)/gm)].map((m) => m[1]);
  const juicy = disallow.filter((p) => /admin|super|reset|forgot|verify|2fa|invite|share|api\//i.test(p));
  if (juicy.length >= 3) {
    push({ sev: "LOW", category: "A01 Broken Access Control (recon aid)",
      title: "robots.txt enumerates sensitive routes",
      evidence: `Disallow list includes: ${juicy.slice(0, 8).join(", ")}${juicy.length > 8 ? ", …" : ""}.`,
      recommendation: "Do not enumerate protected paths in robots.txt. Rely on server-side auth; use noindex on individual pages." });
  }
}

// --- security.txt ---
const secTxt = readOr(path.join(RAW, "infra-files.txt"));
if (/security\.txt/.test(secTxt) && /404\s+.*security\.txt/.test(secTxt)) {
  push({ sev: "INFO", category: "Best practice",
    title: "Missing /.well-known/security.txt",
    evidence: "GET /.well-known/security.txt returned 404.",
    recommendation: "Publish security.txt per RFC 9116 (Contact, Expires, Preferred-Languages)." });
}

// --- HTTPS redirect ---
const httpHeaders = readOr(path.join(RAW, "headers-http.txt"));
const httpStatus = (httpHeaders.match(/^HTTP\/[\d.]+ (\d+)/m) || [])[1];
if (httpStatus && /^(301|308)$/.test(httpStatus)) {
  push({ sev: "OK", category: "Positive control",
    title: "HTTPS enforced from plain HTTP",
    evidence: `HTTP responded ${httpStatus} → HTTPS.`,
    recommendation: "Maintain. Combine with HSTS to close first-visit downgrade window." });
} else if (httpStatus) {
  push({ sev: "MEDIUM", category: "A02 Security Misconfiguration",
    title: "HTTP not redirected to HTTPS",
    evidence: `HTTP responded ${httpStatus} without redirect.`,
    recommendation: "Force 308 to https:// for every HTTP request." });
}

// --- CORS reflection ---
const corsEvil = parseHeaders(readOr(path.join(RAW, "cors-evil.txt")));
const corsNull = parseHeaders(readOr(path.join(RAW, "cors-null.txt")));
if (corsEvil["access-control-allow-origin"] === "https://evil.example") {
  push({ sev: "HIGH", category: "A01 CORS Misconfiguration",
    title: "CORS reflects arbitrary Origin",
    evidence: `Access-Control-Allow-Origin echoed https://evil.example.`,
    recommendation: "Whitelist origins server-side; never reflect the Origin header. Do not combine reflection with Allow-Credentials: true." });
}
if (corsNull["access-control-allow-origin"] === "null") {
  push({ sev: "MEDIUM", category: "A01 CORS Misconfiguration",
    title: "CORS allows Origin: null",
    evidence: "Access-Control-Allow-Origin: null.",
    recommendation: "Reject `null` origins — they arise from sandboxed iframes and file:// contexts and are exploitable." });
}

// --- TLS ---
const tls = readOr(path.join(RAW, "tls.txt"));
if (/tls1:\s*New,/.test(tls) || /tls1_1:\s*New,/.test(tls)) {
  push({ sev: "MEDIUM", category: "A04 Cryptographic Failures",
    title: "Legacy TLS version accepted",
    evidence: "openssl s_client negotiated TLS 1.0 or 1.1.",
    recommendation: "Disable TLS < 1.2 at the edge (Caddy: `tls { protocols tls1.2 tls1.3 }`)." });
} else if (/tls1_3:\s*New,/.test(tls) && /tls1_2:\s*New,/.test(tls)) {
  push({ sev: "OK", category: "Positive control",
    title: "TLS 1.2 & 1.3 only",
    evidence: "TLS 1.0/1.1 refused; 1.2 and 1.3 accepted.",
    recommendation: "Maintain. Track cipher-suite deprecations." });
}

// --- Emit ---
const findingsPath = path.join(OUT_DIR, "findings.json");
fs.writeFileSync(findingsPath, JSON.stringify({
  meta: {
    generated_at: new Date().toISOString(),
    generator: "analyze-recon.js v1",
    evidence_dir: RAW,
  },
  findings,
}, null, 2));

console.log(`wrote ${findings.length} findings → ${findingsPath}`);
