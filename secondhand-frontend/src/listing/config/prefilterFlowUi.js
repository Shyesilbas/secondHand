/**
 * Unified UI configuration for listing prefilter and creation forms.
 * Provides a clean, minimalist, professional aesthetic with glassmorphism depth.
 */

export const PREFLOW_WIZARD_VARIANT = {
  BROWSE: 'browse',
  SELL: 'sell',
  COMPOSER: 'composer',
  DEFAULT: 'default',
};

/** Unified ListingWizard shell and step styling */
export function getWizardTheme(variant) {
  // All variants now share a unified, professional clean theme
  return {
    shell: 'min-h-screen bg-gradient-to-b from-zinc-50 via-zinc-50/80 to-white pb-28',
    stickyOuter: 'border-b border-zinc-200/40 bg-white/80 backdrop-blur-xl',
    cancelBtn:
      'group flex items-center gap-1.5 rounded-lg py-2 pl-2 pr-3 text-xs font-medium text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900 hover:shadow-sm',
    stepActiveMob: 'bg-zinc-900 text-white shadow-sm',
    stepDoneMob: 'bg-zinc-100 text-zinc-900',
    stepTodoMob: 'bg-transparent text-zinc-400 border border-zinc-200/60',
    connectorDone: 'bg-zinc-900',
    connectorTodo: 'bg-zinc-200',
    progressTrack: 'bg-zinc-100',
    progressFill: 'from-zinc-900 to-black',
    sidebarCardActive: 'border-transparent bg-transparent',
    sidebarStepActive: 'bg-zinc-900 text-white shadow-sm',
    sidebarStepDone: 'bg-zinc-100 text-zinc-900',
    sidebarStepTodo: 'bg-transparent text-zinc-400 border border-zinc-200/60',
    sidebarTitleActive: 'text-zinc-900 font-medium',
    sidebarTitleDone: 'text-zinc-600',
    sidebarTitleTodo: 'text-zinc-400',
    sidebarStepDesc: 'text-[11px] text-zinc-500',
    descMuted: 'text-zinc-500',
    stepMeta: 'text-zinc-500',
    eyebrowWrap: 'mb-3 inline-flex items-center',
    eyebrowBadge: 'rounded-lg bg-zinc-100/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600',
    pageTitle: 'text-zinc-900',
    bottomBar: 'fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200/40 bg-white/90 backdrop-blur-xl',
    footerBackBtn:
      'flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 hover:shadow-sm',
    primaryBtn:
      'flex items-center gap-2 rounded-xl bg-zinc-900 px-8 py-2.5 text-sm font-medium text-white shadow-md shadow-zinc-900/15 transition-all hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-900/20 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 disabled:shadow-none',
    draftBtnClass:
      'flex items-center gap-1.5 rounded-xl border border-zinc-200/60 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-50',
    stepScrollWell: '',
  };
}

/** Unified Category selection cards (step 1) */
export function getCategoryCardClasses(variant, isSelected) {
  return {
    wrapper: `group relative flex w-full items-center gap-4 rounded-xl border px-4 py-4 text-left transition-all duration-200 focus:outline-none ${
      isSelected
        ? 'border-zinc-900/20 bg-zinc-50/80 shadow-md shadow-zinc-200/50'
        : 'border-zinc-200/60 bg-white hover:border-zinc-300 hover:shadow-sm'
    }`,
    iconBg: `flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg transition-all duration-200 ${
      isSelected ? 'bg-zinc-900 text-white shadow-sm' : 'bg-zinc-100/80 text-zinc-500 group-hover:bg-zinc-200/60'
    }`,
    title: isSelected ? 'text-zinc-900' : 'text-zinc-900',
    desc: isSelected ? 'text-zinc-700' : 'text-zinc-500',
    trailing: isSelected ? 'text-zinc-900' : 'text-zinc-300 group-hover:text-zinc-400',
    checkOuter: 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 shadow-sm',
    checkInner: 'h-3 w-3 text-white',
    chevron: 'h-4 w-4 shrink-0',
  };
}

/** Unified Grid selection boxes (step 2+) */
export function getGridOptionClasses(variant, isSelected) {
  return `relative flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all duration-200 focus:outline-none ${
    isSelected
      ? 'border-zinc-900/20 bg-zinc-50/80 shadow-md shadow-zinc-200/50'
      : 'border-zinc-200/60 bg-white hover:border-zinc-300 hover:shadow-sm'
  }`;
}

export function getGridOptionLabelClass(variant, isSelected) {
  return `text-[13px] font-medium ${isSelected ? 'text-zinc-900' : 'text-zinc-700'}`;
}

export function getGridCheckDotClass(variant) {
  return 'ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-900 shadow-sm';
}

/** Unified Auxiliary UI (Search input, dropdowns, empty states) */
export function getAuxiliaryUi(variant) {
  return {
    gridSearchInput:
      'w-full rounded-xl border border-zinc-200/60 bg-white py-2.5 pl-10 pr-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 hover:border-zinc-300 wizard-input-glow',
    dropdownCard: 'rounded-xl border border-zinc-200/40 wizard-glass-elevated p-5',
    skipLink:
      'inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-all hover:text-zinc-900 hover:gap-2.5',
    midSearchBtn:
      'inline-flex items-center gap-2 rounded-xl border border-zinc-200/60 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition-all hover:bg-zinc-50 hover:shadow-sm',
    dependentSelectorHint:
      'mt-3 rounded-xl border border-zinc-200/60 bg-zinc-50/80 px-3 py-2.5 text-center text-[12px] font-medium text-zinc-600',
    emptyFilterBox:
      'mt-4 rounded-xl border border-dashed border-zinc-300/60 bg-zinc-50/50 py-8 text-center',
    emptyFilterTitle: 'text-[13px] font-medium text-zinc-900',
    emptyFilterSubtitle: 'mt-0.5 text-[12px] text-zinc-500',
  };
}

/** Unified Create prefilter content surface */
export function getSellPreflowStepSurface() {
  return 'rounded-2xl wizard-glass-elevated p-4 sm:p-5';
}
