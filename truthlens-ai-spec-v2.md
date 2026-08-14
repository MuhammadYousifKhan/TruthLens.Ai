# TruthLens AI — App Specification v2 (hackathon-aligned)

Version 2.0 — July 2026
Supersedes: `truthlens-ai-complete-spec.md` (v1.1) **for app scope only**. v1's data model, theme, and F1–F8 feature definitions still hold except where this document changes them.
Scope of this doc: **the app only.** Yousif owns the app; Shahzaman owns the written proposal and the pitch video. Every app decision here is optimized for the two things judges actually score (see §1).

---

## 1. Context correction — what this hackathon actually is

v1 was written as if this were a live, venue-judged, demo-on-a-phone hackathon (standalone APK, "venue wifi", 7-day sprint, live 3-minute demo). **It is not.** From the UNESCO docs (`D:/TruthLens Docs`):

- **Event:** UNESCO Global Youth Hackathon 2026. Theme: *"Play Your Part: Youth Designing the Future of Media and Information Literacy (MIL)."*
- **Submission is remote and async.** Two deliverables only: (1) a written **proposal** (Word/PDF, English, ≤10 MB) and (2) a **≤3-minute pitch video**. No judge ever touches the app.
- **Prototype stage is explicitly acceptable** (stated in their FAQ).
- **Timeline:** submission window **6 July – 16 August 2026** (deadline 16 Aug, 23:59 Paris). ~4 weeks of runway, not 7 days.
- **Judging:** 3 international experts per project, scoring 5 fixed criteria (§2).
- **Outcome:** 4 winning teams → Thessaloniki, Greece (Nov 26–28); every valid submission gets a UNESCO certificate.

### Implications for the app (these change the build)

1. The app is a **prop for a video and for screenshots** in the proposal. It must *look* convincing and *demonstrate each idea vividly on camera*. It does **not** need venue-grade robustness.
2. **Dropped from scope** (all v1 effort here stops): EAS standalone APK for the venue, seeded offline demo accounts, mobile-data hardening, day-6/7 demo rehearsal, "5× in a row on the demo phone." Expo Go on the dev machine is enough to record the video.
3. **Every screen must earn its place on camera** by proving a scoring point. Features that don't read in 3 minutes of video or a screenshot are low priority.
4. We have weeks — real detection, localization, and a new "game" feature that v1 called out-of-scope are now all feasible.

---

## 2. What the app must prove (criteria → app responsibilities)

Official criteria, verbatim, mapped to what the app should show:

