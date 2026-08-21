---
description: Run the agentic security tester end-to-end against config/scope.json's primary target (or an in-scope URL you pass).
---

Launch the `sec-tester` sub-agent with the following instructions:

1. Read `config/scope.json`. Reject the run if `engagement.authorization` is not one of `owner | written-permission | bugbounty-scope | internal-authorized`.
2. Print the **Plan** (phase 0) and wait for my acknowledgement — unless my command included the token `auto` (then run to completion).
3. On acknowledgement, execute phases 1–6 per your system prompt.
4. Final message: paths to `report.html`, `report.json`, `report.md` plus a 5-line executive summary.

Target: {{args if provided else config/scope.json:targets.primary}}
Mode: {{"auto" if "auto" in args else "plan-first"}}
