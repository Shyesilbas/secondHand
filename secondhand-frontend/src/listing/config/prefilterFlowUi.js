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
      shell: 'min-h-screen bg-background-secondary pb-4',
      stickyOuter: 'border-b border-border-light bg-background-primary',
      cancelBtn:
        'group flex items-center gap-1.5 rounded-lg py-2 pl-2 pr-3 text-xs font-medium text-text-secondary transition-all hover:bg-background-secondary hover:text-text-primary hover:shadow-sm',
      stepActiveMob: 'bg-primary text-white shadow-sm',
      stepDoneMob: 'bg-primary/10 text-primary font-semibold',
      stepTodoMob: 'bg-transparent text-text-muted border border-border-light',
      connectorDone: 'bg-primary',
      connectorTodo: 'bg-border-light',
      progressTrack: 'bg-border-light',
      progressFill: 'from-primary to-primary-hover',
      sidebarCardActive: 'border-transparent bg-transparent',
      sidebarStepActive: 'bg-primary text-white shadow-sm',
      sidebarStepDone: 'bg-primary/10 text-primary font-semibold',
      sidebarStepTodo: 'bg-transparent text-text-muted border border-border-light',
      sidebarTitleActive: 'text-text-primary font-semibold',
      sidebarTitleDone: 'text-primary/80',
      sidebarTitleTodo: 'text-text-muted',
      sidebarStepDesc: 'text-caption text-text-secondary',
      descMuted: 'text-text-secondary',
      stepMeta: 'text-text-secondary font-medium',
      eyebrowWrap: 'mb-3 inline-flex items-center',
      eyebrowBadge: 'rounded-lg bg-primary/10 px-2.5 py-1 text-caption font-semibold uppercase tracking-wider text-primary',
      pageTitle: 'text-text-primary',
      bottomBar: 'relative mt-4 border-t border-border-light bg-transparent py-4',
      footerBackBtn:
        'flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-text-secondary transition-all hover:bg-background-secondary hover:text-text-primary hover:shadow-sm',
      primaryBtn:
        'flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md disabled:cursor-not-allowed disabled:bg-background-secondary disabled:text-text-secondary disabled:shadow-none',
      draftBtnClass: 'hidden',
      stepScrollWell: '',
    };
  }

  // Default theme for Sell / Composer variants
  return {
    shell: 'min-h-screen bg-background-secondary pb-4 flex flex-col',
    stickyOuter: 'border-b border-border-light bg-background-primary',
    cancelBtn:
      'group flex items-center gap-1.5 rounded-lg py-2 pl-2 pr-3 text-xs font-medium text-text-secondary transition-all hover:bg-background-secondary hover:text-text-primary hover:shadow-sm',
    stepActiveMob: 'bg-primary text-white shadow-sm',
    stepDoneMob: 'bg-background-secondary text-text-primary',
    stepTodoMob: 'bg-transparent text-text-muted border border-border-light',
    connectorDone: 'bg-primary',
    connectorTodo: 'bg-border-light',
    progressTrack: 'bg-border-light',
    progressFill: 'from-primary to-primary-hover',
    sidebarCardActive: 'border-transparent bg-transparent',
    sidebarStepActive: 'bg-primary text-white shadow-sm',
    sidebarStepDone: 'bg-background-secondary text-text-primary',
    sidebarStepTodo: 'bg-transparent text-text-muted border border-border-light',
    sidebarTitleActive: 'text-text-primary font-medium',
    sidebarTitleDone: 'text-text-secondary',
    sidebarTitleTodo: 'text-text-muted',
    sidebarStepDesc: 'text-caption text-text-secondary',
    descMuted: 'text-text-secondary',
    stepMeta: 'text-text-secondary',
    eyebrowWrap: 'mb-3 inline-flex items-center',
    eyebrowBadge: 'rounded-lg bg-background-secondary px-2.5 py-1 text-caption font-semibold uppercase tracking-wider text-text-secondary',
    pageTitle: 'text-text-primary',
    bottomBar: 'fixed bottom-0 left-0 right-0 z-40 border-t border-border-light bg-background-primary py-3',
    footerBackBtn:
      'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:bg-background-secondary hover:text-text-primary hover:shadow-sm',
    primaryBtn:
      'flex items-center gap-2 rounded-xl bg-primary px-8 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md disabled:cursor-not-allowed disabled:bg-background-secondary disabled:text-text-secondary disabled:shadow-none',
    draftBtnClass:
      'flex items-center gap-1.5 rounded-xl border border-border-light bg-background-primary px-5 py-2 text-sm font-medium text-text-secondary transition-all hover:border-border-focus hover:bg-background-secondary hover:shadow-sm disabled:cursor-not-allowed disabled:bg-background-secondary disabled:opacity-50',
    stepScrollWell: '',
  };
}

