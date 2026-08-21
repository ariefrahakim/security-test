# Abuse case — [Feature name]

**Source QA test case:** [link/name of automation test]
**Endpoint:** `METHOD /path`

## Happy path (from QA)
What the current QA test verifies.

## 10 abuse cases

| # | Variation | Expected safe response | OWASP category |
|---|-----------|------------------------|----------------|
| 1 | Change object ID to another user's | 403/404 | A01 / API1 |
| 2 | Remove `Authorization` header | 401 | A07 / API2 |
| 3 | Send wrong data type (array vs string) | 400 | A05 |
| 4 | Call endpoint with low-privilege role | 403 | A01 / API5 |
| 5 | Skip a required step in multi-step flow | 400/403 | A01 |
| 6 | Negative value for price/quantity | 400 | A06 |
| 7 | Extra field injection (`isAdmin: true`) | Ignored | A05 / API3 |
| 8 | Duplicate the request (race condition) | Idempotent | A06 |
| 9 | Change method (GET → POST/DELETE) | 405 | A01 |
| 10 | Very large payload / weird chars | Cleanly rejected | A10 |

## Verify manually first
Before automating, PoC in Burp Repeater. If any actually pass → report using `pentest-report.md`.

## Candidates for security regression suite
After the bug is fixed, add to automation suite.
