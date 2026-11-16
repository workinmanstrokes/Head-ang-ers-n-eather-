# Laugh Pad: Meme Soundboard — Play listing draft

Developer name: DowntownDiddlerrr
Package: com.diddlerrr.laughpad
Privacy policy URL: https://workinmanstrokes.github.io/test-builds/privacy/soundboard.html
Privacy source in this repo: docs/privacy/soundboard.html
Contact: mscofield1588@gmail.com
Price: free. No in-app purchases. No ads.

The filename `soundboard.html` is the page the app already opens. The page itself is titled Laugh Pad: Meme Soundboard.

## Title

Laugh Pad: Meme Soundboard

(27 characters. Play’s title limit is 50.)

## Short description

Tap a coloured pad and a sound plays. Record your own. No ads.

(62 characters. Play’s short-description limit is 80.)

## Full description

Laugh Pad: Meme Soundboard is a free soundboard from DowntownDiddlerrr. Tap a big coloured pad and a short sound plays.

What’s inside

- Sixteen original synthesized sounds, ready with no download
- Record a sound with the microphone and keep it on a pad. Recordings stay on this device and are not uploaded
- Search the Internet Archive for short clips with a clear free license (public domain, CC0, CC BY, or CC BY-SA), preview them, and save a copy on the device
- Rename, delete, or download a pad
- Chain up to eight pads into one tap
- A volume control and a Stop all button

Privacy

Laugh Pad has no ads and no account. Crash reports and play stats are optional. While that switch is on, the app can send anonymous crash reports to Sentry and anonymous play counts to PostHog, project workinmanstrokesinc. Every stat is labeled app = Laugh Pad. There are no session recordings, no capture of what you type, and no person profile. Turn the switch off in More. The choice is saved on this device. The full policy is linked from the app.

Permissions

The microphone is used only after you tap Record. Internet is used for sound search, the privacy page, and those optional reports.

Made by DowntownDiddlerrr. Questions: mscofield1588@gmail.com

## Content rating notes

Do not enrol this app in Designed for Families or any program for children under 13. The privacy policy says it is not directed at children under 13. Sentry and PostHog are not used as advertising, and they are off when the in-app switch is off, but they are still analytics and crash tools and are a poor fit for a children’s program.

Suggested questionnaire answers:

| Topic | Answer |
| --- | --- |
| Violence | None |
| Sexuality | None |
| Language / profanity | None in the interface |
| Controlled substances | None |
| Crude humor | Mild. The built-in pack includes comic effects such as a fart sound. |
| Fear | None |
| Gambling | None |
| User-generated content | The user can record audio. It stays on the device. There is no profile, no chat, and no way to post it. |
| Shares location with other users | No |
| Unrestricted internet | Yes. Archive search, the privacy page, and optional crash reports and play stats. |
| Digital purchases | None |
| Ads | None |

A mild crude-humor flag often lands on Everyone or Everyone 10+. Answer the questionnaire from the table and accept the rating Play assigns. Do not tick “designed for children”.

## Data safety answers

These match the telemetry in the app. Collection happens only when the Play build includes the Sentry and PostHog keys and the in-app switch is on. A build with blank keys sends nothing. The switch defaults to on and can be turned off. The choice is stored on the device.

Data is not sold. It is not used for advertising. It is not required for the app to work. It is sent over HTTPS.

| Play data type | Collected? | Shared? | Optional? | Notes |
| --- | --- | --- | --- | --- |
| Crash logs | Yes | No | Yes | Sentry browser SDK. Error text and a short trail. Email-shaped text is stripped. No user id. The event IP field is cleared. |
| App interactions | Yes | No | Yes | PostHog project workinmanstrokesinc. Events: app opened, pad played (kind only: built-in, recording, or saved), chain played. Property on every event: app = Laugh Pad. |
| Device or other IDs | Yes | No | Yes | A random id PostHog stores on the device for those stats. Not the advertising id. Cleared on the device when the switch is turned off. person_profiles is never, so it is not a person profile. |
| Approximate location | No | No | — | The client does not attach an IP address to the event. Also turn on Sentry “Prevent Storing of IP Addresses” and PostHog “Discard client IP data” in those projects, because the network connection itself still reaches their servers. |
| Precise location | No | No | — | Not declared and not used. |
| Audio | No | No | — | Recordings stay on the device. They are not in crash reports or play stats. |
| Personal info, contacts, photos, files, messages, search history | No | No | — | Search words go only to archive.org, not to Sentry or PostHog. Pad names are not sent. |

“Shared” is No because Sentry and PostHog process the data for DowntownDiddlerrr as service providers. They are not sold and they are not sent onward for ads. If the Play form asks whether a service provider processes the data, answer yes for Sentry (crash logs) and PostHog (app interactions and the random id).

Encryption in transit: yes.
Users can request deletion: turning the switch off stops new data and clears the on-device stats id. There is no account, and crash reports are not tied to a person, so there is no profile to delete on a server.
Data collection is optional: yes. The app runs the same with the switch off.

What the client is configured to refuse:

- Session recordings
- Autocapture of taps and of text the user types
- Person profiles (`person_profiles: 'never'`)
- A stored IP on the event
- Advertising SDKs

## Screenshots

Phone screenshots of this app, 1080×1920, are in `docs/store/screenshots/`. They are captures of the running board, not placeholder art. The More shot shows the crash-and-stats switch. In this repo the keys are blank, so that shot says nothing is sent until a Play build is baked with keys.
