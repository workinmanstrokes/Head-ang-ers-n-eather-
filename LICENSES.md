# Licenses and sound sources

Laugh Pad ships only audio we made, audio the person records on their own device, or audio saved from the Internet Archive after the app has checked a clear license. Anything with unclear rights is not bundled and is not offered for save.

## App code

The application source is under the MIT license in `LICENSE`. Copyright (c) 2026 Workinmanstrokesinc.

## Starter pack (bundled)

The 32 starter sounds in `www/audio/` are real recordings from Wikimedia Commons and SoundBible, converted to WAV 44.1 kHz / 16-bit / mono, silence-trimmed and peak-normalized to about -3 dBFS (first 16 to -3.0 dBFS, second 16 to -3.1 dBFS). The first 16 replaced synthesized placeholders on 2026-11-19; the second 16 were added on 2026-11-20. The per-sound source and license are also in `www/data/starter-pack.json`, and the app shows them on each pad's detail view.

| Sound | Source | License |
|---|---|---|
| airhorn | SoundBible — "Air Horn" by Mike Koenig | CC BY 3.0 |
| applause | Wikimedia Commons — "277021 sandermotions applause-2.wav" | CC0 1.0 |
| boing | Wikimedia Commons — "Boing raw.ogg" | CC BY 4.0 |
| buzzer | SoundBible — "Buzzer" by cognito | CC Sampling Plus 1.0 |
| coin | Wikimedia Commons — "Coin dropped on wooden floor.ogg" | Public domain |
| crickets | Wikimedia Commons — "Cricket Gryllus bimaculatus Chirps.oga" | CC BY-SA 4.0 |
| ding | SoundBible — "Temple Bell" by Mike Koenig | CC BY 3.0 |
| drum-roll | Wikimedia Commons — "Drum Roll Intro.ogg" | CC0 1.0 |
| fart | Wikimedia Commons — "Human fart.wav" | CC BY-SA 4.0 |
| laser | SoundBible — "Laser" by Mike Koenig | CC BY 3.0 |
| moo | SoundBible — "Cow Moo" by Mike Koenig | CC BY 3.0 |
| quack | Wikimedia Commons — "Pekin duck & mallard.ogg" | CC BY-SA 4.0 |
| rimshot | SoundBible — "Joke Sting" | Personal Use Only (SoundBible) |
| sad-trombone | SoundBible — "Sad Trombone" by Joe Lamb | CC BY 3.0 |
| tada | SoundBible — "Ta Da" by Mike Koenig | CC BY 3.0 |
| whistle | SoundBible — "Whistling" by Mike Koenig | CC BY 3.0 |
| vine-boom | SoundBible — "Explosion Ultra Bass" by Mark DiAngelo | CC BY 3.0 |
| cash-register | SoundBible — "Cha Ching Register" by Muska666 | CC BY 3.0 |
| doorbell | Wikimedia Commons — "Sound Effect - Door Bell" by Amada44 | CC0 1.0 |
| siren | Wikimedia Commons — "Air Raid Siren" by MrSpode42 | CC BY-SA 4.0 |
| explosion | Wikimedia Commons — "Explosion-LS100155" by Fg2 | Public domain |
| goat | SoundBible — "Bleat" by Mike Koenig | CC BY 3.0 |
| rooster | Wikimedia Commons — "Young rooster crowing" by Filo gèn' | CC BY-SA 4.0 |
| wolf-howl | Wikimedia Commons — "Wolf howls" | Public domain |
| glass-break | Wikimedia Commons — "Glass breaking (Gravity Sound)" by Gravity Sound | CC BY 4.0 |
| thunder | SoundBible — "Thunder" by Mike Koenig | CC BY 3.0 |
| burp | Wikimedia Commons — "Burp" by Ezwa | Public domain |
| party-horn | SoundBible — "Party Horn" by Mike Koenig | CC BY 3.0 |
| alarm-clock | SoundBible — "Annoying Alarm Clock" by UncleKornicob | Public Domain |
| dog-bark | SoundBible — "Small Dog Barking" by Daniel Simion | CC BY 3.0 |
| sneeze | SoundBible — "Sneeze" by Mike Koenig | CC BY 3.0 |
| dramatic-sting | SoundBible — "Dun Dun Dun" by Delsym | CC BY 3.0 |

Two sounds carry tighter terms than the rest: buzzer (CC Sampling Plus 1.0, noncommercial) and rimshot (SoundBible Personal Use Only). Freer-licensed alternates exist on Wikimedia Commons and can be swapped in later if wanted: "Buzzer.wav" (CC0) and "Rimshot loop 108bpm.ogg" (CC BY-SA 4.0).

Labels such as "airhorn" and "rimshot" describe the effect. The coin chime is a real coin dropped on a wooden floor, not a quotation of a game sound. "Vine Boom" is a deep bass explosion recording, used as the meme's boom sound.

`scripts/generate-starter-pack.mjs` generated the original synthesized WAV files. Those files have been replaced by the recordings above; the script is kept for reference and is not used for the bundled sounds anymore.

## Icons and interface

`www/icon.svg`, the PNG icons, and the pad glyphs in `www/lib/marks.js` are original artwork for this app. No stock illustration packs and no third-party logos.

## Outfit typeface

The interface uses Outfit, copyright 2021 The Outfit Project Authors (https://github.com/Outfitio/Outfit-Fonts), under the SIL Open Font License 1.1. The license text is in `www/fonts/OFL.txt`. The font files are the latin woff2 cuts from the Fontsource distribution of Outfit 5.2.8.

## Microphone recordings

A recording made in the app belongs to the person who recorded it. It is stored only in the app's private on-device storage (IndexedDB). The app does not upload it. See `docs/privacy/soundboard.html`.

## Internet Archive search (not bundled)

Search is optional. The app queries `archive.org` and then drops any item whose license is missing, unknown, non-commercial, or no-derivatives.

Allowed, and only when `licenseurl` or the Archive rights field says so:

- CC0 1.0 (`creativecommons.org/publicdomain/zero`)
- Public Domain Mark (`creativecommons.org/publicdomain/mark`)
- Legacy public-domain tag (`creativecommons.org/licenses/publicdomain`)
- CC BY (`creativecommons.org/licenses/by/`, and not BY-NC or BY-ND)
- CC BY-SA (`creativecommons.org/licenses/by-sa/`)
- Rights text exactly "public domain" or "no known copyright restrictions" when no conflicting license URL is present

A saved clip is copied onto the device. The pad stores the license name, license URL, creator, and an attribution line, and More lists those attributions. CC BY and CC BY-SA still require that attribution to stay with the sound.

Files longer than 12 seconds or larger than 2.5 MB are not saved. Nothing from the Internet Archive is committed in this repository.
