---
name: yes2sdk-upload
description: Uploads a built Yes2SDK game to the Yes2 dashboard as the signed-in user (or with their own API key) and returns its Inspector link. Use when the user asks to upload or push a build to the dashboard.
---

# Uploading a build to the Yes2 dashboard

This is the single source of the upload procedure. It puts a build on the dashboard
so the studio can open it in the Inspector. It does **not** publish to any platform:
publishing stays an admin action on the dashboard (the studio requests it there, and
a Yes2Games admin reviews and publishes). Say so in the final report.

The plugin wraps the `yes2sdk` MCP, which does the real work. The dashboard tools act
as the user, in one of two ways:

- **Sign-in (the default).** The user runs `codex mcp login yes2sdk` once in a
  terminal and approves in the browser; Codex then sends the resulting token itself.
- **An API key (optional, for CI and headless use).** If `YES2_API_KEY` is set, the
  plugin's `.mcp.json` sends it as the `X-Yes2-Api-Key` header through
  `env_http_headers`; unset, Codex leaves the header out.

The hosted server never reads the zip or the image: `yes2sdk:prepare_upload` and
`yes2sdk:set_game_image` hand back a `curl` command that sends the file from the
user's machine straight to storage.

## Credentials are never yours to handle

- Sign-in happens in the user's browser. Never ask for a password, a code or a token,
  and never try to complete the sign-in yourself. `codex mcp login` is for the user to
  run in their own terminal.
- Never print, echo, `cat`, `grep` or `env`-dump `YES2_API_KEY`, and never put it in
  a command, a file or a commit. Nothing in this procedure needs its value: Codex
  sends it.
- Never ask the user to paste a key or token into the chat. If they do anyway, do not
  repeat it, and suggest they revoke it (a key on the dashboard's **Personal API keys**,
  a sign-in under **Settings > Connected apps**), since the chat is kept.
- The only presence check is step 1: call `yes2sdk:list_games` and read the answer.

## Procedure

1. **Check the sign-in.** Call `yes2sdk:list_games`.
   - **Sign-in required.** If the call fails because the `yes2sdk` server needs the
     user to sign in (an unauthorized error, or an answer naming
     `codex mcp login yes2sdk`), or it answers with setup steps, stop and tell the
     user: run `codex mcp login yes2sdk` in a terminal and approve in the browser
     that opens. The approval page shows the account Codex will act as: their studio,
     or their personal games on a preview account. Then wait for them and call
     `yes2sdk:list_games` again. Only the dashboard tools need this; the docs and
     validation tools keep working.
   - **`INVALID_API_KEY` or a sign-in that stopped working.** If they use a key, it
     was revoked or mistyped: create a new one. If they signed in, the connection was
     revoked or expired, or their seat changed: run `codex mcp login yes2sdk` again.
   - **`INSUFFICIENT_SCOPE`.** The credential lacks a permission this procedure
     needs. Ask them to sign in again with `codex mcp login yes2sdk` and approve every
     permission, or to use a key with all scopes.
   - **No browser (CI, a remote shell).** Offer the key instead:
     - Create a key on the dashboard: a personal key under avatar, **Settings >
       Personal API keys**, or a team key from the **Team** page. Copy it.
     - Add `export YES2_API_KEY=y2g_...` to their shell profile (`~/.zshrc`,
       `~/.bashrc`), never to a file in the project and never to a commit.
     - Open a new terminal and restart Codex from it. Nothing else is needed: the
       plugin already sends the variable, and no `config.toml` entry is required.
     - If they replaced the plugin's server with their own `[mcp_servers.yes2sdk]`
       entry in `~/.codex/config.toml` (a local server, for example), that entry needs
       `env_http_headers = { "X-Yes2-Api-Key" = "YES2_API_KEY" }` too.
2. **Pick the game.** Show the games `yes2sdk:list_games` returned and ask which one
   this build belongs to. If it is not there, offer `yes2sdk:create_game` with the
   name the user gives; `vanilla` is the engine for any JavaScript/TypeScript game
   (plain JS, Phaser, three.js). `create_game` makes a new game every call, so never
   call it for a game already listed. Keep the `gameId`. A preview account (no studio
   yet) works with its personal games: `game_limit_reached` means it already has the
   most games it may (3 by default) until the account is verified, so offer to upload
   to one of the listed games instead.
