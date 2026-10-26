# Yes2SDK for Codex

One integration ships your HTML5 game to every supported web game platform. Install
once, and Codex knows the whole SDK.

This plugin gives Codex one-step access to the [Yes2SDK](https://developer.yes2games.com)
MCP server, plus skills that install the SDK, scaffold the integration, verify a build
against platform rules, diagnose failures and upload a build to the Yes2 dashboard. Installing it registers the hosted
Yes2SDK MCP, so there is no local server to build or run.

Works with Unity, Defold and JavaScript/TypeScript games (Phaser, three.js or vanilla).
On JavaScript/TypeScript you write against `window.Yes2SDK` with the
[`@yes2games/js`](https://www.npmjs.com/package/@yes2games/js) package (runtime helpers,
types, a local-dev mock), build with Vite, and upload the plain build; the dashboard
injects the real SDK, so you never bundle it. See
https://developer.yes2games.com/docs/javascript.

## Install

```bash
codex plugin marketplace add yes2games/yes2sdk-codex-plugins
codex plugin add yes2sdk@yes2games
codex mcp list        # confirm the yes2sdk server is listed
```

You can also install from the Codex app's plugin browser once the marketplace is added.

This registers the `yes2sdk` MCP server (remote HTTP, `https://mcp.yes2games.com/mcp`)
and adds the skills below.

## Sign in to the dashboard (for the dashboard tools only)

Signing in is opt-in, and only the dashboard tools need it: the docs, rules and
validation tools never do. Until you sign in, a dashboard tool just replies that you're
not signed in. To upload builds to the Yes2 dashboard with `$yes2sdk-upload`, or to edit
a game there, sign in once with your dashboard account:

```bash
codex mcp login yes2sdk
```

You can also ask Codex to "sign in to Yes2", which calls the `sign_in` tool; once you're
signed in, the same tool reports the account and studio in use.

Your browser opens the dashboard; log in if needed. The approval page shows which app is
asking, the account it will act as (your studio and role, or your personal games on a
preview account) and what it may do: see your games and builds, create and edit games,
upload builds. It cannot publish, download builds, or see analytics, revenue or your
team. Approve, then go back to Codex. If a dashboard tool says you're not signed in, run
the same command.

Codex keeps the sign-in and refreshes it on its own. To disconnect it, open the dashboard
(avatar > **Settings > Connected apps**) and **Revoke** it, or run
`codex mcp logout yes2sdk`.

Sign-in needs an owner, manager or developer seat in a studio, or a preview account with
no studio yet. A preview account works with its usual limits until the account is
verified: unlimited games; one build per game, and a new upload replaces the previous one
unless that build is in review or live. The tools say so when an upload can't go through.

### API key (optional, for CI and headless use)

Where nobody can approve in a browser, give Codex a dashboard API key instead. It is
still supported through `env_http_headers`:

1. Create a key on the dashboard: a personal key under your avatar, **Settings >
   Personal API keys**, or a team key from the **Team** page.
2. Export it from your shell profile (`~/.zshrc`, `~/.bashrc`), never from a file in a
   project and never in a commit:

   ```bash
   export YES2_API_KEY=y2g_your_key_here
   ```

3. Open a new terminal and start Codex from it. No `config.toml` entry is needed.

The plugin's `.mcp.json` maps the variable onto a header with
`"env_http_headers": { "X-Yes2-Api-Key": "YES2_API_KEY" }`, so Codex sends the key as
`X-Yes2-Api-Key` on each request. The server passes it to the dashboard for that
request only and never stores it. When the variable is unset Codex leaves the header
out and the server starts as usual, so the docs and validation tools work without a
key.

`env_http_headers` is documented for `~/.codex/config.toml`, not for a plugin's MCP
file. Codex accepts it there anyway; this was verified end to end on Codex CLI 0.156.1
(unset: the server starts and no header is sent; set: the header arrives), and CI
checks that the installed plugin still carries it.

Without a key or a sign-in the dashboard tools reply that you're not signed in. Codex never needs to
see the key, so do not paste it into the chat.

Uploading puts a build on the dashboard, where you can open it in the Inspector. It
does not publish anything: publishing to platforms is requested on the dashboard and
done by a Yes2Games admin.

## Skills

Codex picks a skill up from what you describe. To call one by name, type `$` and the
skill name, or run `/skills`.

| Skill | What it does | Say something like |
|---|---|---|
| `yes2sdk-install` | Detects the engine (Unity, Defold, or JavaScript/TypeScript with Phaser, three.js or Vite) and install state, then gives the version-pinned install steps. Runs before any Yes2SDK code is written. | *"Set up Yes2SDK in this project."* |
| `yes2sdk-integrate` | Scaffolds the unified init and ad loop with `isSupported()` guards. On JavaScript/TypeScript it also wires the dev-only mock import. It writes code, so it only runs when you ask for it by name. | *"$yes2sdk-integrate for poki"* |
| `yes2sdk-verify` | Checks an extracted WebGL or JavaScript/TypeScript build against one platform or all of them. For all platforms it groups findings by cause, so one missing `gameplayStop()` reads as one fix. | *"Verify ./build/webgl for YouTube."* / *"Check this build against every platform."* |
| `yes2sdk-diagnose` | Routes a symptom, a failed rule id or a "does this platform support X" question to the right tool. | *"The rewarded ad plays but the reward never lands."* |
| `yes2sdk-platform-rules` | Cross-platform rules for any integration or compliance work, deferring to the MCP for the authoritative rule set. | *"What breaks if I ship this to Yandex and Poki?"* |
| `yes2sdk-docs` | Searches the Yes2SDK docs. | *"$yes2sdk-docs rewarded ad callbacks"* |
| `yes2sdk-upload` | Uploads a build to the Yes2 dashboard as you (sign in with `codex mcp login yes2sdk`, or use an API key): picks or creates the game, builds a JS/TS project, zips the build with `index.html` at the root, uploads it, waits for processing and returns the Inspector link and any upload warnings. Asks before reserving a version. It uploads, so it only runs when you ask for it by name. | *"$yes2sdk-upload ./dist"* |

`yes2sdk-verify` takes the path to your **extracted** WebGL/HTML5 build; if you leave it
off it asks once. On a JavaScript/TypeScript project it builds first with your Vite
build script and checks the output folder (`dist/`). An Inspector event log can be added for the behavioral checks. Without one,
the report says which checks did not run. For Jest, the automated checks cover only the
universal rules, so the report lists Jest's manual launch checklist as not yet checked.

## MCP tool coverage

All 21 `yes2sdk` MCP tools are reachable:

| Tool | Fronted by |
|---|---|
| `detect_sdk` | `yes2sdk-install`, `yes2sdk-integrate` |
| `get_install_instructions` | `yes2sdk-install`, `yes2sdk-integrate`, `yes2sdk-platform-rules` |
| `get_quickstart` | `yes2sdk-integrate`, `yes2sdk-docs`, `yes2sdk-platform-rules` |
| `get_api_reference` | `yes2sdk-integrate`, `yes2sdk-docs`, `yes2sdk-platform-rules` |
| `search_docs` | `yes2sdk-docs` |
| `get_platform_requirements` | `yes2sdk-platform-rules`, `yes2sdk-verify` |
| `validate_integration` | `yes2sdk-verify`, `yes2sdk-integrate`, `yes2sdk-platform-rules` |
| `get_compliance_rule` | `yes2sdk-diagnose`, `yes2sdk-verify` |
| `troubleshoot` | `yes2sdk-diagnose` |
| `get_platform_capabilities` | `yes2sdk-diagnose` |
| `list_sdk_modules` | `yes2sdk-diagnose` |
| `sign_in` | `yes2sdk-upload` |
| `list_games` | `yes2sdk-upload` |
| `create_game` | `yes2sdk-upload` |
| `prepare_upload` | `yes2sdk-upload` |
| `finalize_upload` | `yes2sdk-upload` |
| `get_build_status` | `yes2sdk-upload` |
| `update_game` | `yes2sdk-upload` (on request) |
| `set_game_image` | `yes2sdk-upload` (on request) |
| `finalize_image_upload` | `yes2sdk-upload` (on request) |
| `rename_build` | `yes2sdk-upload` (on request) |

The last ten are the dashboard tools, `sign_in` first. The rest need you to sign in, or an API key (see
[Sign in to the dashboard](#sign-in-to-the-dashboard-for-the-dashboard-tools-only)).
The last four edit a game's profile or rename a build, and the skill offers them only
when you ask. `set_game_image` returns a `curl` PUT that sends the image from your
machine straight to storage with no credential in it, and `finalize_image_upload` then
sets it, so the image never passes through the chat or the MCP.

The server's MCP prompts (`integrate_module`, `setup_new_project`) and resources
(`yes2sdk://modules`, `yes2sdk://docs/{module}`) are not wrapped in a skill. Any MCP
client can reach them directly.

The plugin ships no hooks.

## How it's wired

The plugin is a thin wrapper. Every skill routes to an MCP tool; compliance rules,
docs and validation live in the MCP, not here.

A procedure lives in one skill and the others hand off to it: `yes2sdk-verify` owns
how a build is supplied to `validate_integration`, and `yes2sdk-install` owns engine
detection. `yes2sdk-integrate` follows both rather than restating them, and
`yes2sdk-upload` hands its optional pre-upload check to `yes2sdk-verify`.

### MCP server version

Built against `yes2sdk` MCP server **0.3.2**, expecting `>=0.3.2 <1.0.0`. The hosted
server is upgraded in place, so no action is normally needed.

The dashboard tools (`list_games`, `create_game`, `prepare_upload`, `finalize_upload`,
`get_build_status`, `update_game`, `set_game_image`, `finalize_image_upload`,
`rename_build`) and `sign_in` are newer than
that version. On a server without them,
`yes2sdk-upload` stops at its first step because `yes2sdk:list_games` does not exist.

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
Your entry replaces the plugin's, so for uploads give it the header too:
`env_http_headers = { "X-Yes2-Api-Key" = "YES2_API_KEY" }` (local HTTP), or forward the
variable with `env_vars = ["YES2_API_KEY"]` (stdio). A local server does not offer
sign-in.

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

Authoring rules for this repo are in [AGENTS.md](AGENTS.md). Plugin directory listing
fields, test cases and release notes are in
[docs/directory-submission.md](docs/directory-submission.md).

Bumping the version means editing `.codex-plugin/plugin.json` and `package.json`. The
validator fails if they disagree.

## Support

Email developer.support@yes2games.com, or see https://developer.yes2games.com. Bugs in
the plugin itself go to https://github.com/yes2games/yes2sdk-codex-plugins/issues.

## License

MIT, see [LICENSE](LICENSE).
