/**
 * Unified UI configuration for listing prefilter and creation forms.
 * Provides a clean, minimalist, professional aesthetic with unified Emerald & Slate design system.
 */

export const PREFLOW_WIZARD_VARIANT = {
  BROWSE: 'browse',
  SELL: 'sell',
  COMPOSER: 'composer',
  DEFAULT: 'default',
};

/** Unified ListingWizard shell and step styling */
export function getWizardTheme(variant) {
  const isBrowse = variant === PREFLOW_WIZARD_VARIANT.BROWSE || variant === 'browse';

  if (isBrowse) {
    return {
      shell: 'min-h-screen bg-slate-50/70 pb-4',
      stickyOuter: 'border-b border-slate-200 bg-white/90 backdrop-blur-md',
      cancelBtn:
        'group flex items-center gap-1.5 rounded-xl py-2 pl-2 pr-3 text-xs font-bold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900',
      stepActiveMob: 'bg-emerald-600 text-white shadow-xs',
      stepDoneMob: 'bg-emerald-50 text-emerald-700 font-bold',
      stepTodoMob: 'bg-transparent text-slate-400 border border-slate-200',
      connectorDone: 'bg-emerald-600',
      connectorTodo: 'bg-slate-200',
      progressTrack: 'bg-slate-200',
      progressFill: 'from-emerald-600 to-teal-600',
      sidebarCardActive: 'border-transparent bg-transparent',
      sidebarStepActive: 'bg-emerald-600 text-white shadow-xs',
      sidebarStepDone: 'bg-emerald-50 text-emerald-700 font-bold',
      sidebarStepTodo: 'bg-transparent text-slate-400 border border-slate-200',
      sidebarTitleActive: 'text-slate-900 font-bold',
      sidebarTitleDone: 'text-emerald-700 font-semibold',
      sidebarTitleTodo: 'text-slate-400',
      sidebarStepDesc: 'text-xs text-slate-500 font-medium',
      descMuted: 'text-slate-500',
      stepMeta: 'text-slate-500 font-medium',
      eyebrowWrap: 'mb-3 inline-flex items-center',
      eyebrowBadge: 'rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800',
      pageTitle: 'text-slate-900 font-extrabold',
      bottomBar: 'relative mt-4 border-t border-slate-200 bg-transparent py-4',
      footerBackBtn:
        'flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900',
      primaryBtn:
        'flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-8 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-emerald-600/20 transition-all disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
      draftBtnClass: 'hidden',
      stepScrollWell: '',
    };
  }

  // Default theme for Sell / Composer variants
  return {
    shell: 'min-h-screen bg-slate-50/70 pb-4 flex flex-col',
    stickyOuter: 'border-b border-slate-200 bg-white/90 backdrop-blur-md',
    cancelBtn:
      'group flex items-center gap-1.5 rounded-xl py-2 pl-2 pr-3 text-xs font-bold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900',
    stepActiveMob: 'bg-emerald-600 text-white shadow-xs',
    stepDoneMob: 'bg-slate-100 text-slate-900 font-bold',
    stepTodoMob: 'bg-transparent text-slate-400 border border-slate-200',
    connectorDone: 'bg-emerald-600',
    connectorTodo: 'bg-slate-200',
    progressTrack: 'bg-slate-200',
    progressFill: 'from-emerald-600 to-teal-600',
    sidebarCardActive: 'border-transparent bg-transparent',
    sidebarStepActive: 'bg-emerald-600 text-white shadow-xs',
    sidebarStepDone: 'bg-slate-100 text-slate-900 font-bold',
    sidebarStepTodo: 'bg-transparent text-slate-400 border border-slate-200',
    sidebarTitleActive: 'text-slate-900 font-bold',
    sidebarTitleDone: 'text-slate-600 font-medium',
    sidebarTitleTodo: 'text-slate-400',
    sidebarStepDesc: 'text-xs text-slate-500 font-medium',
    descMuted: 'text-slate-500',
    stepMeta: 'text-slate-500',
    eyebrowWrap: 'mb-3 inline-flex items-center',
    eyebrowBadge: 'rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider text-slate-700',
    pageTitle: 'text-slate-900 font-extrabold',
    bottomBar: 'fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md py-3',
    footerBackBtn:
      'flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900',
    primaryBtn:
      'flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-8 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-emerald-600/20 transition-all disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
    draftBtnClass:
      'flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 hover:shadow-xs disabled:cursor-not-allowed disabled:opacity-50',
    stepScrollWell: '',
  };
}

/** Unified Category selection cards (step 1) - Clean Unified Style */
export function getCategoryCardClasses(_variant, isSelected) {
  const scheme = {
    activeBorder: 'border-emerald-600 bg-emerald-50/30 shadow-md shadow-emerald-600/10 ring-2 ring-emerald-600/20',
    activeIcon: 'bg-emerald-600 text-white shadow-sm',
    hoverIcon: 'group-hover:bg-slate-100 group-hover:text-slate-900',
    accentText: 'text-emerald-700 font-extrabold',
  };

  return {
    wrapper: `group relative flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3 text-left transition-all duration-200 focus:outline-none bg-white ${
      isSelected
        ? `${scheme.activeBorder}`
        : 'border-slate-200 hover:border-emerald-500/60 hover:shadow-xs hover:-translate-y-0.5'
    }`,
    iconBg: `flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg transition-all duration-200 ${
      isSelected ? `${scheme.activeIcon}` : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600'
    }`,
    title: isSelected ? 'text-slate-900 font-extrabold text-sm tracking-tight' : 'text-slate-900 font-bold text-sm group-hover:text-emerald-700 transition-colors',
    desc: 'text-xs text-slate-500 font-medium mt-0.5 line-clamp-1',
    trailing: isSelected ? 'text-emerald-700 font-bold' : 'text-slate-400 group-hover:text-slate-600',
    checkOuter: 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs',
    checkInner: 'h-3 w-3 text-white',
    chevron: 'h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5',
  };
}

/** Unified Grid selection boxes (step 2+) */
export function getGridOptionClasses(_variant, isSelected) {
  return `relative flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-200 focus:outline-none ${
    isSelected
      ? 'border-emerald-600 bg-emerald-50/30 shadow-md shadow-emerald-600/10 ring-2 ring-emerald-600/20'
      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
  }`;
}

export function getGridOptionLabelClass(_variant, isSelected) {
  return `text-xs font-bold transition-colors ${isSelected ? 'text-emerald-900 font-extrabold' : 'text-slate-900'}`;
}

export function getGridCheckDotClass() {
  return 'ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs';
}

/** Unified Auxiliary UI (Search input, dropdowns, empty states) */
export function getAuxiliaryUi() {
  return {
    gridSearchInput:
      'w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 hover:border-slate-300 shadow-xs',
    dropdownCard: 'rounded-2xl border border-slate-200 bg-white p-5 shadow-xs',
    skipLink:
      'inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 transition-all hover:text-emerald-600 hover:gap-2.5',
    midSearchBtn:
      'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-900 px-4 py-2 text-xs font-bold transition-all hover:bg-slate-50 hover:shadow-xs',
    dependentSelectorHint:
      'mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-medium text-slate-600',
    emptyFilterBox:
      'mt-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-6 text-center',
    emptyFilterTitle: 'text-xs font-bold text-slate-900',
    emptyFilterSubtitle: 'mt-0.5 text-xs text-slate-500 font-medium',
  };
}

/** Unified Create prefilter content surface */
export function getSellPreflowStepSurface() {
  return 'rounded-2xl bg-white shadow-xs ring-1 ring-slate-200 p-5';
}
