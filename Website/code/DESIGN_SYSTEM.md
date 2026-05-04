# ANKON Design System: Functional Luxury

## Core Philosophy
**Functional Luxury** is the synthesis of high-end, editorial aesthetics with rigid, engineering-grade logic. It prioritizes clarity, whitespace, and precision over decorative clutter.

---

## 1. Color Palette

| Token | Hex | Usage |
| :--- | :--- | :--- |
| **Obsidian** | `#121212` | Primary background, primary text (on cream) |
| **White** | `#FFFFFF` | Primary text (on obsidian), buttons |
| **Cream** | `#F5F5F5` | Secondary background, soft highlights |
| **Slate** | `#707070` | Secondary text, captions, borders |
| **Copper** | `#B87333` | Subtle accents, success states, micro-interactions |

---

## 2. Typography

### Primary Font: **Montserrat** (Sans-Serif)
Used for all structural elements, navigation, and body text to ensure a modern, technological feel.
- **Weights**: 100 (Thin), 300 (Light), 500 (Medium), 700 (Bold)
- **Headings**: Weight 300 is the brand standard for all major section titles.

### Editorial Font: **Cormorant Garamond** (Serif)
Used exclusively for emphasis, dynamic words, and "Architectural" highlights.
- **Style**: Italic is preferred for high-contrast "Luxury" moments.

---

## 3. Layout & Spacing

### Grid
- **Container**: Max-width `1400px` with horizontal padding.
- **Section Rhythm**: `10rem` (160px) vertical padding between major sections.
- **Bento Grid**: 24px gutter for portfolio and complex layouts.

### Proportions
- Headings use a fluid scale via `clamp()` to maintain impact across devices.

---

## 4. Interaction Patterns

### Motion Signature
All animations must use the **ANKON Signature Curve**:
- `cubic-bezier(0.16, 1, 0.3, 1)`
- This curve provides a rapid initial movement with a long, elegant deceleration.

### Hover Effects
- **Buttons**: Subtle lift (`translateY(-2px)`) with a shadow transition.
- **Links**: Opacity shift from `0.6` to `1.0` or sliding underline.
- **Cards**: Background shifts from `rgba(255,255,255,0.05)` to higher visibility.

---

## 5. Visual Language

### Background Elements
- **Grain**: A subtle noise overlay (3-5% opacity) to add texture and depth.
- **Glassmorphism**: High blur (`40px`) with low-opacity borders for UI elements like the AI Chatbox.
- **Borders**: Hairline borders (`1px`) with low opacity (`0.05` to `0.1`).
