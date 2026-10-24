# Repo rules

This repo is a Codex plugin, not compiled code: a manifest (`.codex-plugin/plugin.json`),
a remote MCP registration (`.mcp.json`), a repo marketplace
(`.agents/plugins/marketplace.json`), skills (`skills/*/SKILL.md`), and one
dependency-free validator (`scripts/validate-plugin.mjs`).

## Thin front end

- All real logic lives in the hosted `yes2sdk` MCP (`https://mcp.yes2games.com/mcp`).
  This repo routes; it never reimplements. Compliance rules, docs, API reference and
  validation belong in the MCP.
- A needed server change is an issue on `yes2sdk-mcp`, never a workaround here.
- Do not bake rules or numeric limits into skills. The one exception is the hedged
  "usual causes of rejection" summaries in `yes2sdk-verify` and
  `yes2sdk-platform-rules`, which exist only to explain a finding and must never be used
  to decide one.

## Skills

- Frontmatter is `name` and `description` only. `name` equals the directory name.
  Keep `description` short: Codex budgets the whole skills list into every session.
- Never put `: ` inside an unquoted `description`. It breaks the YAML and the skill
  loads with nothing.
- Name MCP tools in prose as `yes2sdk:<tool>`. Name another skill as `$<skill-name>`;
  the validator checks those references resolve.
- `agents/openai.yaml` carries UI metadata. Set `policy.allow_implicit_invocation:
  false` on anything that writes to the user's project (`yes2sdk-integrate`).
- One procedure, one file. `yes2sdk-verify` owns how a build reaches
  `validate_integration`; `yes2sdk-install` owns engine detection. Others hand off to
  them by name instead of restating them.
- The hosted server has no disk access. `detect_sdk` gets `files`, not `projectPath`;
  `validate_integration` gets `indexHtml`/`fileList`/`jsContents`, not `buildPath`.
- Adding a tool to the server means adding it to a skill and to the README coverage
  table.
- The nine dashboard tools (`list_games`, `create_game`, `prepare_upload`,
  `finalize_upload`, `get_build_status`, and `update_game`, `set_game_image`,
  `finalize_image_upload`, `rename_build`, which the skill offers only on request) act
  as the user, signed in with `codex mcp login yes2sdk` (the default) or with the
  optional API key, and are fronted by `yes2sdk-upload`. Without either they ask the
  user to sign in, so the presence check is a call to `list_games`, never a look at the
  variable. No skill may print, echo or `grep` the key, put it in a command, or ask the
  user to paste a key or token. `set_game_image` returns a `curl` PUT to a presigned URL
  with no credential in it; run it as returned, then call `finalize_image_upload`.
- `.mcp.json` sends the optional key with `"env_http_headers": { "X-Yes2-Api-Key":
  "YES2_API_KEY" }`; the server takes the bare key in that header. Codex documents
  `env_http_headers` only for `config.toml`, but accepts it in a plugin's MCP file
  (verified end to end on CLI 0.156.1) and skips the header when the variable is unset,
  so the docs tools still start without a key. Never use `bearer_token_env_var` here:
  an unset variable stops the server from starting at all. The validator rejects it,
  and CI checks the installed plugin still carries the header mapping.
- SDK naming taught to users: Defold `yes2sdk.*` (Lua), Unity `Yes2SDK.Yes2SDK.*` (C#),
  JS `Yes2SDK.*` on `window.Yes2SDK`, with the `@yes2games/js` package for helpers,
  types and the mock. On JS the SDK itself is never installed or bundled (the
  dashboard injects it), so never teach a step that adds it to the project.

## Keeping in step with the Claude Code plugin

The skill bodies are shared in substance with
[yes2sdk-claude-plugins](https://github.com/yes2games/yes2sdk-claude-plugins). A fix to a
procedure there usually needs the same fix here. The two plugins version independently.

## Writing style

No em or en dashes anywhere; the validator fails on them.

## Before committing

- `node scripts/validate-plugin.mjs` must pass.
- For manifest or marketplace changes, run the install test from the README against a
  throwaway `CODEX_HOME`.
- Version bumps touch `.codex-plugin/plugin.json` and `package.json`, plus a
  `CHANGELOG.md` entry.
