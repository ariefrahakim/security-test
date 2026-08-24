# Security Assessment Report

**Target:** https://stage-onebid.us.bci-tnlm.com/login  
**Date:** 2026-08-22  
**Tester:** ariefrahman  
**Authorization:** internal-authorized  
**Run:** `2026-08-22-stage-onebid-bci-tnlm`

## Overall risk: HIGH

> High risk — fix before next release

| Severity | Count |
|---|---|
| HIGH | 1 |
| MEDIUM | 3 |
| LOW | 1 |
| OK | 1 |

## Executive summary (for PM / stakeholders)

- Coverage: **9 module(s)**, **114 test scenarios** executed.
- Findings: **6** total (1 HIGH, 3 MEDIUM, 1 LOW, 1 OK).
- Top 3 action item(s):
  1. **Bearer/refresh tokens delivered in non-HttpOnly, non-Secure cookies** — Set accessToken and refreshToken cookies with HttpOnly=true, Secure=true, SameSite=Lax (or Strict for the refresh token). If the SPA needs to include the bearer manually, keep the access token in memory only and put the refresh token in an HttpOnly+Secure cookie scoped to the refresh endpoint path. _(owner: Backend (Auth))_
  1. **JWT persisted in localStorage under key `auth-storage`** — Do not persist bearer JWTs in Web Storage. Hold access token in memory (JS closure or React state); persist only the refresh token, and only in an HttpOnly+Secure cookie. _(owner: Backend (Auth))_
  1. **Auth token stored in BOTH cookie and localStorage (double-storage anti-pattern)** — Single-source-of-truth for session state. Recommended pattern: refresh token in HttpOnly+Secure+SameSite=Strict cookie; access token in memory only. Delete localStorage['auth-storage'] on logout AND clear cookies. _(owner: Backend (Auth))_

## Modules

### Authentication (`01-login`) — HIGH:1 · MEDIUM:2

**Routes**

- `https://stage-onebid.us.bci-tnlm.com/login`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`

**Features observed**

- Email + password sign-in, /login form (data-testid=login-form-submit-btn)
- Backend auth: POST https://api-stage-portal.bidocean.com/api/v1/account/auth/sign-in (status 201)
- Post-login landing: https://stage-onebid.us.bci-tnlm.com/main/dashboard
- Auth token delivery: JWT in Web Storage
- Bearer token attached to XHRs: false

**Test scenarios (for QA)**

| ID | Scenario | Result | Evidence |
|---|---|---|---|
| S-A1 | Load /login and wait for SPA hydrate | pass | `evidence-deep/01-login/form.png` |
| S-A2 | Submit valid credentials; observe redirect | pass | `evidence-deep/01-login/post-login.png` |
| S-A3 | Inspect app-scope cookies for HttpOnly+Secure+SameSite | finding | `` |
| S-A4 | Storage secret scan (localStorage+sessionStorage) | finding | `` |

**Findings**

#### V-01 — [HIGH] Bearer/refresh tokens delivered in non-HttpOnly, non-Secure cookies

- **What it means:** Attacker could steal data, take over accounts, or disrupt service.
- **Effort to fix:** Hours to a day.
- **Likely owner:** Backend (Auth)
- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-1004
- **Confidence:** verified
- **CVSS 4.0:** 6.9 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:H/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `evidence-deep/01-login/cookies.json`

**How we saw it**

```
Cookies `accessToken` and `refreshToken` set on stage-onebid.us.bci-tnlm.com with httpOnly=false, secure=false, sameSite=Lax. Because httpOnly is false, any XSS on the origin can exfiltrate the bearer JWT via document.cookie. Because secure is false, the cookie will be sent over HTTP if HSTS is ever bypassed (e.g. new browser, private mode before HSTS pinned). Raw evidence: reports/2026-08-22-stage-onebid-bci-tnlm/evidence-deep/01-login/cookies.json
```

**How to fix:** Set accessToken and refreshToken cookies with HttpOnly=true, Secure=true, SameSite=Lax (or Strict for the refresh token). If the SPA needs to include the bearer manually, keep the access token in memory only and put the refresh token in an HttpOnly+Secure cookie scoped to the refresh endpoint path.

#### V-02 — [MEDIUM] JWT persisted in localStorage under key `auth-storage`

- **What it means:** Reduces defence-in-depth; can be chained into a bigger issue.
- **Effort to fix:** Minutes to hours — usually a config or header change.
- **Likely owner:** Backend (Auth)
- **Category:** A02:2021 Cryptographic Failures
- **CWE:** CWE-922
- **Confidence:** verified
- **CVSS 4.0:** 5.4 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:P/VC:H/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `evidence-deep/01-login/storage.json`

**How we saw it**

```
localStorage['auth-storage'] contains a base64url-encoded JWT (three-segment eyJ… pattern) after successful login. localStorage is readable by any script on the origin — CSP allows 'unsafe-inline' 'unsafe-eval' on script-src, so XSS impact is unmitigated. Raw evidence: reports/2026-08-22-stage-onebid-bci-tnlm/evidence-deep/01-login/storage.json
```

**How to fix:** Do not persist bearer JWTs in Web Storage. Hold access token in memory (JS closure or React state); persist only the refresh token, and only in an HttpOnly+Secure cookie.

#### V-04 — [MEDIUM] Auth token stored in BOTH cookie and localStorage (double-storage anti-pattern)

- **What it means:** Reduces defence-in-depth; can be chained into a bigger issue.
- **Effort to fix:** Minutes to hours — usually a config or header change.
- **Likely owner:** Backend (Auth)
- **Category:** A04:2021 Insecure Design
- **CWE:** CWE-1004
- **Confidence:** verified
- **CVSS 4.0:** 3.1 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:N/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `evidence-deep/01-login/cookies.json`

**How we saw it**

```
The same session credential is persisted in two locations: (a) Cookie `accessToken` on stage-onebid.us.bci-tnlm.com (V-01), (b) localStorage key `auth-storage` (V-02). This doubles the exfiltration surface and makes any session-revocation logic likely inconsistent (cookie cleared but localStorage stale, or vice versa). Confirmed in same evidence bundle.
```

**How to fix:** Single-source-of-truth for session state. Recommended pattern: refresh token in HttpOnly+Secure+SameSite=Strict cookie; access token in memory only. Delete localStorage['auth-storage'] on logout AND clear cookies.

**Coverage notes:** Login only. Wrong-password / rate-limit / reset-token / 2FA-enrol deferred to HITL.

### Dashboard (`02-dashboard`) — LOW:1 · MEDIUM:1

**Routes**

- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`
- `https://stage-onebid.us.bci-tnlm.com/main/dashboard`

