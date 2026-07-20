# TruthLens AI — complete project specification

Version 1.1 — July 2026 (frontend changed to React Native)
Project: TruthLens AI: Think Before You Share
Team: Shahzaman (business lead, content, testing, pitch) · Yousif (developer, AI-assisted)
Build window: 7 days (hackathon MVP)

---

## 1. Overview

TruthLens AI is a mobile app that helps young people (13-30) identify AI-generated images, deepfakes, and misinformation, and teaches them to verify content before sharing it. The MVP combines three loops: a scan flow that analyzes an uploaded image, a learning loop of short lessons with quizzes, and a reward system (XP, badges) that reinforces responsible sharing habits.

The hackathon MVP uses a simulated detection engine (mock results) with a clearly presented roadmap to real detection APIs. The product thesis: detection alone is unreliable — even commercial detectors misjudge compressed or cropped images — so TruthLens pairs every detection result with education on manual verification. Detection makes the user suspicious; the fact-checking guide tells them what to do next.

### Alignment

- SDG 4 (Quality Education): media literacy lessons and quizzes
- SDG 16 (Peace, Justice and Strong Institutions): reducing misinformation spread

---

## 2. Problem and solution

Problem: students and young people encounter AI-generated images, edited videos, and fake news daily, and most share content without verifying it. Existing detection tools give a score but teach nothing, and their accuracy is inconsistent.

Solution: an app where scanning an image is the entry point into learning. Every scan result links to a step-by-step fact-checking guide; lessons and quizzes build lasting verification habits; XP and badges reward completing them.

### Target users

Students aged 13-30, schools, universities, teachers, and youth organizations. The MVP targets the individual student; institutional accounts are future work.

---

## 3. Scope

### 3.1 In scope (must ship)

| # | Feature | Summary |
|---|---|---|
| F1 | Authentication | Email/password sign up and login via Firebase Auth |
| F2 | Home dashboard | Five entry cards: Scan, Learn, Quiz, Achievements, Profile |
| F3 | AI scan flow | Gallery upload → Storage → simulated analysis → result screen |
| F4 | Fact-checking guide | Five static verification steps, linked from every scan result |
| F5 | Learn Hub | Six hardcoded lessons |
| F6 | Quizzes | One multiple-choice quiz per lesson, scores saved to Firestore |
| F7 | Rewards | XP on scans and quizzes; four badges with unlock rules |
| F8 | Profile | XP, progress, quiz scores, badges earned |

### 3.2 Stretch goals (only if all in-scope features are done and tested)

| # | Feature | Trigger to build |
|---|---|---|
| S1 | Real detection via Hugging Face Inference API | Yousif finishes day 6 early |
| S2 | Camera capture (in addition to gallery) | Spare time day 6 |
| S3 | Onboarding carousel (3 pages) | Spare time day 7 morning |
| S4 | Daily streaks | Lowest priority |
| S5 | Guest mode | Lowest priority |

### 3.3 Out of scope (do not build)

Custom-trained detection model, OCR, reverse image search API integration, fact-checking API integration, multilingual assistant, achievement certificates, language selection, school/teacher dashboards, push notifications, social features.

---

## 4. Architecture

```
React Native app via Expo (Android primary, iOS if a Mac is available)
   │
   ├── Firebase Auth ............ sign up / login (email + password)
   ├── Cloud Firestore .......... users, quiz results, badges, scan records
   ├── Firebase Storage ......... uploaded scan images (scans/{uid}/...)
   └── MockAnalyzer (local) ..... simulated detection results
         └── [Stretch S1] swap for HTTP call to Hugging Face Inference API
```

No custom backend server. Firebase is the backend (Backend-as-a-Service). Lessons and quiz questions are hardcoded TypeScript data files inside the app — not Firestore — for instant loading, offline reliability during the demo, and one less integration to break.

### Tech stack decisions (final)

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React Native with Expo (TypeScript) | Single codebase; Expo managed workflow removes native build setup for a solo dev; instant reload on device via Expo Go during development |
| Firebase SDK | Firebase JS SDK (modular, v10+) | Works inside Expo's managed workflow with no native code; covers Auth, Firestore, and Storage |
| Navigation | React Navigation (native stack) | De-facto standard; straightforward for AI-assisted code generation |
| Image picking | expo-image-picker | Gallery access with built-in permission handling on both platforms |
| Auth | Firebase Auth | Free, no card required |
| Database | Cloud Firestore | Free tier: 50K reads / 20K writes per day — far above demo usage |
| Storage | Firebase Storage | Free within Google Cloud Always Free tier (5 GB stored, 100 GB egress/month); requires a linked billing card since Feb 2026 to create the bucket |
| State management | React hooks (useState/useContext) + simple repository modules | Smallest surface area for AI-assisted code; no Redux/Zustand learning curve |
| Version control | Git, commit per working feature | Rollback safety for AI-generated changes |

