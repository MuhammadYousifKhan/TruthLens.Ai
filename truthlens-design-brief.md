# TruthLens AI — Design Brief for a Visual Redesign

**For:** a design pass by Claude (or any designer) that will be handed back to engineering and implemented in React Native / Expo.
**From:** the existing codebase, audited in full on 15 Aug 2026.
**Repo:** `d:\TruthLens.Ai` · branch `feature/report-card` · Expo SDK 57, React Native 0.86, React 19.2, TypeScript.

> **Read this section first if you read nothing else.** The app today is **dark-mode-only by architecture**, not by palette. `src/theme/theme.ts` exports a plain frozen object of hex strings that is imported at module scope into 26 separate `StyleSheet.create()` calls. Those styles are evaluated **once, at import time**, so no colour in this app can currently change at runtime. Adding light mode is therefore **not a palette swap — it is a token-architecture change.** The single most valuable thing this design pass can produce is a **semantic token set with two palettes bound to it**, delivered in a shape that can be moved to a runtime theme hook. Everything else in this brief is secondary to that.

---

## 1. What the product is

TruthLens AI is a media-and-information-literacy (MIL) mobile app for young people, built for the **UNESCO Global Youth Hackathon 2026** (submission deadline 16 Aug 2026 — a written proposal plus a ≤3-minute pitch video; **no judge ever installs the app**).

The thesis: **AI detection is unreliable, so every detection result must be paired with education.** The app never claims certainty. It gives a probability *band*, tells you what to look at with your own eyes, walks you through verifying it yourself, and makes you pause before you share.

Core loop: **Scan → honest verdict → learn the tells → verify interactively → pause before sharing.**
Supporting loops: a *Spot the Fake* training game, six lessons with quizzes, XP/badges rewarded for *verification behaviour* (not screen time), a deepfake first-response support flow, and a shareable "my MIL habits" report card.

**Localisation:** English and **Urdu**, switchable at runtime, persisted to AsyncStorage.

### What this means for design

Three things follow from the hackathon context and should steer every decision:

1. **The app's real deliverable is footage.** It is filmed at phone resolution and screenshotted into a PDF proposal. **Legibility at video scale beats density.** Big type, one idea per screen, one obvious primary action.
2. **Calm authority, not alarm.** The product's whole ethical stance is "don't be paranoid, be careful." A design that shouts red at people undermines the pedagogy. The `uncertain` band is deliberately **amber, not red** — uncertainty is a real answer here, not a failure state.
3. **It must not look like a hackathon prototype.** Judges score "clarity of presentation." Premium finish is worth real points.

---

## 2. Current design system — full inventory

The existing system is genuinely good and **should be evolved, not discarded**. It is centralised, well-commented, accessibility-aware, and every screen already routes through it. Your redesign should keep the same *component API surface* wherever possible so implementation is a token-and-style change rather than a rewrite.

### 2.1 The design direction as it stands

Named in the code as **"deep aurora dark"**: a near-black navy ground with three slowly drifting low-alpha colour blobs behind frosted-glass surfaces. The rationale, quoted from `theme.ts`:

> *"Glass only reads as glass when what sits behind it has colour and movement, so the background is part of the system, not decoration bolted on top."*

That principle is correct and should survive into the redesign — **including into light mode**, which is the hard part (see §5.1).

### 2.2 Tokens — `src/theme/theme.ts`

**Ground**
| Token | Value | Role |
|---|---|---|
| `background` | `#070B18` | true base |
| `backgroundDeep` | `#04060F` | top of the aurora gradient |
| `backgroundLift` | `#0C1226` | warmer bottom of the gradient |

**Aurora wash** (three drifting blobs, ~14s cycle, built from 6 concentric rings at 3–6% alpha each — no GPU blur)
| Token | Value |
|---|---|
| `auroraCyan` | `rgba(74, 222, 222, 0.20)` |
| `auroraViolet` | `rgba(139, 123, 255, 0.22)` |
| `auroraDeep` | `rgba(30, 41, 99, 0.35)` |

**Glass surfaces**
| Token | Value | Role |
|---|---|---|
| `glass` | `rgba(255,255,255,0.06)` | default card fill |
| `glassStrong` | `rgba(255,255,255,0.10)` | separates from busy backdrop |
| `glassSunken` | `rgba(4,6,15,0.45)` | inputs, meter tracks — recedes |
| `glassBorder` | `rgba(255,255,255,0.12)` | hairline edge |
| `glassBorderStrong` | `rgba(255,255,255,0.20)` | emphasised edge |
| `glassHighlight` | `rgba(255,255,255,0.28)` | 1px top catch-light |

