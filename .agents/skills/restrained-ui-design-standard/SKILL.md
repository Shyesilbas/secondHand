---
name: restrained-ui-design-standard
description: Use this skill before creating, modifying, styling, or reviewing any frontend UI component, view, modal, table, form, or stylesheet in secondhand-frontend. Enforces the Apple/Spotify-tier restrained design standard, semantic tokens, purposeful non-flashy color balance, four-state data discipline, and mandatory pre-completion regex/lint checks.
---

# Restrained UI Design Standard

Act as a senior frontend engineer at a premium consumer-product company (Apple / Spotify tier) before the generative AI era: every screen is deliberate, quiet, consistent, and fast. UI/UX quality is the first priority, ahead of speed of delivery.

**Core Principle — Restraint & Purposeful Color:** Visual hierarchy comes primarily from typography size, weight, spacing, alignment, and 1px hairline borders. Rigid monochrome restrictions are replaced by thoughtful, context-appropriate colors (status indicators, metrics, charts, subtle category tags), provided they remain restrained, balanced, and never exaggerated, loud, or tacky (*abartı ve cıvık olmayan bir denge*).

## 1. Hard Prohibitions ("Never" List)
- **No emojis anywhere:** Never use emojis in UI copy, buttons, toasts, alerts, empty states, placeholders, seed data, or code comments. Use `lucide-react` icons (16px or 20px, stroke 1.5, `currentColor`) or nothing.
- **No tacky / loud decoration:** No neon bubbles, floating blobs, glowing rings, or chaotic rainbow chips. Subtle, purposeful contextual badges, tags, or pills are allowed.
- **No oversized border radii:** Never use `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, or arbitrary `rounded-[..]` classes. No pill-shaped buttons or cards.
- **No garish card backgrounds, gradients, or blur:** Resting cards remain clean with 1px borders. Never use `bg-gradient-*`, `backdrop-blur*`, decorative glows, or resting card shadows.
- **No arbitrary Tailwind values or raw hex codes:** Never write `text-[13px]`, `p-[18px]`, `rounded-[2rem]`, or inline hex colors (`#...`). Use the Tailwind scale and semantic tokens from `src/common/theme/theme.js` / `tailwind.config.js`.
- **No heavy display weights or decorative micro-caps:** Never use `font-black` or `font-extrabold`, or all-caps micro labels with wide tracking as decoration.
- **No bouncy or decorative motion:** No hover lift (`-translate-y-*`), scale-up hover (`hover:scale-*`), or looping decorative animations.

## 2. Design Tokens & Visual System (`src/common/theme/theme.js`)
- **Surfaces & Borders:**
  - Page background: `bg-background-secondary`
  - Primary content surface: `bg-background-primary`
  - Subtle fill: `bg-background-tertiary`
  - Separate sections and cards with 1px borders (`border-border` for outer edges, `border-border-light` for inner dividers), not shadows.
- **Text Hierarchy:**
  - Primary content: `text-text-primary`
  - Supporting copy: `text-text-secondary`
  - Metadata: `text-text-tertiary` / `text-text-muted` (never use for essential info; maintain $\ge 4.5:1$ contrast).
- **Accent, Status & Price:**
  - Primary action anchor: `primary` (with complementary contextual accents where they improve clarity).
  - Semantic status: `status-success`, `status-error`, `status-warning`, `status-info` (dot, subtle tag, or text badge).
  - Price emphasis: `text-price` / `highlight` strictly for prices and financial figures.
- **Border Radius Ceiling (Note: repo theme scale maps `rounded-sm`=6px, `rounded`=8px, `rounded-md`=12px):**
  - `rounded-sm`: Tags, checkboxes, small badges
  - `rounded`: Buttons, inputs, selects, cards, dropdowns, toasts, images
  - `rounded-md`: Modals, drawers, large panels (**strict maximum ceiling**)
  - `rounded-full`: Avatars, 6px status dots, switches only
- **Shadows:**
  - Default is `shadow-none`. Allowed only on floating layers: `shadow-sm` on dropdowns/popovers, `shadow-md` on modals. Never on resting cards.
- **Typography (Plus Jakarta Sans):**
  - Weights: `400` (`font-normal`), `500` (`font-medium`), `600` (`font-semibold`) only.
  - At most 3 hierarchy levels per view: Page title `text-2xl font-semibold`, Section title `text-lg font-semibold`, Body `text-sm`, Meta `text-sm text-text-secondary`.
  - Minimum font size is `12px` (`text-xs`); avoid `text-caption` or anything smaller for real content.
  - Always apply `tabular-nums` to numbers, prices, counts, timers, and dates. Use sentence case, no exclamation marks, and specific action verbs ("Save changes", not "Submit").
- **Spacing & Layout:**
  - 4px grid: card padding `p-4` or `p-5` (consistent across sibling cards), stack gaps `gap-4` / `gap-6`, section gaps `gap-8`.
  - Wrap pages in `PageContainer`. Mobile-first (`360px`, `768px`, `1280px` widths), touch targets $\ge 44\text{px}$ on mobile, solid backgrounds on sticky bars.

## 3. Component & Four-State Discipline
- **Shared Primitives First:** Always use `common/components/ui` (`Button`, `buttonClasses`, `Modal`, `Skeleton`, `EmptyState`, `Alert`, `DataPagination`) and `common/components/forms/{FormPrimitives.jsx,inputStyles.js}` instead of hand-rolling controls.
- **Buttons:** Primary / secondary / ghost only; one primary button per view; 36–40px height, `rounded`. Destructive actions use `status-error` text or a confirmation step, not loud red blocks.
- **Cards:** Flat, `bg-background-primary`, 1px `border-border`, `rounded`, no resting shadow. Hover changes border to `card-border-hover` only.
- **Modals & Drawers:** `bg-black/40` backdrop without blur, `rounded-md`, focus trapped, `Esc` closes, primary action on the right. Use a Drawer for long forms; never nest modals.
- **Mandatory 4 Data States (Every data view must implement all four):**
  1. **Loading:** `Skeleton` matching the final layout geometry (no layout shift, no page-level spinners).
  2. **Empty:** `EmptyState` with one concise sentence and one clear CTA (no illustration blobs, no emojis).
  3. **Error:** Inline error message (`Alert`) with a retry action (`ErrorBoundary` only for fatal render crashes).
  4. **Disabled / Pending:** Preserve layout dimensions, reduce contrast, and show progress in the button label.

## 4. Pre-Completion Verification (Mandatory)
Before finishing any frontend UI task, run these checks from `secondhand-frontend/` against all modified files and fix every violation:

```bash
grep -nE "rounded-(lg|xl|2xl|3xl)|rounded-\[|bg-gradient|backdrop-blur|font-(black|extrabold)|text-\[[0-9]|#[0-9a-fA-F]{3,6}\b" <touched-files>
grep -nP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" <touched-files>
npm run lint
npm run build
```
