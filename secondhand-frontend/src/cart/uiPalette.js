/**
 * Cart & checkout — colour + shape tokens mapping.
 * Uses semantic theme classes and design system tokens.
 */
export const CART_UI = Object.freeze({
  pageBg: '#f8fafc', // bg-background-secondary
  border: '#e2e8f0', // border-border-light
  borderHover: '#cbd5e1', // border-border
  surface: '#ffffff', // bg-background-primary / bg-card-bg
  surfaceWash: '#f8fafc',
  text: '#0f172a', // text-text-primary
  textMuted: '#475569', // text-text-secondary
  textHint: '#64748b', // text-text-tertiary
  /** Brand Accent: Teal */
  accent: '#0d9488', // primary
  accentHover: '#0f766e', // primary-hover
  accentSubtle: '#f0fdf9', // primary-light
  disabledBg: '#f1f5f9',
  disabledText: '#94a3b8',
});

/** Köşe + derinlik */
export const CART_SHAPE = Object.freeze({
  radiusPanel: 'rounded-2xl',
  radiusBox: 'rounded-xl',
  radiusThumb: 'rounded-lg',
  radiusPill: 'rounded-full',
  shadowPanel: 'shadow-sm',
  shadowLift: 'shadow-md',
  shadowBar: 'shadow-sm',
});

/* ─── Panels ───────────────────────────────────────────────── */

export const cartSurfacePanel =
  'overflow-hidden border border-border-light bg-background-primary rounded-xl shadow-sm';

export const cartPageCanvas = 'bg-background-secondary';

export const cartPageHeader =
  'sticky top-0 z-30 border-b border-border-light bg-background-primary/95 backdrop-blur-sm';

/* ─── Buttons ──────────────────────────────────────────────── */

export const cartBtnPrimary =
  'rounded-lg border border-primary bg-primary px-5 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:border-primary-hover hover:bg-primary-hover disabled:cursor-not-allowed disabled:border-border-light disabled:bg-background-secondary disabled:text-text-muted active:scale-[0.99]';

export const cartBtnPrimarySm =
  'rounded-lg border border-primary bg-primary px-3 py-2 text-sm font-medium text-white transition-all duration-150 hover:border-primary-hover hover:bg-primary-hover disabled:border-border-light disabled:bg-background-secondary disabled:text-text-muted active:scale-[0.99]';

export const cartBtnPrimaryBlock =
  'w-full rounded-lg border border-primary bg-primary py-3 text-sm font-medium text-white transition-all duration-150 hover:border-primary-hover hover:bg-primary-hover disabled:cursor-not-allowed disabled:border-border-light disabled:bg-background-secondary disabled:text-text-muted active:scale-[0.99]';

export const cartBtnSecondary =
  'rounded-lg border border-border-light bg-background-primary px-5 py-2.5 text-sm font-medium text-text-primary transition-all duration-150 hover:border-border hover:bg-background-secondary active:scale-[0.99]';

export const cartBtnGhost =
  'rounded-lg px-4 py-2.5 text-sm font-medium text-text-secondary transition-all duration-150 hover:text-text-primary';

export const cartBtnOutlineXs =
  'rounded-lg border border-border-light bg-background-primary px-3 py-1.5 text-xs font-medium text-text-primary transition-all duration-150 hover:bg-background-secondary active:scale-[0.99]';

/* ─── Inputs ───────────────────────────────────────────────── */

export const cartFieldInput =
  'w-full rounded-lg border border-border-light bg-background-primary px-3 py-2.5 text-sm text-text-primary outline-none transition-all duration-150 placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15';

export const cartFieldInputMedium =
  'w-full rounded-lg border border-border-light bg-background-primary px-3 py-2.5 text-sm font-medium text-text-primary outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/15';

/* ─── Selectable cards ─────────────────────────────────────── */

export const cartSelectableBase =
  'rounded-lg border bg-background-primary p-4 transition-all duration-150';

export const cartSelectableIdle =
  'border-border-light hover:border-border';

export const cartSelectableMuted =
  'cursor-not-allowed border-border-light bg-background-secondary opacity-50';

export const cartSelectableActive =
  'border-l-[3px] border-l-primary border-t-border-light border-r-border-light border-b-border-light bg-primary/5';

/* ─── Soft panels ──────────────────────────────────────────── */

export const cartSoftPanel =
  'rounded-lg border border-border-light bg-background-secondary p-4';

export const cartSoftPanelWhite =
  'rounded-lg border border-border-light bg-background-primary p-4';
