---
name: yes2sdk-install
description: Adds Yes2SDK to a Unity, Defold or JavaScript/TypeScript (Phaser, three.js, vanilla) project and confirms it resolves. Use before writing Yes2SDK code, when onboarding a project, or when a Yes2SDK reference will not compile.
---

# Installing Yes2SDK

Install comes before code. `Yes2SDK` (Unity) and the `yes2sdk` module (Defold) do not
resolve until the package is added, so code written first does not compile and the
failure reads as a coding error. On JavaScript/TypeScript the package is different in
kind, see the first precondition.

## Routing order

1. `yes2sdk:detect_sdk` reports the engine and the install state. This replaces
   asking the user which engine they are on, and replaces guessing from the file
   tree.
2. `yes2sdk:get_install_instructions` for that engine, when an install is still
   required. The steps it returns are version-pinned; use them as returned rather
   than a remembered install procedure.

## Preconditions

- **On a JS project, what installs is `@yes2games/js`, never the SDK.** That package
  carries the runtime helpers, the `window.Yes2SDK` types and a local-dev mock, with
  `/phaser` and `/three` helpers. The SDK itself (`window.Yes2SDK`) is never added to
  the project or bundled: the dashboard injects it into the uploaded build. So a
  report that `@yes2games/js` is missing is the install path, and a step that adds an
  SDK `<script>` tag or file is wrong. Take the steps from
  `yes2sdk:get_install_instructions` with engine `js`. Read the report, not just the
  `installed` line.
- `yes2sdk:detect_sdk` takes exactly one of two input modes, and the wrong one is
  the most common way this fails. This plugin registers the **hosted** server, which
  has no disk access. Read the engine-marker files locally and pass them inline as
  `files` (repo-relative path to contents). `projectPath` there returns an error
  result, not a thin answer; pass it only when the user runs the server on their own
  machine.
- **Unity needs two markers, not one:** `Packages/manifest.json` *and* a
  `ProjectSettings/` file (`ProjectSettings/ProjectVersion.txt` will do). With only
  one, detection returns `Engine: unknown` and every downstream step is wrong.
  Defold needs `game.project`. JS needs `package.json`, plus the Vite config
  (`vite.config.*`) when there is one; the server reads Phaser, three.js and Vite off
  them, so pass them as they are.
- Read those markers from the project ROOT. Detection keys off root-level files;
  markers picked up from a subfolder identify the wrong engine or none.
- The engine passed to `yes2sdk:get_install_instructions` comes from
  `yes2sdk:detect_sdk`. Do not pass an engine the user merely mentioned in passing.
- Yes2SDK targets HTML5/WebGL only. On a non-web target the modules are no-op
  stubs, so an install that looks fine still produces no platform behaviour.

## Failure modes worth naming

- Detection reporting an engine but no install is the normal state on a fresh
  project. Treat it as the install path, not an error.
- A project that already has a platform SDK (Poki, CrazyGames, and so on) wired
  directly is not "already integrated". Yes2SDK replaces those direct calls, and
  leaving both wired double-fires ad and lifecycle events. On JS, a Yes2SDK or
  platform SDK `<script>` tag already in `index.html` belongs to the same cleanup.
- After installing, re-run `yes2sdk:detect_sdk` before generating code. An install
  that needs an editor step (Unity package import plus its WebGL template, Defold
  library fetch) is not complete when the manifest edit lands; a JS install is not
  complete until the package manager has run.
