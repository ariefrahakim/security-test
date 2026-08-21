# Security Assessment Report

**Target:** https://testforge.emha.space  
**Date:** 2026-08-21  
**Tester:** ariefrahman  
**Authorization:** owner  
**Run:** `reports/2026-08-21-testforge-emha-space-dashboard`

## Overall risk: CLEAN

> No material issues found in scope

| Severity | Count |
|---|---|
| INFO | 2 |
| OK | 3 |

## Executive summary (for PM / stakeholders)

- Coverage: **2 module(s)**, **20 test scenarios** executed.
- Findings: **5** total (2 INFO, 3 OK).

## Modules

### Dashboard (deep interactive) (`dashboard`) — INFO:2 · OK:3

**Routes**

- `/dashboard`

**Features observed**

- Interactive widget clicks, modal opens, tabs, dropdowns, sort headers, pagination, reflection probes, storage inspection, XHR capture

**Test scenarios (for QA)**

| ID | Scenario | Result | Evidence |
|---|---|---|---|
| I-000 | Navigate /dashboard | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/03-dashboard-initial.png` |
| I-001 | Click "TestForge" | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/click-I-001-TestForge.png` |
| I-002 | Click "Search⌘K" | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/click-I-002-Search_K.png` |
| I-003 | Click "Dashboard" | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/click-I-003-Dashboard.png` |
| I-004 | Click "Log out →" | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/click-I-004-Log_out_.png` |
| I-005 | Click "Light" | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/click-I-005-Light.png` |
| I-006 | Click "System" | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/click-I-006-System.png` |
| I-007 | Click "Dark" | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/click-I-007-Dark.png` |
| I-008 | Click "Continue learningMy progress →QA Fundamentals — 0 of 13 lessons doneStart QA Fun" | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/click-I-008-Continue_learningMy_progress_QA_Fundamentals_0_of_13_lessons.png` |
| I-refl-q | Reflected probe param=q | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/reflect-q.png` |
| I-refl-search | Reflected probe param=search | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/reflect-search.png` |
| I-refl-filter | Reflected probe param=filter | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/reflect-filter.png` |
| I-refl-project | Reflected probe param=project | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/reflect-project.png` |
| I-refl-view | Reflected probe param=view | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/reflect-view.png` |
| I-refl-tab | Reflected probe param=tab | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/reflect-tab.png` |
| I-refl-ref | Reflected probe param=ref | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/reflect-ref.png` |
| I-refl-id | Reflected probe param=id | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/reflect-id.png` |
| I-refl-name | Reflected probe param=name | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/reflect-name.png` |
| I-refl-sort | Reflected probe param=sort | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/reflect-sort.png` |
| I-refl-page | Reflected probe param=page | pass | `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/reflect-page.png` |

**Findings**

#### V-D01 — [INFO] Query-string values reflected into Next.js RSC JSON payload (not an HTML sink)

- **What it means:** Informational — no exploit path observed.
- **Effort to fix:** Optional — best-practice tightening.
- **Likely owner:** Backend + Frontend
- **Category:** A03:2021 Injection
- **CWE:** CWE-79
- **Confidence:** heuristic
- **CVSS 4.0:** 0 (`CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/reflect-q.html`

**How we saw it**

```
All 11 probed GET params (q, search, filter, project, view, tab, ref, id, name, sort, page) with canary value zzq...xx were echoed by /dashboard inside a <script> block as JSON-encoded strings under __NEXT_DATA__.urlParts. Context excerpt: `"urlParts":["","dashboard?q=zzqmt3529kvxx"]`. JSON encoding prevents breakout to HTML/JS execution context. See evidence/dashboard/reflect-*.html.
```

**How to fix:** No direct action required — JSON serialisation is the defence. As defence-in-depth, ship a strict Content-Security-Policy (script-src 'self' with nonces) so that even if a future refactor moves the value into an unsafe sink, execution is blocked.

#### V-D02 — [INFO] 4 dashboard controls produced no observable effect on click

- **What it means:** Informational — no exploit path observed.
- **Effort to fix:** Optional — best-practice tightening.
- **Likely owner:** Frontend
- **Category:** UX / Reliability
- **CWE:** CWE-1006
- **Confidence:** heuristic
- **CVSS 4.0:** 0 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:P/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/clickables.json`

**How we saw it**

```
During interactive walk, 4 clickable elements produced no URL change, no XHR, no console event. See reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/clickables.json and per-click artefacts click-I-*.html.
```

**How to fix:** Manual review: distinguish expected pure-CSS toggles (accordion open/close) from unwired handlers.

#### V-D03 — [OK] Dashboard XHR surface is clean (198/198 successful, no PII/secret leaks, no IDOR-shaped ids)

