# Security Assessment Report

**Target:** https://stage-onebid.us.bci-tnlm.com/login  
**Date:** 2026-08-22  
**Tester:** ariefrahman  
**Authorization:** internal-authorized  
**Run:** `2026-08-22-stage-onebid-tyonanda`

## Overall risk: MODERATE

> Moderate risk — plan remediation this sprint

| Severity | Count |
|---|---|
| MEDIUM | 3 |
| LOW | 2 |
| OK | 1 |

## Executive summary (for PM / stakeholders)

- Coverage: **9 module(s)**, **106 test scenarios** executed.
- Findings: **6** total (3 MEDIUM, 2 LOW, 1 OK).
- Top 3 action item(s):
  1. **Legacy TLS version accepted** — Disable TLS < 1.2 at the edge (Caddy: `tls { protocols tls1.2 tls1.3 }`). _(owner: Platform / DevOps)_
  1. **App session cookie missing hardening flags** — Set HttpOnly, Secure, SameSite=Lax on all auth/session cookies. _(owner: Backend (Auth))_
  1. **JWT stored in Web Storage (localStorage/sessionStorage)** — Deliver auth via HttpOnly+Secure+SameSite=Lax cookies. Do not persist bearer tokens in Web Storage. _(owner: Backend (Auth))_

## Modules

### Authentication (`01-login`) — MEDIUM:2

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

#### V-01 — [MEDIUM] App session cookie missing hardening flags

- **What it means:** Reduces defence-in-depth; can be chained into a bigger issue.
- **Effort to fix:** Minutes to hours — usually a config or header change.
- **Likely owner:** Backend (Auth)
- **Category:** A05:2021 Security Misconfiguration
- **CWE:** CWE-1004
- **Confidence:** verified
- **CVSS 4.0:** 4.6 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:P/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `evidence-deep/01-login/cookies.json`

**How we saw it**

```
Cookies without HttpOnly+Secure+SameSite(Lax|Strict): accessToken@stage-onebid.us.bci-tnlm.com(httpOnly=false,secure=false,sameSite=Lax); refreshToken@stage-onebid.us.bci-tnlm.com(httpOnly=false,secure=false,sameSite=Lax)
```

**How to fix:** Set HttpOnly, Secure, SameSite=Lax on all auth/session cookies.

