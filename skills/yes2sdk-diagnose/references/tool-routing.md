# `yes2sdk` MCP tool routing

Which of the 11 tools answers which question, and the preconditions and failure
modes seen in practice. Routing knowledge only. Each tool's own schema and output
is authoritative over anything written here, so call the tool rather than trusting a
parameter list remembered from this page.

## Contents

- [Pick a tool by question](#pick-a-tool-by-question)
- [The two-mode tools](#the-two-mode-tools): the most common source of a useless answer
- [Per-tool notes](#per-tool-notes)
- [Chains that work](#chains-that-work)
- [Not fronted by this plugin](#not-fronted-by-this-plugin)

## Pick a tool by question

| Question | Tool |
| --- | --- |
| Can this project compile SDK code yet? | `yes2sdk:detect_sdk` |
| How do I add the SDK? | `yes2sdk:get_install_instructions` |
| How do I integrate for platform X? | `yes2sdk:get_quickstart` |
| What is this method's exact signature? | `yes2sdk:get_api_reference` |
| What module names exist? | `yes2sdk:list_sdk_modules` |
| Something in the docs, question still open-ended | `yes2sdk:search_docs` |
| What must I satisfy for platform X? | `yes2sdk:get_platform_requirements` |
| What does rule id N mean, and how do I fix it? | `yes2sdk:get_compliance_rule` |
| Would this build be rejected? | `yes2sdk:validate_integration` |
| Is module X available on platform Y? | `yes2sdk:get_platform_capabilities` |
| This error or symptom: what causes it? | `yes2sdk:troubleshoot` |

## The two-mode tools

`yes2sdk:detect_sdk` and `yes2sdk:validate_integration` each accept a disk path OR
inline content. **This plugin registers the hosted server at
`https://mcp.yes2games.com/mcp`, and it has no disk access.** The path arguments fail
loudly there: `detect_sdk` returns an error result naming the cause, and
`validate_integration` returns a blocking `build-path` FAIL. Read the files locally
and pass them inline.

| Tool | Hosted (this plugin) | Server on your own machine |
| --- | --- | --- |
| `yes2sdk:detect_sdk` | `files`, a map of repo-relative path to contents | `projectPath` |
| `yes2sdk:validate_integration` | `indexHtml`, `fileList`, `jsContents` | `buildPath` |

Exactly one mode per `yes2sdk:detect_sdk` request. For
`yes2sdk:validate_integration`, `jsContents` is what makes the Yes2SDK-bundling
check possible; without it that check cannot run.

## Per-tool notes

**`yes2sdk:detect_sdk`** reports engine, install state, installed version, and the
steps still required. Engine markers to pass inline: `game.project` (Defold),
**both** `Packages/manifest.json` and a `ProjectSettings/` file (Unity; one alone
returns `Engine: unknown`), `package.json` (JS). Inspects only; never modifies.
`installed: no` is a blocker on Unity and Defold, and the expected permanent state
on JS, where the runtime is injected into the build at upload time.

**`yes2sdk:get_install_instructions`** is version-pinned, so use the returned steps
rather than a remembered procedure. It reports what to do, not what is already
done; that is `yes2sdk:detect_sdk`.

**`yes2sdk:get_quickstart`** returns the whole guide for one platform: call
sequence, per-engine examples, common rejection reasons. Read it before the first
SDK call is written, not after a failure.

**`yes2sdk:get_api_reference`** takes `module` as a fixed enum, and it is wider than
the module list most docs quote. A name outside it is rejected, so take the list
from `yes2sdk:list_sdk_modules` rather than guessing a plural or a synonym.

**`yes2sdk:list_sdk_modules`** is a directory, not documentation; it exists so
`yes2sdk:get_api_reference` gets a valid module name.

**`yes2sdk:search_docs`** is keyword search over the bundled docs, no web access.
It is the weakest of the three lookup routes for a precise question: a concrete
error goes to `yes2sdk:troubleshoot`, per-platform module support to
`yes2sdk:get_platform_capabilities`. Use it when the question is still open-ended.

**`yes2sdk:get_platform_requirements`** returns the full rule list for one
platform, the same checks `yes2sdk:validate_integration` runs. It grades nothing;
it lists.

**`yes2sdk:get_compliance_rule`** takes the rule id off a finding, whose own hint
is only a summary. Id prefixes tell you the scope: `U-` universal, `P-` Poki, `CG-`
CrazyGames, `Y-` Yandex, `GD-` GameDistribution, `YT-` YouTube. Jest has no
platform-specific rule ids yet: its requirements are a manual checklist from
`yes2sdk:get_platform_requirements`, and only `U-` rules run against a Jest build.

**`yes2sdk:validate_integration`** has static and behavioral modes that are
independent, and either can run alone. The static checks need the build; the
behavioral rules exist only in an exported Inspector event log passed as
`eventLogJson`. With one of the two supplied, say which checks did not run. The
calling procedure lives in the `$yes2sdk-verify` skill.

**`yes2sdk:get_platform_capabilities`** answers the `isSupported()` question. Omit
its arguments for the full Ready/Partial/not-offered matrix. Its module filter is a
substring match, not the strict enum `yes2sdk:get_api_reference` uses.

**`yes2sdk:troubleshoot`** takes an error string or plain language, and routes:
answers point at `yes2sdk:detect_sdk`, `yes2sdk:get_install_instructions`,
`yes2sdk:get_compliance_rule` or `yes2sdk:validate_integration`, and say so when
nothing matches. Cheaper than `yes2sdk:search_docs` for anything with an error
message attached.

## Chains that work

- New project: `yes2sdk:detect_sdk`, then `yes2sdk:get_install_instructions`,
  `yes2sdk:get_quickstart`, `yes2sdk:get_api_reference`,
  `yes2sdk:validate_integration`.
- Verify FAIL: `yes2sdk:get_compliance_rule` (rule id off the finding), fix, then
  re-run `$yes2sdk-verify`.
- Symptom with no rule id: `yes2sdk:troubleshoot`, then whichever tool it names.
- "Can I call this here?": `yes2sdk:get_platform_capabilities`, then
  `yes2sdk:get_api_reference`.

## Not fronted by this plugin

The server also exposes MCP prompts (`integrate_module`, `setup_new_project`) and
resources (`yes2sdk://modules`, `yes2sdk://docs/{module}`). They are reachable
directly through any MCP client and are deliberately not wrapped in a skill.
Wrapping a prompt in a prompt adds a layer without adding routing.
