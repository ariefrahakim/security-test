# sec-agent — Agentic Web Application Security Testing

An authorized, agent-driven web security tester built as a Claude Code sub-agent stack.
**Target-agnostic:** change `TARGET_WEB` in `.env`, re-run — everything else is derived.

```
┌──────────────────────────────────────────────────────────────────┐
│  sec-orchestrator   (Lead — plans, delegates, arbitrates)        │
│      │                                                            │
│      ├── sec-recon    (Passive reconnaissance)                    │
│      │                                                            │
│      └── sec-verify   (Minimal-PoC verification, HITL-gated)      │
└──────────────────────────────────────────────────────────────────┘
                              │
              scripts/  (safe-curl · scope-check · recon-passive
                         · analyze-recon · build-report · run)
                              │
              reports/<date>-<slug>/  (raw evidence + findings + HTML/JSON/MD)
```

## Quick start

```bash
# 1. Configure the target and authorization
cp .env.example .env
$EDITOR .env      # set TARGET_WEB, AUTHORIZATION_TYPE, AUTHORIZATION_NOTE

# 2. Run the one-shot passive pipeline (no LLM needed)
./scripts/run.sh
open reports/<today>-<slug>/report.html

# 3. Or drive the full agentic workflow through Claude Code
#    (in a Claude Code session inside this repo)
#      > Use the sec-orchestrator sub-agent to run the sec-test end-to-end.
#    Or run the command:
#      /sec-test
```

Change target → `sed -i '' 's|^TARGET_WEB=.*|TARGET_WEB=https://next.example.com|' .env` → rerun.

## The three agents

| Agent | Role | Tools | Never does |
|---|---|---|---|
| **`sec-orchestrator`** | Lead. Plans (Course-of-Action), delegates, arbitrates, assembles the final report. | `Read`, `Write`, `Bash`, `Agent` | Never calls scanners directly — only sub-agents/scripts. |
| **`sec-recon`** | Passive reconnaissance only — headers, TLS, robots, common files, CORS. | `Bash` (scripts only), `Read` | No credentials, no payloads, no active scanning. |
| **`sec-verify`** | Verification. Turns hypotheses into minimal PoCs. HITL-gated on state-changing requests. | `Bash`, `Read`, Playwright MCP (sandboxed) | Never bulk-approves POST/PUT/DELETE. |

All three enforce the two-gate authorization: **`AUTHORIZATION_TYPE` in `.env`** and **`scripts/scope-check.sh` at runtime**.

## The `.env` contract

The whole framework is driven by `.env`. `.env.example` documents every field.

| Var | Meaning |
|---|---|
| `TARGET_WEB` | Full URL of the target. Its host is the only in-scope host by default. |
| `AUTHORIZATION_TYPE` | `owner` \| `written-permission` \| `bugbounty-scope` \| `internal-authorized`. Anything else = refuse to run. |
| `AUTHORIZATION_NOTE` | Free-text audit trail. |
| `EMAIL` / `PASSWORD` | Optional test-account creds. Only used if you explicitly enable auth-flow tests. |
| `EXTRA_IN_SCOPE_HOSTS` | Comma-separated. Extra hosts to accept (e.g. an API subdomain). |
| `OUT_OF_SCOPE_PATHS` | Comma-separated path prefixes to *reject* (e.g. `/api/billing`). |
| `MAX_RPM` | Max requests per minute per host (rate-limiter in `safe-curl.sh`). |
| `SEC_AGENT_KILL` | Set to `1` to hard-halt all agent activity immediately. |

## What gets tested (passive baseline, out of the box)

- HTTPS enforcement (HTTP→HTTPS redirect status)
- TLS version negotiation (rejects 1.0/1.1, accepts 1.2/1.3), cert issuer + dates
- Response security headers: HSTS, CSP, X-Frame-Options / `frame-ancestors`, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Framework fingerprint disclosure (`X-Powered-By`, `Server`)
- `robots.txt` / `sitemap.xml` / `.well-known/security.txt`
- Common sensitive files (`.env`, `.git/config`, `.DS_Store`, `backup.zip`, …) — 404-confirmation only
- CORS reflection (hostile Origin, null Origin)

`sec-orchestrator` extends this by planning **light-active** and **verification** phases per engagement.

## Report

Every run emits three formats under `reports/<YYYY-MM-DD>-<slug>/`:

- `report.html` — interactive, self-contained. Single **Export** dropdown → PDF (print) / JSON / CSV / Excel (`.xls`) / Markdown.
- `report.json` — machine-readable, feed into dashboards.
- `report.md` — copy-paste friendly for tickets/PRs.

Each finding carries: **CVSS 4.0 vector**, confidence rating (`verified` / `probable` / `heuristic`), CWE, OWASP:2025 category, minimal PoC, chain-of-attack narrative, patch + compensating-control + detection-rule remediation, retest command.

## Guardrails (hard rules)