#### V-02 — [MEDIUM] JWT stored in Web Storage (localStorage/sessionStorage)

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
JWT (three-segment base64url) matched in Web Storage after successful login. Any XSS → full session theft. See reports/2026-08-22-stage-onebid-tyonanda/evidence-deep/01-login/storage.json
```

**How to fix:** Deliver auth via HttpOnly+Secure+SameSite=Lax cookies. Do not persist bearer tokens in Web Storage.

**Coverage notes:** Login only. Wrong-password / rate-limit / reset-token / 2FA-enrol deferred to HITL.

### Dashboard (`02-dashboard`) — LOW:1

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
| S-D28 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D29 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D30 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D31 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D32 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D33 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D34 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D35 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D36 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D37 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D38 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D39 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D40 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D41 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D42 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D43 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
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
| S-D56 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D57 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D58 | Click tracker folder tracker-folder-btn-quoted | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-quoted.png` |
| S-D59 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D60 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D61 | Click tracker folder tracker-folder-btn-quoted | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-quoted.png` |
| S-D62 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D63 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D64 | Click tracker folder tracker-folder-btn-quoted | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-quoted.png` |
| S-D65 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D66 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
| S-D67 | Click tracker folder tracker-folder-btn-quoted | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-quoted.png` |
| S-D68 | Click tracker folder tracker-folder-btn-won | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-won.png` |
| S-D69 | Click tracker folder tracker-folder-btn-lost | pass | `evidence-deep/02-dashboard/folder-tracker-folder-btn-lost.png` |
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
| S-D82 | Click tracker folder tracker-folder-btn-quoted | fail | `` |
| S-D83 | Click tracker folder tracker-folder-btn-won | fail | `` |
| S-D84 | Click tracker folder tracker-folder-btn-lost | fail | `` |
| S-D85 | Click tracker folder tracker-folder-btn-quoted | fail | `` |
| S-D86 | Click tracker folder tracker-folder-btn-won | fail | `` |
| S-D87 | Click tracker folder tracker-folder-btn-lost | fail | `` |
| S-D88 | Click tracker folder tracker-folder-btn-quoted | fail | `` |
| S-D89 | Click tracker folder tracker-folder-btn-won | fail | `` |
| S-D90 | Click tracker folder tracker-folder-btn-lost | fail | `` |
| S-D91 | Click tracker folder tracker-folder-btn-quoted | fail | `` |
| S-D92 | Click tracker folder tracker-folder-btn-won | fail | `` |
| S-D93 | Click tracker folder tracker-folder-btn-lost | fail | `` |

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
GET https://stage-onebid.us.bci-tnlm.com/ headers: no X-Frame-Options and CSP without frame-ancestors. See reports/2026-08-22-stage-onebid-tyonanda/evidence-deep/02-dashboard/root-headers.json
```

**How to fix:** Add `frame-ancestors 'none'` to CSP (or X-Frame-Options: DENY) on all authenticated app responses.

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
| S-S2 | Type query "refltest1787358606676" and press Enter; observe reflection | pass | `evidence-deep/04-search/after-query.png` |

_No findings recorded for this module._

**Coverage notes:** Read-only search query. Filter-save (state-changing) deferred to HITL.

### Project Detail (`05-project-detail`) — no findings

**Features observed**

- Individual project detail pages under /main/project/<numericId>

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

### Infrastructure / Transport (`infrastructure`) — MEDIUM:1 · LOW:1 · OK:1

**Features observed**

- TLS + edge headers observed on public origin

**Findings**

#### F-03 — [MEDIUM] Legacy TLS version accepted

- **What it means:** Reduces defence-in-depth; can be chained into a bigger issue.
- **Effort to fix:** Minutes to hours — usually a config or header change.
- **Likely owner:** Platform / DevOps
- **Category:** A04 Cryptographic Failures
- **Confidence:** heuristic

**How we saw it**

```
openssl s_client negotiated TLS 1.0 or 1.1.
```

**How to fix:** Disable TLS < 1.2 at the edge (Caddy: `tls { protocols tls1.2 tls1.3 }`).

#### F-01 — [LOW] Missing clickjacking protection (X-Frame-Options)

- **What it means:** Hygiene / policy gap; unlikely direct impact.
- **Effort to fix:** Minutes — config or minor code tweak.
- **Likely owner:** Platform / DevOps
- **Category:** A02 Security Misconfiguration
- **Confidence:** heuristic

**How we saw it**

```
Header `x-frame-options` absent on GET /.
```

**How to fix:** Prefer CSP frame-ancestors 'none'; or X-Frame-Options: DENY.

#### F-02 — [OK] HTTPS enforced from plain HTTP

- **What it means:** Control observed working correctly.
- **Effort to fix:** No action.
- **Likely owner:** Platform / DevOps
- **Category:** Positive control
- **Confidence:** heuristic

**How we saw it**

```
HTTP responded 301 → HTTPS.
```

**How to fix:** Maintain. Combine with HSTS to close first-visit downgrade window.

**Coverage notes:** Passive header + TLS probe.

## Deferred hypotheses (need human approval to test)

| ID | Hypothesis | Based on | Test plan |
|---|---|---|---|
| H-01 | User enumeration via login error copy | /login | Send wrong-password for known email vs unknown email; compare error text / status / timing. |
| H-02 | Login rate-limit bypass | POST /api/v1/account/auth/sign-in | 50 wrong-password attempts within 60s; observe lockout / Retry-After header. |
| H-03 | Password-reset token reuse / no expiry | /forgot-password link on login page | Request reset twice; attempt reuse of the first token after issuing the second. |
| H-04 | JWT: alg=none or weak-secret acceptance | JWT in localStorage | Decode token; try alg=none and HS256 with common weak secrets against a protected endpoint. |
| H-05 | 2FA/MFA bypass on password step | sign-in flow | If 2FA offered, drop the challenge and hit the post-2FA endpoint directly with the interim token. |

## Out-of-scope observations

- Third-party CDNs and analytics: not tested.
- Backend infrastructure (host OS, DB): not probed.
- State-changing flows (password reset, 2FA, delete, checkout): deferred to HITL.