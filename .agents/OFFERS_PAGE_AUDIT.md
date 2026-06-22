# Offers Page & Subcomponents Audit Report

## 1. Current Violations (Design System & Guidelines)

### A. Hardcoded Colors & Theme Violations
- **Page Container:** Uses `bg-slate-50/90` instead of semantic `bg-background-secondary`.
- **Containers & Cards:** Uses `bg-background-primary/90`, `border-border-light/80`, and custom shadow configurations (`shadow-lg shadow-slate-900/5`) instead of standard theme shadows (`shadow-sm`, `shadow-md`) and borders.
- **Tab Buttons:** Active and inactive states use hardcoded `bg-slate-100`, `text-slate-600`, and `bg-slate-200/80`.
- **Inputs & Dropdowns:** The search bar uses `bg-slate-50/80` (glassmorphism/opacity) and `placeholder:text-slate-400`. The sort dropdown uses `text-slate-800`.
- **Status Chips:** Uses hardcoded color combinations such as `bg-indigo-50`, `bg-emerald-200/80`, `bg-status-warning-bg/50` with custom borders instead of standard semantic status definitions.
- **Milestone Indicators:** Card milestones use `bg-slate-900`, `bg-slate-200`, `text-slate-600` directly.

### B. Prohibited Design Choices
- **Banned Gradients:** The empty state container uses `bg-gradient-to-br from-indigo-500/15 to-violet-500/15`, which is explicitly forbidden by the design system.
- **Glassmorphism/Bubble Effects:** Multiple instances of opacity-based colors (e.g., `/90`, `/80`, `/50`) and backdrop filters are present.

### C. Layout & Component Violations
- **Border Radius:** Tab wrapper uses `rounded-2xl` for small tabs (violates the "rounded-xl for small tab groupings, rounded-lg for buttons/inputs" standard).
- **Milestone Progress:** The 1-2-3 step progress bar uses a text-heavy indicator with hardcoded circles and text arrows (`→`), which is visually subpar and non-standard.

---

## 2. Proposed Improvements

1. **Strict Theme Integration:**
   - Replace all `bg-slate-*` and custom opacity classes with semantic theme classes (`bg-background-primary`, `bg-background-secondary`, `bg-background-tertiary`, `text-text-primary`, `text-text-secondary`, `text-text-muted`).
   - Use standard border classes (`border-border-light`, `border-border-DEFAULT`).
   - Standardize shadows to `shadow-sm` and `shadow-md`.

2. **Refining Component Layouts:**
   - **Tab Buttons:** Rework tabs into a modern segment control style utilizing `bg-background-tertiary` for the wrapper and smooth active states using standard colors.
   - **Modern Search & Sort Bar:** Clean borders, standard focus ring (`focus:ring-primary/20`), and correct input radius (`rounded-lg`).
   - **Premium Milestone Timeline:** Replace the inline step indicator in `OfferTrackingCard` with a sleek, horizontal dot-and-line stepper using custom colors that dynamically highlight current status.
   - **Clean Offer Details Grid:** Clean grid item cards in `OfferTrackingCard` to display pricing, quantity, and expiration info in a more structured format.
   - **Accept/Reject/Counter Actions:** Rework CTA buttons inside `OfferTrackingCard` to use correct button tokens (`bg-primary`, `hover:bg-primary-hover`) and semantic outline states.

3. **No Gradients Empty State:**
   - Redesign the "No Offers" placeholder utilizing a solid `bg-background-secondary` and a sleek icon with minimal typography.
