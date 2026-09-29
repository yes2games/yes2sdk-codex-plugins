---
name: yes2sdk-install
description: Adds Yes2SDK to a Unity, Defold or JS project and confirms it resolves. Use before writing Yes2SDK code, when setting up or onboarding a project, or when a Yes2SDK reference will not compile.
---

# Installing Yes2SDK

Install comes before code on Unity and Defold. `Yes2SDK` (Unity) and the `yes2sdk`
module (Defold) do not resolve until the package is added, so code written first
does not compile and the failure reads as a coding error. JS is different, see the
first precondition.

## Routing order

1. `yes2sdk:detect_sdk` reports the engine and the install state. This replaces
   asking the user which engine they are on, and replaces guessing from the file
   tree.
2. `yes2sdk:get_install_instructions` for that engine, when an install is still
   required. The steps it returns are version-pinned; use them as returned rather
   than a remembered install procedure.

## Preconditions

- **`installed: no` is a blocker on Unity and Defold only.** On a JS project it is
  the expected and permanent state: there is no dev-time package, because the web
  runtime is injected into the build by the dashboard at upload time. Blocking there
  blocks every JS project forever. Read the report, not just that line.
- `yes2sdk:detect_sdk` takes exactly one of two input modes, and the wrong one is
  the most common way this fails. This plugin registers the **hosted** server, which
  has no disk access. Read the engine-marker files locally and pass them inline as
  `files` (repo-relative path to contents). `projectPath` there returns an error
  result, not a thin answer; pass it only when the user runs the server on their own
  machine.
- **Unity needs two markers, not one:** `Packages/manifest.json` *and* a
  `ProjectSettings/` file (`ProjectSettings/ProjectVersion.txt` will do). With only
  one, detection returns `Engine: unknown` and every downstream step is wrong.
  Defold needs `game.project`; JS needs `package.json`.
- Read those markers from the project ROOT. Detection keys off root-level files;
  markers picked up from a subfolder identify the wrong engine or none.
- The engine passed to `yes2sdk:get_install_instructions` comes from
  `yes2sdk:detect_sdk`. Do not pass an engine the user merely mentioned in passing.
- Yes2SDK targets HTML5/WebGL only. On a non-web target the modules are no-op
  stubs, so an install that looks fine still produces no platform behaviour.

## Failure modes worth naming

- Detection reporting an engine but no install is the normal state on a fresh Unity
  or Defold project. Treat it as the install path, not an error.
- A project that already has a platform SDK (Poki, CrazyGames, and so on) wired
  directly is not "already integrated". Yes2SDK replaces those direct calls, and
  leaving both wired double-fires ad and lifecycle events.
- After installing, re-run `yes2sdk:detect_sdk` before generating code. An install
  that needs an editor step (Unity package import plus its WebGL template, Defold
  library fetch) is not complete when the manifest edit lands.
