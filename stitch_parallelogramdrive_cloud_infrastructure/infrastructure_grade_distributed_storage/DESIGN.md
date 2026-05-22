---
name: Infrastructure-Grade Distributed Storage
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#ccc3d9'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#958da2'
  outline-variant: '#4a4456'
  surface-tint: '#d2bbff'
  primary: '#d2bbff'
  on-primary: '#3e008e'
  primary-container: '#7b2ff7'
  on-primary-container: '#ebddff'
  inverse-primary: '#7423f0'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#ddb7ff'
  on-tertiary: '#490080'
  tertiary-container: '#8b34d9'
  on-tertiary-container: '#f0dbff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5900c6'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb7ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#6900b3'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 48px
  margin-mobile: 16px
  max-width: 1440px
---

## Brand & Style
The design system embodies the precision of high-end infrastructure and the mystery of distributed networks. It is built for a developer-centric audience that values mathematical rigor and aesthetic refinement. The visual language is inspired by contemporary technical interfaces like Linear and Vercel, prioritizing clarity, speed, and a "pro-tool" feel.

The style is a synthesis of **Minimalism** and **Glassmorphism**, characterized by deep obsidian surfaces, ultra-thin glowing strokes, and sophisticated backdrop blurs. It avoids traditional skeuomorphism in favor of digital-native depth, using light as a functional signifier of activity and connectivity.

## Colors
This design system utilizes a high-contrast dark palette. The base is an absolute deep black to ensure maximum contrast for the neon accents. 

- **Primary (Deep Purple):** Used for core actions, active states, and primary brand markers.
- **Secondary (Electric Blue):** Used for data visualization, progress indicators, and links.
- **Tertiary (Neon Violet):** Used for secondary accents and hover states to create a sense of depth and energy.
- **Surface Palette:** Layers are defined by varying levels of transparency rather than just solid grays. Surfaces should use a subtle grain texture to prevent banding in gradients.

## Typography
The typography strategy focuses on technical legibility. **Inter** provides a clean, neutral foundation for the main interface, while **JetBrains Mono** is reserved for metadata, terminal outputs, and system labels to reinforce the developer-focused narrative.

For large displays, use tight letter spacing to create a compact, architectural look. For body text, maintain generous line heights to ensure readability against the dark background. Code and label styles should always be crisp and monochromatic to serve as a grounding element against vibrant gradients.

## Layout & Spacing
The layout follows a **Mathematical Grid** model. All spacing is derived from a 4px base unit, ensuring that every element aligns to a consistent rhythmic interval. 

- **Desktop:** A 12-column fluid grid with 24px gutters. Use wide margins to allow the "glass" panels to breathe.
- **Mathematical Planes:** Content should be organized into logical "planes" or modules. Use subtle CSS grid patterns (`background-size: 40px 40px`) on the base canvas to visualize the underlying structure.
- **Reflow:** On mobile, the grid collapses to a single column, but internal padding within containers should remain generous (16px to 20px) to maintain the premium, spacious feel.

## Elevation & Depth
Elevation is expressed through **transparency and light emission** rather than traditional drop shadows. 

1.  **Base Layer:** Solid `#050505` with a faint grid overlay.
2.  **Mid Layer (Glass):** Semi-transparent surfaces with a `backdrop-filter: blur(12px)`. These panels feature a 1px solid border at 10% white opacity.
3.  **Top Layer (Glow):** Interactive elements or active status indicators use an `outer-glow` (box-shadow) with the primary accent color at low opacity (20-30%) and high blur (20px+).

This creates a "holographic" hierarchy where the most important information appears to be emitting light from within the screen.

## Shapes
The shape language is "Soft Geometric." While the grid is rigid, elements have a standard 0.5rem (8px) radius to feel modern and approachable. 

- **Containers:** 0.5rem (8px) for standard panels.
- **Large Sections:** 1.5rem (24px) for major layout blocks.
- **Interactive Elements:** Buttons and inputs follow the 0.5rem standard, creating a cohesive visual unit.
- **Geometric Accents:** Incorporate 45-degree angled lines and parallelogram-inspired clipping paths for decorative elements and data visualizations.

## Components
Consistent component behavior is critical for maintaining the "Infrastructure-Grade" feel of the design system.

- **Buttons:** Use a solid primary color for "Action" buttons and a glass-effect for "Secondary" buttons. On hover, buttons should trigger a subtle scaling effect (1.02x) and an increased outer glow.
- **Input Fields:** Minimalist design with only a bottom border or an ultra-thin ghost outline. The focus state should illuminate the entire border with a Deep Purple-to-Electric Blue gradient stroke.
- **Progress Bars:** Use a dual-tone gradient fill (Purple to Blue) with a blurred glow trailing the progress indicator. The background of the bar should be a dark, recessed track.
- **Cards/Panels:** Every card is a glassmorphic unit. Ensure the `backdrop-filter` is applied to maintain legibility over background patterns.
- **Holographic Graphs:** Data visualizations should use thin 1.5px lines with "glowing nodes" at data points. Use area fills with 10% opacity gradients to show volume.
- **Chips/Status:** Small, JetBrains Mono-labeled capsules with a pulsing "live" dot for active distributed nodes.