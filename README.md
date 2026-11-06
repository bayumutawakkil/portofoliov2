# Bayu Mutawakkil — Portfolio

A static-first personal portfolio built with Astro, Tailwind CSS, GSAP, ScrollTrigger, Lenis, and SplitType.

## Requirements
- Node.js 20.3+ (recommended)
- npm

## Run locally
```bash
npm install
npm run dev
```

Open the local URL printed by Astro (usually http://localhost:4321).

## Production build
```bash
npm run build
npm run preview
```

## Customize your content
1. Edit `src/data/site.ts` to update profile, capabilities, and experience metadata.
2. Add or edit Markdown case studies in `src/content/projects/`. The schema is defined in `src/content/config.ts`.
3. Edit `src/pages/index.astro` and the components in `src/components/sections/` to change the narrative.
4. Edit `src/styles/global.css` for visual tokens, responsive rules, and component styling.
5. Edit `tailwind.config.mjs` if you want to extend the utility palette.

## Notes
- The project uses Astro components, native routing, and content collections without a React runtime.
- Project detail pages are generated at `/projects/[slug]/` from Markdown content.
- GSAP, Lenis, and SplitType are initialized in `src/scripts/main.ts` on Astro page-load and cleaned up before view transitions.
- The project cards currently use CSS-built illustrative previews. Replace these with real screenshots when available.
- Replace the placeholder LinkedIn URL and public email before publishing.
- Project descriptions are based on known project context; verify their public status and replace repository links with exact project URLs.
