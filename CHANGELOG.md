# Changelog

All notable changes to this plugin. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.2.0]: https://github.com/yes2games/yes2sdk-codex-plugins/releases/tag/v0.2.0
[0.1.0]: https://github.com/yes2games/yes2sdk-codex-plugins/releases/tag/v0.1.0