/** Unified Category selection cards (step 1) */
export function getCategoryCardClasses(variant, isSelected, typeValue) {
  const isBrowse = variant === PREFLOW_WIZARD_VARIANT.BROWSE || variant === 'browse';

  // Config mapping for category-specific colors
  const colorMap = {
    REAL_ESTATE: {
      activeBorder: 'border-primary/40 bg-primary/5 shadow-md shadow-primary/10 ring-2 ring-primary/20',
      activeIcon: 'bg-gradient-to-br from-primary to-blue-600 text-white shadow-md shadow-primary/25',
      hoverIcon: 'group-hover:bg-primary/10 group-hover:text-primary',
      accentText: 'text-primary',
    },
    VEHICLE: {
      activeBorder: 'border-amber-500/40 bg-amber-500/5 shadow-md shadow-amber-500/10 ring-2 ring-amber-500/20',
      activeIcon: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25',
      hoverIcon: 'group-hover:bg-amber-500/10 group-hover:text-amber-600',
      accentText: 'text-amber-600',
    },
    ELECTRONICS: {
      activeBorder: 'border-indigo-500/40 bg-indigo-500/5 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20',
      activeIcon: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25',
      hoverIcon: 'group-hover:bg-indigo-500/10 group-hover:text-indigo-600',
      accentText: 'text-indigo-600',
    },
    CLOTHING: {
      activeBorder: 'border-rose-500/40 bg-rose-500/5 shadow-md shadow-rose-500/10 ring-2 ring-rose-500/20',
      activeIcon: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25',
      hoverIcon: 'group-hover:bg-rose-500/10 group-hover:text-rose-600',
      accentText: 'text-rose-600',
    },
    BOOKS: {
      activeBorder: 'border-emerald-500/40 bg-emerald-500/5 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20',
      activeIcon: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25',
      hoverIcon: 'group-hover:bg-emerald-500/10 group-hover:text-emerald-600',
      accentText: 'text-emerald-600',
    },
    SPORTS: {
      activeBorder: 'border-cyan-500/40 bg-cyan-500/5 shadow-md shadow-cyan-500/10 ring-2 ring-cyan-500/20',
      activeIcon: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25',
      hoverIcon: 'group-hover:bg-cyan-500/10 group-hover:text-cyan-600',
      accentText: 'text-cyan-600',
    },
  };

  const scheme = colorMap[typeValue] || {
    activeBorder: 'border-primary/40 bg-primary/5 shadow-md ring-2 ring-primary/20',
    activeIcon: 'bg-gradient-to-br from-primary to-primary-hover text-white shadow-md',
    hoverIcon: 'group-hover:bg-background-secondary',
    accentText: 'text-primary',
  };

  if (isBrowse) {
    return {
      wrapper: `group relative flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-all duration-250 focus:outline-none backdrop-blur-sm ${
        isSelected
          ? `${scheme.activeBorder}`
          : 'border-border-light/80 bg-background-primary/90 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5'
      }`,
      iconBg: `flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg transition-all duration-250 ${
        isSelected ? `${scheme.activeIcon}` : `bg-background-secondary text-text-secondary ${scheme.hoverIcon}`
      }`,
      title: isSelected ? 'text-text-primary font-bold text-sm tracking-tight' : 'text-text-primary font-semibold text-sm group-hover:text-primary transition-colors',
      desc: 'text-xs text-text-muted mt-0.5 font-normal line-clamp-1',
      trailing: isSelected ? scheme.accentText : 'text-text-muted group-hover:text-text-secondary',
      checkOuter: 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-white shadow-md shadow-primary/30',
      checkInner: 'h-3 w-3 text-white',
      chevron: 'h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5',
    };
  }

  return {
    wrapper: `group relative flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3 text-left transition-all duration-250 focus:outline-none backdrop-blur-sm ${
      isSelected
        ? `${scheme.activeBorder}`
        : 'border-border-light/80 bg-background-primary/90 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5'
    }`,
    iconBg: `flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg transition-all duration-250 ${
      isSelected ? `${scheme.activeIcon}` : 'bg-background-secondary text-text-secondary group-hover:bg-background-secondary'
    }`,
    title: isSelected ? 'text-text-primary font-bold text-sm tracking-tight' : 'text-text-primary font-semibold text-sm',
    desc: 'text-xs text-text-muted mt-0.5 font-normal line-clamp-1',
    trailing: isSelected ? 'text-text-primary' : 'text-text-muted group-hover:text-text-secondary',
    checkOuter: 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-white shadow-md shadow-primary/30',
    checkInner: 'h-3 w-3 text-white',
    chevron: 'h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5',
  };
}

