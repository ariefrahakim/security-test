# Security Assessment Report

**Target:** https://testforge.emha.space  
**Date:** 2026-08-21  
**Tester:** ariefrahman  
**Authorization:** owner  
**Run:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full`

## Overall risk: MODERATE

> Moderate risk — plan remediation this sprint

| Severity | Count |
|---|---|
| MEDIUM | 4 |
| LOW | 47 |
| INFO | 3 |
| OK | 1 |

## Executive summary (for PM / stakeholders)

- Coverage: **9 module(s)**, **46 test scenarios** executed.
- Findings: **55** total (4 MEDIUM, 47 LOW, 3 INFO, 1 OK).
- Top 3 action item(s):
  1. **Missing security header: strict-transport-security** — Add `strict-transport-security` at edge (Caddy/Next config). _(owner: Platform / DevOps)_
  1. **Framework fingerprinting via X-Powered-By** — Strip banner (poweredByHeader:false in next.config.js). _(owner: Platform / DevOps)_
  1. **Form on /projects has no visible CSRF token** — Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token. _(owner: Backend (Auth))_

## Modules

### Landing (pre-auth) (`landing`) — MEDIUM:4 · LOW:10

**Routes**

- `https://testforge.emha.space/`

**Features observed**

- Public landing page; links to /login, /signup

**Test scenarios (for QA)**

| ID | Scenario | Result | Evidence |
|---|---|---|---|
| S-L1 | Load landing, capture headers | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.png` |

**Findings**

#### V-01 — [MEDIUM] Missing security header: strict-transport-security

- **What it means:** Reduces defence-in-depth; can be chained into a bigger issue.
- **Effort to fix:** Minutes to hours — usually a config or header change.
- **Likely owner:** Platform / DevOps
- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json`

**How we saw it**

```
Header `strict-transport-security` absent on https://testforge.emha.space/. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json
```

**How to fix:** Add `strict-transport-security` at edge (Caddy/Next config).

#### V-02 — [MEDIUM] Missing security header: content-security-policy

- **What it means:** Reduces defence-in-depth; can be chained into a bigger issue.
- **Effort to fix:** Minutes to hours — usually a config or header change.
- **Likely owner:** Platform / DevOps
- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json`

**How we saw it**

```
Header `content-security-policy` absent on https://testforge.emha.space/. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json
```

**How to fix:** Add `content-security-policy` at edge (Caddy/Next config).

#### V-03 — [LOW] Missing security header: x-frame-options

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json`

**How we saw it**

```
Header `x-frame-options` absent on https://testforge.emha.space/. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json
```

**How to fix:** Add `x-frame-options` at edge (Caddy/Next config).

#### V-04 — [LOW] Missing security header: x-content-type-options

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json`

**How we saw it**

```
Header `x-content-type-options` absent on https://testforge.emha.space/. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json
```

**How to fix:** Add `x-content-type-options` at edge (Caddy/Next config).

#### V-05 — [LOW] Missing security header: referrer-policy

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json`

**How we saw it**

```
Header `referrer-policy` absent on https://testforge.emha.space/. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json
```

**How to fix:** Add `referrer-policy` at edge (Caddy/Next config).

#### V-06 — [LOW] Missing security header: permissions-policy

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json`

**How we saw it**

```
Header `permissions-policy` absent on https://testforge.emha.space/. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json
```

**How to fix:** Add `permissions-policy` at edge (Caddy/Next config).

#### V-07 — [LOW] Framework fingerprinting via X-Powered-By

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-200
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json`

**How we saw it**

```
x-powered-by: Next.js on https://testforge.emha.space/. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json
```

**How to fix:** Strip banner (poweredByHeader:false in next.config.js).

#### F-01 — [MEDIUM] Missing security header: strict-transport-security

- **What it means:** Reduces defence-in-depth; can be chained into a bigger issue.
- **Effort to fix:** Minutes to hours — usually a config or header change.
- **Likely owner:** Platform / DevOps
- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json`

**How we saw it**

```
Header `strict-transport-security` absent on https://testforge.emha.space/. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json
```

**How to fix:** Add `strict-transport-security` at edge (Caddy/Next config).

#### F-02 — [MEDIUM] Missing security header: content-security-policy

- **What it means:** Reduces defence-in-depth; can be chained into a bigger issue.
- **Effort to fix:** Minutes to hours — usually a config or header change.
- **Likely owner:** Platform / DevOps
- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json`

