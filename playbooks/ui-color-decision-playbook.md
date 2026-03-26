# UI Color Decision Playbook (UCDP) v1.0

## Purpose
To define a systematic approach to color that ensures **Visual Hierarchy**, **Emotional Resonance**, and **Functional Clarity**. This playbook treats color not as "decoration" but as a critical component of the **Persona's Skin**.

## The Core Framework: 60-30-10 Rule
To achieve the "Premium" balance, we follow the **Golden Proportion of UI Harmony**:

* **60% Dominant (Neutral):** Typically the background/surface color. Provides the "Canvas."
* **30% Secondary (Brand):** Used for navigation, headers, and larger UI blocks. Provides the "Identity."
* **10% Accent (Action):** Reserved for CTAs, notifications, and critical highlights. Provides the "Direction."



---

## 1. The Color-Decision Matrix
Before choosing a hex code, define the **Emotional Objective (PHI-12)**.

| Color Category | Emotional / Functional Association | Recommended Use Case |
| :--- | :--- | :--- |
| **Warm (Red/Orange)** | Energy, Urgency, Passion | Error states, Destructive actions, High-alert CTAs |
| **Cool (Blue/Green)** | Trust, Calm, Growth | Success states, Primary navigation, Finance/Data apps |
| **Neutral (Gray/Beige)**| Balance, Professionalism, Minimal | Body text, Backgrounds, Secondary information |
| **Vibrant (Yellow)** | Optimism, Caution, Attention | Warnings (low level), Highlights, Youth-focused brands |

## 2. Decision Directives

### A. The "Gray is Never Just Gray" Heuristic
**Rule:** Avoid pure `#808080`. Always "tint" your neutrals with a hint of your primary brand color.
* **Why:** Pure grays look "dead" or "muddy" on digital displays. 
* **Action:** Add 2–5% saturation of your brand's blue or purple into your gray scale to create an "organic" feel.

### B. Contrast & Accessibility (WCAG 2.1)
**Rule:** Never sacrifice usability for "Premium" aesthetics (Ghost text).
* **Standard Text:** Minimum **4.5:1** contrast ratio.
* **Large Text/Icons:** Minimum **3.0:1** contrast ratio.
* **Tooling:** Use `Bun.serve()` to run a local lighthouse or contrast checker during the **Sieve (Tier 1)** phase.

### C. Interaction States (The Luminosity Rule)
When creating hover/active states, do not just "pick a darker color." Follow the **Natural Lighting Heuristic**:
* **Darker Variation (Shadow):** Decrease Brightness + **Increase Saturation**.
* **Lighter Variation (Highlight):** Increase Brightness + **Decrease Saturation**.

---

## 3. Implementation: Semantic Color Tokens
Map your colors to **Roles** to ensure **Workflow Durability (PHI-13)**.

```typescript
// Define in your Theme/Sleeve layer
const UI_TOKENS = {
  SURFACE: "#FAFAFA",    // 60% - Neutral
  PRIMARY: "#2D5BFF",    // 30% - Brand Identity
  ACCENT:  "#FF4D4D",    // 10% - Critical Action
  
  // Semantic Extensions
  SUCCESS: "#28C76F",
  WARNING: "#FF9F43",
  ERROR:   "#EA5455",
  INFO:    "#00CFE8"
};
```

[Image showing a web page interface layout with the 60-30-10 color rule applied to its sections]

---

## 4. The "Premium" Checklist
- [ ] **Start in Grayscale:** Does the layout work without color? If not, the hierarchy is broken.
- [ ] **Limit to 3 Hues:** Does the design use more than 3 primary colors? If yes, reduce to prevent **Conceptual Entropy**.
- [ ] **Check the "Ghosting":** Is secondary text at least 4.5:1? (Avoid light gray on white).
- [ ] **Redundancy:** Is information conveyed *only* through color? Add icons or labels for color-blind accessibility.

---

**Status:** Version 1.0 Persisted. This playbook is now a canonical reference for all **Skin/UI** development tasks within the **Persona Stack**.