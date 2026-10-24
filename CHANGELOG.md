# Changelog

All notable changes to this plugin. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2026-10-24

Sign-in becomes the default way the dashboard tools act as you: run
`codex mcp login yes2sdk` once. `YES2_API_KEY` through `env_http_headers` stays
supported, for CI and headless use. Also adds editing a game from the upload flow.

Needs the dashboard's OAuth sign-in and the MCP's lazy sign-in gate to be live.

### Added

- Sign-in through Codex's MCP OAuth: `codex mcp login yes2sdk`. The dashboard tools no
  longer need a key, and the docs and validation tools never ask. The README covers the
  approval page, revoking under **Settings > Connected apps**, and preview accounts.
- `update_game`, `set_game_image`, `finalize_image_upload` and `rename_build` in the
  README coverage table (20 tools), `AGENTS.md` and `docs/directory-submission.md`.
  After a build is ready, `yes2sdk-upload` can offer to rename it or edit the game's
  details, icon or banner, only when the user asks.
- `yes2sdk-upload` handles a sign-in-required answer (tell the user to run
  `codex mcp login yes2sdk`, then retry), `INSUFFICIENT_SCOPE`, and a preview account's
  `game_limit_reached` and `build_limit_reached`.

### Changed

- Setting an icon or banner uses the presigned flow: `set_game_image` takes the image's
  `size` and path and returns a `curl` PUT with no credential in it, then
  `finalize_image_upload` sets the image. The command no longer reads `$YES2_API_KEY`.
- The README's API key section now covers all dashboard tools, not only uploads, and
  sits under sign-in as the CI and headless option. `.mcp.json` is unchanged: its
  `X-Yes2-Api-Key` header does not stop Codex's OAuth.

## [0.4.0] - 2026-10-23

Adds uploading a build to the Yes2 dashboard, through the authenticated dashboard
tools in the `yes2sdk` MCP.

### Added

- `yes2sdk-upload` skill, the single source of the upload procedure, with
  `agents/openai.yaml` (`allow_implicit_invocation: false`, since it uploads). It
  checks the key with `list_games`, picks the game or creates it with `create_game`,
  builds a JS/TS project with `npm run build` (or asks for the Unity/Defold WebGL/HTML5
  output folder), zips it with `index.html` at the zip root, can run `$yes2sdk-verify`
  first, then calls `prepare_upload`, runs the returned `curl` PUT as given, calls
  `finalize_upload` and polls `get_build_status` until the build is `ready` or
  `failed`. It reports the `inspectorUrl` and any upload warnings, and says that
  publishing to platforms stays an admin action on the dashboard. It never reads,
  prints or asks for the key.
- `list_games`, `create_game`, `prepare_upload`, `finalize_upload` and
  `get_build_status` in the README coverage table (16 tools) and in `AGENTS.md`.
- `.mcp.json` sends `YES2_API_KEY` as the `X-Yes2-Api-Key` header through
  `env_http_headers`. Users export the variable and restart Codex; no `config.toml`
  entry is needed. Codex skips the header when the variable is unset, so the docs and
  validation tools work without a key. `env_http_headers` is documented for
  `config.toml` only, but Codex accepts it in a plugin's MCP file, verified end to end
  on CLI 0.156.1.
- README section on setting `YES2_API_KEY`.
- `validate-plugin.mjs` rejects `bearer_token_env_var` and `bearer_token` in
  `.mcp.json`, and the CI install test checks the installed plugin still carries the
  `X-Yes2-Api-Key` mapping.
- Upload in the listing's long description, the 0.4.0 release note, and the dashboard
  tools' hints in `docs/directory-submission.md`.

## [0.3.0] - 2026-10-23

Adds JavaScript/TypeScript (Phaser, three.js, vanilla) as a supported engine, through
the `@yes2games/js` package.

### Added

- JavaScript/TypeScript in `yes2sdk-install`, `yes2sdk-integrate`, `yes2sdk-verify`,
  `yes2sdk-diagnose` and its tool-routing notes, `yes2sdk-platform-rules`,
  `yes2sdk-docs`, the README and the listing's long description.
  `yes2sdk-integrate` places the JS init, loading and ad calls, routes ads and
  pause/mute through `@yes2games/js` (or its `/phaser` and `/three` helpers), imports
  the mock only under `import.meta.env.DEV`, and marks the game canvas
  `data-yes2-canvas`.