- **What it means:** Control observed working correctly.
- **Effort to fix:** No action.
- **Likely owner:** Backend (API)
- **Category:** Observation
- **CWE:** N/A
- **Confidence:** verified
- **CVSS 4.0:** 0 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/xhrs.json`

**How we saw it**

```
198 XHR/fetch calls observed across 20 dashboard interactions. All returned 200 (197) or 303 (1). Unique endpoints: 19. Numeric/UUID id in path: 0. JWT/AKIA/private-key patterns in bodies: 0. Foreign emails: 0. See reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/xhrs.json.
```

**How to fix:** Baseline is healthy. Re-run after any new dashboard widget lands.

#### V-D04 — [OK] Browser storage on /dashboard contains no tokens, PII, or secret-shaped values

- **What it means:** Control observed working correctly.
- **Effort to fix:** No action.
- **Likely owner:** Backend (Auth)
- **Category:** Observation
- **CWE:** N/A
- **Confidence:** verified
- **CVSS 4.0:** 0 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/storage.json`

**How we saw it**

```
localStorage + sessionStorage snapshot after login. No JWT, no AWS key, no private key, no `password:` field, no key names matching /session_id|api_key|refresh_token|access_token/. See reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/storage.json.
```

**How to fix:** Continue keeping session material in HttpOnly cookies (as observed).

#### V-D05 — [OK] Zero JS console errors and zero unhandled promise rejections during dashboard walk

- **What it means:** Control observed working correctly.
- **Effort to fix:** No action.
- **Likely owner:** To be triaged
- **Category:** Observation
- **CWE:** N/A
- **Confidence:** verified
- **CVSS 4.0:** 0 (`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N`)
- **Evidence:** `reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/console.json`

**How we saw it**

```
20 interactions, 198 XHRs, 0 console.error, 0 pageerror. See reports/2026-08-21-testforge-emha-space-dashboard/evidence/dashboard/console.json.
```

**How to fix:** Good hygiene — keep an eye when adding new widgets.

**Coverage notes:** Deep-interactive walk: 20 interactions, 198 XHRs observed, 0 console errors, 0 unhandled exceptions. State-changing submits deferred to HITL.

### Infrastructure / Transport (`infrastructure`) — no findings

**Features observed**

- TLS + edge headers observed on public origin

_No findings recorded for this module._

**Coverage notes:** Passive header + TLS probe.

## Deferred hypotheses (need human approval to test)

| ID | Hypothesis | Based on | Test plan |
|---|---|---|---|
| H-D-xss-q | Reflected XSS candidate: q on /dashboard | https://testforge.emha.space/dashboard?q=zzqmt3529kvxx | Send payload <svg/onload=alert(1)> in ?q= |
| H-D-xss-search | Reflected XSS candidate: search on /dashboard | https://testforge.emha.space/dashboard?search=zzqmt3529kvxx | Send payload <svg/onload=alert(1)> in ?search= |
| H-D-xss-filter | Reflected XSS candidate: filter on /dashboard | https://testforge.emha.space/dashboard?filter=zzqmt3529kvxx | Send payload <svg/onload=alert(1)> in ?filter= |
| H-D-xss-project | Reflected XSS candidate: project on /dashboard | https://testforge.emha.space/dashboard?project=zzqmt3529kvxx | Send payload <svg/onload=alert(1)> in ?project= |
| H-D-xss-view | Reflected XSS candidate: view on /dashboard | https://testforge.emha.space/dashboard?view=zzqmt3529kvxx | Send payload <svg/onload=alert(1)> in ?view= |
| H-D-xss-tab | Reflected XSS candidate: tab on /dashboard | https://testforge.emha.space/dashboard?tab=zzqmt3529kvxx | Send payload <svg/onload=alert(1)> in ?tab= |
| H-D-xss-ref | Reflected XSS candidate: ref on /dashboard | https://testforge.emha.space/dashboard?ref=zzqmt3529kvxx | Send payload <svg/onload=alert(1)> in ?ref= |
| H-D-xss-id | Reflected XSS candidate: id on /dashboard | https://testforge.emha.space/dashboard?id=zzqmt3529kvxx | Send payload <svg/onload=alert(1)> in ?id= |
| H-D-xss-name | Reflected XSS candidate: name on /dashboard | https://testforge.emha.space/dashboard?name=zzqmt3529kvxx | Send payload <svg/onload=alert(1)> in ?name= |
| H-D-xss-sort | Reflected XSS candidate: sort on /dashboard | https://testforge.emha.space/dashboard?sort=zzqmt3529kvxx | Send payload <svg/onload=alert(1)> in ?sort= |
| H-D-xss-page | Reflected XSS candidate: page on /dashboard | https://testforge.emha.space/dashboard?page=zzqmt3529kvxx | Send payload <svg/onload=alert(1)> in ?page= |

## Out-of-scope observations

- Third-party CDNs and analytics: not tested.
- Backend infrastructure (host OS, DB): not probed.
- State-changing flows (password reset, 2FA, delete, checkout): deferred to HITL.