---
name: yes2sdk-platform-rules
description: Cross-platform Yes2SDK rules; the yes2sdk MCP is source of truth. Use when integrating Yes2SDK or fixing compliance for Poki, CrazyGames, Yandex, GameDistribution, YouTube.
---

# Yes2SDK platform rules

Yes2SDK is one unified API across every supported platform. Write the integration
once and gate platform-specific features with `isSupported()` so unsupported
features no-op. Never call a platform SDK directly. Never invent SDK methods.

## Highest-leverage rules (apply everywhere)

1. `await initializeAsync()` before any other SDK call. Call `startGameAsync()`
   only when the game is loaded and interactable, never during loading.
2. Call `game.gameplayStop()` BEFORE every interstitial; `game.gameplayStart()` to
   resume after.
3. Pause/mute in `beforeAd`, restore in `afterAd`. Grant rewarded-ad rewards in
   `adViewed` only, never `afterAd` (it fires even on dismissal).
4. No external `<script src="http...">`. All platforms sandbox or strip them.
5. Guard optional modules (`auth`, `banners`, `friends`) with `isSupported()`.

## This is a summary, not the source of truth

Per-platform rules diverge (Poki's 30s/60s ad timing, CrazyGames' 3-minute floor
and wrapper options, Yandex pause/resume and locale, GameDistribution's `gameId` and
event flow, YouTube's cert-mandatory pause/audio handling). These change. Do not
rely on this list for compliance decisions.

For the authoritative, current rule set, call the **yes2sdk MCP**:

- `yes2sdk:get_platform_requirements` (platform) returns the full rule list with
  severities.
- `yes2sdk:validate_integration` (platform, plus the build inline and/or an
  Inspector `eventLogJson`) runs the actual checks and surfaces FAILs. The
  `$yes2sdk-verify` skill holds the calling procedure; use it rather than guessing
  which build parameters the connected server can read.
- `yes2sdk:get_quickstart` (platform) and `yes2sdk:get_api_reference` (module) give
  exact call sequences and method signatures.

When in doubt, fetch from the MCP rather than guessing.