Note on the demo build: Expo Go is fine for daily development, but the demo must not depend on a dev server at the venue. Create a standalone Android APK with EAS Build (free tier) on day 6, install it on both phones, and demo from that.

### Cost

$0 for the hackathon. Required setup action: link a debit/credit card to the Firebase project to enable Storage, and set a $1 budget alert in the Google Cloud console.

---

## 5. Data model

### 5.1 Firestore

```
users/{uid}
  name: string
  email: string
  xp: number                    // starts at 0
  createdAt: timestamp
  lastActiveDate: string        // "2026-07-25", streaks (stretch S4)

users/{uid}/quizResults/{lessonId}
  score: number                 // correct answers, e.g. 4
  total: number                 // question count, e.g. 5
  completedAt: timestamp

users/{uid}/badges/{badgeId}    // doc exists = badge earned
  earnedAt: timestamp

users/{uid}/scans/{scanId}
  imageUrl: string              // Storage download URL
  probability: number           // 0-100
  confidence: number            // 0-100
  flags: array<string>
  createdAt: timestamp
```

### 5.2 Storage layout

```
scans/{uid}/{timestampMillis}.jpg    // uploaded at imageQuality 70, maxWidth 1200
```

### 5.3 Firestore security rules (deploy on day 1)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Storage rules: same pattern — authenticated users may read/write only under `scans/{their uid}/`.

### 5.4 Hardcoded app data (TypeScript files, e.g. src/data/)

- `lessons.ts`: array of Lesson {id, title, body, order}
- `quizQuestions.ts`: array of Question {lessonId, question, options[4], correctIndex}
- `scanContent.ts`: high-probability flags, low-probability flags, explanation texts
- `guideSteps.ts`: five fact-checking steps {title, body}
- `badges.ts`: badge definitions {id, name, description, unlockRule}

All five files are populated from Shahzaman's content deliverable (section 8).

---

## 6. Functional specification by screen

### 6.1 Splash
Shows logo ~1.5 s, checks auth state, routes to Login (signed out) or Dashboard (signed in).

### 6.2 Login / Sign up
Email + password fields with validation (valid email format, password ≥ 6 chars). Inline error messages for wrong password, existing account, weak password, no connection. Loading spinner on submit. Toggle between login and sign-up modes. On sign up, create the `users/{uid}` document with xp = 0.

### 6.3 Home dashboard
Greeting with the user's name and current XP. Five rounded cards: Scan Content, Learn, Quiz, Achievements, Profile. Scan is visually dominant (it is the demo centerpiece).

### 6.4 Scan screen (F3, part 1)
Empty state: dashed upload card, "Tap to upload an image or screenshot". Gallery picker via expo-image-picker (quality 0.7, resized to max width ~1200 before upload). After selection: image preview, "Analyze Image" primary button, "Choose a different image" text button. expo-image-picker handles the iOS photo-library permission prompt; no manual Info.plist editing in the managed workflow.

### 6.5 Analyzing screen (F3, part 2)
Sequence: (1) upload image to Storage — status "Uploading image..."; (2) 2 s delay — "Analyzing pixels and patterns..."; (3) 1.2 s delay — "Checking for generation artifacts..."; (4) generate mock result, save scan + award XP in one Firestore batch write, replace-navigate to Result. On any failure: snackbar "Scan failed. Check your connection." and pop back. The staged status messages are deliberate: they make the simulated analysis feel like real processing.

### 6.6 Result screen (F3, part 3)
Displays: image thumbnail; probability (large, color-coded: ≥55 red "Likely AI-generated", 35-54 orange "Uncertain — verify before sharing", <35 green "Likely authentic"); confidence %; 2-3 detected-element flags; educational explanation card; primary button "Learn how to verify this" → Fact-checking guide; text button "Scan another image" → back to Dashboard.

Mock result generation rules (MockAnalyzer):
- probability: random 10-95
- confidence: random 70-95 (always sounds sure)
- flags: drawn from the high-flag pool when probability ≥ 55, low-flag pool otherwise — flags must stay consistent with the probability or the illusion breaks
- explanation: matched to high/low pool

