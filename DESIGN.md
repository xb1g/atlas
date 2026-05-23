---
name: Claude Monet Impressionist Design System
description: Warm, whimsical, and painterly design language for kid-friendly micro-adventure platforms.
colors:
  neutral-bg: "#f7f5ee"
  primary: "#10b981"
  primary-deep: "#059669"
  sunset-warmth: "#fffaec"
  neutral-fg: "#022c22"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
  hand:
    fontFamily: "Caveat, cursive"
    fontSize: "1.25rem"
    fontWeight: 600
rounded:
  sm: "8px"
  md: "12px"
  lg: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
---

# Design System: Claude Monet Impressionist Design System

## 1. Overview

**Creative North Star: "The Painterly Sanctuary"**

The visual language of Atlas avoids high-tech cold terminals, sterile tech-corporate outlines, and childish vector noise. Instead, it is inspired by the soft, warm sunlight, gentle breeze, and painterly brushstrokes of Claude Monet's impressionist landscapes, specifically his cliffside sunrises. The canvas is antique paper tone (#f7f5ee) overlayed with light, luminous glass textures, warm sand accents, and shifting lavender and gold sunset glows that shimmer organically in the background.

This theme creates a safe, comfortable, prestigious yet completely approach-friendly "creative laboratory" for teenagers (ages 13 to 20). Spacing elements flow with a natural rhythm, combining standard mobile-friendly touch targets with spacious headings and cozy handwritten cursive annotations.

**Key Characteristics:**
- **Antique Canvas Paper Texture**: Replacing harsh white and dark gray panels with cozy, warm parchment and light-glassmorphic dropboards.
- **Atmospheric Golden-Hour Washes**: Using slow, ease-out-quint animated pastel light emitters to simulate warm breeze reflections.
- **Whimsical Organic Annotations**: Sprinkling informal handwritten details at margins to evoke manual craft and kid-friendly creativity.

## 2. Colors

Describe the palette character: A warm, eye-safe palette featuring organic foliage greens, soft beach amber, and atmospheric pastel glows.

### Primary
- **Foliage Emerald** (#10b981): Refers to nature, growth, and achievement. It is used as the key active token for success icons, checkmarks, progress bars, and high-impact action buttons.

### Neutral
- **Antique Canvas Paper** (#f7f5ee): The core ambient frame background. Comfortable for extended reading and completely eye-strain safe.
- **Deep Forest Slate** (#022c22): The default color for high-contrast slate text, geometric icons, and structured headings.
- **Glassmorphic Paper Lighter** (rgba(251, 249, 244, 0.45)): The soft backplate overlay representing premium glass sheets resting on the paper layer.

### Sunset Warmth
- **Sunset Sand Amber** (rgba(254, 249, 236, 0.9) / #fffaec): Soft glowing container backing for tips, warnings, and optional testing presets.

### Named Rules
**The Green Foliage Rule.** The primary emerald green is reserved strictly for positive actions, completions, active milestones, and success targets. It must never occupy more than 15% of any screen surface to preserve its significance and celebratory power.

## 3. Typography

**Display Font:** "Space Grotesk" (with sans-serif fallback)
**Body Font:** "Plus Jakarta Sans" paired with "Inter" (with system-ui fallback)
**Label/Mono Font:** "JetBrains Mono"
**Handwritten Cursive:** "Caveat"

**Character:** A pairing of precise geometric technicality with organic, soft human accents. 

### Hierarchy
- **Display** (weight: 600, size: 1.75rem, line-height: 1.2): Section tags, brand headers, and dialog introductions.
- **Headline** (weight: 500, size: 1.25rem, line-height: 1.3): Step titles, sidebar milestones, and card headers.
- **Body** (weight: 400, size: 0.875rem, line-height: 1.5, max-width: 70ch): Standard info cards, survey instructions, and narrative descriptions.
- **Label** (weight: 600, size: 0.75rem, letter-spacing: 0.05em, uppercase): Logging monitors, coordinate numbers, and quick-toggle identifiers.
- **Handwritten** (weight: 600, size: 1.25rem, font-family: "Caveat"): Whimsical marginal quotes and motivational annotations.

### Named Rules
**The Reading Limit Rule.** All informational prose blocks must strictly map to a maximum column width of 70 characters (70ch) to protect teenagers from cognitive overload.

## 4. Elevation

The Atlas platform uses layer depth instead of harsh shadows. Containers are styled as translucent paper panels resting flat on an organic canvas.

### Shadow Vocabulary
- **Paper Ambient Low** (`box-shadow: 0 4px 24px rgba(2, 44, 34, 0.05)`): A diffuse, very soft dark-green tint shadow simulating a flat card resting on cardboard sand.
- **Luminous Active Shimmer** (`box-shadow: 0 10px 30px rgba(16, 185, 129, 0.1)`): A soft emerald glow that envelopes cards and maps once completed or selected.

### Named Rules
**The Flat-At-Rest Rule.** All cards and selector surfaces are flat at rest. They raise slightly and acquire the soft green glow only in direct response to user interaction (hover, active focus).

## 5. Components

### Buttons
- **Shape:** Soft-curved corners (12px / rounded-xl)
- **Primary:** Forest green background (#10b981) paired with white text, with generous touch areas (minimum height of 48px).
- **Hover / Focus:** Gently deepens tone to #059669 with smooth spring easing transformations (`transform: scale(1.01)`).

### Cards
- **Corner Style:** Rounded boundaries (24px / rounded-3xl)
- **Background:** Warm white glass plate (rgba(255, 255, 255, 0.85)) with a micro-thin boundary border.
- **Internal Padding:** Spaced spacing offsets (16px and 24px).

### Inputs / Fields
- **Style:** Antique warm ivory backing with a thin orange-gray border (#fbf9f4).
- **Focus:** Highlights outline in active foliage green (#10b981) with a soft ring shadow.

### Immersive Media / Artwork
- **Borderless Canvas Blending:** When placing painterly or impressionist artwork inside cards, avoid hard edges. Use `[mask-image:linear-gradient(to_bottom,black_30%,transparent_100%)]` or radial gradients to fade the artwork seamlessly into the card's background.
- **Texture Merging:** Use `mix-blend-multiply` on artwork placed against the antique canvas paper backgrounds (`#fcfbf9` or `#f7f5ee`). This organically merges the artwork's paper texture with the UI's background layer, making the image feel painted directly onto the interface rather than pasted inside a box.
- **Floating Floating UI (Glassmorphism):** Any badges, icons, or text floating over immersive artwork should use high-blur glassmorphism (`backdrop-blur-md` or `-xl`) with soft translucent white backings (`bg-white/40`) and very subtle borders (`border-white/20`) to prevent harsh geometric shapes from interrupting the organic painting.

## 6. Do's and Don'ts

### Do:
- **Do** map all primary interactive targets to at least 44px of physical space.
- **Do** tint all borders, shadows, and neutrals with a tiny hint of soft warm olive or teal hue to keep elements organic.
- **Do** present standard before-and-after git comparators before completing any shippable step.

### Don't:
- **Don't** use cold, dark terminal templates (gray-on-black) unless the user has explicitly requested simulated developer goggles.
- **Don't** use generic purple SaaS gradients, raw JSON trackers, or corporate layout cards.
- **Don't** use side-stripe left borders on cards. Use a thin full border or background tint layout instead.