| # | Criterion (verbatim) | What the app must demonstrate |
|---|---|---|
| 1 | **Consistency with the MIL theme** — strong alignment with MIL principles | Cover more of MIL than "detect." MIL = **access, analyze, evaluate, create, act** (NAMLE). Today we do analyze/evaluate; we must add **act** (pause-before-share, verify, respond) and lean toward **create/contribute**. |
| 2 | **Clarity of presentation** | Screens legible on video: big type, one idea per screen, obvious primary action. (This criterion is mostly Shahzaman's video, but the app must not be visually noisy.) |
| 3 | **Innovation & creativity** | The *pedagogy* is the innovation, not the scanner. Friction-before-sharing, a real-or-fake training game, and "teach the tells" are the differentiators. |
| 4 | **Feasibility & sustainability** | Runs at ~$0 (Firebase free tier, local content, offline-capable). A real (not faked) detector signals feasibility. Sustainability story = open content + partner curricula. |
| 5 | **Impact & inclusion** | Back the problem with hard numbers (Common Sense Media stats). Add **inclusion**: localization, low-bandwidth/offline mode, accessibility, and a deepfake-victim support flow for the most vulnerable case. |

**Mentor design asks we are deliberately answering** (these came up repeatedly across the July 1–2 sessions and are the strongest signal of what the experts value):
- Dhanyashri (Pranava Institute): *"Can you design for verification? A source-trace button? Cross-check across sources? **Create friction before sharing.** Know what's AI-made."*
- Jenna Khanna (Common Sense Media): *"A gut check that works faster than a lie spreads. Teach pattern recognition **without making every young person paranoid.** Deepfake of a classmate — what to do in the **first five minutes**."*
- Elizabeth Sherr: trust tips — *pause before you share; trace it back; look for visual tells; reverse image search; go to the primary source.*
- Sherri Culver: MIL = access/analyze/evaluate/create/act; warns against "don't trust anything" nihilism.

---

## 3. Current state — keep vs change

**Keep (genuinely good, do not rework):**
- Architecture: centralized `src/theme/theme.ts`, typed navigation (`src/navigation/types.ts`), Firestore repository modules (`src/firebase/*`), hooks (`src/hooks/*`), local content data files (`src/data/*`). This is clean and AI-assist-friendly.
- Core thesis: detection is unreliable → pair every result with education. This is exactly what the mentors advocate — it's an asset, keep it central.
- Existing F1–F8 flows (auth, dashboard, scan→analyzing→result, guide, learn hub, lessons, quizzes, rewards, profile) — all functional; we extend, not replace.

**Change / add (this document):**
- 4.1 Detector: add a **real** Hugging Face path **and** redesign the result screen for honesty ("both", per decision).
- 4.2 Fact-check guide → **interactive verification flow** tied to the scanned image.
- 4.3 New **"Pause before you share"** friction moment.
- 4.4 **"What to look at" (the tells)** teaching block on the result.
- 4.5 New **"Real or Fake?" training game.**
- 4.6 New **deepfake first-response** flow.
- 4.7 **Localization + offline/inclusion** pass.
- 4.8 **Behavior-based rewards** reframe.
- 4.9 (optional) **Shareable verification report card.**

---

## 4. New & changed features — with implementation

Each feature lists: **Why** (criterion + mentor basis) · **UX** · **Implementation** (repo files, Expo v57 APIs, data, navigation). No code is written yet — this is the build plan.

> Expo v57 note (from `AGENTS.md`): the four new Expo modules below are **not yet installed** — add them with `npx expo install` (see §5). `expo-image-manipulator` has changed: `manipulateAsync` is deprecated in favor of the object-oriented API (`ImageManipulator.manipulate(uri)` context → `.resize({ width })` → `.renderAsync()` → `.saveAsync({ format: SaveFormat.JPEG, compress })`, or the `useImageManipulator` hook in components).

### 4.1 Honest detector — real Hugging Face + result redesign (decision: BOTH)

**Why.** #4 Feasibility (a real signal, not a random number), #3 Innovation, #1 Theme. Removes the single biggest credibility risk in front of professional fact-checkers.

**UX.**
- Result no longer *leads* with a confident "87%, 92% confidence." It leads with a **band** — *Likely AI-generated / Uncertain / Likely authentic* — plus an explicit line: **"This is an estimate, not proof. Always verify before sharing."**
- When the real model runs, show a small **"Analyzed by an open detection model (probabilistic)"** note. When it falls back to mock (offline/timeout), show **"Offline estimate — verify manually."** Never claim certainty.
- Downstream flow (save to Firestore, XP, routing to the verification flow) is unchanged.

**Implementation.**
- New module `src/firebase/detector.ts` (or `src/utils/detector.ts`) exposing `analyzeImage(localUri, storageUrl): Promise<ScanResult>`.
  - Try the real path first; on any error/timeout (e.g. > 6 s) `catch` and return `generateMockResult()` from the existing `src/utils/mockAnalyzer.ts`. **The mock stays as the guaranteed fallback** so the demo can never break — this is also the honest "detection is unreliable" story.
  - Keep the existing `ScanResult` type (`{ probability, confidence, flags, explanation }`) so `AnalyzingScreen` → `ResultScreen` and the Firestore save are untouched. Add optional `source: "model" | "offline"` and `modelLabel?: string`.
- **Real path (Hugging Face Inference).** POST the image bytes to an image-classification AI-detector model, e.g. `Organika/sdxl-detector` or `dima806/ai_vs_real_image_detection`. Response shape is `[{ label, score }, …]`; map the "AI/fake/artificial" label's `score` (0–1) to `probability` (0–100). Confirm the exact endpoint/model at build time (HF has been migrating "Inference API" → "Inference Providers"; verify one that's callable on the free tier and pick 2–3 fallback models).
  - **Auth/secret handling — important.** An HF token embedded in the app bundle is extractable (unlike the Firebase web config, which is genuinely not a secret). Two options:
    1. **Recommended (sustainable):** proxy the call through a **Firebase Cloud Function** (the billing card is already linked per v1 §4). The function holds the token as a runtime secret; the app calls the function with the Storage URL. Cleaner story for the "feasibility/sustainability" criterion.
    2. **Fast (prototype-acceptable):** call HF directly from the app with a **free, rate-limited** token supplied via `EXPO_PUBLIC_HF_TOKEN` (Expo inlines `EXPO_PUBLIC_*` at build). Acceptable for a prototype; note it is not truly secret. **Never commit the token** — use a git-ignored `.env` / EAS secret.
  - Send the already-uploaded **Storage download URL** (the scan flow uploads to `scans/{uid}/…` and gets a URL) so the detector and reverse-image-search (4.2) both reuse one public URL. This means the Analyzing step must upload *before* calling the detector (it already uploads first per v1 §6.5).