> The code's own note: *"That highlight — not the blur — is what actually reads as 'glass'."* Worth preserving.

**Text** (contrast ratios measured against `background`)
| Token | Value | Ratio |
|---|---|---|
| `text` | `#F2F5FF` | 18.6:1 |
| `textMuted` | `#94A0C0` | 7.5:1 |
| `textFaint` | `#6B779A` | 4.6:1 — captions only |
| `placeholder` | `#5A648A` | — |

**Accents**
| Token | Value | Ratio | Meaning |
|---|---|---|---|
| `primary` | `#4ADEDE` cyan | 12.0:1 | verify / scan / the product |
| `primaryDeep` | `#2BB8B8` | — | gradient end |
| `secondary` | `#8B7BFF` violet | 6.0:1 | learn / lessons |
| `onPrimary` | `#06131A` | 11.5:1 on primary | text on filled cyan |
| `onSecondary` | `#0B0720` | — | text on filled violet |

**Status** — *never used alone to carry meaning; always paired with a label and usually an icon*
| Token | Value | Ratio | Used for |
|---|---|---|---|
| `success` | `#5AE6A8` | 12.4:1 | likely authentic, completed, correct |
| `warning` | `#FFB347` | 11.0:1 | uncertain, pause, badges |
| `danger` | `#FF6B81` | 7.2:1 | likely AI, deepfake, destructive |
| `info` | `#7FB0FF` | — | confidence pill |
| Each also has a `…Soft` variant at 0.14 alpha. |

**Scale**
- `spacing` — 4px base: `xs 4 · sm 8 · md 12 · lg 16 · xl 24 · xxl 32 · xxxl 48`
- `radius` — `pill 999 · input 14 · card 20 · hero 24 · sheet 28`
- `fontSize` — ~1.25 ratio: `micro 11 · caption 13 · body 15 · subtitle 16 · title 20 · heading 25 · display 31 · hero 38`
- `letterSpacing` — tightens as size grows: `hero -1.2 · display -0.8 · heading -0.5 · title -0.3 · body 0 · label 0.4 · overline 1.6`
- `lineHeight` — `hero 42 · display 36 · heading 30 · title 26 · subtitle 23 · body 22 · caption 18`
- `motion` — `instant 120 · fast 180 · base 280 · slow 420 · page 520 · ambient 14000 · stagger 55` (ms)
- `touchTarget.minHeight` — `48` (exceeds the 44px WCAG floor)
- `blur` — `subtle 18 · standard 32 · heavy 56`

### 2.3 Component kit — `src/components/`

Barrel-exported from `src/components/index.ts`. Screens import **only** from here.

| Component | File | What it does |
|---|---|---|
| `Screen` | `Screen.tsx` | Shell for every screen. Renders `AuroraBackground`, reserves the transparent-header inset, optional scroll / padding / centring / keyboard-avoidance. Caps content at **480px** and centres it on wide viewports. |
| `AuroraBackground` | `AuroraBackground.tsx` | The animated ground. Vertical gradient + 3 drifting ring-built blobs. Respects reduce-motion. |
| `GlassCard` | `Glass.tsx` | Default surface. Layered translucent fill, 1px border, top catch-light. No GPU cost — safe to use dozens of times. Props: `tone: default\|strong\|sunken`, `radius`, `highlight`, `accent`. |
| `BlurCard` | `Glass.tsx` | Real backdrop blur via `expo-blur`, **iOS and web only** — falls back to `GlassCard` on Android. Reserved for ~4 hero surfaces. |
| `PrimaryButton` | `Buttons.tsx` | Filled cyan gradient + the app's only glow. Icon (leading or trailing), loading, disabled, `tone` override. |
| `SecondaryButton` | `Buttons.tsx` | Glass fill + strong border. Equal-weight alternative. |
| `GhostButton` | `Buttons.tsx` | Text + optional icon. Lowest weight. |
| `PressScale` | `Buttons.tsx` | Wraps any surface with a 120ms spring-scale press response (`scaleTo`, default 0.97). |
| `GlassInput` | `Input.tsx` | Sunken text field. Cyan border + glow on focus. Error state with icon. Font pinned at 16 to stop iOS focus-zoom. |
| `Pill` | `Indicators.tsx` | Small tinted capsule, optional icon. Always carries a label. |
| `Meter` | `Indicators.tsx` | Horizontal fill bar. Sunken track, solid fill, optional animate-in. Used for probability, quiz/game progress, XP, the pause cool-down. |
| `SectionLabel` | `Indicators.tsx` | Overline kicker + a 1px rule that fills the remaining width. |
| `FadeIn` | `Motion.tsx` | Entrance: fade + 14px rise, `motion.base` (280ms), ease-out cubic. `delay` staggers lists. Collapses to plain fade under reduce-motion. |
| `Pulse` | `Motion.tsx` | 4% scale breathing loop over 1.6s for "working" states. |
| `LanguageToggle` | `LanguageToggle.tsx` | Segmented EN/UR pill. |
| `ProfileHeaderMenu` | `ProfileHeaderMenu.tsx` | Avatar button in the Dashboard header → `Modal` popover with Profile / Language / Log out. |
| `useReducedMotion` | `useReducedMotion.ts` | Reads OS reduce-motion, live-updating. **Every** animation in the app checks it. |

