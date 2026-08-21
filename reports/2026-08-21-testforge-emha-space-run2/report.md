# Security Assessment Report — https://testforge.emha.space

- **Date:** 2026-08-21
- **Tester:** ariefrahman
- **Authorization:** owner
- **Run:** `reports/2026-08-21-testforge-emha-space-run2`
- **Modules covered:** 9
- **Scenarios executed:** 27

## Executive summary

Authenticated walk-through as owner covered 9 module(s) with 27 test scenarios. Findings by severity: MEDIUM=5, LOW=19, INFO=1, OK=1.

## Findings by severity

- MEDIUM: 5
- LOW: 19
- INFO: 1
- OK: 1

## Modules

### Module: Landing (pre-auth) (`landing`)

**Routes / URLs**

- `https://testforge.emha.space/`

**Feature description (observed)**

- Public landing page; links to /login, /signup

**Test scenarios executed**

| ID | Description | Result | Evidence |
|---|---|---|---|
| S-L1 | Load landing, capture headers | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/landing/home.png |

**Findings in this module**

#### V-01 — [MEDIUM] Missing security header: strict-transport-security

- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N)
- **Evidence file:** `reports/2026-08-21-testforge-emha-space-run2/evidence/landing/home.headers.json`

**Evidence**

```
Header `strict-transport-security` absent on https://testforge.emha.space/. See reports/2026-08-21-testforge-emha-space-run2/evidence/landing/home.headers.json
```

**Recommendation:** Add `strict-transport-security` at edge (Caddy/Next config).

#### V-02 — [MEDIUM] Missing security header: content-security-policy

- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N)
- **Evidence file:** `reports/2026-08-21-testforge-emha-space-run2/evidence/landing/home.headers.json`

**Evidence**

```
Header `content-security-policy` absent on https://testforge.emha.space/. See reports/2026-08-21-testforge-emha-space-run2/evidence/landing/home.headers.json
```

**Recommendation:** Add `content-security-policy` at edge (Caddy/Next config).

#### V-03 — [LOW] Missing security header: x-frame-options

- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N)
- **Evidence file:** `reports/2026-08-21-testforge-emha-space-run2/evidence/landing/home.headers.json`

**Evidence**

```
Header `x-frame-options` absent on https://testforge.emha.space/. See reports/2026-08-21-testforge-emha-space-run2/evidence/landing/home.headers.json
```

**Recommendation:** Add `x-frame-options` at edge (Caddy/Next config).

#### V-04 — [LOW] Missing security header: x-content-type-options

- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N)
- **Evidence file:** `reports/2026-08-21-testforge-emha-space-run2/evidence/landing/home.headers.json`

**Evidence**

```
Header `x-content-type-options` absent on https://testforge.emha.space/. See reports/2026-08-21-testforge-emha-space-run2/evidence/landing/home.headers.json
```

**Recommendation:** Add `x-content-type-options` at edge (Caddy/Next config).

#### V-05 — [LOW] Missing security header: referrer-policy

- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N)
- **Evidence file:** `reports/2026-08-21-testforge-emha-space-run2/evidence/landing/home.headers.json`

**Evidence**

```
Header `referrer-policy` absent on https://testforge.emha.space/. See reports/2026-08-21-testforge-emha-space-run2/evidence/landing/home.headers.json
```

**Recommendation:** Add `referrer-policy` at edge (Caddy/Next config).

#### V-06 — [LOW] Missing security header: permissions-policy

- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N)
- **Evidence file:** `reports/2026-08-21-testforge-emha-space-run2/evidence/landing/home.headers.json`

**Evidence**

```
Header `permissions-policy` absent on https://testforge.emha.space/. See reports/2026-08-21-testforge-emha-space-run2/evidence/landing/home.headers.json
```

**Recommendation:** Add `permissions-policy` at edge (Caddy/Next config).

#### V-07 — [LOW] Framework fingerprinting via X-Powered-By

- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-200
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N)
- **Evidence file:** `reports/2026-08-21-testforge-emha-space-run2/evidence/landing/home.headers.json`

**Evidence**

```
x-powered-by: Next.js on https://testforge.emha.space/. See reports/2026-08-21-testforge-emha-space-run2/evidence/landing/home.headers.json
```

**Recommendation:** Strip banner (poweredByHeader:false in next.config.js).

**Coverage notes:** Read-only: header capture, DOM snapshot. Skipped: signup form fuzz (state-changing, HITL).

### Module: Authentication (`auth`)

**Routes / URLs**

- `https://testforge.emha.space/login`

**Feature description (observed)**

