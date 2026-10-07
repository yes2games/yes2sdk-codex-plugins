---
name: yes2sdk-platform-rules
description: Cross-platform Yes2SDK rules; the yes2sdk MCP is source of truth. Use when integrating Yes2SDK or fixing compliance for Poki, CrazyGames, Yandex, GameDistribution, YouTube, Jest.
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

Jest is the outlier. It is mobile-first and earns from IAP and subscriptions only,
with no in-game ads. Ad calls stay safe and end in a no-fill, so keep rules 2 and 3
for the other platforms (Unity reports the no-fill through `onError` with no
`afterAd`, so resume there too), but no progression may depend on a rewarded ad.
Its own checks are a manual launch checklist that `yes2sdk:validate_integration`
does not grade: save guest progress before any login prompt; schedule a D1 to D7
notification sequence with images once the player registers; recover and complete
incomplete purchases at startup; never re-offer a subscription the player holds;
show `auth.showRegistrationPrompt` to guests only, with Automatic login reminders
(`jest.autoLoginReminders: false`) turned off so there is one prompt; save in the
`exitRequested` handler. Fetch the checklist with `yes2sdk:get_platform_requirements`
rather than working from this paragraph.

Jest needs Core 2.10.0, Unity 2.11.0 or Defold 1.8.0 or later (take the exact pins
from `yes2sdk:get_install_instructions`); the Construct addon does not support it
yet. The Yes2Games team builds the Jest zip once a publish request is approved, and
the studio uploads it in the Jest Developer Console.

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