**Typography components** — `Typography.tsx` exports `Hero · Display · Heading · Title · Subtitle · Body · BodyStrong · Caption · Overline`. Each locks size + weight + tracking + line-height together. Props: `color`, `muted`, `center`. Screens use these instead of raw `<Text>`.

**Icons:** `@expo/vector-icons` → `MaterialIcons` only. No custom icon set, no SVG library.

**Fonts:** **none.** There is no `expo-font` dependency and no `fontFamily` anywhere. Everything renders in the platform system font (SF Pro on iOS, Roboto on Android). Weights used: 400, 600, 700, 800.

---

## 3. Screen inventory

18 screens, all in `src/screens/`. Navigation is a single native stack (`src/navigation/RootNavigator.tsx`) with **transparent headers app-wide** so the aurora runs edge-to-edge and content scrolls underneath.

| # | Screen | Route | Anatomy | Notes for redesign |
|---|---|---|---|---|
| 1 | **Splash** | outside navigator | Lens mark in a 116px glass circle with a rotating lit-quadrant ring; wordmark "TruthLens AI"; tagline "Think before you share". Holds ~1.5s. | Renders outside the navigator — composes `AuroraBackground` directly. First frame anyone sees on video. |
| 2 | **Login** | `Login` | Language toggle → brand row (icon chip + "TruthLens AI") → lede → `BlurCard` with 2–3 `GlassInput`s, error row, `PrimaryButton`, `GhostButton` mode toggle. | Login/signup share one screen via a `mode` state. Centred, keyboard-avoiding. |
| 3 | **Dashboard** | `Dashboard` | Greeting + XP pill → **big filled cyan Scan card** (the one strongest action) → amber "Pause before you share" row card → `SectionLabel` → 2-col grid of 5 glass cards (Learn/Quiz/Game/Achievements/DeepfakeHelp), each with a tinted icon chip. | Each destination owns a hue so the grid is scannable by colour. Header carries `ProfileHeaderMenu`. |
| 4 | **Scan** | `Scan` | Empty state: prompt + lede + **dashed-border** glass dropzone with a 68px icon circle. Filled state: 1:1 image preview with hairline edge + `PrimaryButton` + `GhostButton`. | The dashed border is the one place a border does semantic work — "a slot waiting to be filled". |
| 5 | **Analyzing** | `Analyzing` | Square image preview, dimmed, with a **cyan scan line sweeping vertically** (1.6s each way) → heading → 3-stage checklist card (done ✓ / active spinner / waiting ○). | Fades in from Scan rather than pushing. Named stages beat a spinner. |
| 6 | **Result** | `Result` | **Hero `BlurCard`**: thumbnail + verdict icon + short label + big coloured headline, `Meter`, three `Pill`s (estimate % / confidence / model-or-offline) → **sunken disclaimer card** ("estimate, not proof") → "What to look at" numbered tells card → "Signals" dotted list → "What this means" prose card → conditional red deepfake CTA (if ≥55%) → Primary "Learn how to verify" / Secondary "Share" / Ghost "Scan another". | **The most important screen in the app.** Three verdict bands: ≥55 danger "Likely AI-generated"; 35–54 **warning** "Uncertain"; <35 success "Likely authentic". Verdict never rides on colour alone — icon + words + colour together. |
| 7 | **Guide** | `Guide` | Progress row + `Meter` → 5 checklist cards, each a glass card with a 24px rounded checkbox that turns green when checked; card 2 carries TinEye/Google-Lens pill buttons, card 4 carries fact-check-source pill buttons → `PrimaryButton` continue. | Interactive verification checklist tied to the scanned image. Completing all five awards XP. |
| 8 | **Pause** | `Pause` | Amber icon chip → heading → lede → 3 checkbox glass cards (amber accent) → **`PrimaryButton` "I'll verify first"** → cool-down `Meter` filling for 2.5s → `SecondaryButton` "Share anyway" (disabled until it fills). | The signature feature. **Friction by design** — the visual hierarchy must make verifying feel like the primary path and sharing feel like the reluctant one. Slides up from the bottom like a sheet. |
| 9 | **Game** | `Game` | Progress row + streak pill + `Meter` → 1:1 image → two equal-weight glass "Real" / "AI" buttons → on answer, a reveal card (green/red accent, icon, verdict, the *tell* in body weight) + Next button. Finish state: hero `BlurCard` with score, meter, best-streak pill. | "Spot the Fake". The best 15 seconds of the pitch video — **the reveal needs to feel satisfying.** Two choices are deliberately equal-weight so neither is nudged; colour only arrives at the reveal. |
| 10 | **DeepfakeHelp** | `DeepfakeHelp` | Red shield chip + intro + reassurance line → numbered glass step cards with optional "open in browser" pill buttons. | **Deliberately the calmest screen in the app** — no glow, no accent fills, red only on the framing chip. Whoever opens this is distressed. Do not make it alarming. |
| 11 | **LearnHub** | `Learn` | Hero `BlurCard` with "N of 6 lessons" + violet `Meter` → `SectionLabel` → 6 lesson rows (check-circle / empty-circle, title, status caption, chevron). | Violet is the learn hue throughout. |
| 12 | **LessonDetail** | `LessonDetail` | Violet kicker chip + "Lesson" → heading → generous-padding reading card (line-height 25, looser than default) → "Take the quiz". | The one place in the app with sustained reading rather than scanning. |
| 13 | **Quiz** | `Quiz` | Progress row + violet `Meter` → question `Title` → option cards that reveal green/red with icons on answer → Next button appears. | Back gesture disabled. Each question is keyed so it animates in fresh. |
| 14 | **QuizResult** | `QuizResult` | Hero `BlurCard`: 64px badge chip, `Hero`-size score, verdict `Title`, `Meter`, XP pill → Primary "Back to lessons" / Ghost "Retake". | Fail is framed "Not quite — try again" in **amber, not red**. Habits survive missed attempts. |
| 15 | **Achievements** | `Achievements` | Hero `BlurCard` summary + amber `Meter` → 2-col grid of 5 badge cards; locked ones show a **padlock**, not a dimmed trophy. | State is stated, not implied by opacity alone. |
| 16 | **Profile** | `Profile` | Avatar + name/email → language toggle → 2 stat `BlurCard`s (XP, lessons) → "Verification habits" card with a sentence → quiz-score list → badge strip → "Share my MIL habits" / outlined-danger "Log out". | **Note: this screen is not localised** — strings are hardcoded English. |
| 17 | **ReportCard** | `ReportCard` | An **opaque** gradient card: brand row, "{name}'s MIL habits", 3 stat tiles, earned-badge pills, italic tagline → "Share my habits" (captures + opens share sheet). | ⚠️ **Must stay opaque.** `react-native-view-shot` captures the view in isolation — translucent glass captures black and a `BlurView` captures blank. This card paints its own gradient ground and carries its own branding because it lands in someone else's feed with no app around it. |
| 18 | **Placeholder** | — | "Screen not built yet" card. | Unused scaffolding. |