**Features observed**

- 3 section(s): dashboard-section-suggested, dashboard-section-tracked, dashboard-section-interested
- Filters: keyword, location, sector, value
- Empty-state links and slider (prev/next) controls

**Test scenarios (for QA)**

| ID | Scenario | Result | Evidence |
|---|---|---|---|
| S-D1 | Land on /main/dashboard after login | pass | `evidence-deep/02-dashboard/landed.png` |
| S-D2 | Capture root response headers | finding | `` |
| S-D3 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D4 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D5 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D6 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D7 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D8 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D9 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D10 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D11 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D12 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D13 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D14 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D15 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D16 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D17 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D18 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D19 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D20 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D21 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D22 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D23 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D24 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D25 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D26 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D27 | Click tracker folder tracker-folder-btn-interested | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-interested.png` |
| S-D28 | Click tracker folder tracker-folder-btn-quoted | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-quoted.png` |
| S-D29 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D30 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D31 | Click tracker folder tracker-folder-btn-quoted | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-quoted.png` |
| S-D32 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D33 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D34 | Click tracker folder tracker-folder-btn-quoted | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-quoted.png` |
| S-D35 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D36 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D37 | Click tracker folder tracker-folder-btn-quoted | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-quoted.png` |
| S-D38 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D39 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D40 | Click tracker folder tracker-folder-btn-quoted | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-quoted.png` |
| S-D41 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D42 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D43 | Click tracker folder tracker-folder-btn-quoted | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-quoted.png` |
| S-D44 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D45 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D46 | Click tracker folder tracker-folder-btn-quoted | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-quoted.png` |
| S-D47 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D48 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D49 | Click tracker folder tracker-folder-btn-quoted | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-quoted.png` |
| S-D50 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D51 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D52 | Click tracker folder tracker-folder-btn-quoted | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-quoted.png` |
| S-D53 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D54 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D55 | Click tracker folder tracker-folder-btn-quoted | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-quoted.png` |
| S-D56 | Click tracker folder tracker-folder-btn-won | fail | `` |
| S-D57 | Click tracker folder tracker-folder-btn-lost | fail | `` |
| S-D58 | Click tracker folder tracker-folder-btn-quoted | fail | `` |
| S-D59 | Click tracker folder tracker-folder-btn-won | fail | `` |
| S-D60 | Click tracker folder tracker-folder-btn-lost | fail | `` |
| S-D61 | Click tracker folder tracker-folder-btn-quoted | fail | `` |
| S-D62 | Click tracker folder tracker-folder-btn-won | fail | `` |
| S-D63 | Click tracker folder tracker-folder-btn-lost | fail | `` |
| S-D64 | Click tracker folder tracker-folder-btn-quoted | fail | `` |
| S-D65 | Click tracker folder tracker-folder-btn-won | fail | `` |
| S-D66 | Click tracker folder tracker-folder-btn-lost | fail | `` |
| S-D67 | Click tracker folder tracker-folder-btn-quoted | fail | `` |
| S-D68 | Click tracker folder tracker-folder-btn-won | fail | `` |
| S-D69 | Click tracker folder tracker-folder-btn-lost | fail | `` |
| S-D70 | Click tracker folder tracker-folder-btn-quoted | fail | `` |
| S-D71 | Click tracker folder tracker-folder-btn-won | fail | `` |
| S-D72 | Click tracker folder tracker-folder-btn-lost | fail | `` |
| S-D73 | Click tracker folder tracker-folder-btn-quoted | fail | `` |
| S-D74 | Click tracker folder tracker-folder-btn-won | fail | `` |
| S-D75 | Click tracker folder tracker-folder-btn-lost | fail | `` |
| S-D76 | Click tracker folder tracker-folder-btn-quoted | fail | `` |
| S-D77 | Click tracker folder tracker-folder-btn-won | fail | `` |
| S-D78 | Click tracker folder tracker-folder-btn-lost | fail | `` |
| S-D79 | Click tracker folder tracker-folder-btn-quoted | fail | `` |
| S-D80 | Click tracker folder tracker-folder-btn-won | fail | `` |
| S-D81 | Click tracker folder tracker-folder-btn-lost | fail | `` |

**Findings**

#### V-03 — [LOW] No clickjacking protection (X-Frame-Options absent; CSP lacks frame-ancestors)

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-1021
- **Confidence:** verified
- **CVSS 4.0:** 2.3 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `evidence-deep/02-dashboard/root-headers.json`

**How we saw it**

```
GET https://stage-onebid.us.bci-tnlm.com/ response headers: X-Frame-Options is absent; CSP is present but does not include a frame-ancestors directive. See reports/2026-08-22-stage-onebid-bci-tnlm/evidence-deep/02-dashboard/root-headers.json and reports/2026-08-22-stage-onebid-bci-tnlm/raw/headers-root.txt
```

**How to fix:** Append `frame-ancestors 'none'` to CSP (or add X-Frame-Options: DENY at CloudFront). Same policy on both the marketing HTML at S3 and the app shell.

#### V-05 — [MEDIUM] CSP script-src allows 'unsafe-inline' and 'unsafe-eval'

- **What it means:** Reduces defence-in-depth; can be chained into a bigger issue.
- **Effort to fix:** Minutes to hours — usually a config or header change.
- **Likely owner:** Platform / DevOps
- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-693
- **Confidence:** verified
- **CVSS 4.0:** 4.6 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `raw/headers-root.txt`

**How we saw it**

```
CSP header (see raw/headers-root.txt) includes: `script-src 'self' 'unsafe-eval' ... 'unsafe-inline'` and `script-src-elem 'self' 'unsafe-inline' ...`. Both defeat the primary purpose of CSP as an XSS mitigation. Combined with V-01/V-02 (bearer tokens JS-readable), a single injection point escalates to session takeover.
```

**How to fix:** Remove 'unsafe-inline' by adopting nonces or hashes; remove 'unsafe-eval' unless a specific dep (arcgis?) requires it — then narrow to that vendor via a separate policy scope. Ship a Report-Only CSP first to inventory violations.

**Coverage notes:** Read-only navigation + header capture. State-changing filter saves deferred to HITL.

### Project Pipeline (`03-project-pipeline`) — no findings

**Routes**

- `https://stage-onebid.us.bci-tnlm.com/main/project-pipeline`

