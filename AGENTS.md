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
