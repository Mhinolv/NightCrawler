# Mutual — Design System

> A clean, inviting web app where **two people answer the same get-to-know-you question.** One question at a time fills the screen; both people write an answer, then reveal each other's. The product is about closeness, curiosity, and unhurried conversation.

---

## ⚠️ Provenance — read this first

This design system was created **from a written brief, not from an existing product.** No codebase, Figma file, screenshots, or brand assets were provided. "Mutual" — the name, logo, palette, type, voice, and UI — is an **original brand direction** invented to fit the brief:

> *"Clean and modern web app, used to populate questions that allow people to get to know each other. The page populates a single question that two people must answer. The palette should be clean and inviting."*

**There are no external sources** (no Figma links, GitHub repos, or codebase paths) to record. If you have an existing product or brand for this, share it and this system should be re-derived from the real source of truth. Until then, treat everything here as a considered first proposal, not a recreation.

---

## The product, in one screen

The hero of every screen is **the question**, set large in a warm serif. Two people are paired (a couple, two friends, two new matches). Each day or week a question appears. You answer privately; when both have answered, the answers reveal side-by-side. The whole experience is calm, generous with whitespace, and emotionally warm — never gamified or loud.

### The signature idea: two people, two colors
The core brand decision is a **two-person color system**:
- **Coral** = *you* (your answers, your actions)
- **Teal** = *them* (the other person's answers, their presence)

This pairing runs through everything — avatars, answer bubbles, status pills, the logo itself (two overlapping circles whose intersection is the shared question).

---

## CONTENT FUNDAMENTALS — how Mutual writes

The voice is **warm, plain-spoken, and unhurried** — like a thoughtful friend, never a brand mascot or a therapist.

- **Person:** Second person, intimate. "Your answer," "What would *you* keep?" The other person is always referred to **by name** ("Alex answered," "Waiting on Sam") — never "your partner" or "user 2." Names make it personal.
- **Tone:** Curious and gentle. Invites rather than instructs: "Say as much or as little as you like" beats "Enter your response." Questions are open and a little poetic, never clinical.
- **Casing:** Sentence case everywhere in UI ("Write my answer," not "Write My Answer"). The only uppercase is the **DM Mono micro-labels** (kickers, status badges: `BOTH ANSWERED`, `QUESTION 14`).
- **Length:** Short. Buttons are 1–3 words ("Answer now," "Shuffle," "Reveal"). Helper text is one calm sentence.
- **Punctuation:** Real typography — curly quotes, em dashes, the occasional ellipsis to soften. Questions end in a question mark; UI rarely uses exclamation points (warmth comes from word choice, not punctuation).
- **Emoji:** **Not used in the interface.** A single category star (★) is the only decorative glyph. Warmth is carried by color, type, and space — not emoji.
- **The questions themselves** are the brand's literary core: concrete, sensory, emotionally open. Examples:
  - "What's a small thing that instantly makes your day better?"
  - "If you could keep only one memory forever, which would you choose?"
  - "When did you last feel completely at ease?"
  - "What's something you've changed your mind about lately?"

  Avoid yes/no questions, trivia, and anything that could be answered in one word.

---

## VISUAL FOUNDATIONS

**Overall vibe:** Soft editorial warmth. Think a beautifully set print magazine that happens to be an app — warm paper, a serif headline, lots of air, one confident accent color.

### Color
- **Warm ivory base** (`#FBF8F3`), never stark white as the canvas. Cards and inputs are pure white and float on the ivory.
- **Warm ink** (`#2A2622`) for text — never pure black. Secondary/tertiary inks are warm taupes, not cold grays.
- **Coral** (`#EE6E4F`) is the single dominant accent — actions, brand, "you." **Teal** (`#2F8079`) is the partner color — "them," secondary accents. Used in roughly an 80/20 split; coral leads.
- Tinted soft fills (`coral-soft`, `teal-soft`) back answer bubbles and pills. Gold appears only for "weekly/special" highlights and match moments.

### Typography
- **Newsreader** (serif) — the **questions** and rare editorial display moments. Regular + Italic; italic in coral for emphasis. This is what makes Mutual feel intimate.
- **Hanken Grotesk** (sans) — all interface and body text. Friendly humanist grotesque, weights 400–700.
- **DM Mono** — small uppercase kickers, status badges, timers, counts. Adds a quiet "system" texture.
- See `colors_and_type.css` for the full scale and semantic tokens.

### Spacing & layout
- **4pt base grid.** Generous — screens breathe. The question is given the most room of anything.
- Content is **centered and column-constrained** (the question card maxes ~560–620px) so reading line-length stays comfortable. The app is single-focus: one question, one task, no dense dashboards.
- Layout rule: never crowd the question. White space around it is load-bearing.

### Shape, border, elevation
- **Soft, generous corner radii** — inputs/cards 14–20px, the hero question card 28px, buttons and avatars fully pill (999px). Nothing sharp.
- **Hairline borders** in warm `--line` (`#ECE4D8`); inputs use a slightly stronger 1.5px warm border.
- **Shadows are soft and warm-tinted** (brown-based rgba, not gray), low and diffuse — cards lift gently off the paper. The primary button carries a coral-tinted shadow. No harsh or large-spread shadows.
- Cards = white surface + 20–28px radius + soft `shadow-md`, usually borderless (the shadow does the lifting). Lightweight list rows use a hairline border instead of a shadow.

### Backgrounds
- Mostly flat warm ivory. **No photographic backgrounds, no busy patterns.** Optional barely-there warmth: a very soft radial wash of `coral-soft`/`teal-soft` behind the hero, or a faint paper grain — always subtle, never a loud gradient. Avoid bluish-purple gradients entirely.

### Motion
- Calm and soft. Default `--ease-soft` / `--ease-out`, durations 140–420ms. Content **fades and rises** a few px on entry; answers reveal with a gentle stagger. One playful `--ease-spring` allowed on the "reveal" moment (a small settle). **No bounces on routine UI, no infinite loops, no parallax.** Respect `prefers-reduced-motion`.

### States
- **Hover:** primary buttons darken (coral → coral-deep); secondary/ghost get a faint paper-2 fill. Cards may lift one shadow step.
- **Press:** slight scale-down (~0.97) and drop the shadow — a soft physical "press."
- **Focus:** 3px soft coral focus ring (`--ring-focus`) plus a coral border. Always visible for keyboard users.
- **Disabled:** paper-2 fill, ink-4 text, no shadow.

### Transparency & blur
- Used sparingly: a translucent white + backdrop-blur on the sticky top bar and on the answer-reveal scrim. Tinted soft fills are solid, not transparent.

---

## ICONOGRAPHY

- **Library:** [Lucide](https://lucide.dev) — clean, open-source line icons. Loaded from CDN (`https://unpkg.com/lucide@latest`). This is a **substitution**: with no existing product there is no proprietary icon set, and Lucide's rounded, even-stroke style matches the friendly-modern aesthetic. Swap for a bespoke set later if desired.
- **Style rules:** line icons only, **never filled**. Stroke `1.75px`, rounded caps/joins. Icon color follows text ink; accent colors only when an icon *is* the action (e.g. a coral send button).
- **Sizing:** 20px inline, 24–26px standalone, paired with DM Mono labels where labelled.
- **Common icons:** `messages-square`, `heart-handshake`, `shuffle`, `sparkles`, `users-round`, `calendar-heart`, `bell`, `send-horizontal`.
- **Emoji:** not used in UI. **Unicode glyphs:** only the category star `★`.
- **Brand mark** is bespoke (see `assets/`), not an icon — don't substitute a Lucide glyph for the logo.

---

## INDEX — what's in this system

**Foundations (root)**
- `colors_and_type.css` — all design tokens: color, type families + scale, spacing, radii, shadows, motion, plus semantic element styles (`.mutual` scope).
- `README.md` — this file.
- `SKILL.md` — lets this folder run as a downloadable Claude Agent Skill.

**`assets/`** — brand marks
- `mark.svg` — primary two-circle mark (coral + teal, deep-teal intersection)
- `mark-ink.svg` — single-ink outline mark (light backgrounds)
- `mark-reverse.svg` — ivory outline mark (dark / coral backgrounds)

**`preview/`** — Design System tab cards (specimens & tokens)
- Colors: `colors-neutrals`, `colors-brand`, `colors-support`
- Type: `type-question`, `type-scale`, `type-families`
- Spacing: `spacing-radii`, `spacing-shadows`, `spacing-scale`
- Components: `comp-buttons`, `comp-inputs`, `comp-question-card`, `comp-answers`, `comp-chips`
- Brand: `brand-logo`, `brand-iconography`

**`ui_kits/web-app/`** — high-fidelity, interactive recreation of the product
- `index.html` — click-through prototype (paired home → answer → reveal)
- `README.md` — kit overview + component list
- JSX components — `TopBar`, `QuestionCard`, `AnswerComposer`, `RevealPair`, `QuestionRow`, `Button`, `Avatar`, etc.

---

*Mutual is a proposal. Tell me where the voice or visuals miss, and I'll iterate.*