---

## 4. What we want from this redesign

**Direction, in the user's words:** *premium, minimal, dark **and** light mode, rounded buttons, translucent cards and buttons, modern design with modern text.*

Expanded into a brief:

### 4.1 Premium
Restraint, not ornament. Every effect should have a physical justification the way the current glass system does (the catch-light exists because a lit edge faces the light source; the glow exists because the CTA emits light rather than casting a shadow). Depth should come from **light, translucency and material** — never from generic grey drop shadows. Consistency across all 18 screens matters more than any single flourish.

### 4.2 Minimal
One idea per screen, one primary action per screen. Dial down decoration, dial up whitespace and type hierarchy. The current screens already follow this — protect it. If anything, the Result screen (six stacked sections) and Profile (seven) are the two most at risk of feeling like a dump; look for hierarchy fixes there.

### 4.3 Dark **and** light mode — the central deliverable
See §5.1 for the hard problem. What we need is:
- A **semantic token set** — names that describe *role*, not appearance (`surface.raised`, `text.secondary`, `accent.verify`), so one name resolves to different values per mode.
- **Both palettes**, complete, with **measured contrast ratios** for every text-on-surface pair. AA minimum (4.5:1 body, 3:1 large).
- An explicit answer for **how translucency works on a light ground** — this is where most dual-mode glass designs fall apart.
- Guidance on the **aurora in light mode**: does it stay (tinted, softer), get replaced (a warm neutral gradient? a mesh?), or drop out?

