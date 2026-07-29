/**
 * Unified UI configuration for listing prefilter and creation forms.
 * Provides a clean, minimalist, professional aesthetic built on theme tokens.
 */

export const PREFLOW_WIZARD_VARIANT = {
  BROWSE: 'browse',
  SELL: 'sell',
  COMPOSER: 'composer',
  DEFAULT: 'default',
};

/** Unified Category selection cards (step 1) */
export function getCategoryCardClasses(_variant, isSelected) {
  return {
    wrapper: `group relative flex h-full w-full items-center gap-4 rounded-xl border bg-background-primary px-5 py-4 text-left transition-colors duration-200 focus:outline-none ${
      isSelected
        ? 'border-primary bg-primary-50 ring-1 ring-primary'
        : 'border-border-light hover:border-primary-300'
    }`,
    iconBg: `flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg transition-colors duration-200 ${
      isSelected
        ? 'bg-primary text-text-inverse'
        : 'bg-background-secondary text-text-secondary group-hover:bg-primary-50 group-hover:text-primary'
    }`,
    title: isSelected ? 'text-text-primary' : 'text-text-primary group-hover:text-primary-700',
    desc: 'mt-1 line-clamp-2 text-sm leading-relaxed text-text-tertiary',
    trailing: isSelected ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary',
    checkOuter: 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-text-inverse',
    checkInner: 'h-3.5 w-3.5 text-text-inverse',
    chevron: 'h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5',
  };
}

/** Unified Grid selection boxes (step 2+) */
export function getGridOptionClasses(_variant, isSelected) {
  return `relative flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-3.5 text-left transition-colors duration-200 focus:outline-none ${
    isSelected
      ? 'border-primary bg-primary-50 ring-1 ring-primary'
      : 'border-border-light bg-background-primary hover:border-primary-300'
  }`;
}

export function getGridOptionLabelClass(_variant, isSelected) {
  return `truncate text-sm font-semibold transition-colors ${isSelected ? 'text-primary-700' : 'text-text-primary'}`;
}

export function getGridCheckDotClass() {
  return 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-text-inverse';
}

/** Unified Auxiliary UI (Search input, dropdowns, empty states) */
export function getAuxiliaryUi() {
  return {
    gridSearchInput:
      'w-full rounded-lg border border-border-light bg-background-primary py-3 pl-11 pr-4 text-sm text-text-primary transition-colors placeholder:text-text-muted hover:border-border focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary/10',
    dropdownCard: 'rounded-xl border border-border-light bg-background-primary p-5',
    skipLink:
      'inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary transition-colors hover:text-primary',
    midSearchBtn:
      'inline-flex items-center gap-2 rounded-lg border border-border bg-background-primary px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-background-secondary hover:text-text-primary',
    dependentSelectorHint:
      'mt-3 rounded-lg border border-border-light bg-background-secondary px-4 py-3 text-center text-sm text-text-secondary',
    emptyFilterBox:
      'rounded-xl border border-dashed border-border bg-background-secondary py-10 text-center',
    emptyFilterTitle: 'text-sm font-bold text-text-primary',
    emptyFilterSubtitle: 'mt-1 text-sm text-text-tertiary',
  };
}