- **Result redesign** lives in `src/screens/ResultScreen.tsx`: replace the giant `probability` number as the hero with the band label + disclaimer; keep the number smaller/secondary. Add the "tells" block (4.4).

### 4.2 Interactive verification flow (was: static fact-check guide)

**Why.** #1 Theme, #3 Innovation. Direct answer to Dhanyashri's "source-trace button / cross-check across sources." Moves the user from *reading about* verification to *doing* it.

**UX.** The five guide steps become an **active checklist** for the specific scanned image:
1. *Check the source* — tappable, mark-done checkbox.
2. **Reverse image search** — a button that opens the scanned image in Google Lens / TinEye.
3. *Verify the date* — prompt + checkbox.
4. **Cross-check trusted sources** — buttons that open real fact-check sites (AFP Fact Check, EDMO, Climate Feedback — from Elizabeth's resource list).
5. *Decide whether to share* — routes into **Pause before you share** (4.3).
Progress (checkboxes) is local screen state; completing all five awards a small XP nudge (behavior-based, see 4.8).

**Implementation.**
- Rework `src/screens/GuideScreen.tsx` from static cards to a stateful checklist (`useState` map of stepId → done).
- **Reverse image search** and **cross-check links** use `expo-web-browser`: `WebBrowser.openBrowserAsync(url)`.
  - Reverse-image URLs take the **Storage download URL** as a query param, e.g. TinEye `https://tineye.com/search?url=<encoded>`, Google Lens `https://lens.google.com/uploadbyurl?url=<encoded>`. Confirm at build which resolve reliably on mobile web (TinEye-by-URL is historically the most stable; keep two providers).
  - This requires the Storage URL on this screen → thread it through navigation params. Update `RootStackParamList.Guide` from `undefined` to `{ imageUrl?: string }` in `src/navigation/types.ts`, and pass it from `ResultScreen` (and keep a no-arg entry from the Dashboard where there's no image).
- Add `expo-web-browser` (§5).

### 4.3 Pause before you share (new)

**Why.** #1 Theme, #3 Innovation, #5 Impact. The single most-requested pattern across mentors ("create friction before sharing"; "pause before you share"). This is the app's signature hook — build it to be the standout 15 seconds of the video.

**UX.** A deliberate interstitial before any "share" action and available as a standalone tool from the Dashboard:
- Title: *"Pause. 3 quick checks before you share."*
- Three tappable checks (Do you know the source? Have you seen it elsewhere? Does it make you feel a strong emotion?) with a short cool-down so it can't be dismissed instantly (a subtle 2–3 s enable delay on the "Share anyway" button — friction by design).
- Two exits: **"I'll verify first"** → verification flow (4.2); **"Share anyway"** → native share sheet.

**Implementation.**
- New screen `src/screens/PauseScreen.tsx`; add `Pause: { imageUrl?: string }` to `RootStackParamList` and register it in `src/navigation/RootNavigator.tsx`.
- Entry points: (a) a **"Share"** button added to `ResultScreen` routes here first; (b) a Dashboard card "Think before you share."
- Native share via `expo-sharing`: `await Sharing.isAvailableAsync()` then `Sharing.shareAsync(localFileUri, { mimeType: 'image/*' })`. (Sharing needs a local file URI, which the scan already has as `imageUri`.)
- The cool-down is a `useEffect` + `setTimeout` toggling a `canShare` state; keep it short (2–3 s) so it reads as intentional, not broken, on video.
- Add `expo-sharing` (§5).

### 4.4 "What to look at" — teach the tells (part of the result redesign)

**Why.** #1 Theme, #3 Innovation. Answers Jenna's "teach pattern recognition without making them paranoid" and Elizabeth's "look for the visual tells." The user should learn to spot fakes *without* the tool.

**UX.** On the Result, below the band, a **"What to look at"** card lists 2–3 concrete things to inspect in *this* image (hands/fingers, lighting vs background, warped text/jewelry, over-smooth skin), each one sentence. Framed as "look and judge for yourself," not "the AI says."

**Implementation.**
- Extend `src/data/scanContent.ts`: the existing high/low flag pools already read like tells; add a short `tells` array (label + one-line "why it matters") for the high-probability pool, and a "signs of authenticity" set for the low pool.
- Render in `ResultScreen` as a card between the band and the primary button. No new dependencies.

### 4.5 "Real or Fake?" training game (new)

**Why.** #3 Innovation (your strongest lever), #1 Theme. Builds pattern recognition actively; far more filmable than text multiple-choice. Elizabeth ran exactly this live; Common Sense ships "Two Truths and AI." This is your best single video moment.

**UX.** A stack of images; for each, the user picks **Real** or **AI** (tap buttons — baseline), then an **instant reveal** explains the tell and whether they were right. Score + streak at the end, ties into XP/badges. (Enhancement: swipe left/right instead of buttons.)

**Implementation.**
- Baseline (recommended for feasibility): **tap** "Real"/"AI" buttons with an animated reveal using RN's built-in `Animated` — **no new gesture libraries**. New screen `src/screens/GameScreen.tsx`; add `Game: undefined` to the nav stack; Dashboard card "Spot the fake."
- Data: new `src/data/gameItems.ts` — `{ id, imageAsset, isAI, tell }`. Bundle 8–12 images in `assets/game/` (mix of obvious AI and real). Keep the set small; these are static local assets so the game works fully offline (inclusion + feasibility win).
- Scoring reuses the XP/badge plumbing (`src/firebase/*`, `src/hooks/useBadges.ts`); consider a new badge `sharp_spotter` (needs a stable id like the others in `src/data/badges.ts`).
- Enhancement (only if time): swipe gestures via `react-native-gesture-handler` + `react-native-reanimated` (add via `npx expo install`). Not required for the video.

### 4.6 Deepfake first-response flow (new)

**Why.** #5 Impact & Inclusion (highest), #1 Theme. Jenna's "first five minutes after a deepfake of a classmate." Addresses cyber-harassment/doxxing (Lizette's villain list). No competitor ed-app does this — it's a distinctive impact story.

**UX.** A calm, guided flow: *Stop — don't share or forward · Save evidence (screenshot, save the link/URL) · Report it (platform report links) · Tell someone you trust / support the person · It is not your fault.* Reachable from the Dashboard and surfaced on any high-probability scan result as **"Is this a deepfake of someone you know?"**

**Implementation.**
- New static content file `src/data/deepfakeResponseSteps.ts` (`{ title, body, actionUrl? }`), new screen `src/screens/DeepfakeHelpScreen.tsx`, nav route `DeepfakeHelp: undefined`.
- "Report it" buttons open platform reporting pages via `expo-web-browser`.
- Entry points: Dashboard card + a conditional link on `ResultScreen` when `probability >= 55`.
- Static content only — no network, works offline.

### 4.7 Localization + offline / inclusion pass

**Why.** #5 Impact & Inclusion (biggest untapped points), #4 Feasibility. UNESCO runs EN/FR/ES; English-only is a visible inclusion gap. Global-south youth are on limited data — offline is inclusion, not just polish.

**UX.** A language toggle (device default + manual override); the whole app renders in the chosen language. All non-scan features already work offline; make that explicit and complete.

**Implementation.**
- Detect locale with `expo-localization` (`getLocales()[0].languageTag`). Pair with a lightweight i18n library — **`i18n-js`** is simplest (no provider needed); `react-i18next` if we want hooks. Store the manual override in `@react-native-async-storage/async-storage` (already installed).
- Externalize all user-facing strings into `src/i18n/en.json` + one authentic second language (pick one real to the team/community — e.g. Urdu, Arabic, or French; authenticity is the point per Dun Abiera's "localize the problem"). Wrap strings as `t('key')`.
- The heavy content is the lessons/quizzes/guide in `src/data/*` — translate at least the demo lesson + the guide + the game tells for the video; full translation can be phased.
- Offline: confirm lessons, quizzes, guide, game, deepfake flow, and profile all render with the network off; only the scan (upload + detector) needs connectivity and already falls back to the mock (4.1).
- Add `expo-localization` + `i18n-js` (§5).

### 4.8 Behavior-based rewards reframe

**Why.** #1 Theme, #5 Impact. v1's XP rewards scanning and quizzing — i.e. screen time, which the mentors are wary of (engagement-maximizing design). Reward *behavior change* instead.

**UX.** Add small XP / a streak for real actions: completing a verification checklist (4.2), choosing "I'll verify first" at the Pause (4.3), a daily "I paused before sharing" pledge. Profile shows a "verification habits" summary, not just points.

**Implementation.**
- Extend the users doc or add `users/{uid}/actions/{actionId}` in Firestore (mirror the existing `scans`/`quizResults` pattern in `src/firebase/`). Keep XP awards idempotent per action to prevent farming (v1 already does this for quizzes).
- Surface in `src/screens/ProfileScreen.tsx`. Optional new badge for a verification streak.

### 4.9 Shareable verification report card (optional, polish phase)

**Why.** #3 Innovation, #5 Impact. A screenshot-friendly "my MIL habits" card turns users into an awareness campaign (a valid UNESCO project category). Good social footage.

**Implementation.** A styled summary view; capture with `react-native-view-shot` and share via `expo-sharing`. Lowest priority; only if ahead.

---

## 5. Dependencies to add

Install with `npx expo install` (never plain `npm install` for Expo-managed native modules — it resolves the wrong version; Expo v57 is pinned):

- `expo-web-browser` — reverse image search + fact-check + report link-outs (4.2, 4.6)
- `expo-sharing` — native share sheet (4.3, 4.9)
- `expo-localization` — device locale (4.7)
- `i18n-js` (or `react-i18next`) — translations (4.7) *(plain npm is fine; not a native module)*
- `expo-image-manipulator` — resize/compress at pick time before upload (referenced by v1 §6.4 but not currently installed); use the new object-oriented API, not `manipulateAsync`
- *(enhancement only)* `react-native-gesture-handler`, `react-native-reanimated` — swipe variant of the game (4.5)
- *(optional)* `react-native-view-shot` — report card capture (4.9)

Confirm each against `https://docs.expo.dev/versions/v57.0.0/` before use, per `AGENTS.md`.

---

## 6. Data model & navigation changes (summary)

**Firestore (additions to v1 §5):**
- `users/{uid}/actions/{actionId}` — `{ type, xpAwarded, createdAt }` for behavior rewards (4.8).
- Optional new badge ids in `src/data/badges.ts`: `sharp_spotter` (game), a verification-streak badge. Keep ids stable (unlock logic keys off them).

**New local data files:** `src/data/gameItems.ts` (4.5), `src/data/deepfakeResponseSteps.ts` (4.6), `src/i18n/en.json` + second language (4.7), extended `tells` in `src/data/scanContent.ts` (4.4).

**Navigation (`src/navigation/types.ts` + `RootNavigator.tsx`):**
- `Guide` param: `undefined` → `{ imageUrl?: string }`.
- Add routes: `Pause: { imageUrl?: string }`, `Game: undefined`, `DeepfakeHelp: undefined`.
- New Dashboard cards: "Think before you share" (Pause), "Spot the fake" (Game), and a deepfake-help entry.

**Detector (`ScanResult`):** add optional `source: "model" | "offline"`, `modelLabel?: string` (4.1).

---

## 7. Build sequence (4 weeks, app-only)

Ordered by return-on-score. Each phase ends with a **video-able** artifact.

**Phase 1 — credibility + on-theme quick wins (week 1)**
- 4.1 detector (real HF + honest redesign) · 4.4 tells · 4.2 interactive verification · 4.3 pause-before-share.
- *Done when:* a scan yields a real (or gracefully-mocked) band, teaches the tells, and flows into an interactive verify → pause sequence, all filmable.

**Phase 2 — innovation showpiece (week 2)**
- 4.5 Real-or-Fake game (tap baseline).
- *Done when:* a 20-image round plays offline with instant tell-reveals and a score.

**Phase 3 — impact & inclusion (week 3)**
- 4.6 deepfake first-response · 4.7 localization (device locale + one second language on the demo path) + verified offline mode.
- *Done when:* the app runs end-to-end in a second language with the network off; the deepfake flow is reachable from a scan result.

**Phase 4 — polish for camera + optional (week 4)**
- 4.8 behavior rewards · 4.9 report card (optional) · **visual polish pass** (the UI work deferred until now) · record-ready check (§8).
- *Done when:* the §8 checklist passes and screens are clean enough to film.

---

## 8. Video-readiness checklist (what "done" means for the app)

The app's real deliverable is footage. Before the Phase-4 freeze, each of these must look right on screen:
- [ ] Scan → **band + "estimate, not proof"** disclaimer reads clearly (no fake-precision hero number).
- [ ] "What to look at" tells are legible at video resolution.
- [ ] Reverse-image-search button visibly opens a real search with the scanned image.
- [ ] Pause-before-share reads as *intentional friction*, not a bug (cool-down subtle, copy clear).
- [ ] Real-or-Fake game has a satisfying reveal animation.
- [ ] Deepfake flow feels calm and supportive, not alarming.
- [ ] One full pass runs in the second language with airplane mode on.
- [ ] Big type, one primary action per screen, blue/white theme consistent (per `theme.ts`).

---

## 9. Explicitly dropped from v1

Do not spend time on: EAS standalone APK for judging, seeded demo Account A/B, mobile-data hardening, "demo 5× in a row," on-venue rehearsal, laptop-hotspot fallback. There is no live demo. This time is reallocated to §4 and to making the app filmable.

---

## 10. Open decisions

1. **Detector secret handling** — Cloud Function proxy (sustainable, recommended) vs. `EXPO_PUBLIC_HF_TOKEN` in-client (fast, prototype-acceptable)? (§4.1)
2. **Second language** — which one (Urdu / Arabic / French / other)? Should be authentic to the team so the inclusion story is real. (§4.7)
3. **Game input** — tap buttons (baseline, no new deps) vs. swipe (needs gesture-handler + reanimated)? (§4.5)
4. **Report card (4.9)** — include, or cut for time?

---

## 11. Definition of done (v2)

The app is done when, on video, it can show: a scan that returns an **honest, band-based** result and **teaches what to look for**; an **interactive verification** step that actually reverse-searches the image; a **deliberate pause** before sharing; a **Real-or-Fake game** that trains the eye; a **deepfake support** flow for the worst case; and at least one full path **in a second language, offline** — every one of which maps to a named judging criterion. Everything else is bonus.
