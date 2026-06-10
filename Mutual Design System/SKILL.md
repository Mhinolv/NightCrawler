---
name: mutual-design
description: Use this skill to generate well-branded interfaces and assets for Mutual, either for production or throwaway prototypes/mocks/etc. Mutual is a clean, inviting web app where two paired people answer the same get-to-know-you question and then reveal their answers. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

Key files:
- `README.md` — brand context, content voice, visual foundations, iconography, and a full index of the system.
- `colors_and_type.css` — all design tokens (color, type, spacing, radii, shadows, motion) plus semantic element styles. Link or copy this into anything you build.
- `assets/` — brand marks (`mark.svg`, `mark-ink.svg`, `mark-reverse.svg`).
- `preview/` — token & component specimen cards.
- `ui_kits/web-app/` — interactive, high-fidelity recreation of the product with reusable JSX components.

Remember the essentials: warm ivory canvas, warm-ink text, **coral = "you" / teal = "them"**, the question set large in **Newsreader** serif, all UI in **Hanken Grotesk**, small uppercase labels in **DM Mono**, soft radii and soft warm-tinted shadows, Lucide line icons, calm motion, no emoji.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
