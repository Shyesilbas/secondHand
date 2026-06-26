---
name: Design System
description: Triggered when UI component, color, typography, or spacing changes will be made in the frontend.
triggers:
  - "design review"
---

# Design System

## Trigger
Triggered by "design review".

## Zero-I/O Architectural Rules
- **Tokens:** Verify all color, typography, and spacing usages against the tokens defined in `src/common/theme/theme.js`.
- **Prohibited:** Do not use hardcoded values (e.g., `#f7f6f5`, `text-gray-900`, `text-[14px]`, `gap-[14px]`).
- **Styles:** Ensure no gradients, heavy shadows, or glassmorphism are used unless strictly defined in tokens.
- **Border Radii:** `rounded-md` (small elements), `rounded-lg` (buttons/inputs), `rounded-xl` (cards), `rounded-2xl` (large cards/modals), `rounded-full` (avatars).

## Workflow Steps
1. Scan the UI component for token compliance.
2. Apply standard border radii.
3. Base new components on existing examples in `src/common/components/`.
4. Produce a summary of the design changes applied or audited.
