# Licenses and sound sources

Soundboard ships only audio we made, audio the person records on their own device, or audio saved from the Internet Archive after the app has checked a clear license. Anything with unclear rights is not bundled and is not offered for save.

## App code

The application source is under the MIT license in `LICENSE`. Copyright (c) 2026 Workinmanstrokesinc.

## Starter pack (bundled)

The 16 starter sounds in `www/audio/` are original synthesis. `scripts/generate-starter-pack.mjs` generates the WAV files. No third-party samples, recordings, or sound libraries are used. They are part of this app and covered by the MIT license above.

Labels such as “airhorn” and “rimshot” describe the effect. They are not recordings of a commercial sample pack. The coin chime is an original two-note figure (D6 then A6), not a quotation of a game sound.

## Icons and interface

`www/icon.svg`, the PNG icons, and the pad glyphs in `www/lib/marks.js` are original artwork for this app. No stock illustration packs and no third-party logos.

## Outfit typeface

The interface uses Outfit, copyright 2021 The Outfit Project Authors (https://github.com/Outfitio/Outfit-Fonts), under the SIL Open Font License 1.1. The license text is in `www/fonts/OFL.txt`. The font files are the latin woff2 cuts from the Fontsource distribution of Outfit 5.2.8.

## Microphone recordings

A recording made in the app belongs to the person who recorded it. It is stored only in the app’s private on-device storage (IndexedDB). The app does not upload it. See `docs/privacy/soundboard.html`.

## Internet Archive search (not bundled)

Search is optional. The app queries `archive.org` and then drops any item whose license is missing, unknown, non-commercial, or no-derivatives.

Allowed, and only when `licenseurl` or the Archive rights field says so:

- CC0 1.0 (`creativecommons.org/publicdomain/zero`)
- Public Domain Mark (`creativecommons.org/publicdomain/mark`)
- Legacy public-domain tag (`creativecommons.org/licenses/publicdomain`)
- CC BY (`creativecommons.org/licenses/by/`, and not BY-NC or BY-ND)
- CC BY-SA (`creativecommons.org/licenses/by-sa/`)
- Rights text exactly “public domain” or “no known copyright restrictions” when no conflicting license URL is present

A saved clip is copied onto the device. The pad stores the license name, license URL, creator, and an attribution line, and More lists those attributions. CC BY and CC BY-SA still require that attribution to stay with the sound.

Files longer than 12 seconds or larger than 2.5 MB are not saved. Nothing from the Internet Archive is committed in this repository.