**How we saw it**

```
Header `content-security-policy` absent on https://testforge.emha.space/. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json
```

**How to fix:** Add `content-security-policy` at edge (Caddy/Next config).

#### F-03 — [LOW] Missing security header: x-frame-options

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json`

**How we saw it**

```
Header `x-frame-options` absent on https://testforge.emha.space/. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json
```

**How to fix:** Add `x-frame-options` at edge (Caddy/Next config).

#### F-04 — [LOW] Missing security header: x-content-type-options

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json`

**How we saw it**

```
Header `x-content-type-options` absent on https://testforge.emha.space/. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json
```

**How to fix:** Add `x-content-type-options` at edge (Caddy/Next config).

#### F-05 — [LOW] Missing security header: referrer-policy

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json`

**How we saw it**

```
Header `referrer-policy` absent on https://testforge.emha.space/. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json
```

**How to fix:** Add `referrer-policy` at edge (Caddy/Next config).

#### F-06 — [LOW] Missing security header: permissions-policy

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:L/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json`

**How we saw it**

```
Header `permissions-policy` absent on https://testforge.emha.space/. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json
```

**How to fix:** Add `permissions-policy` at edge (Caddy/Next config).

#### F-07 — [LOW] Framework fingerprinting via X-Powered-By

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-200
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json`

**How we saw it**

```
x-powered-by: Next.js on https://testforge.emha.space/. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/landing/home.headers.json
```

**How to fix:** Strip banner (poweredByHeader:false in next.config.js).

**Coverage notes:** Read-only: header capture, DOM snapshot. Skipped: signup form fuzz (state-changing, HITL).

### Authentication (`auth`) — no findings

**Routes**

- `https://testforge.emha.space/login`

**Features observed**

- Email + password login; links to /forgot-password, /signup, /login/2fa

**Test scenarios (for QA)**

| ID | Scenario | Result | Evidence |
|---|---|---|---|
| S-A0 | Locate email/password inputs | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/auth/login-page.png` |
| S-A1 | Submit valid email + wrong password; observe error message for user-enumeration | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/auth/login-wrong-password.png` |
| S-A2 | Login with correct credentials | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/auth/post-login.png` |
| S-A3 | Inspect session cookie flags | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/auth/cookies.json` |

_No findings recorded for this module._

**Coverage notes:** Read-only: login form, wrong-password error, session cookies. Deferred (HITL): password reset flow, 2FA enrolment.

### My-work (`my-work`) — no findings

**Routes**

- `https://testforge.emha.space/my-work`

**Features observed**

- TestForge — Test Case Management

**Test scenarios (for QA)**

| ID | Scenario | Result | Evidence |
|---|---|---|---|
| S-MY-WORK-1 | Navigate https://testforge.emha.space/my-work (nav text: "My Work") | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/my-work/route-1.png` |

_No findings recorded for this module._

**Coverage notes:** Visited 1/1 discovered route(s). State-changing actions (create/edit/delete) deferred to HITL.

### Projects (`projects`) — LOW:5

**Routes**

- `https://testforge.emha.space/projects`
- `https://testforge.emha.space/projects/testis`

**Features observed**

- TestForge — Test Case Management — Projects
- Testis — TestForge — Testis

**Test scenarios (for QA)**

| ID | Scenario | Result | Evidence |
|---|---|---|---|
| S-PROJECTS-1 | Navigate https://testforge.emha.space/projects (nav text: "Projects") | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/projects/route-1.png` |
| S-PROJECTS-2 | Form action= method=POST lacks visible CSRF token | finding | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/projects/route-1.png` |
| S-PROJECTS-3 | Form action= method=POST lacks visible CSRF token | finding | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/projects/route-1.png` |
| S-PROJECTS-4 | Navigate https://testforge.emha.space/projects/testis (nav text: "Testis") | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/projects/route-2.png` |
| S-PROJECTS-5 | Form action= method=POST lacks visible CSRF token | finding | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/projects/route-2.png` |

**Findings**

#### V-08 — [LOW] Form on /projects has no visible CSRF token

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Backend (Auth)
- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/projects/route-1.html`

**How we saw it**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/projects/route-1.html
```

**How to fix:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

#### V-09 — [LOW] Form on /projects has no visible CSRF token

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Backend (Auth)
- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/projects/route-1.html`