- Email + password login; links to /forgot-password, /signup, /login/2fa

**Test scenarios executed**

| ID | Description | Result | Evidence |
|---|---|---|---|
| S-A0 | Locate email/password inputs | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/auth/login-page.png |
| S-A1 | Submit valid email + wrong password; observe error message for user-enumeration | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/auth/login-wrong-password.png |
| S-A2 | Login with correct credentials | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/auth/post-login.png |
| S-A3 | Inspect session cookie flags | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/auth/cookies.json |

_No findings recorded for this module._

**Coverage notes:** Read-only: login form, wrong-password error, session cookies. Deferred (HITL): password reset flow, 2FA enrolment.

### Module: Dashboard (`dashboard`)

**Routes / URLs**

- `https://testforge.emha.space/dashboard`

**Feature description (observed)**

- TestForge — Test Case Management — Dashboard

**Test scenarios executed**

| ID | Description | Result | Evidence |
|---|---|---|---|
| S-DASHBOARD-1 | Navigate https://testforge.emha.space/dashboard (nav text: "TestForge") | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/dashboard/route-1.png |

_No findings recorded for this module._

**Coverage notes:** Visited 1/1 discovered route(s). State-changing actions (create/edit/delete) deferred to HITL.

### Module: My-work (`my-work`)

**Routes / URLs**

- `https://testforge.emha.space/my-work`

**Feature description (observed)**

- TestForge — Test Case Management

**Test scenarios executed**

| ID | Description | Result | Evidence |
|---|---|---|---|
| S-MY-WORK-1 | Navigate https://testforge.emha.space/my-work (nav text: "My Work") | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/my-work/route-1.png |

_No findings recorded for this module._

**Coverage notes:** Visited 1/1 discovered route(s). State-changing actions (create/edit/delete) deferred to HITL.

### Module: Projects (`projects`)

**Routes / URLs**

- `https://testforge.emha.space/projects`
- `https://testforge.emha.space/projects/testis`

**Feature description (observed)**

- TestForge — Test Case Management — Projects
- Testis — TestForge — Testis

**Test scenarios executed**

| ID | Description | Result | Evidence |
|---|---|---|---|
| S-PROJECTS-1 | Navigate https://testforge.emha.space/projects (nav text: "Projects") | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/projects/route-1.png |
| S-PROJECTS-2 | Form action= method=POST lacks visible CSRF token | finding | reports/2026-08-21-testforge-emha-space-run2/evidence/projects/route-1.png |
| S-PROJECTS-3 | Form action= method=POST lacks visible CSRF token | finding | reports/2026-08-21-testforge-emha-space-run2/evidence/projects/route-1.png |
| S-PROJECTS-4 | Navigate https://testforge.emha.space/projects/testis (nav text: "Testis") | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/projects/route-2.png |
| S-PROJECTS-5 | Form action= method=POST lacks visible CSRF token | finding | reports/2026-08-21-testforge-emha-space-run2/evidence/projects/route-2.png |

**Findings in this module**

#### V-08 — [LOW] Form on /projects has no visible CSRF token

- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N)
- **Evidence file:** `reports/2026-08-21-testforge-emha-space-run2/evidence/projects/route-1.html`

**Evidence**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See reports/2026-08-21-testforge-emha-space-run2/evidence/projects/route-1.html
```

**Recommendation:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

#### V-09 — [LOW] Form on /projects has no visible CSRF token

- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N)
- **Evidence file:** `reports/2026-08-21-testforge-emha-space-run2/evidence/projects/route-1.html`

**Evidence**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See reports/2026-08-21-testforge-emha-space-run2/evidence/projects/route-1.html
```

**Recommendation:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

#### V-10 — [LOW] Form on /projects/testis has no visible CSRF token

- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N)
- **Evidence file:** `reports/2026-08-21-testforge-emha-space-run2/evidence/projects/route-2.html`

**Evidence**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See reports/2026-08-21-testforge-emha-space-run2/evidence/projects/route-2.html
```

**Recommendation:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

**Coverage notes:** Visited 2/2 discovered route(s). State-changing actions (create/edit/delete) deferred to HITL.

### Module: Settings (`settings`)

**Routes / URLs**

- `https://testforge.emha.space/settings/team`
- `https://testforge.emha.space/settings/api-keys`
- `https://testforge.emha.space/settings/ai`
- `https://testforge.emha.space/settings/audit-log`
- `https://testforge.emha.space/settings/backup`
- `https://testforge.emha.space/settings/account`

**Feature description (observed)**