**Features observed**

- Pipeline tabs / folders: 
- Kanban-style view of pursued/interested/quoted/won/lost projects

**Test scenarios (for QA)**

| ID | Scenario | Result | Evidence |
|---|---|---|---|
| S-P1 | Land on /main/project-pipeline | pass | `evidence-deep/03-project-pipeline/landed.png` |

_No findings recorded for this module._

**Coverage notes:** Read-only tab navigation. Award/reject/publish actions skipped by policy.

### Search (`04-search`) — no findings

**Routes**

- `https://stage-onebid.us.bci-tnlm.com/main/search`

**Features observed**

- Full-text project search
- Search fires 0 XHR(s) carrying the query keyword

**Test scenarios (for QA)**

| ID | Scenario | Result | Evidence |
|---|---|---|---|
| S-S1 | Land on /main/search | pass | `evidence-deep/04-search/landed.png` |
| S-S2 | Type query "refltest1787357977908" and press Enter; observe reflection | pass | `evidence-deep/04-search/after-query.png` |

_No findings recorded for this module._

**Coverage notes:** Read-only search query. Filter-save (state-changing) deferred to HITL.

### Project Detail (`05-project-detail`) — no findings

**Routes**

- `https://stage-onebid.us.bci-tnlm.com/main/project/5752707`
- `https://stage-onebid.us.bci-tnlm.com/main/project/5695136`
- `https://stage-onebid.us.bci-tnlm.com/main/project/5702381`

