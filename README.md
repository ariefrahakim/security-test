# sec-notes — Journey from QA Automation Lead → Web Application Security Test Engineer

Personal study notes of Arief Rahman Hakim, following a 40-week roadmap (Aug 2026 – May 2027).

## Purpose of this repo

1. **Career asset** — payloads, PoCs, and write-ups become a cheat sheet + portfolio for BSCP certification and interviews.
2. **Active recall** — every failed lab must be redone from scratch the next day without looking at notes.
3. **Proof of progress** — milestones per phase (reports, PRs to pipeline) live here.

## Folder structure

```
phase-0-foundation/            Weeks 1–4  — HTTP, browser security, Linux, mindset
phase-1-owasp-top10/           Weeks 5–14 — one folder per OWASP Top 10:2025 category
phase-2-advanced-exploitation/ Weeks 15–22 — SSRF, XXE, deserialization, race, smuggling
phase-3-api-security/          Weeks 23–28 — OWASP API Top 10:2023, OAuth, JWT, GraphQL
phase-4-security-automation/   Weeks 29–34 — SAST/DAST/SCA/secret scanning in CI
phase-5-bug-bounty-cert/       Weeks 35–40 — Recon, bug bounty, BSCP
labs/                          Notes per lab (PortSwigger, HTB, THM)
tools/                         Configs & scripts: Burp, ZAP, ffuf, etc.
payloads/                      Payload collection with reasoning
reports/                       Pentest & bug bounty reports (milestones)
templates/                     Report, checklist, threat model templates
cheatsheets/                   Quick-reference summaries per topic
```

## Note-taking rules

For each topic/lab, minimum format:

```markdown
# [Topic/Lab] — [Date]

## Context
Which app, which version, which lab.

## Initial hypothesis
What I guessed before starting.

## Payloads / requests tried
Both failing and working ones. Keep the failures — biggest learning.

## Why it worked (root cause)
Not just "use `' OR 1=1--`" — explain the mechanism.
If you can't explain, you don't understand yet.

## Impact / exploitability
Realistic scenario, not `alert(1)`.

## Remediation
How the dev should fix it.

## References
WSTG, OWASP cheat sheet, write-up links (only after finishing).
```

## Ethics rules (read once, follow forever)

- Test **only** on: intentionally-vulnerable labs, licensed platforms (PortSwigger Academy, HTB, THM), company assets with written authorization, or in-scope public bug bounty programs.
- Automated scanners (Nuclei, ZAP active, sqlmap) are **never** pointed at assets without explicit permission.
- Personal data found during testing: don't download, don't store. Prove access, report it, move on.

## Key references

- [OWASP Top 10:2025](https://owasp.org/Top10/2025/)
- [OWASP API Security Top 10:2023](https://owasp.org/www-project-api-security/)
- [OWASP WSTG](https://owasp.org/www-project-web-security-testing-guide/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- Full roadmap: see `roadmap-security-test-engineer.md` in the parent directory.

## Progress tracker

- [ ] Phase 0 — Foundation (W1–4)
- [ ] Phase 1 — OWASP Top 10 (W5–14) — target 60+ labs
- [ ] Phase 2 — Advanced exploitation (W15–22) — Juice Shop pentest report
- [ ] Phase 3 — API Security (W23–28) — crAPI pentest report
- [ ] Phase 4 — Security Automation (W29–34) — PR into Hubexo pipeline
- [ ] Phase 5 — Bug Bounty & Cert (W35–40) — BSCP / bug bounty report
