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
  const isBrowse = variant === PREFLOW_WIZARD_VARIANT.BROWSE || variant === 'browse';

  if (isBrowse) {
    return {
      shell: 'min-h-screen bg-gradient-to-tr from-slate-50 via-zinc-50/80 to-indigo-50/20 pb-16',
      stickyOuter: 'border-b border-zinc-200/40 bg-background-primary/70 backdrop-blur-xl',
      cancelBtn:
        'group flex items-center gap-1.5 rounded-lg py-2 pl-2 pr-3 text-xs font-medium text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900 hover:shadow-sm',
      stepActiveMob: 'bg-primary text-white shadow-md shadow-indigo-600/10',
      stepDoneMob: 'bg-indigo-50 text-primary font-semibold',
      stepTodoMob: 'bg-transparent text-zinc-400 border border-zinc-200/60',
      connectorDone: 'bg-primary',
      connectorTodo: 'bg-zinc-200',
      progressTrack: 'bg-zinc-100',
      progressFill: 'from-indigo-600 to-violet-700',
      sidebarCardActive: 'border-transparent bg-transparent',
      sidebarStepActive: 'bg-primary text-white shadow-md shadow-indigo-600/10',
      sidebarStepDone: 'bg-indigo-50 text-primary font-semibold',
      sidebarStepTodo: 'bg-transparent text-zinc-400 border border-zinc-200/60',
      sidebarTitleActive: 'text-zinc-900 font-semibold',
      sidebarTitleDone: 'text-primary/80',
      sidebarTitleTodo: 'text-zinc-400',
      sidebarStepDesc: 'text-caption text-zinc-500',
      descMuted: 'text-zinc-500',
      stepMeta: 'text-zinc-500 font-medium',
      eyebrowWrap: 'mb-3 inline-flex items-center',
      eyebrowBadge: 'rounded-lg bg-indigo-50 px-2.5 py-1 text-caption font-semibold uppercase tracking-wider text-primary',
      pageTitle: 'text-zinc-900',
      bottomBar: 'relative mt-10 border-t border-zinc-200/60 bg-transparent py-6', // relative layout for browse mode!
      footerBackBtn:
        'flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 hover:shadow-sm',
      primaryBtn:
        'flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-600/15 transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-900/20 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 disabled:shadow-none',
      draftBtnClass: 'hidden',
      stepScrollWell: '',
    };
  }

  // Default theme for Sell / Composer variants
  return {
    shell: 'min-h-screen bg-gradient-to-b from-zinc-50 via-zinc-50/80 to-white pb-28',
    stickyOuter: 'border-b border-zinc-200/40 bg-background-primary/80 backdrop-blur-xl',
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
    sidebarStepDesc: 'text-caption text-zinc-500',
    descMuted: 'text-zinc-500',
    stepMeta: 'text-zinc-500',
    eyebrowWrap: 'mb-3 inline-flex items-center',
    eyebrowBadge: 'rounded-lg bg-zinc-100/80 px-2.5 py-1 text-caption font-semibold uppercase tracking-wider text-zinc-600',
    pageTitle: 'text-zinc-900',
    bottomBar: 'fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200/40 bg-background-primary/90 backdrop-blur-xl',
    footerBackBtn:
      'flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 hover:shadow-sm',
    primaryBtn:
      'flex items-center gap-2 rounded-xl bg-zinc-900 px-8 py-2.5 text-sm font-medium text-white shadow-md shadow-zinc-900/15 transition-all hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-900/20 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 disabled:shadow-none',
    draftBtnClass:
      'flex items-center gap-1.5 rounded-xl border border-zinc-200/60 bg-background-primary px-5 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-50',
    stepScrollWell: '',
  };
}