- TestForge — Test Case Management — Team
- TestForge — Test Case Management — API Keys
- TestForge — Test Case Management — AI assist
- TestForge — Test Case Management — Audit Log
- TestForge — Test Case Management — Backup & restore
- TestForge — Test Case Management — Account

**Test scenarios executed**

| ID | Description | Result | Evidence |
|---|---|---|---|
| S-SETTINGS-1 | Navigate https://testforge.emha.space/settings/team (nav text: "Team") | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-1.png |
| S-SETTINGS-2 | Form action= method=POST lacks visible CSRF token | finding | reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-1.png |
| S-SETTINGS-3 | Navigate https://testforge.emha.space/settings/api-keys (nav text: "API Keys") | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-2.png |
| S-SETTINGS-4 | Form action= method=POST lacks visible CSRF token | finding | reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-2.png |
| S-SETTINGS-5 | Form action= method=POST lacks visible CSRF token | finding | reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-2.png |
| S-SETTINGS-6 | Navigate https://testforge.emha.space/settings/ai (nav text: "AI Assist") | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-3.png |
| S-SETTINGS-7 | Form action= method=POST lacks visible CSRF token | finding | reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-3.png |
| S-SETTINGS-8 | Navigate https://testforge.emha.space/settings/audit-log (nav text: "Audit Log") | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-4.png |
| S-SETTINGS-9 | Navigate https://testforge.emha.space/settings/backup (nav text: "Backup") | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-5.png |
| S-SETTINGS-10 | Navigate https://testforge.emha.space/settings/account (nav text: "Account") | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-6.png |
| S-SETTINGS-11 | Form action= method=POST lacks visible CSRF token | finding | reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-6.png |

**Findings in this module**

#### V-11 — [LOW] Form on /settings/team has no visible CSRF token

- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N)
- **Evidence file:** `reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-1.html`

**Evidence**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-1.html
```

**Recommendation:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

#### V-12 — [LOW] Form on /settings/api-keys has no visible CSRF token

- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N)
- **Evidence file:** `reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-2.html`

**Evidence**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-2.html
```

**Recommendation:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

#### V-13 — [LOW] Form on /settings/api-keys has no visible CSRF token

- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N)
- **Evidence file:** `reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-2.html`

**Evidence**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-2.html
```

**Recommendation:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

#### V-14 — [LOW] Form on /settings/ai has no visible CSRF token

- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N)
- **Evidence file:** `reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-3.html`

**Evidence**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-3.html
```

**Recommendation:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

#### V-15 — [LOW] Form on /settings/account has no visible CSRF token

- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N)
- **Evidence file:** `reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-6.html`

**Evidence**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See reports/2026-08-21-testforge-emha-space-run2/evidence/settings/route-6.html
```

**Recommendation:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

**Coverage notes:** Visited 6/6 discovered route(s). State-changing actions (create/edit/delete) deferred to HITL.

### Module: Academy (`academy`)

**Routes / URLs**

- `https://testforge.emha.space/academy`
- `https://testforge.emha.space/academy/me`
- `https://testforge.emha.space/academy/fundamentals/what-qa-does`

**Feature description (observed)**

- QA Academy — learn software testing from scratch | TestForge — QA AcademyBeta
- My progress — TestForge QA Academy — My progressBeta
- What a tester actually does — QA Fundamentals | TestForge QA Academy — What a tester actually does

**Test scenarios executed**

| ID | Description | Result | Evidence |
|---|---|---|---|
| S-ACADEMY-1 | Navigate https://testforge.emha.space/academy (nav text: "AcademyBeta") | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/academy/route-1.png |
| S-ACADEMY-2 | Navigate https://testforge.emha.space/academy/me (nav text: "My progress") | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/academy/route-2.png |
| S-ACADEMY-3 | Navigate https://testforge.emha.space/academy/fundamentals/what-qa-does (nav text: "Start QA Fundamentals") | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/academy/route-3.png |

_No findings recorded for this module._

**Coverage notes:** Visited 3/3 discovered route(s). State-changing actions (create/edit/delete) deferred to HITL.

### Module: Docs (`docs`)

**Routes / URLs**

- `https://testforge.emha.space/docs/help`

**Feature description (observed)**

- Help — TestForge — Help

**Test scenarios executed**

| ID | Description | Result | Evidence |
|---|---|---|---|
| S-DOCS-1 | Navigate https://testforge.emha.space/docs/help (nav text: "Help") | pass | reports/2026-08-21-testforge-emha-space-run2/evidence/docs/route-1.png |

_No findings recorded for this module._