**How we saw it**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/projects/route-1.html
```

**How to fix:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

#### V-10 — [LOW] Form on /projects/testis has no visible CSRF token

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Backend (Auth)
- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/projects/route-2.html`

**How we saw it**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/projects/route-2.html
```

**How to fix:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

#### F-08 — [LOW] Form on /projects has no visible CSRF token

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Backend (Auth)
- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/projects/route-1.html`

**How we saw it**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/projects/route-1.html
```

**How to fix:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

#### F-09 — [LOW] Form on /projects/testis has no visible CSRF token

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Backend (Auth)
- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/projects/route-2.html`

**How we saw it**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/projects/route-2.html
```

**How to fix:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

**Coverage notes:** Visited 2/2 discovered route(s). State-changing actions (create/edit/delete) deferred to HITL.

### Settings (`settings`) — LOW:9

**Routes**

- `https://testforge.emha.space/settings/team`
- `https://testforge.emha.space/settings/api-keys`
- `https://testforge.emha.space/settings/ai`
- `https://testforge.emha.space/settings/audit-log`
- `https://testforge.emha.space/settings/backup`
- `https://testforge.emha.space/settings/account`

**Features observed**

- TestForge — Test Case Management — Team
- TestForge — Test Case Management — API Keys
- TestForge — Test Case Management — AI assist
- TestForge — Test Case Management — Audit Log
- TestForge — Test Case Management — Backup & restore
- TestForge — Test Case Management — Account

**Test scenarios (for QA)**

| ID | Scenario | Result | Evidence |
|---|---|---|---|
| S-SETTINGS-1 | Navigate https://testforge.emha.space/settings/team (nav text: "Team") | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-1.png` |
| S-SETTINGS-2 | Form action= method=POST lacks visible CSRF token | finding | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-1.png` |
| S-SETTINGS-3 | Navigate https://testforge.emha.space/settings/api-keys (nav text: "API Keys") | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-2.png` |
| S-SETTINGS-4 | Form action= method=POST lacks visible CSRF token | finding | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-2.png` |
| S-SETTINGS-5 | Form action= method=POST lacks visible CSRF token | finding | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-2.png` |
| S-SETTINGS-6 | Navigate https://testforge.emha.space/settings/ai (nav text: "AI Assist") | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-3.png` |
| S-SETTINGS-7 | Form action= method=POST lacks visible CSRF token | finding | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-3.png` |
| S-SETTINGS-8 | Navigate https://testforge.emha.space/settings/audit-log (nav text: "Audit Log") | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-4.png` |
| S-SETTINGS-9 | Navigate https://testforge.emha.space/settings/backup (nav text: "Backup") | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-5.png` |
| S-SETTINGS-10 | Navigate https://testforge.emha.space/settings/account (nav text: "Account") | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-6.png` |
| S-SETTINGS-11 | Form action= method=POST lacks visible CSRF token | finding | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-6.png` |

**Findings**

#### V-11 — [LOW] Form on /settings/team has no visible CSRF token

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Backend (Auth)
- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-1.html`

**How we saw it**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-1.html
```

**How to fix:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

#### V-12 — [LOW] Form on /settings/api-keys has no visible CSRF token

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Backend (Auth)
- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-2.html`

**How we saw it**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-2.html
```

**How to fix:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

#### V-13 — [LOW] Form on /settings/api-keys has no visible CSRF token

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Backend (Auth)
- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-2.html`

**How we saw it**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-2.html
```

**How to fix:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

#### V-14 — [LOW] Form on /settings/ai has no visible CSRF token

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Backend (Auth)
- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-3.html`

**How we saw it**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-3.html
```

**How to fix:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

#### V-15 — [LOW] Form on /settings/account has no visible CSRF token

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Backend (Auth)
- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-6.html`

**How we saw it**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-6.html
```

**How to fix:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

#### F-10 — [LOW] Form on /settings/team has no visible CSRF token

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Backend (Auth)
- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-1.html`

**How we saw it**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-1.html
```

**How to fix:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

#### F-11 — [LOW] Form on /settings/api-keys has no visible CSRF token

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Backend (Auth)
- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-2.html`

**How we saw it**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-2.html
```

**How to fix:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

#### F-12 — [LOW] Form on /settings/ai has no visible CSRF token

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Backend (Auth)
- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-3.html`

