# Changelog

All notable changes to this plugin. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0]

First version, ported from the Yes2SDK Claude Code plugin (0.2.0).

### Added

- `.codex-plugin/plugin.json` manifest and `.mcp.json` registering the hosted
  `yes2sdk` MCP server (`https://mcp.yes2games.com/mcp`).
- Repo marketplace at `.agents/plugins/marketplace.json`, so
  `codex plugin marketplace add yes2games/yes2sdk-codex-plugin` works.
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

[0.1.0]: https://github.com/yes2games/yes2sdk-codex-plugin/releases/tag/v0.1.0