/** Unified Category selection cards (step 1) */
export function getCategoryCardClasses(variant, isSelected, typeValue) {
  const isBrowse = variant === PREFLOW_WIZARD_VARIANT.BROWSE || variant === 'browse';

  // Config mapping for category-specific colors
  const colorMap = {
    REAL_ESTATE: {
      activeBorder: 'border-primary/30 bg-blue-50/40 shadow-blue-100/50',
      activeIcon: 'bg-primary text-white shadow-blue-600/20',
      hoverIcon: 'group-hover:bg-blue-100/70 group-hover:text-primary',
      accentText: 'text-primary',
    },
    VEHICLE: {
      activeBorder: 'border-amber-500/30 bg-status-warning-bg/40 shadow-amber-100/50',
      activeIcon: 'bg-status-warning-bg text-white shadow-amber-600/20',
      hoverIcon: 'group-hover:bg-status-warning-bg/70 group-hover:text-status-warning',
      accentText: 'text-status-warning',
    },
    ELECTRONICS: {
      activeBorder: 'border-cyan-500/30 bg-cyan-50/40 shadow-cyan-100/50',
      activeIcon: 'bg-cyan-600 text-white shadow-cyan-600/20',
      hoverIcon: 'group-hover:bg-cyan-100/70 group-hover:text-cyan-600',
      accentText: 'text-cyan-600',
    },
    CLOTHING: {
      activeBorder: 'border-rose-500/30 bg-rose-50/40 shadow-rose-100/50',
      activeIcon: 'bg-rose-600 text-white shadow-rose-600/20',
      hoverIcon: 'group-hover:bg-rose-100/70 group-hover:text-rose-600',
      accentText: 'text-rose-600',
    },
    BOOKS: {
      activeBorder: 'border-emerald-500/30 bg-status-success-bg/40 shadow-emerald-100/50',
      activeIcon: 'bg-status-success-bg text-white shadow-emerald-600/20',
      hoverIcon: 'group-hover:bg-status-success-bg/70 group-hover:text-status-success',
      accentText: 'text-status-success',
    },
    SPORTS: {
      activeBorder: 'border-violet-500/30 bg-primary/40 shadow-violet-100/50',
      activeIcon: 'bg-primary text-white shadow-violet-600/20',
      hoverIcon: 'group-hover:bg-primary/70 group-hover:text-violet-600',
      accentText: 'text-violet-600',
    },
  };

  const scheme = colorMap[typeValue] || {
    activeBorder: 'border-zinc-900/25 bg-zinc-50/80 shadow-zinc-200/50',
    activeIcon: 'bg-zinc-900 text-white shadow-sm',
    hoverIcon: 'group-hover:bg-zinc-200/60',
    accentText: 'text-zinc-900',
  };

  if (isBrowse) {
    return {
      wrapper: `group relative flex w-full items-center gap-4 rounded-2xl border px-5 py-5 text-left transition-all duration-300 focus:outline-none ${
        isSelected
          ? `border-2 ${scheme.activeBorder} shadow-lg scale-[1.01]`
          : 'border-zinc-200/70 bg-background-primary hover:border-zinc-300 hover:shadow-md hover:scale-[1.01] hover:translate-y-[-1px]'
      }`,
      iconBg: `flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl transition-all duration-300 ${
        isSelected ? `${scheme.activeIcon} shadow-md` : `bg-zinc-50 text-zinc-500 ${scheme.hoverIcon}`
      }`,
      title: isSelected ? 'text-zinc-900 font-bold' : 'text-zinc-800 font-semibold group-hover:text-zinc-900',
      desc: isSelected ? 'text-zinc-600 text-[12px]' : 'text-zinc-500 text-[12px] group-hover:text-zinc-600',
      trailing: isSelected ? scheme.accentText : 'text-zinc-300 group-hover:text-zinc-400',
      checkOuter: 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 shadow-sm',
      checkInner: 'h-3 w-3 text-white',
      chevron: 'h-4 w-4 shrink-0',
    };
  }

  return {
    wrapper: `group relative flex w-full items-center gap-4 rounded-xl border px-4 py-4 text-left transition-all duration-200 focus:outline-none ${
      isSelected
        ? 'border-zinc-900/20 bg-zinc-50/80 shadow-md shadow-zinc-200/50'
        : 'border-zinc-200/60 bg-background-primary hover:border-zinc-300 hover:shadow-sm'
    }`,
    iconBg: `flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg transition-all duration-200 ${
      isSelected ? 'bg-zinc-900 text-white shadow-sm' : 'bg-zinc-100/80 text-zinc-500 group-hover:bg-zinc-200/60'
    }`,
    title: isSelected ? 'text-zinc-900 font-semibold' : 'text-zinc-900',
    desc: isSelected ? 'text-zinc-700' : 'text-zinc-500',
    trailing: isSelected ? 'text-zinc-900' : 'text-zinc-300 group-hover:text-zinc-400',
    checkOuter: 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 shadow-sm',
    checkInner: 'h-3 w-3 text-white',
    chevron: 'h-4 w-4 shrink-0',
  };
}

