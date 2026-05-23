# TODOS

## P3 — Extract archetypes array to `src/data/archetypes.ts`

**What:** Move the archetypes array (5 objects with title, desc, icon, img, colors) from `LandingHero.tsx` lines 22–72 to `src/data/archetypes.ts`.

**Why:** Enables reuse between landing page and onboarding flow (`InterviewForm`), and lets non-devs update copy without touching JSX.

**Context:** The archetype concept is also relevant to `InterviewForm.tsx` personalization. Once extracted, both components can share the same source of truth.

**Effort:** S (human: ~30min / CC: ~5min). Priority: P3.