**Coverage notes:** Visited 1/1 discovered route(s). State-changing actions (create/edit/delete) deferred to HITL.

### Module: Infrastructure / Transport (`infrastructure`)

**Feature description (observed)**

- TLS + edge headers observed on public origin

**Findings in this module**

#### F-01 — [MEDIUM] Missing HSTS

- **Category:** A02 Security Misconfiguration
- **Confidence:** heuristic

**Evidence**

```
Header `strict-transport-security` absent on GET /.
```

**Recommendation:** Add Strict-Transport-Security: max-age=63072000; includeSubDomains; preload after verifying every subdomain is HTTPS-only.

#### F-02 — [MEDIUM] Missing Content-Security-Policy

- **Category:** A02 Security Misconfiguration
- **Confidence:** heuristic

**Evidence**

```
Header `content-security-policy` absent on GET /.
```

**Recommendation:** Ship a nonce-based CSP: default-src 'self'; script-src 'self' 'nonce-<N>'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'.

#### F-11 — [MEDIUM] Legacy TLS version accepted

- **Category:** A04 Cryptographic Failures
- **Confidence:** heuristic

**Evidence**

```
openssl s_client negotiated TLS 1.0 or 1.1.
```

**Recommendation:** Disable TLS < 1.2 at the edge (Caddy: `tls { protocols tls1.2 tls1.3 }`).

#### F-03 — [LOW] Missing clickjacking protection (X-Frame-Options)

- **Category:** A02 Security Misconfiguration
- **Confidence:** heuristic

**Evidence**

```
Header `x-frame-options` absent on GET /.
```

**Recommendation:** Prefer CSP frame-ancestors 'none'; or X-Frame-Options: DENY.

#### F-04 — [LOW] Missing X-Content-Type-Options

- **Category:** A02 Security Misconfiguration
- **Confidence:** heuristic

**Evidence**

```
Header `x-content-type-options` absent on GET /.
```

**Recommendation:** Add X-Content-Type-Options: nosniff globally.

#### F-05 — [LOW] Missing Referrer-Policy

- **Category:** A02 Security Misconfiguration
- **Confidence:** heuristic

**Evidence**

```
Header `referrer-policy` absent on GET /.
```

**Recommendation:** Add Referrer-Policy: strict-origin-when-cross-origin.

#### F-06 — [LOW] Missing Permissions-Policy

- **Category:** A02 Security Misconfiguration
- **Confidence:** heuristic

**Evidence**

```
Header `permissions-policy` absent on GET /.
```

**Recommendation:** Deny unused features, e.g. Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=().

#### F-07 — [LOW] Framework fingerprinting via X-Powered-By

- **Category:** A05 Injection / Info Disclosure

**Evidence**

```
x-powered-by: Next.js
```

**Recommendation:** Strip framework banner (Next.js: `poweredByHeader:false` in next.config.js). Enforce at Caddy too as belt-and-braces.

#### F-08 — [LOW] robots.txt enumerates sensitive routes

- **Category:** A01 Broken Access Control (recon aid)
- **Confidence:** heuristic

**Evidence**

```
Disallow list includes: /api/, /share/, /invite/, /verify, /verify-email, /reset-password, /forgot-password, /login/2fa, ….
```

**Recommendation:** Do not enumerate protected paths in robots.txt. Rely on server-side auth; use noindex on individual pages.

#### F-09 — [INFO] Missing /.well-known/security.txt

- **Category:** Best practice
- **Confidence:** heuristic

**Evidence**

```
GET /.well-known/security.txt returned 404.
```

**Recommendation:** Publish security.txt per RFC 9116 (Contact, Expires, Preferred-Languages).

#### F-10 — [OK] HTTPS enforced from plain HTTP

- **Category:** Positive control
- **Confidence:** heuristic

**Evidence**

```
HTTP responded 308 → HTTPS.
```

**Recommendation:** Maintain. Combine with HSTS to close first-visit downgrade window.

**Coverage notes:** Passive header + TLS probe.

## Deferred hypotheses (HITL required)

| ID | Title | Based on | Test plan |
|---|---|---|---|
| H-A1 | Password reset token reuse / no expiry | /forgot-password route enumerated | Request reset email twice, attempt to reuse first token after second issued |
| H-A2 | Login rate-limit bypass | login endpoint | 50 rapid wrong-password attempts; observe lockout |

## Out-of-scope observations

- Third-party CDNs and analytics: not tested (out of authorization scope).
- Backend infrastructure (host OS, DB): not probed.
- Password reset and 2FA enrolment flows: deferred to HITL.