/** Unified Grid selection boxes (step 2+) */
export function getGridOptionClasses(variant, isSelected) {
  const isBrowse = variant === PREFLOW_WIZARD_VARIANT.BROWSE || variant === 'browse';

  if (isBrowse) {
    return `relative flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all duration-300 focus:outline-none ${
      isSelected
        ? 'border-primary/30 bg-indigo-50/30 shadow-md shadow-indigo-100/40 border-2'
        : 'border-zinc-200/70 bg-background-primary hover:border-zinc-300 hover:shadow-sm hover:scale-[1.005]'
    }`;
  }

  return `relative flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all duration-200 focus:outline-none ${
    isSelected
      ? 'border-zinc-900/20 bg-zinc-50/80 shadow-md shadow-zinc-200/50'
      : 'border-zinc-200/60 bg-background-primary hover:border-zinc-300 hover:shadow-sm'
  }`;
}

export function getGridOptionLabelClass(variant, isSelected) {
  const isBrowse = variant === PREFLOW_WIZARD_VARIANT.BROWSE || variant === 'browse';

  if (isBrowse) {
    return `text-body font-semibold transition-colors ${isSelected ? 'text-primary' : 'text-zinc-700'}`;
  }

  return `text-body font-medium ${isSelected ? 'text-zinc-900' : 'text-zinc-700'}`;
}

export function getGridCheckDotClass(variant) {
  const isBrowse = variant === PREFLOW_WIZARD_VARIANT.BROWSE || variant === 'browse';

  if (isBrowse) {
    return 'ml-2 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-primary shadow-sm';
  }

  return 'ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-900 shadow-sm';
}

/** Unified Auxiliary UI (Search input, dropdowns, empty states) */
export function getAuxiliaryUi(variant) {
  const isBrowse = variant === PREFLOW_WIZARD_VARIANT.BROWSE || variant === 'browse';

  if (isBrowse) {
    return {
      gridSearchInput:
        'w-full rounded-2xl border border-zinc-200 bg-background-primary py-3 pl-11 pr-4 text-body text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-indigo-100 hover:border-zinc-300 shadow-sm',
      dropdownCard: 'rounded-2xl border border-zinc-200/60 bg-background-primary/70 backdrop-blur-md p-6 shadow-sm',
      skipLink:
        'inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition-all hover:text-primary hover:gap-2.5',
      midSearchBtn:
        'inline-flex items-center gap-2 rounded-xl border border-primary/50 bg-indigo-50/50 text-primary px-4 py-2.5 text-sm font-semibold transition-all hover:bg-indigo-50 hover:shadow-sm',
      dependentSelectorHint:
        'mt-3 rounded-xl border border-zinc-200/60 bg-zinc-50/80 px-3 py-2.5 text-center text-[12px] font-medium text-zinc-600',
      emptyFilterBox:
        'mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 py-8 text-center',
      emptyFilterTitle: 'text-body font-medium text-zinc-900',
      emptyFilterSubtitle: 'mt-0.5 text-[12px] text-zinc-500',
    };
  }

  return {
    gridSearchInput:
      'w-full rounded-xl border border-zinc-200/60 bg-background-primary py-2.5 pl-10 pr-3 text-body text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 hover:border-zinc-300 wizard-input-glow',
    dropdownCard: 'rounded-xl border border-zinc-200/40 wizard-glass-elevated p-5',
    skipLink:
      'inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-all hover:text-zinc-900 hover:gap-2.5',
    midSearchBtn:
      'inline-flex items-center gap-2 rounded-xl border border-zinc-200/60 bg-background-primary px-4 py-2.5 text-sm font-medium text-zinc-900 transition-all hover:bg-zinc-50 hover:shadow-sm',
    dependentSelectorHint:
      'mt-3 rounded-xl border border-zinc-200/60 bg-zinc-50/80 px-3 py-2.5 text-center text-[12px] font-medium text-zinc-600',
    emptyFilterBox:
      'mt-4 rounded-xl border border-dashed border-zinc-300/60 bg-zinc-50/50 py-8 text-center',
    emptyFilterTitle: 'text-body font-medium text-zinc-900',
    emptyFilterSubtitle: 'mt-0.5 text-[12px] text-zinc-500',
  };
}

/** Unified Create prefilter content surface */
export function getSellPreflowStepSurface() {
  return 'rounded-2xl wizard-glass-elevated p-4 sm:p-5';
}
