# Product

## Register

product

## Users
The target users of Atlas are teenagers, middle-to-high schoolchildren, and young aspiring environmentalists or civic creators (primarily ages 13 to 20). 
Their context when navigating the platform is exploration and learning — they are typically seeking to make a real-world difference but are easily overwhelmed by traditional codebase setups, heavy registration walls, raw JSON configuration dashboards, or intimidating command line logs.
Their key job to be done is to easily turn a creative "spark" (anything in the real world that bothers them or they feel passionate about fixing) into a live, shippable, shareable web impact piece (like a guest columns, interactive calculators, custom GIS map overlays, or public letter campaigns) while retaining total safety, simplicity, and agency through plan-then-approve steps.

## Product Purpose
Atlas is a kid-friendly micro-adventure pipeline platform that empowers teenagers to learn by doing. Instead of presenting passive quizzes or mock sandbox simulations, Atlas flips the scenario: it connects the specific real-world problems kids care about with a real web page they can build and launch onto the live web with a guided, step-by-step gate pipeline. Atlas exists to spark agency, self-efficacy, and a lifelong appreciation for digital creation. Success means a user discovers their spark, builds and approves their plan, launches their micro-adventure, and receives persistent live URLs and gold achievement medals they can proudly share with peers.

## Brand Personality
- **Warm**: Inviting, affectionate, and completely friendly.
- **Sparkling**: Energetic, encouraging, yet clean and elegant.
- **Whimsical**: Grounded in organic artistry rather than cold tech interfaces.
Three-word personality: *Warm, Whimsical, Sparkling*

## Anti-references
- **Cold Technical Terminals**: Avoid sterile grey-on-black command line interfaces, raw JSON configuration widgets, or developer jargon (e.g., bypass raw terminal setup without interactive context).
- **Generic Purply SaaS Portals**: Avoid clichéd, flat purple-to-blue vector gradients, dense feature grids, and rigid card templates that look like modern business tracking apps.
- **Infantile Educational Games**: Avoid noisy, childish cartoon-style characters or overstimulating flash elements that might feel condescending to teenagers (ages 13-20). We pair simple actions with prestigious, beautiful design of Claude Monet's painterly landscapes.

## Design Principles
1. **The Spark Over Forms (Onboarding Wizard)**: Frame onboarding as a premium, 5-step interactive conversational wizard rather than satisfying rigid technical questions or a single overwhelming form.
   - **No Abstract Terminology**: Avoid using abstract developer jargon like "What is your spark?" in the UI, as teenagers (ages 13–20) find it confusing. Instead, translate it into friendly, relatable framing like *"What is something in the real world that bugs you or that you want to fix?"* or *"What you care about"*.
   - **Interactive Suggestion Chips**: Use custom, clickable suggestion chips (e.g., Beach Plastic, Cafeteria Waste) to help students instantly pre-fill ideas and overcome blank-page anxiety.
   - **No Managed Agents**: Step 1 utilizes a lightweight, high-performance standard GenAI API call (`gemini-3.5-flash`) rather than establishing a complex, heavy remote Managed Agent.
   - **Dynamic Personalization**: Welcome students by name and provide customized feedback based on their age and selections to foster warmth and safety.
2. **Double-Vision Before Committing**: Retain total student agency by displaying precise visual previews (before/after buffers and golden drafts) at every step before executing changes.
3. **Prestigious-yet-Approachable**: Frame teenage creations with premium typographic pairings and elegant organic colors (inspired by Monet landscapes) so that their final shippable pieces look highly professional.
4. **Actionable Micro-steps**: Deconstruct complex Git, API, or writing operations into clear, bite-sized checklists with standard interactive touchpoints.

## Accessibility & Inclusion
- **Touch-Friendly Controls**: Ensure all interactive selectors and button layouts target a minimum height and width of 44px to prevent mechanical miss-taps.
- **Contrast Comfort**: Set text colors with deep contrast against background pages (using soft off-white canvas `#f7f5ee` paired with deep forest/slate charcoals) to comfort eye strain.
- **Reduced Motion Safety**: All animations are implemented with smooth, spring-driven curves and safe transitions rather than sudden flashing cuts. Fits safe guidelines for students.
