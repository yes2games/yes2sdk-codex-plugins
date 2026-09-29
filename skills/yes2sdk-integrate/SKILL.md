---
name: yes2sdk-integrate
description: Scaffolds a Yes2SDK integration into the current project. Detects the engine, checks the install, then writes the init and ad loop with isSupported() guards.
---

# Scaffolding a Yes2SDK integration

Yes2SDK is one unified API that runs on every supported platform (poki,
crazygames, yandex, gamedistribution, youtube). Write the integration once and guard
platform-specific features with `isSupported()` so unsupported features no-op
instead of breaking.

Target platform: the one the user named. Default to `poki` when none was named.

## Steps

1. Establish the engine and the install state by following the `$yes2sdk-install`
   skill, which holds the detection procedure and its preconditions. Do not ask the
   user which engine they are on. Ask only if detection cannot determine one:
   Defold (Lua, `yes2sdk.*`), Unity (C#, `Yes2SDK.Yes2SDK.*`), or plain TS/JS
   (`Yes2SDK.*`). Use the matching naming convention in all generated code.
2. **Stop here when the engine is `unity` or `defold` and the SDK is not
   installed.** Generated code would reference a namespace or module that does not
   resolve, so it cannot compile. Surface the install steps and write NO code
   referencing `Yes2SDK`, the `yes2sdk` module or `window.Yes2SDK`. Say the install
   is the blocker and offer to continue after it.

   Do not stop on a `js` project. There `installed: no` is expected and permanent:
   the web runtime is injected into the build at upload time, and its report lists
   steps that are the build-and-upload flow, not a package to add. Generate the
   code.
3. Call `yes2sdk:get_quickstart` for the target platform.
4. Call `yes2sdk:get_api_reference` for the `ads` and `lifecycle` modules to get
   exact method signatures.
5. Generate the integration following the mandatory loop, in this order:
   - `initializeAsync()`: await it before any other SDK call.
   - `startGameAsync()`: call only when the game is loaded and interactable,
     never during a loading screen.
   - `game.gameplayStart()` when play begins.
   - `game.gameplayStop()` BEFORE showing any ad.
   - `ads.showInterstitial(...)` (or rewarded): pause/mute in `beforeAd`, restore
     in `afterAd`; for rewarded, grant the reward only in `adViewed`.
   - `game.gameplayStart()` to resume after the ad.
   - Wrap every optional-feature call (`auth`, `banners`, `friends`, and so on) in
     its `isSupported()` guard.
6. After writing the code, if the user has a built and extracted WebGL build,
   follow the `$yes2sdk-verify` skill for the target platform and report any
   FAILs and WARNs with fix hints. Otherwise say that verification runs once there
   is a build.

Do not call any platform SDK directly and do not invent SDK methods. Use only what
the quickstart and API reference document.
