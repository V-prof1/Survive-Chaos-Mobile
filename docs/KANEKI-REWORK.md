# Kaneki Mobile rework

Only V-prof1/Survive-Chaos-Mobile is modified. The read-only browser source is pinned to 17adf0a8c3422200fcd6021d39a14689b35ae2b2 so the tested base and APK base match.

## Proportions and rendering

Inspected SPR.hero and original Classic, Ninja, Knight, Samurai and Reaper sheets. Original cells are 96x96; foot anchor is (48,87); scale is r*4.2/96 and local foot position is r*.9. Classic idle_down opaque bounds are (21,9)-(78,90), Ninja (21,12)-(78,90). Kaneki uses the same cell, anchor, scale, down/up/side direction selection, side mirroring and 12fps walking cadence. His native 32px logical body uses a 3px grid, narrow profile torso, fixed feet, black coat, gloves, boots, layered silver hair, a shadowed normal eye, black sclera/crimson iris and a black metal-tooth mask. The cut-in reuses this exact atlas, including two finger-crack hand poses.

Four permanent Rinkaku ribbons originate at the waist/back, with tapered polygon silhouettes, uneven muscle plates, dark internal shading and restrained highlights. Movement direction bends them behind the body. Shot recoil, rifle reach, shotgun spread and crossbow compression alter existing ribbons. Staff gets three visual organic orbitals. Only the ULT grows extra temporary extensions.

## Weapon visuals (mechanics unchanged)

| Weapon | Visual |
|---|---|
| Pistol | Short crimson thorn + thin trail, one quick arm strike |
| Shotgun | Multiple asymmetric organic blade fragments + fan of arms |
| Rifle | Long narrow needle + forward lance reach |
| Crossbow | Thick layered compressed spine, visible charge contraction/release |
| Staff | Tumbling flesh fragments, three organic orbitals; upgrade orbitals use the same fragments |

Player projectile objects retain damage, crit, speed, lifetime, piercing, bounce and upgrade fields. Only a visual `kg` weapon tag is added on creation; enemies retain their normal bullets. No ordinary weapon sprite is drawn for Kaneki. Non-Kaneki rendering delegates to the original renderer.

## Ultimate

A simulation-driven timeline spends the existing shared ULT meter once, slows the world, darkens the view, ducks sound, presents a same-proportion finger-crack cut-in and ignites Kakugan. Horizontal, diagonal and multidirectional ribbons then hit along their visible sampled geometry, at most once per enemy per wave. The last burst uses eight organic ribbons and restores 12% maximum HP. Large Kagune remains for about one second, then retracts. Pausing freezes the sequence; death, a new run or changing away from Kaneki cancels it. No delayed damage timers cross into a new run.

Geometry uses five reusable Float32Array buffers of 17 samples, a bounded cached body atlas, one reusable cut-in Canvas, and trails drawn directly without particle objects or new gameplay DOM. The old overlaid Kaneki implementation and unused GIF cut-in have been replaced.

## Save and Android compatibility

Existing Kaneki index remains 21, price stays 5,000,000, original shop purchase logic and `nsf` save key/schema remain. No migration or reset. appId stays `com.survivechaos.game`, androidScheme stays https. Android versionCode increases with the existing workflow run number.

The build must restore the existing Beta signing key. It refuses to generate a replacement key. Both key and final APK certificate must match SHA-256:
`bc1cbe0c095a9a929e611426860f921c0fff588b4f5924c93052cec2d72cf11b`
This matches successful preceding Mobile build 45. The APK application ID is checked with aapt.

## ADM

Custom integer input with six presets (1K, 10K, 100K, 1M, 5M, 10M). Rejects blanks, negatives, decimals, exponent notation, NaN, Infinity, malformed text, unsafe integers and balance overflow. Grants 8,735,421 exactly. Limit is Number.MAX_SAFE_INTEGER, including the resulting balance.

## Verification

`node tests/kaneki.spec.cjs` serves assembled www and runs Chromium regressions. `CHROMIUM_PATH` can select an installed browser. CI also runs this before Android compilation and publishes QA images/results.

Checks: existing ownership; one-time purchase; original metadata; persisted save after reload; all five weapons compared field-for-field with normal skin; arbitrary ADM amounts and malformed/overflow inputs; movement and dash; ULT cost, four damage waves, pause-safe age, 12% healing, retraction and new-run cancellation; portrait 390x844 and landscape 844x390; no horizontal page overflow; no page JavaScript errors; 1200 enemies + 250 projectiles without DOM growth. All assembled JS files pass node --check.

Local software-rendered Chromium stress median: about 25ms per full draw over 25 frames, with 893 DOM elements before/after and 30 cached body frames. This is desktop headless evidence, not measured Android-device FPS. APK overwrite installation on a physical user's phone is not simulated by these browser tests; compatibility is checked through package ID, version and certificate.

Changed implementation: mobile-kaneki.js (registration/shop), mobile-kaneki-v2.js (renderer/combat presentation/ULT), mobile-kaneki-v2.css (store styling), mobile-admin-plus.js (safe grants), apply-mobile-patches.js (strict Mobile-only renderer hooks), package.json (test runner), tests/kaneki.spec.cjs (regressions) and build-apk.yml (tests, fixed source, certificate guards).
