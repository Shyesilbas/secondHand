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
      activeBorder: 'border-primary/30 bg-primary/5',
      activeIcon: 'bg-primary text-white',
      hoverIcon: 'group-hover:bg-primary/10 group-hover:text-primary',
      accentText: 'text-primary',
    },
    VEHICLE: {
      activeBorder: 'border-status-warning-border bg-status-warning-bg',
      activeIcon: 'bg-status-warning text-white',
      hoverIcon: 'group-hover:bg-status-warning-bg group-hover:text-status-warning',
      accentText: 'text-status-warning',
    },
    ELECTRONICS: {
      activeBorder: 'border-primary/30 bg-primary/5',
      activeIcon: 'bg-primary text-white',
      hoverIcon: 'group-hover:bg-primary/10 group-hover:text-primary',
      accentText: 'text-primary',
    },
    CLOTHING: {
      activeBorder: 'border-status-error-border bg-status-error-bg',
      activeIcon: 'bg-status-error text-white',
      hoverIcon: 'group-hover:bg-status-error-bg group-hover:text-status-error',
      accentText: 'text-status-error',
    },
    BOOKS: {
      activeBorder: 'border-status-success-border bg-status-success-bg',
      activeIcon: 'bg-status-success text-white',
      hoverIcon: 'group-hover:bg-status-success-bg group-hover:text-status-success',
      accentText: 'text-status-success',
    },
    SPORTS: {
      activeBorder: 'border-primary/30 bg-primary/5',
      activeIcon: 'bg-primary text-white',
      hoverIcon: 'group-hover:bg-primary/10 group-hover:text-primary',
      accentText: 'text-primary',
    },
  };

  const scheme = colorMap[typeValue] || {
    activeBorder: 'border-primary/30 bg-background-secondary',
    activeIcon: 'bg-primary text-white shadow-sm',
    hoverIcon: 'group-hover:bg-background-secondary',
    accentText: 'text-primary',
  };

  if (isBrowse) {
    return {
      wrapper: `group relative flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-200 focus:outline-none ${
        isSelected
          ? `border-2 ${scheme.activeBorder} shadow-sm`
          : 'border-border-light bg-background-primary hover:border-border-DEFAULT hover:shadow-sm'
      }`,
      iconBg: `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm transition-all duration-200 ${
        isSelected ? `${scheme.activeIcon} shadow-sm` : `bg-background-secondary text-text-secondary ${scheme.hoverIcon}`
      }`,
      title: isSelected ? 'text-text-primary font-bold text-sm' : 'text-text-primary font-semibold group-hover:text-text-primary text-sm',
      desc: 'hidden', // Hide description to save space
      trailing: isSelected ? scheme.accentText : 'text-text-muted group-hover:text-text-secondary',
      checkOuter: 'flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary shadow-sm',
      checkInner: 'h-2.5 w-2.5 text-white',
      chevron: 'h-4 w-4 shrink-0',
    };
  }

  return {
    wrapper: `group relative flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 focus:outline-none ${
      isSelected
        ? 'border-primary/30 bg-background-secondary shadow-sm'
        : 'border-border-light bg-background-primary hover:border-border-DEFAULT hover:shadow-sm'
    }`,
    iconBg: `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm transition-all duration-200 ${
      isSelected ? 'bg-primary text-white shadow-sm' : 'bg-background-secondary text-text-secondary group-hover:bg-background-secondary text-text-secondary'
    }`,
    title: isSelected ? 'text-text-primary font-semibold text-sm' : 'text-text-primary text-sm',
    desc: 'hidden',
    trailing: isSelected ? 'text-text-primary' : 'text-text-muted group-hover:text-text-secondary',
    checkOuter: 'flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary shadow-sm',
    checkInner: 'h-2.5 w-2.5 text-white',
    chevron: 'h-4 w-4 shrink-0',
  };
}

/** Unified Grid selection boxes (step 2+) */
export function getGridOptionClasses(variant, isSelected) {
  const isBrowse = variant === PREFLOW_WIZARD_VARIANT.BROWSE || variant === 'browse';

  if (isBrowse) {
    return `relative flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left transition-all duration-200 focus:outline-none ${
      isSelected
        ? 'border-primary bg-primary/5 shadow-sm border-2'
        : 'border-border-light bg-background-primary hover:border-border-DEFAULT hover:shadow-sm'
    }`;
  }

  return `relative flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left transition-all duration-200 focus:outline-none ${
    isSelected
      ? 'border-primary/30 bg-background-secondary shadow-sm'
      : 'border-border-light bg-background-primary hover:border-border-DEFAULT hover:shadow-sm'
  }`;
}

export function getGridOptionLabelClass(variant, isSelected) {
  const isBrowse = variant === PREFLOW_WIZARD_VARIANT.BROWSE || variant === 'browse';

  if (isBrowse) {
    return `text-body font-semibold transition-colors ${isSelected ? 'text-primary' : 'text-text-secondary'}`;
  }

  return `text-body font-medium ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`;
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
