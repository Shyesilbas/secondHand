/**
 * Unified UI configuration for listing prefilter and creation forms.
 * Provides a clean, minimalist, professional aesthetic without colorful gradients.
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
    shell: 'min-h-screen bg-gray-50/50 pb-28',
    stickyOuter: 'border-b border-gray-200 bg-white',
    cancelBtn:
      'group flex items-center gap-1.5 rounded-md py-2 pl-2 pr-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900',
    stepActiveMob: 'bg-black text-white',
    stepDoneMob: 'bg-gray-100 text-gray-900',
    stepTodoMob: 'bg-transparent text-gray-400 border border-gray-200',
    connectorDone: 'bg-gray-900',
    connectorTodo: 'bg-gray-200',
    progressTrack: 'bg-gray-100',
    progressFill: 'from-gray-900 to-black',
    sidebarCardActive: 'border-transparent bg-transparent',
    sidebarStepActive: 'bg-black text-white',
    sidebarStepDone: 'bg-gray-100 text-gray-900',
    sidebarStepTodo: 'bg-transparent text-gray-400 border border-gray-200',
    sidebarTitleActive: 'text-gray-900 font-medium',
    sidebarTitleDone: 'text-gray-600',
    sidebarTitleTodo: 'text-gray-400',
    sidebarStepDesc: 'text-[11px] text-gray-500',
    descMuted: 'text-gray-500',
    stepMeta: 'text-gray-500',
    eyebrowWrap: 'mb-3 inline-flex items-center',
    eyebrowBadge: 'rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-600',
    pageTitle: 'text-gray-900',
    bottomBar: 'fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-md',
    footerBackBtn:
      'flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900',
    primaryBtn:
      'flex items-center gap-2 rounded-lg bg-black px-8 py-2.5 text-sm font-medium text-white shadow-md shadow-black/10 transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none',
    draftBtnClass:
      'flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50',
    stepScrollWell: '',
  };
}

/** Unified Category selection cards (step 1) */
export function getCategoryCardClasses(variant, isSelected) {
  return {
    wrapper: `group relative flex w-full items-center gap-4 rounded-lg border px-4 py-3.5 text-left transition-all duration-150 focus:outline-none ${
      isSelected
        ? 'border-black bg-gray-50 shadow-sm'
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`,
    iconBg: `flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-lg transition-colors duration-150 ${
      isSelected ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
    }`,
    title: isSelected ? 'text-black' : 'text-gray-900',
    desc: isSelected ? 'text-gray-700' : 'text-gray-500',
    trailing: isSelected ? 'text-black' : 'text-gray-300 group-hover:text-gray-400',
    checkOuter: 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black',
    checkInner: 'h-3 w-3 text-white',
    chevron: 'h-4 w-4 shrink-0',
  };
}

/** Unified Grid selection boxes (step 2+) */
export function getGridOptionClasses(variant, isSelected) {
  return `relative flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-all duration-150 focus:outline-none ${
    isSelected
      ? 'border-black bg-gray-50 shadow-sm'
      : 'border-gray-200 bg-white hover:border-gray-300'
  }`;
}

export function getGridOptionLabelClass(variant, isSelected) {
  return `text-[13px] font-medium ${isSelected ? 'text-black' : 'text-gray-700'}`;
}

export function getGridCheckDotClass(variant) {
  return 'ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-black';
}

/** Unified Auxiliary UI (Search input, dropdowns, empty states) */
export function getAuxiliaryUi(variant) {
  return {
    gridSearchInput:
      'w-full rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-[13px] text-gray-900 placeholder:text-gray-400 transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900/10',
    dropdownCard: 'rounded-lg border border-gray-200 bg-white p-5',
    skipLink:
      'inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-black',
    midSearchBtn:
      'inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50',
    dependentSelectorHint:
      'mt-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-center text-[12px] font-medium text-gray-600',
    emptyFilterBox:
      'mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-center',
    emptyFilterTitle: 'text-[13px] font-medium text-gray-900',
    emptyFilterSubtitle: 'mt-0.5 text-[12px] text-gray-500',
  };
}

/** Unified Create prefilter content surface */
export function getSellPreflowStepSurface() {
  return 'rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm';
}
