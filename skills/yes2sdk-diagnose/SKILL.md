---
name: yes2sdk-diagnose
description: Diagnoses a Yes2SDK symptom or compliance failure. Use when ads will not show, audio stays dead after an ad, a reward is not granted, a loading screen never dismisses, a verify run FAILs on a rule id, or a platform may not support a module.
---

# Diagnosing a Yes2SDK integration

Four questions, four tools. Pick by the question actually being asked rather than
running all four.

| The question | Route to |
| --- | --- |
| "it does not work", an error or a symptom | `yes2sdk:troubleshoot` |
| "why did this check fail", a rule id in hand | `yes2sdk:get_compliance_rule` |
| "does this platform support X" | `yes2sdk:get_platform_capabilities` |
| "what modules exist", an unfamiliar module name | `yes2sdk:list_sdk_modules` |

## Drilling into a verify failure

A `$yes2sdk-verify` run reports findings with a rule id and a short fix hint. The
hint is a summary; the rule is the thing the platform rejects on.

1. Take the rule id off the finding.
2. `yes2sdk:get_compliance_rule` with that id returns the full rule text, severity,
   and why the platform enforces it.
3. If the finding is a symptom rather than a rule violation (audio dead after an
   ad, loading screen never dismissing, rewards not granting), go to
   `yes2sdk:troubleshoot` instead. Those have known causes that the static rule
   text does not explain.
4. Re-run `$yes2sdk-verify` for that platform after the fix. Do not mark a FAIL
   resolved on reasoning alone.

## Before blaming the code

Check the feature exists on that platform. `yes2sdk:get_platform_capabilities`
answers it. An `isSupported()` guard returning false is the SDK working correctly,
not a bug. The fix is to handle the unsupported path, not to force the call.

## Reference

`references/tool-routing.md` covers all 11 `yes2sdk` MCP tools: which question each
answers, its preconditions, and the failure modes observed in practice. Read it
when a tool returns nothing useful or rejects its arguments.

## Never answer from memory

Rule text, limits and capability matrices change server-side. Fetch them. This
skill carries routing knowledge only; the server is the single source of truth
for what any rule says.