**How we saw it**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-3.html
```

**How to fix:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

#### F-13 — [LOW] Form on /settings/account has no visible CSRF token

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Backend (Auth)
- **Category:** A01:2021 Broken Access Control
- **CWE:** CWE-352
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-6.html`

**How we saw it**

```
Form action= method=POST. Framework may use SameSite/double-submit; needs verification. See /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/settings/route-6.html
```

**How to fix:** Verify CSRF protection: SameSite=Strict on session cookie AND server-side origin check, or explicit CSRF token.

**Coverage notes:** Visited 6/6 discovered route(s). State-changing actions (create/edit/delete) deferred to HITL.

### Academy (`academy`) — no findings

**Routes**

- `https://testforge.emha.space/academy`
- `https://testforge.emha.space/academy/me`
- `https://testforge.emha.space/academy/fundamentals/what-qa-does`

**Features observed**

- QA Academy — learn software testing from scratch | TestForge — QA AcademyBeta
- My progress — TestForge QA Academy — My progressBeta
- What a tester actually does — QA Fundamentals | TestForge QA Academy — What a tester actually does

**Test scenarios (for QA)**

| ID | Scenario | Result | Evidence |
|---|---|---|---|
| S-ACADEMY-1 | Navigate https://testforge.emha.space/academy (nav text: "AcademyBeta") | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/academy/route-1.png` |
| S-ACADEMY-2 | Navigate https://testforge.emha.space/academy/me (nav text: "My progress") | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/academy/route-2.png` |
| S-ACADEMY-3 | Navigate https://testforge.emha.space/academy/fundamentals/what-qa-does (nav text: "Start QA Fundamentals") | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/academy/route-3.png` |

_No findings recorded for this module._

**Coverage notes:** Visited 3/3 discovered route(s). State-changing actions (create/edit/delete) deferred to HITL.

### Docs (`docs`) — no findings

**Routes**

- `https://testforge.emha.space/docs/help`

**Features observed**

- Help — TestForge — Help

**Test scenarios (for QA)**

| ID | Scenario | Result | Evidence |
|---|---|---|---|
| S-DOCS-1 | Navigate https://testforge.emha.space/docs/help (nav text: "Help") | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/docs/route-1.png` |

_No findings recorded for this module._

**Coverage notes:** Visited 1/1 discovered route(s). State-changing actions (create/edit/delete) deferred to HITL.

### Dashboard (deep interactive) (`dashboard`) — LOW:22 · INFO:2

**Routes**

- `/dashboard`

**Features observed**

- Interactive widget clicks, modal opens, tabs, dropdowns, sort headers, pagination, reflection probes, storage inspection, XHR capture

**Test scenarios (for QA)**

| ID | Scenario | Result | Evidence |
|---|---|---|---|
| I-000 | Navigate /dashboard | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/03-dashboard-initial.png` |
| I-001 | Click "TestForge" | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/click-I-001-TestForge.png` |
| I-002 | Click "Search⌘K" | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/click-I-002-Search_K.png` |
| I-003 | Click "Dashboard" | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/click-I-003-Dashboard.png` |
| I-004 | Click "Log out →" | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/click-I-004-Log_out_.png` |
| I-005 | Click "Light" | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/click-I-005-Light.png` |
| I-006 | Click "System" | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/click-I-006-System.png` |
| I-007 | Click "Dark" | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/click-I-007-Dark.png` |
| I-008 | Click "Continue learningMy progress →QA Fundamentals — 0 of 13 lessons doneStart QA Fun" | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/click-I-008-Continue_learningMy_progress_QA_Fundamentals_0_of_13_lessons.png` |
| I-refl-q | Reflected probe param=q | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-q.png` |
| I-refl-search | Reflected probe param=search | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-search.png` |
| I-refl-filter | Reflected probe param=filter | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-filter.png` |
| I-refl-project | Reflected probe param=project | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-project.png` |
| I-refl-view | Reflected probe param=view | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-view.png` |
| I-refl-tab | Reflected probe param=tab | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-tab.png` |
| I-refl-ref | Reflected probe param=ref | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-ref.png` |
| I-refl-id | Reflected probe param=id | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-id.png` |
| I-refl-name | Reflected probe param=name | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-name.png` |
| I-refl-sort | Reflected probe param=sort | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-sort.png` |
| I-refl-page | Reflected probe param=page | pass | `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-page.png` |

**Findings**

#### V-D01 — [LOW] Query param "q" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-q.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: \"eVuR_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?q=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-q.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### V-D02 — [LOW] Query param "search" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-search.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: R_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?search=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-search.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### V-D03 — [LOW] Query param "filter" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-filter.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: R_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?filter=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-filter.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### V-D04 — [LOW] Query param "project" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-project.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: _-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?project=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-project.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### V-D05 — [LOW] Query param "view" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-view.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: VuR_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?view=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-view.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### V-D06 — [LOW] Query param "tab" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-tab.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: eVuR_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?tab=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-tab.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### V-D07 — [LOW] Query param "ref" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-ref.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: eVuR_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?ref=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-ref.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### V-D08 — [LOW] Query param "id" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-id.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: "eVuR_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?id=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-id.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### V-D09 — [LOW] Query param "name" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-name.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: VuR_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?name=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-name.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### V-D10 — [LOW] Query param "sort" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-sort.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: VuR_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?sort=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-sort.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### V-D11 — [LOW] Query param "page" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-page.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: VuR_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?page=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-page.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### V-D12 — [INFO] 4 dashboard control(s) produced no observable effect on click

- **What it means:** Informational — no exploit path observed.
- **Effort to fix:** Optional — best-practice tightening.
- **Likely owner:** Frontend
- **Category:** UX / Reliability
- **CWE:** CWE-1006
- **Confidence:** heuristic
- **CVSS 4.0:** 0 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:P/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/clickables.json`

