# Security Assessment Report — https://testforge.emha.space

- **Date:** 2026-08-21
- **Tester:** ariefrahman
- **Authorization:** owner

## Summary

- MEDIUM: 3
- LOW: 6
- INFO: 1
- OK: 1

## Findings

### F-01 — [MEDIUM] Missing HSTS
- **Category:** A02 Security Misconfiguration
**Evidence**
```
Header `strict-transport-security` absent on GET /.
```
**Recommendation:** Add Strict-Transport-Security: max-age=63072000; includeSubDomains; preload after verifying every subdomain is HTTPS-only.
### F-02 — [MEDIUM] Missing Content-Security-Policy
- **Category:** A02 Security Misconfiguration
**Evidence**
```
Header `content-security-policy` absent on GET /.
```
**Recommendation:** Ship a nonce-based CSP: default-src 'self'; script-src 'self' 'nonce-<N>'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'.
### F-11 — [MEDIUM] Legacy TLS version accepted
- **Category:** A04 Cryptographic Failures
**Evidence**
```
openssl s_client negotiated TLS 1.0 or 1.1.
```
**Recommendation:** Disable TLS < 1.2 at the edge (Caddy: `tls { protocols tls1.2 tls1.3 }`).
### F-03 — [LOW] Missing clickjacking protection (X-Frame-Options)
- **Category:** A02 Security Misconfiguration
**Evidence**
```
Header `x-frame-options` absent on GET /.
```
**Recommendation:** Prefer CSP frame-ancestors 'none'; or X-Frame-Options: DENY.
### F-04 — [LOW] Missing X-Content-Type-Options
- **Category:** A02 Security Misconfiguration
**Evidence**
```
Header `x-content-type-options` absent on GET /.
```
**Recommendation:** Add X-Content-Type-Options: nosniff globally.
### F-05 — [LOW] Missing Referrer-Policy
- **Category:** A02 Security Misconfiguration
**Evidence**
```
Header `referrer-policy` absent on GET /.
```
**Recommendation:** Add Referrer-Policy: strict-origin-when-cross-origin.
### F-06 — [LOW] Missing Permissions-Policy
- **Category:** A02 Security Misconfiguration
**Evidence**
```
Header `permissions-policy` absent on GET /.
```
**Recommendation:** Deny unused features, e.g. Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=().
### F-07 — [LOW] Framework fingerprinting via X-Powered-By
- **Category:** A05 Injection / Info Disclosure
**Evidence**
```
x-powered-by: Next.js
```
**Recommendation:** Strip framework banner (Next.js: `poweredByHeader:false` in next.config.js). Enforce at Caddy too as belt-and-braces.
### F-08 — [LOW] robots.txt enumerates sensitive routes
- **Category:** A01 Broken Access Control (recon aid)
**Evidence**
```
Disallow list includes: /api/, /share/, /invite/, /verify, /verify-email, /reset-password, /forgot-password, /login/2fa, ….
```
**Recommendation:** Do not enumerate protected paths in robots.txt. Rely on server-side auth; use noindex on individual pages.
### F-09 — [INFO] Missing /.well-known/security.txt
- **Category:** Best practice
**Evidence**
```
GET /.well-known/security.txt returned 404.
```
**Recommendation:** Publish security.txt per RFC 9116 (Contact, Expires, Preferred-Languages).
### F-10 — [OK] HTTPS enforced from plain HTTP
- **Category:** Positive control
**Evidence**
```
HTTP responded 308 → HTTPS.
```
**Recommendation:** Maintain. Combine with HSTS to close first-visit downgrade window.