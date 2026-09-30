# Plugin directory submission

What to paste into the ChatGPT/Codex plugin submission portal. Every test case below
was run live in Codex (CLI 0.156.1, plugin installed from GitHub `main`) on 2026-09-30,
and "Tools triggered" is what that run actually called. None needs a file attachment,
so a reviewer can run them as written.

Re-run all eight after any skill or MCP change, and update this file with what they
actually did.

## Listing fields

| Field | Value |
|---|---|
| Name | Yes2SDK |
| Website | https://developer.yes2games.com |
| Support | https://developer.yes2games.com (email: developer.support@yes2games.com) |
| Privacy policy | https://developer.yes2games.com/privacy-policy |
| Terms of service | https://developer.yes2games.com/terms |
| MCP server | https://mcp.yes2games.com/mcp (all 11 tools carry `readOnlyHint: true`, `destructiveHint: false`, `openWorldHint: false`) |
| Logo and icon | `assets/logo.png` (512x512 PNG) |
| Starter prompts | the three in `.codex-plugin/plugin.json` `interface.defaultPrompt` |

### Tool hint justifications

Every tool returns docs, rules or validation results computed from the request. None
writes anything, changes state on the server or elsewhere, or reaches out to third-party
systems on the user's behalf, so all are read-only, non-destructive and closed-world.
The hosted server has no disk access; `detect_sdk` and `validate_integration` read only
the file contents passed inline in the request.

## Positive test cases

### 1. Platform certification requirements

- **Description:** Lists what a Yes2SDK game must do to pass YouTube Playables certification.
- **Prompt:** `What does my HTML5 game need to pass YouTube Playables certification when using Yes2SDK?`
- **Tools triggered:** `get_platform_requirements`, `get_quickstart`
- **Expected behavior:** A requirements list that includes: await `initializeAsync()`
  before other SDK calls; call `startGameAsync()` only once the game is interactive;
  pause the game loop, audio and network on `pause`; honor `session.isAudioEnabled()` and
  `audioEnabledChange`; no external scripts; cloud saves under 3 MiB; rewards only in
  `adViewed`.

### 2. Diagnose a missing rewarded-ad reward

- **Description:** Diagnoses a rewarded ad that plays but never grants the reward.
- **Prompt:** `My rewarded ad plays on Poki through Yes2SDK, but the player never gets the reward. Why, and how do I fix it?`
- **Tools triggered:** `troubleshoot`, `get_compliance_rule`, `get_api_reference`
- **Expected behavior:** Identifies granting the reward in `afterAd` or after an async
  step instead of in `adViewed`, cites rule `U-007`, shows the correct callback for
  JavaScript, Unity and Defold, and says not to grant on dismissal, no-fill or error.

### 3. Feature support across platforms

- **Description:** Answers whether leaderboards and banner ads are available on CrazyGames and Yandex Games.
- **Prompt:** `With Yes2SDK, can I use leaderboards and banner ads on CrazyGames and Yandex Games?`
- **Tools triggered:** `get_platform_capabilities`, `get_api_reference`
- **Expected behavior:** A table showing banners supported on both platforms and
  leaderboards supported on Yandex Games only, advice to guard calls with
  `isSupported()`, and per-platform banner differences.

### 4. Install the SDK in a Defold project

- **Description:** Gives version-pinned Yes2SDK install steps for Defold.
- **Prompt:** `How do I install Yes2SDK in a Defold project?`
- **Tools triggered:** `get_install_instructions`
- **Expected behavior:** Steps to add the pinned `yes2sdk-defold` release zip as a
  `dependencies#0` entry in `game.project`, run Project, Fetch Libraries, verify that
  `require "yes2sdk.yes2sdk"` resolves, and note that SDK features only work in an HTML5
  bundle.

### 5. Validate a build page for Poki

- **Description:** Checks an index.html against Poki's rules and flags an external script.
- **Prompt:** `Check this index.html for Poki with Yes2SDK: <!doctype html><html><head><script src="https://cdn.example.com/analytics.js"></script></head><body><canvas id="game" width="800" height="600"></canvas><script src="game.js"></script></body></html>`
- **Tools triggered:** `validate_integration`, `get_platform_requirements`
- **Expected behavior:** Reports one blocking FAIL, `static:external-scripts` (P-007),
  for the external CDN script with a fix hint to bundle it locally; warnings for the
  non-responsive canvas and the missing `index.json`; and states that runtime checks did
  not run because no Inspector event log was provided.

## Negative test cases

### 1. Unrelated coding task

- **Description:** A general programming request with no game or SDK context.
- **Prompt:** `Write a Python function that reverses a singly linked list.`
- **Why the plugin should not act:** Nothing here involves HTML5 games or Yes2SDK. Codex
  answers directly and calls no Yes2SDK tools.

### 2. Native mobile ads

- **Description:** An ad integration request for a native Android app.
- **Prompt:** `Add AdMob rewarded ads to my native Android app written in Kotlin.`
- **Why the plugin should not act:** Yes2SDK targets HTML5 and WebGL games on web game
  platforms only. Native Android and AdMob are out of scope, so no Yes2SDK tools are
  called.

### 3. App store submission

- **Description:** A question about publishing a Unity game to the Apple App Store.
- **Prompt:** `What are the steps to submit my Unity game to the Apple App Store?`
- **Why the plugin should not act:** The App Store is a native mobile store, not one of
  Yes2SDK's web platforms (Poki, CrazyGames, Yandex Games, GameDistribution, YouTube
  Playables). The prompt mentions Unity, which Yes2SDK supports, and the plugin still
  correctly stays out.

## Release notes

> First release. Registers the hosted Yes2SDK MCP server and adds six skills for Codex:
> install the SDK, scaffold the unified init and ad loop, verify a WebGL build against
> every supported web game platform, diagnose integration failures, cross-platform
> rules, and docs search.

## Demo video

If the portal requires one, record the five positive prompts above in order in Codex.
A plain 2 to 3 minute screen recording, unlisted on YouTube or Loom, is enough.