### 4.4 Rounded
Already largely there (`pill 999 / input 14 / card 20 / hero 24 / sheet 28`). If you want a rounder, softer feel, propose a revised radius scale — and note that **buttons currently use `radius.input` (14)**, so "rounded buttons" likely means moving them toward pill or a larger corner. Say which, explicitly.

### 4.5 Translucent cards *and* buttons
Cards already are. **Buttons are the gap:** `PrimaryButton` is a solid cyan gradient. Making it translucent while keeping it unmistakably the strongest action on screen — and keeping `onPrimary` text above 4.5:1 over a *moving, variable* backdrop — is a real design problem. Solve it explicitly. (A tinted-glass fill with a saturated border and an inner glow is one avenue; a translucent fill over a guaranteed-opacity scrim is another.)

### 4.6 Modern text
Currently **100% system fonts**. Adding a typeface is the single highest-leverage move available for "premium" and "modern". If you recommend one:
- It must be **self-hostable and bundled** (loaded via `expo-font` from `assets/fonts/`) — no CDN, no network fetch at runtime.
- Licence must permit app embedding (SIL OFL is ideal).
- Needs the weights the scale uses: **400, 600, 700, 800** (or a variable font).
- **Must have Urdu / Arabic-script coverage, or you must nominate a paired fallback for `ur`.** Urdu in the system font is currently legible but plain; Noto Nastaliq Urdu or Noto Naskh Arabic are the usual answers, and Nastaliq needs *significantly* more line-height than Latin. Specify per-language line-height overrides if so.
- Give a revised type scale with the chosen family's optical sizes and tracking.

---

## 5. Hard constraints — please design within these

These come from the platform and the existing code. Violating them means the design cannot be built.

### 5.1 ⚠️ Translucency on a light ground — the hard problem

Read §top again. Beyond the token architecture, the *visual* problem: the entire glass system is built on **white at low alpha over a dark ground**. That inverts badly. `rgba(255,255,255,0.06)` over a light background is invisible.

The naive fix — black at low alpha over white — produces a grey, muddy, cheap-looking surface. This is the single most common failure mode in dual-mode glass systems and the thing we most need you to solve properly. Please give an explicit, opinionated answer covering:
- What the **light-mode ground** is (pure white is almost certainly wrong — glass needs something with colour and gradation behind it).
- What the **light-mode card fill** is (a tinted white at *higher* alpha? A colour-shifted translucency? A subtle inner shadow to replace the catch-light?).
- What replaces the **top catch-light**, which is the cue that sells glass in dark mode and does nothing on light.
- What happens to **borders** — the 12%/20% white hairlines have no light-mode equivalent that reads the same way.
- Whether the **aurora** stays, and in what form.

### 5.2 Blur is not available everywhere
`expo-blur` gives real backdrop blur on **iOS and web only**. On Android `BlurCard` silently falls back to `GlassCard` — real blur there needs `BlurTargetView` plumbing on every screen and drops frames on older hardware. **The design must look complete and premium with zero actual blur.** Treat blur as a progressive enhancement on ~4 hero surfaces, never as load-bearing.

### 5.3 No web CSS
This is React Native. There is no `backdrop-filter`, no `box-shadow` spread, no CSS gradients, no CSS filters, no `:hover` on mobile. Available: `LinearGradient` (expo-linear-gradient), layered `View`s with alpha, `borderWidth`/`borderColor`, iOS `shadow*` props, Android `elevation` (which is a fixed material shadow you cannot tint the same way), and `Animated`. Shadows behave *differently* on the two platforms — design so the layout survives either.

