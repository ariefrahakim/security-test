# Security Assessment Report

**Target:** https://testforge.emha.space  
**Date:** 2026-08-21  
**Tester:** ariefrahman  
**Authorization:** owner  
**Run:** `reports/2026-08-21-testforge-emha-space`

## Overall risk: MODERATE

> Moderate risk — plan remediation this sprint

| Severity | Count |
|---|---|
| MEDIUM | 3 |
| LOW | 6 |
| INFO | 1 |
| OK | 1 |

## Executive summary (for PM / stakeholders)

- Coverage: **1 module(s)**, **0 test scenarios** executed.
- Findings: **11** total (3 MEDIUM, 6 LOW, 1 INFO, 1 OK).
- Top 3 action item(s):
  1. **Missing HSTS** — Add Strict-Transport-Security: max-age=63072000; includeSubDomains; preload after verifying every subdomain is HTTPS-only. _(owner: Platform / DevOps)_
  1. **Missing Content-Security-Policy** — Ship a nonce-based CSP: default-src 'self'; script-src 'self' 'nonce-<N>'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'. _(owner: Platform / DevOps)_
  1. **Legacy TLS version accepted** — Disable TLS < 1.2 at the edge (Caddy: `tls { protocols tls1.2 tls1.3 }`). _(owner: Platform / DevOps)_

## Modules

### Infrastructure / Transport (`infrastructure`) — MEDIUM:3 · LOW:6 · INFO:1 · OK:1

**Features observed**

- TLS + edge headers observed on public origin

**Findings**

#### F-01 — [MEDIUM] Missing HSTS

- **What it means:** Reduces defence-in-depth; can be chained into a bigger issue.
- **Effort to fix:** Minutes to hours — usually a config or header change.
- **Likely owner:** Platform / DevOps
- **Category:** A02 Security Misconfiguration

**How we saw it**

```
Header `strict-transport-security` absent on GET /.
```

**How to fix:** Add Strict-Transport-Security: max-age=63072000; includeSubDomains; preload after verifying every subdomain is HTTPS-only.

#### F-02 — [MEDIUM] Missing Content-Security-Policy

- **What it means:** Reduces defence-in-depth; can be chained into a bigger issue.
- **Effort to fix:** Minutes to hours — usually a config or header change.
- **Likely owner:** Platform / DevOps
- **Category:** A02 Security Misconfiguration

**How we saw it**

```
Header `content-security-policy` absent on GET /.
```

**How to fix:** Ship a nonce-based CSP: default-src 'self'; script-src 'self' 'nonce-<N>'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'.

#### F-11 — [MEDIUM] Legacy TLS version accepted

- **What it means:** Reduces defence-in-depth; can be chained into a bigger issue.
- **Effort to fix:** Minutes to hours — usually a config or header change.
- **Likely owner:** Platform / DevOps
- **Category:** A04 Cryptographic Failures

**How we saw it**

```
openssl s_client negotiated TLS 1.0 or 1.1.
```

**How to fix:** Disable TLS < 1.2 at the edge (Caddy: `tls { protocols tls1.2 tls1.3 }`).

#### F-03 — [LOW] Missing clickjacking protection (X-Frame-Options)

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A02 Security Misconfiguration

**How we saw it**

```
Header `x-frame-options` absent on GET /.
```

**How to fix:** Prefer CSP frame-ancestors 'none'; or X-Frame-Options: DENY.

#### F-04 — [LOW] Missing X-Content-Type-Options

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A02 Security Misconfiguration

**How we saw it**

```
Header `x-content-type-options` absent on GET /.
```

**How to fix:** Add X-Content-Type-Options: nosniff globally.

#### F-05 — [LOW] Missing Referrer-Policy

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A02 Security Misconfiguration

**How we saw it**

```
Header `referrer-policy` absent on GET /.
```

**How to fix:** Add Referrer-Policy: strict-origin-when-cross-origin.

#### F-06 — [LOW] Missing Permissions-Policy

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A02 Security Misconfiguration

**How we saw it**

```
Header `permissions-policy` absent on GET /.
```

**How to fix:** Deny unused features, e.g. Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=().

#### F-07 — [LOW] Framework fingerprinting via X-Powered-By

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A05 Injection / Info Disclosure

**How we saw it**

```
x-powered-by: Next.js
```

**How to fix:** Strip framework banner (Next.js: `poweredByHeader:false` in next.config.js). Enforce at Caddy too as belt-and-braces.

#### F-08 — [LOW] robots.txt enumerates sensitive routes

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Backend (API)
- **Category:** A01 Broken Access Control (recon aid)

**How we saw it**

```
Disallow list includes: /api/, /share/, /invite/, /verify, /verify-email, /reset-password, /forgot-password, /login/2fa, ….
```

**How to fix:** Do not enumerate protected paths in robots.txt. Rely on server-side auth; use noindex on individual pages.

#### F-09 — [INFO] Missing /.well-known/security.txt

- **What it means:** Informational — no exploit path observed.
- **Effort to fix:** Optional — best-practice tightening.
- **Likely owner:** To be triaged
- **Category:** Best practice

**How we saw it**

```
GET /.well-known/security.txt returned 404.
```

**How to fix:** Publish security.txt per RFC 9116 (Contact, Expires, Preferred-Languages).

#### F-10 — [OK] HTTPS enforced from plain HTTP

- **What it means:** Control observed working correctly.
- **Effort to fix:** No action.
- **Likely owner:** Platform / DevOps
- **Category:** Positive control

**How we saw it**

```
HTTP responded 308 → HTTPS.
```

**How to fix:** Maintain. Combine with HSTS to close first-visit downgrade window.

**Coverage notes:** Passive header + TLS probe.

## Out-of-scope observations

- Third-party CDNs and analytics: not tested.
- Backend infrastructure (host OS, DB): not probed.
- State-changing flows (password reset, 2FA, delete, checkout): deferred to HITL.