**How we saw it**

```
Labels: TestForge, Search⌘K, Dashboard, Log out → — no navigation, no XHR, no console change. May be pure UI toggles (expected) or dead buttons (bug).
```

**How to fix:** Manually verify these controls: expected pure-CSS toggle vs missing click handler.

#### F-14 — [LOW] Query param "q" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-q.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: \"eVuR_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?q=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-q.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### F-15 — [LOW] Query param "search" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-search.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: R_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?search=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-search.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### F-16 — [LOW] Query param "filter" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-filter.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: R_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?filter=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-filter.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### F-17 — [LOW] Query param "project" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-project.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: _-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?project=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-project.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### F-18 — [LOW] Query param "view" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-view.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: VuR_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?view=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-view.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### F-19 — [LOW] Query param "tab" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-tab.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: eVuR_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?tab=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-tab.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### F-20 — [LOW] Query param "ref" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-ref.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: eVuR_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?ref=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-ref.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### F-21 — [LOW] Query param "id" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-id.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: "eVuR_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?id=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-id.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### F-22 — [LOW] Query param "name" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-name.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: VuR_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?name=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-name.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### F-23 — [LOW] Query param "sort" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-sort.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: VuR_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?sort=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-sort.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### F-24 — [LOW] Query param "page" reflected in DOM at /dashboard

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** probable
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-page.html`

**How we saw it**

```
Canary "zzqmt35h1y4xx" appears in response body. Context excerpt: VuR_-kK8Yz55oiw9QMtN\",\"assetPrefix\":\"\",\"urlParts\":[\"\",\"dashboard?page=zzqmt35h1y4xx\"],\"initialTree\":[\"\",{\"children\":[\"(app)\",{\"children\":[\ (see /Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/reflect-page.html)
```

**How to fix:** Ensure the value is HTML-encoded on render and not written into a JS string literal. Add CSP with strict script-src.

#### F-26 — [INFO] 4 dashboard control(s) produced no observable effect on click

- **What it means:** Informational — no exploit path observed.
- **Effort to fix:** Optional — best-practice tightening.
- **Likely owner:** Frontend
- **Category:** UX / Reliability
- **CWE:** CWE-1006
- **Confidence:** heuristic
- **CVSS 4.0:** 0 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:P/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `/Users/ariefrahman/Documents/Arief/automation/playwright/hubexo org/sec-test/security-test/reports/2026-08-21-testforge-emha-space-full/evidence/dashboard/clickables.json`

**How we saw it**

```
Labels: TestForge, Search⌘K, Dashboard, Log out → — no navigation, no XHR, no console change. May be pure UI toggles (expected) or dead buttons (bug).
```

**How to fix:** Manually verify these controls: expected pure-CSS toggle vs missing click handler.

**Coverage notes:** Deep-interactive walk: 20 interactions, 198 XHRs observed, 0 console errors, 0 unhandled exceptions. State-changing submits deferred to HITL.

### Infrastructure / Transport (`infrastructure`) — LOW:1 · INFO:1 · OK:1

**Features observed**

- TLS + edge headers observed on public origin

**Findings**

#### F-25 — [LOW] robots.txt enumerates sensitive routes

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Backend (API)
- **Category:** A01 Broken Access Control (recon aid)
- **Confidence:** heuristic

**How we saw it**

```
Disallow list includes: /api/, /share/, /invite/, /verify, /verify-email, /reset-password, /forgot-password, /login/2fa, ….
```

**How to fix:** Do not enumerate protected paths in robots.txt. Rely on server-side auth; use noindex on individual pages.

#### F-27 — [INFO] Missing /.well-known/security.txt

- **What it means:** Informational — no exploit path observed.
- **Effort to fix:** Optional — best-practice tightening.
- **Likely owner:** To be triaged
- **Category:** Best practice
- **Confidence:** heuristic

**How we saw it**

```
GET /.well-known/security.txt returned 404.
```

**How to fix:** Publish security.txt per RFC 9116 (Contact, Expires, Preferred-Languages).

#### F-28 — [OK] HTTPS enforced from plain HTTP

- **What it means:** Control observed working correctly.
- **Effort to fix:** No action.
- **Likely owner:** Platform / DevOps
- **Category:** Positive control
- **Confidence:** heuristic

**How we saw it**

```
HTTP responded 308 → HTTPS.
```

**How to fix:** Maintain. Combine with HSTS to close first-visit downgrade window.

**Coverage notes:** Passive header + TLS probe.

## Deferred hypotheses (need human approval to test)

| ID | Hypothesis | Based on | Test plan |
|---|---|---|---|
| H-A1 | Password reset token reuse / no expiry | /forgot-password route enumerated | Request reset email twice, attempt to reuse first token after second issued |
| H-A2 | Login rate-limit bypass | login endpoint | 50 rapid wrong-password attempts; observe lockout |
| H-D-xss-q | Reflected XSS candidate: q on /dashboard | https://testforge.emha.space/dashboard?q=zzqmt35h1y4xx | Send payload <svg/onload=alert(1)> in ?q= |
| H-D-xss-search | Reflected XSS candidate: search on /dashboard | https://testforge.emha.space/dashboard?search=zzqmt35h1y4xx | Send payload <svg/onload=alert(1)> in ?search= |
| H-D-xss-filter | Reflected XSS candidate: filter on /dashboard | https://testforge.emha.space/dashboard?filter=zzqmt35h1y4xx | Send payload <svg/onload=alert(1)> in ?filter= |
| H-D-xss-project | Reflected XSS candidate: project on /dashboard | https://testforge.emha.space/dashboard?project=zzqmt35h1y4xx | Send payload <svg/onload=alert(1)> in ?project= |
| H-D-xss-view | Reflected XSS candidate: view on /dashboard | https://testforge.emha.space/dashboard?view=zzqmt35h1y4xx | Send payload <svg/onload=alert(1)> in ?view= |
| H-D-xss-tab | Reflected XSS candidate: tab on /dashboard | https://testforge.emha.space/dashboard?tab=zzqmt35h1y4xx | Send payload <svg/onload=alert(1)> in ?tab= |
| H-D-xss-ref | Reflected XSS candidate: ref on /dashboard | https://testforge.emha.space/dashboard?ref=zzqmt35h1y4xx | Send payload <svg/onload=alert(1)> in ?ref= |
| H-D-xss-id | Reflected XSS candidate: id on /dashboard | https://testforge.emha.space/dashboard?id=zzqmt35h1y4xx | Send payload <svg/onload=alert(1)> in ?id= |
| H-D-xss-name | Reflected XSS candidate: name on /dashboard | https://testforge.emha.space/dashboard?name=zzqmt35h1y4xx | Send payload <svg/onload=alert(1)> in ?name= |
| H-D-xss-sort | Reflected XSS candidate: sort on /dashboard | https://testforge.emha.space/dashboard?sort=zzqmt35h1y4xx | Send payload <svg/onload=alert(1)> in ?sort= |
| H-D-xss-page | Reflected XSS candidate: page on /dashboard | https://testforge.emha.space/dashboard?page=zzqmt35h1y4xx | Send payload <svg/onload=alert(1)> in ?page= |

## Out-of-scope observations

- Third-party CDNs and analytics: not tested.
- Backend infrastructure (host OS, DB): not probed.
- State-changing flows (password reset, 2FA, delete, checkout): deferred to HITL.