/** Unified Grid selection boxes (step 2+) */
export function getGridOptionClasses(variant, isSelected) {
  const isBrowse = variant === PREFLOW_WIZARD_VARIANT.BROWSE || variant === 'browse';

  if (isBrowse) {
    return `relative flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-200 focus:outline-none ${
      isSelected
        ? 'border-primary/50 bg-primary/10 shadow-md ring-2 ring-primary/20'
        : 'border-border-light/80 bg-background-primary hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5'
    }`;
  }

  return `relative flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-200 focus:outline-none ${
    isSelected
      ? 'border-primary/50 bg-primary/10 shadow-md ring-2 ring-primary/20'
      : 'border-border-light/80 bg-background-primary hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5'
  }`;
}

export function getGridOptionLabelClass(variant, isSelected) {
  const isBrowse = variant === PREFLOW_WIZARD_VARIANT.BROWSE || variant === 'browse';

  if (isBrowse) {
    return `text-body font-semibold transition-colors ${isSelected ? 'text-primary' : 'text-text-primary'}`;
  }

  return `text-body font-semibold transition-colors ${isSelected ? 'text-primary' : 'text-text-primary'}`;
}

export function getGridCheckDotClass() {
  return 'ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary shadow-sm';
}

/** Unified Auxiliary UI (Search input, dropdowns, empty states) */
export function getAuxiliaryUi(variant) {
  const isBrowse = variant === PREFLOW_WIZARD_VARIANT.BROWSE || variant === 'browse';

  if (isBrowse) {
    return {
      gridSearchInput:
        'w-full rounded-xl border border-border-light bg-background-primary py-2.5 pl-10 pr-3 text-body text-text-primary placeholder:text-text-muted transition-all focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary/10 hover:border-border-DEFAULT shadow-sm',
      dropdownCard: 'rounded-xl border border-border-light bg-background-primary p-5 shadow-sm',
      skipLink:
        'inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary transition-all hover:text-primary hover:gap-2.5',
      midSearchBtn:
        'inline-flex items-center gap-2 rounded-xl border border-border-light bg-background-primary text-text-primary px-4 py-2 text-sm font-semibold transition-all hover:bg-background-secondary hover:shadow-sm',
      dependentSelectorHint:
        'mt-3 rounded-xl border border-border-light bg-background-secondary px-3 py-2 text-center text-[12px] font-medium text-text-secondary',
      emptyFilterBox:
        'mt-4 rounded-xl border border-dashed border-border-light bg-background-secondary py-6 text-center',
      emptyFilterTitle: 'text-body font-medium text-text-primary',
      emptyFilterSubtitle: 'mt-0.5 text-[12px] text-text-secondary',
    };
  }

  return {
    gridSearchInput:
      'w-full rounded-xl border border-border-light bg-background-primary py-2 pl-10 pr-3 text-body text-text-primary placeholder:text-text-muted transition-all focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary/10 hover:border-border-DEFAULT',
    dropdownCard: 'rounded-xl border border-border-light bg-background-primary p-4 shadow-sm',
    skipLink:
      'inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-all hover:text-text-primary hover:gap-2.5',
    midSearchBtn:
      'inline-flex items-center gap-2 rounded-xl border border-border-light bg-background-primary px-4 py-2 text-sm font-medium text-text-primary transition-all hover:bg-background-secondary hover:shadow-sm',
    dependentSelectorHint:
      'mt-3 rounded-xl border border-border-light bg-background-secondary px-3 py-2 text-center text-[12px] font-medium text-text-secondary',
    emptyFilterBox:
      'mt-4 rounded-xl border border-dashed border-border-light bg-background-secondary py-6 text-center',
    emptyFilterTitle: 'text-body font-medium text-text-primary',
    emptyFilterSubtitle: 'mt-0.5 text-[12px] text-text-secondary',
  };
}

/** Unified Create prefilter content surface */
export function getSellPreflowStepSurface() {
  return 'rounded-xl bg-background-primary shadow-sm ring-1 ring-border-light p-4';
}