### 5.4 The ReportCard must be opaque
Screen 17 is captured by `react-native-view-shot`. Any translucency or `BlurView` inside it captures as black or blank. It needs its **own self-contained opaque treatment** in both modes — and it is the artefact that travels outside the app, so it carries the brand alone.

### 5.5 Accessibility is non-negotiable — and already met
The current system clears WCAG 2.1 AA throughout and the code comments cite the ratios. Do not regress this. Specifically:
- **4.5:1** body text, **3:1** large text, on the actual surface it sits on (remember: translucent fill over a *variable* aurora — verify against the worst-case backdrop, not the average).
- **48px** minimum touch target.
- **Status never rides on colour alone.** Every coloured pill carries a label; most carry an icon. Verdicts, quiz answers, badge lock states, and completion states all pair colour with an icon and words. Keep this.
- **Reduce-motion** is respected by every animation. Ambient loops stop; entrances collapse to a plain fade. Any new motion you specify must define its reduced-motion variant.

### 5.6 Bilingual EN / UR
Urdu strings run through the same components. Urdu text is typically **longer** than English and needs **more line-height**. Note that `LanguageContext` exposes `isRTL` but **the layouts do not currently mirror** — if your design depends on directional asymmetry, flag it, because that is unbuilt work.

### 5.7 Layout envelope
Portrait phone. Content column capped at **480px** and centred on wide viewports (tablet / web). Headers are transparent and content scrolls under them; every screen reserves its own top inset via `Screen`.

### 5.8 Icons
`MaterialIcons` only, unless you make an explicit case for adding a set. If you propose different icons, name them from a set that actually exists in `@expo/vector-icons`.

---

## 6. What to hand back

Deliver a **single markdown document** structured so an engineer can implement it file-by-file. Please include:

### 6.1 Design rationale
Short. The direction, the light-mode strategy, what changed from "deep aurora dark" and why. A designer's argument, not a mood board.

### 6.2 The token set — the core artefact
A **semantic** token table with **both** palettes side by side:

```
| Semantic name       | Role                        | Dark        | Light       | Contrast (on its surface) |
|---------------------|-----------------------------|-------------|-------------|---------------------------|
| surface.base        | app ground                  | #070B18     | ?           | —                         |
| surface.raised      | default card fill           | rgba(…)     | rgba(…)     | —                         |
| text.primary        | body and headings           | #F2F5FF     | ?           | 18.6:1 / ?                |
| accent.verify       | primary action, scan, cyan  | #4ADEDE     | ?           | 12.0:1 / ?                |
…
```

Cover every role currently in `theme.ts` §2.2 — ground, aurora, glass (fill/border/highlight/sunken), text (4 levels), accents + their `on*` pairs, and all four status colours + soft variants. **Include the measured ratio for every text pair in both modes.** Also give the revised `radius`, `fontSize`, `letterSpacing`, `lineHeight`, `spacing`, and `motion` scales — even where unchanged, so the file is complete.

### 6.3 Component specs
For each of the components in §2.3: what changes, in both modes. Fills, borders, radii, states (default / pressed / disabled / loading / focused / error / checked). **Keep the existing prop APIs** (`tone`, `accent`, `radius`, `highlight`, `scaleTo`, …) unless you have a reason to change one — say so if you do.

Give `PrimaryButton` extra attention per §4.5.

### 6.4 Typography
Chosen family (or an explicit "stay with system, here's why"), licence, weights, the full scale, the Urdu pairing and its line-height overrides, and how it loads (`expo-font`, `assets/fonts/`).

### 6.5 Screen-level notes
For each of the 18 screens in §3: what changes. Most will just inherit the tokens — **say so, briefly** — but call out the ones needing real attention. At minimum:
- **Result (6)** — the hero verdict card, the three bands, and how each band reads in both modes.
- **Pause (8)** — how the friction hierarchy holds when the primary button becomes translucent.
- **Game (9)** — the reveal moment.
- **DeepfakeHelp (10)** — staying calm in light mode, where "calm" is easier but "serious" is harder.
- **ReportCard (17)** — its self-contained opaque treatment, both modes.
- **Splash (1)** and **Dashboard (3)** — the two screens that open the pitch video.