3. **Get the build folder.** The user may have given a path; it must be the folder
   that holds the built `index.html`.
   - JavaScript/TypeScript (Vite): run `npm run build` and use the output folder,
     `dist/` unless the config says otherwise. Never upload the source tree.
   - Unity or Defold: ask the user for the WebGL / HTML5 output folder they built from
     the editor. Do not try to drive the editor build yourself.
   - Confirm `index.html` is directly inside the folder, not in a subfolder.
4. **Offer a compliance check first (optional).** Ask whether to check the build
   before uploading. If yes, run `$yes2sdk-verify` on the same folder; it owns how a
   build reaches `yes2sdk:validate_integration` on the hosted server. Blocking FAILs do
   not stop an upload, but tell the user they will block a platform review.
5. **Zip it with `index.html` at the zip root.** Zip the folder's contents, not the
   folder, and write the zip outside it. Remove an old zip at that path first, or
   `zip` updates it in place and keeps files the new build dropped:
   `cd dist && rm -f ../build.zip && zip -r ../build.zip . -x '.DS_Store' '__MACOSX/*'`.
   Check the root with `unzip -l ../build.zip`: `index.html` must be listed with no
   folder in front of it. The zip is a build artefact; do not commit it.
6. **Measure it.** The size must be the zip's exact byte count:
   `stat -f%z build.zip` on macOS, `stat -c%s build.zip` on Linux.
7. **Pick the version.** Default to `version` in `package.json`, else the latest git
   tag (`git describe --tags --abbrev=0`). If neither exists or it is unclear, ask.
   Then confirm the game, version and zip with the user before going on, because the
   next call reserves that version.
8. **Prepare.** Call `yes2sdk:prepare_upload` with `gameId`, `version`, `size`, the
   zip's absolute path as `zipPath`, and `notes` if the user gave release notes.
   `VERSION_EXISTS` means the game already has that version: propose the next one
   (bump the last number) and ask before retrying. `build_limit_reached` means a
   preview account's game already holds its builds (1 by default) until the account
   is verified: say so and stop. Pass every other error through as returned.
9. **Upload.** Run the `curl` command it returned **exactly as given**: do not edit
   it, add headers or change the URL. An empty response means the zip landed. An XML
   error body means it did not, usually a size mismatch or an expired URL: re-measure
   and prepare again.
10. **Finalize.** Call `yes2sdk:finalize_upload` with `gameId` and `uploadId`.
11. **Wait for the result.** Call `yes2sdk:get_build_status` with `gameId` and
    `uploadId` about every 5 seconds until the status is `ready` or `failed`. Keep
    going while it says `processing`; a large build can take a couple of minutes
    before it reports `failed`. On `SDK_NOT_INTEGRATED`, uploading the same zip again
    fails the same way, so offer `$yes2sdk-verify` to find what is missing.
12. **Report.** On `ready`: the game, version and build id, the `inspectorUrl` as a
    link the user can open to play and QA the build, and every `uploadWarnings` and
    `bundleErrors` entry as returned. Warnings do not block the build but may block a
    platform review. End with the reminder that the build is on the dashboard only;
    publishing to platforms is requested on the dashboard and done by an admin.

## After the build is ready (only when the user asks)

Do not call these unprompted; mention them once at most, after the report.

- `yes2sdk:rename_build` with `gameId`, `buildId` and `name` gives the build a display
  name; `null` clears it back to the zip file name.
- `yes2sdk:update_game` with `gameId` and only the fields the user wants changed
  (name, description, engine, category, tags, orientation and the like) edits the game
  profile.
- Setting an icon or banner takes three steps:
  1. Measure the image (`stat -f%z` on macOS, `stat -c%s` on Linux). It must be PNG,
     JPEG or WebP, at most 15 MB.
  2. `yes2sdk:set_game_image` with `gameId`, `kind` (`icon` or `banner`), `size` and
     the image's absolute path as `imagePath` returns an `uploadId` and a `curl` PUT.
     Run it **exactly as given**: it carries no credential, and the image goes from
     the user's machine straight to storage. An XML error body means it did not land
     (usually a size or type mismatch, or an expired URL): call `set_game_image`
     again.
  3. `yes2sdk:finalize_image_upload` with `gameId` and `uploadId` makes it the icon or
     banner. Calling it again is safe; `UPLOAD_NOT_RECEIVED` means the PUT has not
     finished.

  `set_game_image` with `remove: true` deletes the image instead, so confirm with the
  user first.
