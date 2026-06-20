/**
 * Cart & checkout — colour + shape tokens.
 * Warm-stone neutrals; accent is a deep blue used sparingly (CTA only).
 * Tailwind JIT: full class strings live here.
 */
export const CART_UI = Object.freeze({
  pageBg: '#f4f3f1',
  border: '#e5e3df',
  borderHover: '#bcb6b0',
  surface: '#f7f6f5',
  surfaceWash: '#f9f9f8',
  text: '#111111',
  textMuted: '#555555',
  textHint: '#999999',
  /** Ana CTA / link / seçim */
  accent: '#1466c6',
  accentHover: '#0f529e',
  accentSubtle: '#eef4fb',
  disabledBg: '#e8e6e4',
  disabledText: '#9c9894',
});

/** Köşe + derinlik */
export const CART_SHAPE = Object.freeze({
  radiusPanel: 'rounded-2xl',
  radiusBox: 'rounded-xl',
  radiusThumb: 'rounded-lg',
  radiusPill: 'rounded-full',
  shadowPanel: 'shadow-sm shadow-black/[0.04]',
  shadowLift: 'shadow-md shadow-black/[0.06]',
  shadowBar: 'shadow-[0_1px_0_rgba(0,0,0,0.04)]',
});

/* ─── Panels ───────────────────────────────────────────────── */

export const cartSurfacePanel =
  'overflow-hidden border border-[#e5e3df] bg-background-primary rounded-xl shadow-sm shadow-black/[0.04]';

export const cartPageCanvas = 'bg-[#f4f3f1]';

export const cartPageHeader =
  'sticky top-0 z-30 border-b border-[#e5e3df] bg-background-primary/98 backdrop-blur-[2px]';

/* ─── Buttons ──────────────────────────────────────────────── */

export const cartBtnPrimary =
  'rounded-lg border border-[#1466c6] bg-[#1466c6] px-5 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:border-[#0f529e] hover:bg-[#0f529e] disabled:cursor-not-allowed disabled:border-[#e8e6e4] disabled:bg-[#e8e6e4] disabled:text-text-muted active:scale-[0.99]';

export const cartBtnPrimarySm =
  'rounded-lg border border-[#1466c6] bg-[#1466c6] px-3 py-2 text-sm font-medium text-white transition-all duration-150 hover:border-[#0f529e] hover:bg-[#0f529e] disabled:border-[#e8e6e4] disabled:bg-[#e8e6e4] disabled:text-text-muted active:scale-[0.99]';

export const cartBtnPrimaryBlock =
  'w-full rounded-lg border border-[#1466c6] bg-[#1466c6] py-3 text-sm font-medium text-white transition-all duration-150 hover:border-[#0f529e] hover:bg-[#0f529e] disabled:cursor-not-allowed disabled:border-[#e8e6e4] disabled:bg-[#e8e6e4] disabled:text-text-muted active:scale-[0.99]';

export const cartBtnSecondary =
  'rounded-lg border border-[#e5e3df] bg-background-primary px-5 py-2.5 text-sm font-medium text-[#111] transition-all duration-150 hover:border-[#bcb6b0] hover:bg-[#fafaf9] active:scale-[0.99]';

export const cartBtnGhost =
  'rounded-lg px-4 py-2.5 text-sm font-medium text-[#555] transition-all duration-150 hover:text-[#111]';

export const cartBtnOutlineXs =
  'rounded-lg border border-[#e5e3df] bg-background-primary px-3 py-1.5 text-xs font-medium text-[#111] transition-all duration-150 hover:bg-[#fafaf9] active:scale-[0.99]';

/* ─── Inputs ───────────────────────────────────────────────── */

export const cartFieldInput =
  'w-full rounded-lg border border-[#e5e3df] bg-background-primary px-3 py-2.5 text-sm text-[#111] outline-none transition-all duration-150 placeholder:text-[#999] focus:border-[#1466c6] focus:ring-2 focus:ring-[#1466c6]/15';

export const cartFieldInputMedium =
  'w-full rounded-lg border border-[#e5e3df] bg-background-primary px-3 py-2.5 text-sm font-medium text-[#111] outline-none transition-all duration-150 focus:border-[#1466c6] focus:ring-2 focus:ring-[#1466c6]/15';

/* ─── Selectable cards ─────────────────────────────────────── */

export const cartSelectableBase =
  'rounded-lg border bg-background-primary p-4 transition-all duration-150';

export const cartSelectableIdle =
  'border-[#e5e3df] hover:border-[#bcb6b0]';

export const cartSelectableMuted =
  'cursor-not-allowed border-[#e5e3df] bg-[#fafaf9] opacity-45';

export const cartSelectableActive =
  'border-l-[3px] border-l-[#1466c6] border-t-[#e5e3df] border-r-[#e5e3df] border-b-[#e5e3df] bg-[#fafcff]';

/* ─── Soft panels ──────────────────────────────────────────── */

export const cartSoftPanel =
  'rounded-lg border border-[#e5e3df] bg-[#fafaf9] p-4';

export const cartSoftPanelWhite =
  'rounded-lg border border-[#e5e3df] bg-background-primary p-4';