### 6.6 Motion
Confirm or revise the timing scale. Specify any new motion **with its reduced-motion variant**. Note that the aurora's 14s ambient drift is deliberately below the threshold of notice — the code's stated goal is *"you should feel that the screen is alive without ever catching it moving."*

### 6.7 Implementation notes
A short section for the engineer:
- The shape of the runtime theme (a `ThemeProvider` + `useTheme()` returning the resolved palette is the obvious answer; note that **every `StyleSheet.create` that references a colour has to move inside the component or become a factory function** — 26 files).
- `app.json` `userInterfaceStyle` must go `"dark"` → `"automatic"`.
- `App.tsx` hardcodes `<StatusBar style="light" />` — must become mode-aware.
- `RootNavigator`'s `navigationTheme` is built from `DarkTheme` — needs both.
- `BlurCard` hardcodes `tint="dark"` — needs to follow the mode.
- Whether the user gets a **manual override** (system / light / dark) or system-only. If manual, it needs an AsyncStorage key alongside the existing `truthlens.language`, and a control — the Profile screen and `ProfileHeaderMenu` are the natural homes.

---

## 7. Things that are deliberate — please don't "fix" them

Each of these looks like an oversight and isn't:

- **Uncertain is amber, not red.** Uncertainty is a valid answer, not an error.
- **A failed quiz is amber and says "Not quite — try again."** Never red, never "Failed".
- **DeepfakeHelp has no glow and no accent fills.** Calm is the point.
- **The Game's Real/AI buttons are equal weight and uncoloured** until the reveal. Colouring them would nudge the guess.
- **The streak pill only appears once a streak exists.** An empty streak counter is a reminder of failure.
- **Locked badges show a padlock**, not a dimmed trophy. State is stated, not implied.
- **The Result disclaimer sits directly under the number**, not at the bottom. The caveat has to travel with the score.
- **The Pause cool-down is visible and finite.** A hidden delay reads as a bug; a visible meter reads as intent.
- **The dashed border on the Scan dropzone** marks a slot waiting to be filled — the one place a border does semantic work.
- **`Log out` is outlined danger, not filled.** Findable, never the easiest thing to hit.

---

## 8. Known gaps (context, not asks)

Not part of the design brief, but useful to know the codebase isn't uniform:
- **Profile, LearnHub, LessonDetail, Quiz, QuizResult, Achievements, and ReportCard have hardcoded English strings** — they never went through i18n. Localisation covers the core scan-to-verify flow only.
- `isRTL` is exposed but no layout mirrors on it.
- `PlaceholderScreen` is unused scaffolding.
- Firebase Storage upload is best-effort and degrades to a local URI, which disables the reverse-image-search buttons on the Guide screen (they render disabled with an explanatory caption — a real state the design must cover).

---

## 9. Quick reference — file map

```
src/
├── theme/theme.ts              ← all tokens. the primary target of this redesign
├── components/
│   ├── index.ts                ← barrel; screens import only from here
│   ├── Screen.tsx              ← shell: aurora + insets + 480px cap
│   ├── AuroraBackground.tsx    ← the animated ground
│   ├── Glass.tsx               ← GlassCard, BlurCard
│   ├── Buttons.tsx             ← Primary / Secondary / Ghost / PressScale
│   ├── Typography.tsx          ← Hero…Overline
│   ├── Indicators.tsx          ← Pill, Meter, SectionLabel
│   ├── Input.tsx               ← GlassInput
│   ├── Motion.tsx              ← FadeIn, Pulse
│   ├── LanguageToggle.tsx
│   ├── ProfileHeaderMenu.tsx
│   └── useReducedMotion.ts
├── screens/                    ← 18 screens, each with one StyleSheet.create
├── navigation/
│   ├── RootNavigator.tsx       ← transparent headers, navigationTheme
│   └── types.ts                ← RootStackParamList
├── i18n/                       ← LanguageContext + en.json / ur.json
├── data/                       ← lessons, quizzes, badges, game items, tells
├── firebase/                   ← auth, scans, quizResults, badges, actions
└── hooks/                      ← useUserProfile, useBadges, useQuizResults, …

App.tsx                         ← providers + hardcoded StatusBar
app.json                        ← userInterfaceStyle: "dark"
AGENTS.md                       ← ⚠️ "Expo HAS CHANGED — read docs.expo.dev/versions/v57.0.0/
                                   before writing any code"
```

---

*Brief compiled from a full read of the codebase, 15 Aug 2026.*
