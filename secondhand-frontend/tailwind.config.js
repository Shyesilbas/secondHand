import { theme } from './src/common/theme/theme.js';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          ...theme.colors.primary,
          DEFAULT: theme.colors.primary.DEFAULT,
        },
        secondary: {
          ...theme.colors.secondary,
          DEFAULT: theme.colors.secondary.DEFAULT,
        },
        accent: {
          indigo: theme.colors.accent.indigo,
          emerald: theme.colors.accent.emerald,
          amber: theme.colors.accent.amber,
        },
        background: theme.colors.background,
        text: theme.colors.text,
        border: theme.colors.border,
        status: theme.colors.status,
        card: theme.colors.card,
        button: theme.colors.button,
        
        'app-bg': theme.colors.background.secondary,
        'main-bg': theme.colors.background.primary,
        'sidebar-bg': theme.colors.background.tertiary,
        'sidebar-border': theme.colors.border.DEFAULT,
        'header-bg': theme.colors.background.secondary,
        'header-border': theme.colors.border.light,
        'auth-bg': theme.colors.background.tertiary,

        'text-primary': theme.colors.text.primary,
        'text-price': theme.colors.accent.emerald.DEFAULT,
        'text-secondary': theme.colors.text.secondary,
        'text-muted': theme.colors.text.muted,

        'btn-primary': theme.colors.button.primary.bg,
        'btn-primary-hover': theme.colors.button.primary.hover,
        'btn-secondary': theme.colors.button.secondary.bg,
        'btn-secondary-hover': theme.colors.button.secondary.hover,

        'alert-success': theme.colors.status.success.DEFAULT,
        'alert-error': theme.colors.status.error.DEFAULT,
        'alert-warning': theme.colors.status.warning.DEFAULT,
        'alert-info': theme.colors.status.info.DEFAULT,

        'card-bg': theme.colors.card.bg,
        'card-border': theme.colors.card.border,
        'card-border-hover': theme.colors.card.borderHover,
        'card-text-primary': theme.colors.text.primary,
        'card-text-secondary': theme.colors.text.secondary,
        'card-text-muted': theme.colors.text.muted,
        'highlight': theme.colors.accent.emerald.DEFAULT,
        'warning-bg': theme.colors.status.warning.bg,
        'warning-border': theme.colors.status.warning.border,
        'warning-text': theme.colors.status.warning.text,
      },
      boxShadow: {
        'card': theme.shadows.sm,
        'card-lg': theme.shadows.md,
        ...theme.shadows,
      },
      borderRadius: {
        'card': theme.borderRadius.lg,
        'card-2xl': theme.borderRadius.xl,
        ...theme.borderRadius,
      },
      transitionDuration: {
        fast: theme.transitions.fast,
        DEFAULT: theme.transitions.DEFAULT,
        slow: theme.transitions.slow,
        slower: theme.transitions.slower,
      },
      zIndex: theme.zIndex,
    },
  },
  plugins: [],
}