Stretch S1 swap: replace `MockAnalyzer.analyze()` with an HTTP call to a hosted AI-image-detector model on the Hugging Face Inference API (free API key, near-zero cost at demo volume). Everything downstream — result screen, Firestore save, XP — is unchanged. Estimated effort: ~1 day including error handling for API timeouts (fall back to the mock on failure so the demo can never break).

### 6.7 Fact-checking guide (F4)
Five steps, each a card with title and short paragraph: check the source; reverse image search; verify the date; cross-check with trusted sources; decide whether to share. Static content, no network. Reachable from every scan result and from the dashboard Learn card.

### 6.8 Learn Hub (F5)
List of six lessons with completion checkmarks: What is misinformation?; Deepfakes; AI-generated images; Fake news; Social media safety; Responsible AI use. Tapping opens Lesson detail: title, 150-250 words of body text, "Take the quiz" button.

### 6.9 Quiz (F6)
4-5 multiple-choice questions per lesson, one at a time, four options each. Immediate feedback per answer (correct/incorrect highlight), then next question. No back navigation mid-quiz.

### 6.10 Quiz result
Score (e.g. 4/5), XP earned, pass state at ≥ 3/5. Writes `quizResults/{lessonId}`, increments XP, runs badge checks. Buttons: "Back to lessons", "Retake quiz" (retake overwrites the score; XP is only awarded on the first completion to prevent farming).

### 6.11 Achievements / badges (F7)
Grid of four badges, earned (colored) vs locked (greyed) states, unlock description under each.

### 6.12 Profile (F8)
Name, email, total XP, lessons completed (n/6), quiz scores list, badges strip, log out button. Settings and language selection are out of scope; About App is a static text page.

---

## 7. Rewards system

### XP rules
- +10 per completed scan
- +5 per correct quiz answer
- +20 bonus for a perfect quiz score
- XP awarded once per lesson quiz (first completion only)

### Badges

| id | Name | Unlock rule |
|---|---|---|
| first_look | First Look | Complete first scan |
| fact_finder | Fact Finder | Pass any quiz (≥ 3/5) |
| truth_seeker | Truth Seeker | Complete all six lessons' quizzes |
| sharp_eye | Sharp Eye | Score 100% on any quiz |

Badge checks run after every scan save and quiz result write. Unlocking shows a celebratory dialog/snackbar and writes `badges/{badgeId}`.

---

## 8. Content deliverable (Shahzaman, due end of day 2)

One shared document plus one spreadsheet:

1. Six lessons, 150-250 words each, written for ages 13-18
2. Quiz spreadsheet — columns: lesson_id, question, option_a, option_b, option_c, option_d, correct_option (4-5 rows per lesson)
3. Fact-checking guide: five steps, one short paragraph each
4. Scan content: 6+ high-probability flags (e.g. "Unnatural finger geometry detected", "Lighting on subject does not match background"), 4+ low-probability flags, 2+ explanations for each pool
5. Badge names/descriptions (may rename the defaults above)
6. Onboarding copy (3 short slides, stretch S3) and About App text
7. Pitch deck and 3-minute demo script (due day 6)

The spreadsheet format is fixed: it pastes directly into `quizQuestions.ts`. This deadline gates day 5; if lessons slip, Yousif builds with two placeholder lessons and swaps content later, but the quiz spreadsheet format cannot change.

---

## 9. Non-functional requirements

- Performance: cold start under 3 s on a mid-range Android phone; all non-scan screens work with no network (hardcoded content)
- Upload resilience: images compressed at pick time; scan flow tested on mobile data, not only wifi
- Security: Firestore and Storage rules restrict every user to their own documents (section 5.3); no secrets committed to git (the Firebase web config object in the app code is fine — those keys are not secrets, security lives in the rules)
- Honesty: the simulated analysis is never presented to judges as a real model; the pitch names it as simulated and shows the integration roadmap
- Accessibility: minimum 14 sp body text, touch targets ≥ 48 dp, sufficient contrast on the blue/white palette

### UI style
Blue and white palette, rounded cards (16 px radius), friendly icons (Material), generous padding, sentence-case labels. Modern and clean; designed for students.

All colors, spacing, radius, and font sizes are centralized in `src/theme/theme.ts` — every screen and component imports from there rather than hardcoding values, so the palette/spacing can be changed in one place and it updates app-wide.

---

## 10. Development process (Yousif)

Three working rules for the AI-assisted build:

1. Build vertically: one complete feature at a time, verified on a real device before the next. Never generate all screens up front.
2. Use an agentic coding tool (Claude Code) that operates on the project directory, so the AI sees all existing files and stays consistent with them.
3. Git commit after every working feature; roll back instead of debugging broken generated changes late at night.