**Features observed**

- Individual project detail pages under /main/project/<numericId>
- Bid Ocean | A Hubexo Product
- Bid Ocean | A Hubexo Product
- Bid Ocean | A Hubexo Product

**Test scenarios (for QA)**

| ID | Scenario | Result | Evidence |
|---|---|---|---|
| S-PD1 | Load project 5752707 | pass | `evidence-deep/05-project-detail/proj-5752707.png` |
| S-PD2 | Project 5752707 → tab "Overview" | pass | `evidence-deep/05-project-detail/proj-5752707-tab-0-overview.png` |
| S-PD3 | Project 5752707 → tab "Description" | pass | `evidence-deep/05-project-detail/proj-5752707-tab-1-description.png` |
| S-PD4 | Project 5752707 → tab "Notices" | pass | `evidence-deep/05-project-detail/proj-5752707-tab-2-notices.png` |
| S-PD5 | Project 5752707 → tab "Pre-Bid" | pass | `evidence-deep/05-project-detail/proj-5752707-tab-3-pre-bid.png` |
| S-PD6 | Project 5752707 → tab "Contacts" | pass | `evidence-deep/05-project-detail/proj-5752707-tab-4-contacts.png` |
| S-PD7 | Project 5752707 → tab "Plan Holders" | pass | `evidence-deep/05-project-detail/proj-5752707-tab-5-plan-holders.png` |
| S-PD8 | Load project 5695136 | pass | `evidence-deep/05-project-detail/proj-5695136.png` |
| S-PD9 | Project 5695136 → tab "Overview" | pass | `evidence-deep/05-project-detail/proj-5695136-tab-0-overview.png` |
| S-PD10 | Project 5695136 → tab "Description" | pass | `evidence-deep/05-project-detail/proj-5695136-tab-1-description.png` |
| S-PD11 | Project 5695136 → tab "Notices" | pass | `evidence-deep/05-project-detail/proj-5695136-tab-2-notices.png` |
| S-PD12 | Project 5695136 → tab "Pre-Bid" | pass | `evidence-deep/05-project-detail/proj-5695136-tab-3-pre-bid.png` |
| S-PD13 | Project 5695136 → tab "Contacts" | pass | `evidence-deep/05-project-detail/proj-5695136-tab-4-contacts.png` |
| S-PD14 | Project 5695136 → tab "Plan Holders" | pass | `evidence-deep/05-project-detail/proj-5695136-tab-5-plan-holders.png` |
| S-PD15 | Load project 5702381 | pass | `evidence-deep/05-project-detail/proj-5702381.png` |
| S-PD16 | Project 5702381 → tab "Overview" | pass | `evidence-deep/05-project-detail/proj-5702381-tab-0-overview.png` |
| S-PD17 | Project 5702381 → tab "Description" | pass | `evidence-deep/05-project-detail/proj-5702381-tab-1-description.png` |
| S-PD18 | Project 5702381 → tab "Notices" | pass | `evidence-deep/05-project-detail/proj-5702381-tab-2-notices.png` |
| S-PD19 | Project 5702381 → tab "Contacts" | pass | `evidence-deep/05-project-detail/proj-5702381-tab-3-contacts.png` |
| S-PD20 | Project 5702381 → tab "Plan Holders" | pass | `evidence-deep/05-project-detail/proj-5702381-tab-4-plan-holders.png` |

_No findings recorded for this module._

**Coverage notes:** Read-only view of first 3 discovered project ids. Cross-tenant IDOR replay deferred to HITL.

### Notifications (`06-notifications`) — no findings

**Routes**

- `https://stage-onebid.us.bci-tnlm.com/main/notification`

