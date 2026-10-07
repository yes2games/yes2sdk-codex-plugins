---
name: yes2sdk-verify
description: Validates a Yes2SDK WebGL build against one platform or all of them (Poki, CrazyGames, Yandex, GameDistribution, YouTube, Jest). Use before an upload, or when asked whether a build would be rejected.
---

# Verifying a Yes2SDK build

This is the single source of the verify procedure. Single-platform checks,
all-platform sweeps and the check at the end of `$yes2sdk-integrate` all run it.
Edit the procedure here, not in the skills that call it.

## Inputs

- **Platform**: one of `poki`, `crazygames`, `yandex`, `gamedistribution`,
  `youtube`, `jest`, or `all`. Take it from the request ("verify for Poki", "check every
  platform"). When the request names none, use `all`.
- **Build**: the user's **extracted** WebGL build folder. If the request gives no
  path, ask once, then reuse the same build for every platform in this run.
- **Event log** (optional): an exported Inspector event log.

## Procedure

1. Read the build once. The plugin registers the **hosted** server, and it has no
   disk access, so `buildPath` there comes back as a blocking `build-path` FAIL.
   Read the build locally and pass it inline as `indexHtml`, `fileList` and
   `jsContents`. `jsContents` is what makes the Yes2SDK-bundling check possible;
   without it that check cannot run. Pass `buildPath` only when the user has the
   server running on their own machine.
2. An Inspector event log may be passed as `eventLogJson`, in addition to or
   instead of the build. The static checks need the build; the behavioral rules
   (gameplayStop before ads, reward only on `adViewed`, no ads in the first 30s)
   exist only in the event log and cannot be derived from files. With only one of
   the two, state plainly which checks did not run.
3. Call `yes2sdk:validate_integration` once per platform being verified, reusing
   the same inline build.
4. For any FAIL whose fix is not obvious from its hint, call
   `yes2sdk:get_compliance_rule` with the rule id before reporting.
5. Some platforms are graded partly by hand. For Jest, `yes2sdk:validate_integration`
   runs only the universal rules, and the platform's own requirements are a manual
   launch checklist. Call `yes2sdk:get_platform_requirements` for that platform and
   list each manual item as not checked. A clean automated run there is never a pass.
6. Report as below.
7. Never soften or reinterpret a FAIL, and never mark one resolved by reasoning.
   The rule set is the platform's, not this plugin's; if a finding looks wrong,
   report it as returned and say so.

## Report

**One platform:** blocking FAILs first, then WARNs, each with its rule id and the
fix hint carried on the finding.

**All platforms:** triage by cause, not by platform. One missing `gameplayStop()`
fails many platforms and is one fix, not one finding each.

1. A one-line verdict: which platforms this build can ship to as-is.
2. A table: `platform | blocking FAILs | WARNs`.
3. The fix list in this order, each with the rule id and the file it applies to
   when you can identify it:
   - **Blocks everywhere**: a FAIL that appears on 3 or more platforms. Fix first;
     it is usually a universal (`U-`) rule.
   - **Blocks one platform**: per-platform FAILs, grouped under that platform.
   - **Warnings**: after the FAILs, briefly.
4. Any checks that could not run, and why. A sweep with no event log did not run
   the behavioral rules at all, and reporting that as a clean pass is the worst
   failure this skill can have. The same goes for a platform whose requirements
   include manual checks (Jest today): list those as not checked, never as passed.

## What each platform usually rejects on

Use these only to explain a finding in the user's terms. They are a summary, not
the rule set; `yes2sdk:validate_integration` is authoritative.

| Platform | Usual causes of rejection |
| --- | --- |
| `poki` | `gameplayStop()` missing before an interstitial; ads in the first 30s; interstitials more often than 1/60s; ads during loading; rewards granted in `afterAd` instead of `adViewed`; external `<script src="http...">`; non-responsive canvas. |
| `crazygames` | Missing wrapper options on init; loading not reported (`setLoadingProgress` / `startGameAsync`); gameplay not bracketed with `gameplayStart()`/`gameplayStop()`; audio not muted during ads; interstitials under the 3-minute floor; an `'unfilled'`/`'adblock'` ad error treated as a dismissal. |
| `yandex` | `startGameAsync()` missing, so the loading screen never dismisses; pause/resume not handled, so audio keeps playing during ads; `gameplayStop()` missing before ads; locale not read from `session.getLocale()`. |
| `gamedistribution` | `gameId` not set before the SDK loads; mute/pause not wired to `beforeAd`/`afterAd`; rewards granted in `afterAd` instead of `adViewed`; external scripts beyond GD's own SDK. |
| `youtube` | Strictest, and the checks are cert-mandatory: `startGameAsync()` not gating `gameReady()` (called during loading); `pause` not stopping game loop, audio and network; audio state not honored (`session.isAudioEnabled()` + `audioEnabledChange`); external scripts (CSP sandbox); cloud saves over the 3 MiB cap. |
| `jest` | Mobile-first, paid by IAP and subscriptions only, with no in-game ads: progression gated on a rewarded ad; guest progress not saved before a login prompt; no D1 to D7 notification sequence with images for registered players; incomplete purchases not recovered at startup; a subscription the player already holds offered again; two login prompts (Automatic login reminders, `jest.autoLoginReminders`, left on next to the game's own `auth.showRegistrationPrompt`); nothing saved in `exitRequested`; root-absolute asset paths. |