Daily loop: build → run on device → send build to Shahzaman each evening → fix his bug list next morning before new features.

---

## 11. Seven-day timeline

| Day | Focus | Milestone (must be true at end of day) |
|---|---|---|
| 1 | Firebase project (Auth, Firestore, Storage + billing card + $1 alert, security rules); Expo app scaffold (create-expo-app, TypeScript) with Firebase JS SDK configured; all screens as placeholders with React Navigation; git init | App runs on a real phone via Expo Go; sign up/login work; every screen reachable |
| 2 | Auth validation and error states; app theme; dashboard layout. Shahzaman delivers content | A stranger can sign up and navigate unaided |
| 3-4 | Scan flow end to end: picker → upload → analyzing → mock result → guide; fact-checking guide screens; scan saved + XP | Full demo path runs smoothly twice in a row on the demo phone |
| 5 | Learn Hub, lesson detail, quizzes, quiz result, Firestore writes | One lesson + quiz completed end to end; score visible in Firestore |
| 6 | Badge checks, badges screen, profile screen; kick off EAS Build for the standalone Android APK (free tier queues can take a while — start it today, not day 7). Stretch goals only if everything is done | Earning a badge visibly unlocks it; APK build submitted |
| 7 | Feature freeze; polish (empty states, back behavior, keyboard); install the EAS-built APK on both phones; seed demo accounts; device + mobile-data testing; rehearsal | Demo runs from the standalone APK (no dev server) 5×; pitch rehearsed 2× against the live app |

### Demo accounts (seeded day 7)
- Account A (fresh): shows first-run experience and live scan
- Account B (loaded): pre-filled XP, quiz history, and badges — shows the reward system without live quizzing

### Cut order if the schedule breaks
1. Streaks → 2. Camera capture → 3. Onboarding → 4. Guest mode → 5. Reduce six lessons to two.
Floor that survives all cuts: login, scan-to-result, one lesson + quiz, one badge unlocking, profile.

---

## 12. Demo script (3 minutes)

1. Problem — 20 s (Shahzaman): young people share unverified content daily; one or two sentences on the stakes
2. Scan demo — 60 s: upload a prepared suspicious image, walk the result, tap into the guide
3. Learning loop — 45 s: open a lesson, answer two quiz questions, show XP gained
4. Rewards — 20 s: switch to Account B, show badges and profile
5. Vision — 35 s: roadmap (real detection API, OCR, reverse image search, fact-checking APIs, school partnerships), SDG 4 and 16, close

Prepared gallery on the demo phone: one obvious AI-generated image, one real photo, one edited screenshot. If judges ask about the model: state plainly that the result is simulated in this prototype, the MVP focus was the product and education loop, and the swap to a live detection API is a one-function change (already scoped as S1).

---

## 13. Risks

| Risk | Mitigation |
|---|---|
| AI-generated code accumulates faster than it is verified | Vertical builds, per-feature device checks, per-feature git commits |
| Content arrives late | Day-2 deadline gates day 5; placeholder lessons as fallback; spreadsheet format frozen |
| Venue wifi fails during demo | Test and demo on mobile data; all non-scan features work offline |
| Storage billing-card setup blocks day 1 | Do it first thing day 1; if blocked, stub uploads (skip Storage, keep local file) and retrofit |
| EAS Build fails or queue delays the standalone APK | Submit the build on day 6, not day 7; fallback is demoing via Expo Go with the dev server on Yousif's laptop hotspot — works, but only as plan B |
| Judges probe the fake model | Honesty policy in the pitch (section 9); S1 stretch makes it real if time allows |
| Detector accuracy questioned (if S1 ships) | Product thesis answer: detection is inherently unreliable, which is exactly why the app teaches manual verification |

---

## 14. Future roadmap (post-hackathon)

Phase 2: live detection via hosted models (Hugging Face → commercial APIs like Sightengine/Hive), OCR for screenshots, reverse image search integration. Phase 3: fact-checking API integration, multilingual assistant, achievement certificates. Phase 4: school and teacher dashboards, classroom assignments, institutional licensing — the revenue path Shahzaman's business plan develops.

---

## 15. Definition of done

The MVP is done when a judge, on the presentation phone, without help, can: sign up, scan an image and read a believable color-coded result, open the fact-checking guide from that result, finish one lesson and its quiz, and watch XP and a badge appear on their profile. Anything beyond that is bonus.
