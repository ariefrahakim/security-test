# Security Comparison Report

Comparing 3 run(s) side by side. Lower risk-score is better.

## Verdict

**Winner (best security posture): `https://stage-onebid.us.bci-tnlm.com/login`** (risk-score 11).
Worst posture: `https://testforge.emha.space` (risk-score 59).

## Side by side

| Metric | `https://testforge.emha.space` | `https://stage-onebid.us.bci-tnlm.com/login` | `https://stage-onebid.us.bci-tnlm.com/login` |
|---|---|---|---|
| Run dir | `2026-08-21-testforge-emha-space-full` | `2026-08-22-stage-onebid-bci-tnlm` | `2026-08-22-stage-onebid-tyonanda` |
| Date | 2026-08-21 | 2026-08-22 | 2026-08-22 |
| Authorization | owner | internal-authorized | internal-authorized |
| Overall risk | MODERATE | HIGH | MODERATE |
| Risk-score (lower=better) | 59 | 17 | 11 |
| Modules explored | 9 | 9 | 9 |
| Scenarios executed | 46 | 114 | 106 |
| Findings (total) | 55 | 6 | 6 |
| CRITICAL | 0 | 0 | 0 |
| HIGH | 0 | 1 | 0 |
| MEDIUM | 4 | 3 | 3 |
| LOW | 47 | 1 | 2 |
| INFO | 3 | 0 | 0 |
| OK | 1 | 1 | 1 |
| HITL-pending | 13 | 9 | 5 |

## Categories present in each run

| Category | `2026-08-21-testforge-emha-space-full` | `2026-08-22-stage-onebid-bci-tnlm` | `2026-08-22-stage-onebid-tyonanda` |
|---|---|---|---|
| A01 Broken Access Control (recon aid) | 1 | 0 | 0 |
| A02 Security Misconfiguration | 0 | 0 | 1 |
| A04 Cryptographic Failures | 0 | 0 | 1 |
| Best practice | 1 | 0 | 0 |
| Broken Access Control | 14 | 0 | 0 |
| Cryptographic Failures | 0 | 1 | 1 |
| Injection | 22 | 0 | 0 |
| Insecure Design | 0 | 1 | 0 |
| Positive control | 1 | 1 | 1 |
| Security Misconfiguration | 14 | 3 | 2 |
| UX / Reliability | 2 | 0 | 0 |

## Findings present in ALL runs (systemic issues)

| Severity | Title | count 1 | count 2 | count 3 |
|---|---|---|---|---|
| OK | HTTPS enforced from plain HTTP | 1 | 1 | 1 |

## Only in `https://testforge.emha.space`

| Severity | Title |
|---|---|
| MEDIUM | Missing security header: strict-transport-security |
| MEDIUM | Missing security header: content-security-policy |
| LOW | Missing security header: x-frame-options |
| LOW | Missing security header: x-content-type-options |
| LOW | Missing security header: referrer-policy |
| LOW | Missing security header: permissions-policy |
| LOW | Framework fingerprinting via X-Powered-By |
| LOW | Form on /projects has no visible CSRF token |
| LOW | Form on /projects/testis has no visible CSRF token |
| LOW | Form on /settings/team has no visible CSRF token |
| LOW | Form on /settings/api-keys has no visible CSRF token |
| LOW | Form on /settings/ai has no visible CSRF token |
| LOW | Form on /settings/account has no visible CSRF token |
| LOW | Query param "q" reflected in DOM at /dashboard |
| LOW | Query param "search" reflected in DOM at /dashboard |
| LOW | Query param "filter" reflected in DOM at /dashboard |
| LOW | Query param "project" reflected in DOM at /dashboard |
| LOW | Query param "view" reflected in DOM at /dashboard |
| LOW | Query param "tab" reflected in DOM at /dashboard |
| LOW | Query param "ref" reflected in DOM at /dashboard |
| LOW | Query param "id" reflected in DOM at /dashboard |
| LOW | Query param "name" reflected in DOM at /dashboard |
| LOW | Query param "sort" reflected in DOM at /dashboard |
| LOW | Query param "page" reflected in DOM at /dashboard |
| LOW | robots.txt enumerates sensitive routes |
| INFO | 4 dashboard control(s) produced no observable effect on click |
| INFO | Missing /.well-known/security.txt |

## Only in `https://stage-onebid.us.bci-tnlm.com/login`

| Severity | Title |
|---|---|
| HIGH | Bearer/refresh tokens delivered in non-HttpOnly, non-Secure cookies |
| MEDIUM | JWT persisted in localStorage under key `auth-storage` |
| MEDIUM | Auth token stored in BOTH cookie and localStorage (double-storage anti-pattern) |
| MEDIUM | CSP script-src allows 'unsafe-inline' and 'unsafe-eval' |

## Only in `https://stage-onebid.us.bci-tnlm.com/login`

| Severity | Title |
|---|---|
| MEDIUM | Legacy TLS version accepted |
| MEDIUM | App session cookie missing hardening flags |
| MEDIUM | JWT stored in Web Storage (localStorage/sessionStorage) |
| LOW | Missing clickjacking protection (X-Frame-Options) |

## Interpretation notes

- **Risk-score** weights: CRITICAL=10, HIGH=7, MEDIUM=3, LOW=1, INFO/OK=0. Sum across all findings per run.
- Fewer findings alone does not mean better security — coverage differs. Compare **severity mix** and **shared-category** rows first.
- Findings marked as present-in-all-runs are systemic patterns that likely stem from the same platform/team choices (e.g. missing security headers at the edge).
- Run counts reflect what the walker exercised on that date. State-changing PoCs are HITL-queued in `hypotheses.json` and are NOT counted as findings.