**Features observed**

- Topbar notification drawer / dropdown
- 8 rendered notification-related element(s)

**Test scenarios (for QA)**

| ID | Scenario | Result | Evidence |
|---|---|---|---|
| S-N1 | Click topbar-notification-btn | pass | `evidence-deep/06-notifications/drawer-open.png` |
| S-N2 | Count rendered notification items | note | `` |

_No findings recorded for this module._

**Coverage notes:** Read-only drawer open. Mark-as-read (state-changing) skipped by policy.

### Profile (`07-profile`) — no findings

**Features observed**

- Menu items: TG | Settings | Bid Ocean Support | Logout

**Test scenarios (for QA)**

| ID | Scenario | Result | Evidence |
|---|---|---|---|
| S-U1 | Open profile menu | pass | `evidence-deep/07-profile/menu-open.png` |
| S-U2 | Enumerate profile menu items (read-only) | note | `` |

_No findings recorded for this module._

**Coverage notes:** Menu open + non-destructive item enumeration. Password/email/2FA changes deferred to HITL.

### Saved Searches (`08-saved-searches`) — no findings

**Features observed**

- Saved searches: none rendered

**Test scenarios (for QA)**

| ID | Scenario | Result | Evidence |
|---|---|---|---|
| S-SS1 | Open saved-search selector | pass | `evidence-deep/08-saved-searches/select-open.png` |
| S-SS2 | Enumerate saved search options | note | `` |

_No findings recorded for this module._

**Coverage notes:** Read-only list rendering. Delete-saved-search skipped by policy.

### Infrastructure / Transport (`infrastructure`) — OK:1

**Features observed**

- TLS + edge headers observed on public origin

**Findings**

#### F-02 — [OK] HTTPS enforced from plain HTTP

- **What it means:** Control observed working correctly.
- **Effort to fix:** No action.
- **Likely owner:** Platform / DevOps
- **Category:** Positive control
- **Confidence:** verified
- **Evidence:** `raw/headers-http.txt`

**How we saw it**

```
HTTP responded 301 to HTTPS. HSTS present (max-age=31536000; includeSubDomains). TLS 1.2/1.3 only. See raw/headers-http.txt and raw/tls.txt.
```

**How to fix:** Maintain. Consider HSTS preload after Sub-Resource CSP hardening.

**Coverage notes:** Passive header + TLS probe.

## Deferred hypotheses (need human approval to test)

| ID | Hypothesis | Based on | Test plan |
|---|---|---|---|
| H-01 | User enumeration via login error copy | /login | Send wrong-password for known email vs unknown email; compare error text / status / timing. |
| H-02 | Login rate-limit bypass | POST /api/v1/account/auth/sign-in | 50 wrong-password attempts within 60s; observe lockout / Retry-After header. |
| H-03 | Password-reset token reuse / no expiry | /forgot-password link on login page | Request reset twice; attempt reuse of the first token after issuing the second. |
| H-04 | JWT: alg=none or weak-secret acceptance | JWT in localStorage | Decode token; try alg=none and HS256 with common weak secrets against a protected endpoint. |
| H-05 | 2FA/MFA bypass on password step | sign-in flow | If 2FA offered, drop the challenge and hit the post-2FA endpoint directly with the interim token. |
| H-06 | IDOR: project detail id 5752707 (numeric) | https://stage-onebid.us.bci-tnlm.com/main/project/5752707 | GET /main/project/5752707 with a second-tenant token; also try id 5752706 and a random 9-digit id; expect 403/404 not 200. |
| H-07 | IDOR: project detail id 5695136 (numeric) | https://stage-onebid.us.bci-tnlm.com/main/project/5695136 | GET /main/project/5695136 with a second-tenant token; also try id 5695135 and a random 9-digit id; expect 403/404 not 200. |
| H-08 | IDOR: project detail id 5702381 (numeric) | https://stage-onebid.us.bci-tnlm.com/main/project/5702381 | GET /main/project/5702381 with a second-tenant token; also try id 5702380 and a random 9-digit id; expect 403/404 not 200. |
| H-09 | IDOR candidate: GET /us/api/v1/main/project/:id | https://api-stage-portal.bidocean.com/us/api/v1/main/project/5752707 | Replay with a token from a second authorized tenant; also mutate the id to unknown values; expect 403/404 not 200. |

## Out-of-scope observations

- Third-party CDNs and analytics: not tested.
- Backend infrastructure (host OS, DB): not probed.
- State-changing flows (password reset, 2FA, delete, checkout): deferred to HITL.