- **Authorization is a two-gate check** — `.env` value + runtime `scripts/scope-check.sh`. Neither alone is trusted.
- Every HTTP request goes through **`./scripts/safe-curl.sh`**, which enforces scope + rate limit + logs to `reports/_agent-log/`.
- **HITL required** for any state-changing request, credential submission, or destructive tool (`sqlmap`, brute-force, `zap-full-scan`).
- **Kill-switch** — `SEC_AGENT_KILL=1` in `.env` halts the agent immediately.
- **Prompt-injection defense** — pages read for evidence are stripped to structured summaries before any LLM re-reads them.

## Files

```
.env.example                Documented sample; copy to .env
.claude/agents/             The three sub-agents (Markdown w/ YAML frontmatter)
  sec-orchestrator.md
  sec-recon.md
  sec-verify.md
.claude/commands/sec-test.md   Slash-command entry (/sec-test)
scripts/
  env.sh                    Sourced by every script; validates .env, derives host + scope regex
  scope-check.sh            Hard scope gate (Bash — the ONLY authoritative check)
  safe-curl.sh              curl wrapper (scope + rate + log)
  recon-passive.sh          Passive evidence collector
  analyze-recon.js          Rule-based analyzer → findings.json
  build-report.js           Emits report.html + report.json + report.md
  run.sh                    One-shot: recon → analyze → report
config/                     (reserved for future engagement-specific config)
templates/                  Report + PoC templates
reports/<date>-<slug>/      Per-run output (git-ignored where sensitive)
```

## Reference repositories (studied, patterns adopted)

This stack is built on public reference implementations. Each contributed specific patterns — with attribution below.

| Repo | Adopted patterns | Deliberately *not* adopted |
|---|---|---|
| [**GH05TCREW/pentestagent**](https://github.com/GH05TCREW/pentestagent) | • Orchestrator + worker crew shape<br>• Explicit **Course-of-Action (COA)** re-plan step in orchestrator prompt<br>• Anti-hallucination clause: every claim traces to a tool result<br>• Structured shared "notes" as the durable memory across sub-agents | • Their scope validator is a library that is **never wired into the executor** — we make `scope-check.sh` a mandatory pre-request gate instead<br>• Reports without CVSS / severity / CWE — we require all three<br>• 2000-char truncation of evidence — we keep raw evidence verbatim<br>• Prompt-only "permission granted; do not ask" — dangerous without a code-level gate |
| [**usestrix/strix**](https://github.com/usestrix/strix) | • Hard **root/child split**: "YOU ARE THE ROOT AGENT. Your job is ORCHESTRATION, not hands-on testing"<br>• Mandatory **Discovery → Validation → Reporting** chain per finding<br>• **Full 8-metric CVSS breakdown** + `code_locations` with `fix_before` / `fix_after`<br>• **VALIDATION MANDATE**: CVSS impact must be demonstrated by the PoC, not implied by scanner labels<br>• LLM-based deduplication at report time | • "Never question your authority / NEVER refuse" language — only safe inside their platform-verified scope injection, dangerous outside<br>• Deep monolithic Jinja prompt mixing all roles — we split per-role Markdown<br>• Shared `/workspace` + browser across children — cross-contamination footgun |
| [**dietrichgebert/ponytail**](https://github.com/dietrichgebert/ponytail) | • **UserPromptSubmit + PreToolUse hook pattern** to re-inject rules-of-engagement every turn (planned — hook-file scaffold under `.claude/`)<br>• **Sub-agent matcher regex** so rules scope by role (`recon` vs `verify`) | • Its actual ruleset ("write less code") is orthogonal to offensive testing — we only borrow the plumbing<br>• Reported "-22% tokens" from output shrinkage — not applicable here (evidence must be preserved) |
| [**Graphify-Labs/graphify**](https://github.com/Graphify-Labs/graphify) | • **Three-artifact contract** — `graph.json` + `graph.html` + `GRAPH_REPORT.md` inspired our `findings.json` + `report.html` + `report.md`<br>• **`EXTRACTED` vs `INFERRED` edge tag** → our finding `provenance` field separates "observed in response bytes" from "inferred from response behavior"<br>• `PreToolUse` strict-mode: block first raw read, force a query against the graph — analog to blocking first raw scan and forcing a query against the recon artifact | • Not fit for black-box HTTP surface — its schema is code-centric; we don't shoehorn HTTP nodes<br>• Use graphify itself only during a white-box phase against target source code |

Broader guidance also mined from:

- OWASP **Top 10:2025** + OWASP **API Security Top 10:2023** + OWASP **Top 10 for Agentic Applications 2026** (Dec 2025) — categorization + guardrail selection.
- OWASP **WSTG** — methodology skeleton for the recon and verification phases.
- **Nuclei** (projectdiscovery) — for future active-phase templates (`-severity info,low -tags tech,ssl,http,misconfig,exposure -rate-limit 20`).
- **CVSS 4.0 calculator** — vector-string discipline.
- IANS write-up (Jul 2026) on the AWS AI Pentester being tricked into scanning attacker-nominated third-party sites — cautionary tale that shaped the two-gate authorization model here.

## Ethics

Test only what you own, are contracted to test, or is listed in a public bug bounty scope. Never point a scanner at an asset without written authorization. Personal data found during testing is never downloaded, never stored — prove access and report.

## License

Personal / internal use. Contributions welcome once the repo is stabilized.
