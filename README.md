# Yes2SDK for Codex

One integration ships your HTML5 game to every supported web game platform. Install
once, and Codex knows the whole SDK.

This plugin gives Codex one-step access to the [Yes2SDK](https://developer.yes2games.com)
MCP server, plus skills that install the SDK, scaffold the integration, verify a build
against platform rules and diagnose failures. Installing it registers the hosted
Yes2SDK MCP, so there is no local server to build or run.

## Install

```bash
codex plugin marketplace add yes2games/yes2sdk-codex-plugins
codex plugin add yes2sdk@yes2games
codex mcp list        # confirm the yes2sdk server is listed
```

You can also install from the Codex app's plugin browser once the marketplace is added.

This registers the `yes2sdk` MCP server (remote HTTP, `https://mcp.yes2games.com/mcp`)
and adds the skills below.

## Skills

Codex picks a skill up from what you describe. To call one by name, type `$` and the
skill name, or run `/skills`.

| Skill | What it does | Say something like |
|---|---|---|
| `yes2sdk-install` | Detects the engine and install state, then gives the version-pinned install steps. Runs before any Yes2SDK code is written. | *"Set up Yes2SDK in this project."* |
| `yes2sdk-integrate` | Scaffolds the unified init and ad loop with `isSupported()` guards. It writes code, so it only runs when you ask for it by name. | *"$yes2sdk-integrate for poki"* |
| `yes2sdk-verify` | Checks an extracted WebGL build against one platform or all of them. For all platforms it groups findings by cause, so one missing `gameplayStop()` reads as one fix. | *"Verify ./build/webgl for YouTube."* / *"Check this build against every platform."* |
| `yes2sdk-diagnose` | Routes a symptom, a failed rule id or a "does this platform support X" question to the right tool. | *"The rewarded ad plays but the reward never lands."* |
| `yes2sdk-platform-rules` | Cross-platform rules for any integration or compliance work, deferring to the MCP for the authoritative rule set. | *"What breaks if I ship this to Yandex and Poki?"* |
| `yes2sdk-docs` | Searches the Yes2SDK docs. | *"$yes2sdk-docs rewarded ad callbacks"* |

`yes2sdk-verify` takes the path to your **extracted** WebGL build; if you leave it off it
asks once. An Inspector event log can be added for the behavioral checks. Without one,
the report says which checks did not run.

## MCP tool coverage

All 11 `yes2sdk` MCP tools are reachable:

| Tool | Fronted by |
|---|---|
| `detect_sdk` | `yes2sdk-install`, `yes2sdk-integrate` |
| `get_install_instructions` | `yes2sdk-install`, `yes2sdk-integrate` |
| `get_quickstart` | `yes2sdk-integrate`, `yes2sdk-docs`, `yes2sdk-platform-rules` |
| `get_api_reference` | `yes2sdk-integrate`, `yes2sdk-docs`, `yes2sdk-platform-rules` |
| `search_docs` | `yes2sdk-docs` |
| `get_platform_requirements` | `yes2sdk-platform-rules` |
| `validate_integration` | `yes2sdk-verify`, `yes2sdk-integrate`, `yes2sdk-platform-rules` |
| `get_compliance_rule` | `yes2sdk-diagnose`, `yes2sdk-verify` |
| `troubleshoot` | `yes2sdk-diagnose` |
| `get_platform_capabilities` | `yes2sdk-diagnose` |
| `list_sdk_modules` | `yes2sdk-diagnose` |

The server's MCP prompts (`integrate_module`, `setup_new_project`) and resources
(`yes2sdk://modules`, `yes2sdk://docs/{module}`) are not wrapped in a skill. Any MCP
client can reach them directly.

The plugin ships no hooks.

## How it's wired

The plugin is a thin wrapper. Every skill routes to an MCP tool; compliance rules,
docs and validation live in the MCP, not here.

A procedure lives in one skill and the others hand off to it: `yes2sdk-verify` owns
how a build is supplied to `validate_integration`, and `yes2sdk-install` owns engine
detection. `yes2sdk-integrate` follows both rather than restating them.

### MCP server version

Built against `yes2sdk` MCP server **0.3.x**, expecting `>=0.3.0 <1.0.0`. The hosted
server is upgraded in place, so no action is normally needed.

A mismatch shows up as a symptom: a skill fails because an MCP tool is missing or its
arguments were rejected. Upgrade the plugin first (`codex plugin marketplace upgrade`).
If it still fails, open an issue at
https://github.com/yes2games/yes2sdk-codex-plugins/issues with what you asked and the
error text.

### Running the MCP on your own machine

The hosted server has **no disk access**, so the skills pass file contents inline:
`detect_sdk` gets `files`, and `validate_integration` gets `indexHtml`, `fileList` and
`jsContents`. The path forms (`projectPath`, `buildPath`) fail loudly against the
hosted server and only work when the server runs on your machine.

To use a local server, point the `yes2sdk` name at it in `~/.codex/config.toml`, for
example `http://127.0.0.1:8091/mcp`. The skills work against any server named `yes2sdk`.

## Contributing

`scripts/validate-plugin.mjs` is the structure gate (Node stdlib only, no
dependencies). Codex has no `plugin validate` command, so CI also installs the plugin
into a throwaway `CODEX_HOME` and checks the skills and MCP server landed:

```bash
node scripts/validate-plugin.mjs

export CODEX_HOME="$(mktemp -d)"
codex plugin marketplace add ./
codex plugin add yes2sdk@yes2games
codex mcp list
```

Authoring rules for this repo are in [AGENTS.md](AGENTS.md).

Bumping the version means editing `.codex-plugin/plugin.json` and `package.json`. The
validator fails if they disagree.

## License

MIT, see [LICENSE](LICENSE).
