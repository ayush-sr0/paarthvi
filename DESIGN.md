---
name: Sacred Forest
colors:
  surface: '#fcf9f3'
  surface-dim: '#dcdad4'
  surface-bright: '#fcf9f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ed'
  surface-container: '#f0eee8'
  surface-container-high: '#ebe8e2'
  surface-container-highest: '#e5e2dc'
  on-surface: '#1c1c18'
  on-surface-variant: '#424841'
  inverse-surface: '#31312d'
  inverse-on-surface: '#f3f0ea'
  outline: '#727971'
  outline-variant: '#c2c8bf'
  surface-tint: '#46664a'
  primary: '#16351d'
  on-primary: '#ffffff'
  primary-container: '#2d4c32'
  on-primary-container: '#99bc9a'
  inverse-primary: '#acd0ad'
  secondary: '#516446'
  on-secondary: '#ffffff'
  secondary-container: '#d1e6c1'
  on-secondary-container: '#56684a'
  tertiary: '#1e3421'
  on-tertiary: '#ffffff'
  tertiary-container: '#344b36'
  on-tertiary-container: '#a0ba9f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c7ecc8'
  primary-fixed-dim: '#acd0ad'
  on-primary-fixed: '#02210b'
  on-primary-fixed-variant: '#2f4e34'
  secondary-fixed: '#d4e9c4'
  secondary-fixed-dim: '#b8cda9'
  on-secondary-fixed: '#101f08'
  on-secondary-fixed-variant: '#3a4c30'
  tertiary-fixed: '#ceeacd'
  tertiary-fixed-dim: '#b3ceb2'
  on-tertiary-fixed: '#0a200e'
  on-tertiary-fixed-variant: '#354c37'
  background: '#fcf9f3'
  on-background: '#1c1c18'
  surface-variant: '#e5e2dc'
  sacred-palace: '#F9F6F0'
  ivory-bright: '#FFFFFF'
  deep-forest: '#1A2E1D'
  olive-drab: '#4B5320'
  moss-shadow: '#3E4C33'
  gold-leaf: '#C5A059'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.01em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  body-lg:
    fontFamily: Open Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Open Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.12em
  label-sm:
    fontFamily: Open Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter-sm: 16px
  gutter-lg: 24px
  margin-mobile: 20px
  margin-desktop: 80px
  container-max: 1360px
---

## Brand & Style
The design system embodies a "Royal Ayurvedic" aesthetic, pivoting from fiery energy to a serene, grounded wisdom. It targets a high-end wellness audience seeking premium, nature-aligned solutions. The brand personality is restorative, regal, and deeply organic, evoking the emotional response of a tranquil temple garden.

The style is a sophisticated blend of **Minimalism** and **Tactile** luxury. It uses expansive white space (Sacred Palace ivory) to signify purity, layered with rich, botanical textures. This design system moves away from aggressive accents toward a calm, lush hierarchy that emphasizes stability and healing through the lens of ancient forest wisdom.

## Colors
The palette is centered on the "Sacred Forest" spectrum, replacing all previous heat-based tones with cooling, verdant hues. 

- **Primary (Deep Forest):** Used for primary actions, navigation headers, and authoritative brand motifs. It provides the "royal" anchor for the system.
- **Secondary (Olive):** Utilized for active states, selection indicators, and secondary UI elements to provide a natural, herbal contrast.
- **Tertiary (Algae):** A softer green used for decorative elements, subtle backgrounds, and informative accents.
- **Neutral (Sacred Palace):** The foundational off-white base. It must be used generously for all backgrounds to maintain the premium, high-end feel.
- **Accent (Gold Leaf):** Retained exclusively for delicate borders, ornamental iconography, and premium certification badges.
- **Typography:** A deep, charcoal-green (#121A13) is used for body text to ensure readability while remaining softer and more organic than pure black.

## Typography
The typography creates a balance between spiritual authority and modern functional clarity.

- **Headlines:** Playfair Display is used to convey a sense of timeless tradition and premium storytelling. It should be used with generous leading to feel "airy" and expensive.
- **Body:** Open Sans ensures that clinical and ingredient information is highly legible across all devices.
- **Utility:** Montserrat (all-caps) is reserved for navigation, tags, and small metadata, providing a clean, architectural counterpoint to the decorative serif headings.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for desktop to maintain a controlled, gallery-like presentation.

- **Grid:** A 12-column grid is used for desktop with wide 80px margins to frame content like a luxury manuscript. Mobile utilizes a 4-column grid with 20px margins.
- **Rhythm:** An 8px linear scale guides all spatial decisions. Section padding should be aggressive (120px+ on desktop) to enforce the serene, unhurried brand personality.
- **Reflow:** On tablet, the margins contract to 40px, and content containers switch to a fluid 8-column model.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and **Low-Contrast Outlines** rather than aggressive shadows, maintaining a grounded, tactile feel.

- **Layering:** Elements are elevated by shifting from "Sacred Palace" to "Ivory Bright" backgrounds.
- **Outlines:** Use subtle 1px borders in `gold-leaf` (20% opacity) or `tertiary` green (15% opacity) to define cards and containers.
- **Shadows:** When necessary for functional depth (e.g., modals), use a very soft, high-diffusion shadow tinted with `deep-forest` at 5% opacity to create a "leaf-cast" ambient effect.
- **Texture:** A microscopic "pressed cotton" texture is applied to the primary background to simulate high-quality archival paper.

## Shapes
The shape language is **Soft (Level 1)**, reflecting the precision of a high-end apothecary while avoiding the clinical coldness of sharp edges.

- **Containers:** Cards and input fields use a 4px (0.25rem) radius for a structured but approachable look.
- **Accents:** Elements like Dosha indicators or botanical icons should be housed in circles to symbolize the holistic nature of Ayurveda.
- **Interactive:** Active states on buttons may transition to a slightly softer corner (8px) to feel more inviting.

## Components
- **Buttons:** Primary buttons are solid `Deep Forest` with `Ivory Bright` text. Secondary buttons use a `Gold Leaf` outline with `Deep Forest` text. Hover states utilize a subtle shift to `Olive Drab`.
- **Input Fields:** Designed with a refined "stationery" look. Use a bottom-only border in `Gold Leaf`. On focus, the border thickens slightly and a very soft `Algae Green` glow appears.
- **Cards:** Product containers use a flat `Ivory Bright` surface with a 1px `Gold Leaf` border at low opacity. Product photography should use "Sacred Palace" as its backplate for a seamless look.
- **Chips & Tags:** Category tags use `Algae Green` backgrounds with `Deep Forest` text, keeping the tone monochromatic and serene.
- **Lists:** Traditional bullets are replaced with small lotus icons or simplified leaf motifs in `Gold Leaf`.
- **Navigation:** The top-tier navigation uses `Montserrat` caps for a clean, structural feel, with the active link indicated by a thin `Deep Forest` underline.