# Chronis — AI Memory Companion (Web App)

## Idea
Chronis is a wearable pendant that continuously observes a person's life and builds an
evolving picture of their memory over time. This web app is the companion interface —
onboarding, dashboard, timeline, and settings — designed around one core idea:

**People are trusting this app with private moments of their life, so every screen has
to earn that trust honestly — never by hiding what the product actually does.**

## Tech Stack
- **React + TypeScript** — core framework
- **TanStack Start** — full-stack routing + SSR (via Nitro)
- **Tailwind CSS v4** — styling, using design tokens instead of scattered values
- **ShadCN UI** — base component primitives
- **Framer Motion** — animations and scroll-driven transitions
- **Lucide Icons** — single icon library, used consistently app-wide

## Architecture
- **File-based routing** (`src/routes`) — one file per screen (index, sign-up, pairing,
  vault, mode, dashboard, timeline, settings)
- **Component-driven UI** — shared, reusable pieces (`StatusIndicator`, cards, buttons)
  instead of one-off styling per page
- **Centralized design tokens** in `styles.css`, mapped through Tailwind's `@theme` —
  colors, spacing, radius, and typography are all defined once and reused everywhere,
  not hardcoded per component
- **Landing hero** (`ChronisHero.tsx`) — a self-contained, scroll-driven video section
  that sits in front of the onboarding flow, with fallbacks for mobile and
  reduced-motion users

## Design System / Theme
- **White, premium, minimal** — clean layout, generous white space, soft shadows
- **Color palette** — one neutral gray scale, one primary brand color, and three
  semantic colors (green = active/success, amber = attention, red = error/off)
- **Typography** — one consistent scale (hero, H1, H2, H3, body, small/meta), no ad-hoc
  font sizes
- **Shape language** — buttons use 8px radius, cards/inputs use 12px radius, applied
  consistently everywhere
- **Alignment rule** — marketing/hero content is centered; in-product screens
  (dashboard, settings, timeline) are left-aligned, since that reads more like a real
  product and less like a landing page
- **No emoji, no vague marketing language** — copy is specific and honest (e.g. real
  numbers, real consequences of a setting) instead of generic reassurance

## Key Improvements Made
- Replaced inconsistent border-radius and spacing values with a single token system
- Added a persistent **Status Indicator** (capture state, last synced) in the header,
  so device/privacy status is always visible, not buried in settings
- Fixed the hero video from looking like a "boxed" video (letterboxing, visible
  vignette) to a full-bleed ambient background using `object-fit: cover`, corner
  correction, and subtle mouse parallax
- Fixed scroll stutter by re-encoding the hero video with all-keyframes, and moving
  scroll tracking off React state and into Framer Motion's scroll values (avoids
  unnecessary re-renders)
- Audited sensitive toggles (audio, motion, location capture) so turning any of them
  off always shows a plain-language explanation of what changes, instead of a silent
  one-tap switch

## Status
Onboarding flow (Welcome → Sign Up → Device Pairing → Vault Setup → Mode Selection) and
in-product screens (Dashboard, Timeline, Settings) are complete and using the shared
design system described above.