- `yes2sdk-verify` builds a JS project with its Vite build script before
  `validate_integration` and checks the output folder, never the source tree or a
  dev-server page.
- `yes2sdk-docs` points JavaScript questions at
  https://developer.yes2games.com/docs/javascript.
- `javascript`, `typescript`, `phaser` and `threejs` keywords.
- SDK naming per engine in `AGENTS.md`.

### Changed

- On a JS project, `installed` now means the `@yes2games/js` package, which
  `get_install_instructions("js")` installs. The SDK itself is still never installed
  or bundled: the dashboard injects `window.Yes2SDK` at upload. The old wording, that
  `installed: no` is the expected permanent state on JS, is gone.
- `yes2sdk-install` passes the root `vite.config.*` to `detect_sdk` alongside
  `package.json`, so the server can report Phaser, three.js and Vite.

## [0.2.0] - 2026-10-07

Adds Jest as a supported platform.

### Added

- Jest in `yes2sdk-verify` (`jest` is a platform name, and is part of `all`),
  `yes2sdk-integrate`, `yes2sdk-platform-rules` and the diagnose tool-routing notes.
  `yes2sdk-integrate` adds the Jest calls (guest save, registration prompt,
  notifications, purchase recovery, subscriptions, exit save) and never gates
  progression on a rewarded ad.
- `jest` keyword, and Jest in the listing's long description.
- Listing metadata for the plugin directory: Yes2Games logo (`assets/logo.png`) as the
  logo and composer icon, brand color, support, privacy policy and terms of service
  URLs. README gains a Support section.
- The validator checks listing images (square, at least 48x48, within 5 MiB and
  4096 px, under `./assets/`) and that listing URLs are https.

### Changed

- `yes2sdk-verify` calls `get_platform_requirements` for a platform with manual checks
  and reports them as not checked, so a clean automated run never reads as a pass.
- README records MCP server `0.3.2` (`>=0.3.2 <1.0.0`), the version that serves the
  `jest` platform.
- Listing subtitle (`interface.shortDescription`) shortened to "Integrate and verify
  web games"; the directory caps it at 30 characters. The validator now checks that
  cap and the starter prompt limits (at most 3, 128 characters each).
- Repository renamed to `yes2games/yes2sdk-codex-plugins`. Install with
  `codex plugin marketplace add yes2games/yes2sdk-codex-plugins`; the old name still
  redirects.

## [0.1.0] - 2026-09-30

First version, ported from the Yes2SDK Claude Code plugin (0.2.0).

### Added

- `.codex-plugin/plugin.json` manifest and `.mcp.json` registering the hosted
  `yes2sdk` MCP server (`https://mcp.yes2games.com/mcp`).
- Repo marketplace at `.agents/plugins/marketplace.json`, so
  `codex plugin marketplace add yes2games/yes2sdk-codex-plugins` works.
- Skills: `yes2sdk-install`, `yes2sdk-integrate`, `yes2sdk-verify`,
  `yes2sdk-diagnose` (with its tool-routing reference), `yes2sdk-platform-rules` and
  `yes2sdk-docs`, covering all 11 MCP tools.
- `scripts/validate-plugin.mjs` and a CI job that also installs the plugin into a
  throwaway `CODEX_HOME` with a pinned Codex CLI.

### Changed from the Claude Code plugin

- The `/verify-*` commands and the `yes2sdk-compliance-sweep` agent are one
  `yes2sdk-verify` skill that takes a platform or `all`. The all-platform report keeps
  the agent's triage by cause.
- `/integrate-all` and `/yes2sdk-docs` are the `yes2sdk-integrate` and `yes2sdk-docs`
  skills. `yes2sdk-integrate` has implicit invocation turned off because it writes code.

[0.3.0]: https://github.com/yes2games/yes2sdk-codex-plugins/releases/tag/v0.3.0
[0.2.0]: https://github.com/yes2games/yes2sdk-codex-plugins/releases/tag/v0.2.0
[0.1.0]: https://github.com/yes2games/yes2sdk-codex-plugins/releases/tag/v0.1.0
