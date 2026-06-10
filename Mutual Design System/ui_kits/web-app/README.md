# Mutual — Web App UI Kit

A high-fidelity, interactive recreation of the Mutual product: a calm space where **two paired people answer the same question**, then reveal their answers to each other.

> ⚠️ Original design, not a recreation of an existing product — there was no codebase or Figma to copy from. See the root `README.md` provenance note.

## Run it
Open `index.html`. It's a click-through prototype of the core loop:

**Home** (the day's question + history) → **Answer** (focused composer) → **Reveal** (both answers, side by side) → next question.

Try: *Write my answer* → type something → *Send answer* → see the reveal → *Next question* / *Shuffle*.

## Structure
- `index.html` — loads fonts, tokens (`../../colors_and_type.css`), `kit.css`, React + Babel + Lucide, then the component scripts.
- `kit.css` — layout & component styling on top of the shared design tokens.
- `primitives.jsx` — `Icon` (Lucide wrapper), `Button`, `IconButton`, `Avatar`, `PairAvatars`, `Badge`, `Chip`.
- `TopBar.jsx` — sticky translucent top bar with brand + paired avatars.
- `QuestionCard.jsx` — the signature hero card (question + partner status + actions).
- `AnswerComposer.jsx` — focused write screen with word count.
- `RevealPair.jsx` — both answers, coral (you) over teal (them).
- `QuestionRow.jsx` — a past-question list row.
- `App.jsx` — sample data + the `home/answer/reveal` state machine.

## Conventions
- Components are cosmetic recreations, not production logic. State is local React state; nothing persists.
- All visuals come from the shared tokens — no hard-coded colors beyond what tokens express.
- Each `.jsx` attaches its components to `window` so the separate Babel scripts can share scope. Style objects (where used) are inline to avoid name collisions.
- Icons are Lucide via CDN, hydrated by the `Icon` component.

## Coverage & gaps
Covered: top bar, hero question card, composer, reveal pair, history list, buttons, chips, badges, avatars, inputs.
Intentionally omitted (no source design to copy): onboarding/pairing flow, settings, auth, notifications panel. Add these from a real product spec rather than inventing them.
