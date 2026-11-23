import { theme } from './src/common/theme/theme.js';

const cssRgb = (varName) => `rgb(var(${varName}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        primary: {
          ...theme.colors.primary,
          DEFAULT: cssRgb('--color-primary'),
          hover: cssRgb('--color-primary-hover'),
        },
        secondary: {
          ...theme.colors.secondary,
          200: cssRgb('--color-secondary-200'),
          DEFAULT: theme.colors.secondary.DEFAULT,
        },
        accent: {
          teal: {
            ...theme.colors.accent.teal,
            DEFAULT: cssRgb('--color-accent-teal'),
            50: cssRgb('--color-accent-teal-50'),
            800: cssRgb('--color-accent-teal-800'),
          },
          slate: theme.colors.accent.slate,
          amber: theme.colors.accent.amber,
        },
        background: {
          page: cssRgb('--color-bg-page'),
          primary: cssRgb('--color-bg-primary'),
          secondary: cssRgb('--color-bg-secondary'),
          tertiary: cssRgb('--color-bg-tertiary'),
          dark: cssRgb('--color-bg-dark'),
        },
        text: {
          primary: cssRgb('--color-text-primary'),
          secondary: cssRgb('--color-text-secondary'),
          tertiary: cssRgb('--color-text-tertiary'),
          muted: cssRgb('--color-text-muted'),
          inverse: cssRgb('--color-text-inverse'),
          link: cssRgb('--color-text-link'),
          linkHover: cssRgb('--color-text-link-hover'),
          price: cssRgb('--color-text-price'),
        },
        border: {
          light: cssRgb('--color-border-light'),
          DEFAULT: cssRgb('--color-border'),
          dark: cssRgb('--color-border-dark'),
          focus: cssRgb('--color-border-focus'),
        },
        status: {
          success: {
            bg: cssRgb('--color-status-success-bg'),
            border: cssRgb('--color-status-success-border'),
            text: cssRgb('--color-status-success-text'),
            icon: cssRgb('--color-status-success-icon'),
            DEFAULT: cssRgb('--color-status-success'),
          },
          error: {
            bg: cssRgb('--color-status-error-bg'),
            border: cssRgb('--color-status-error-border'),
            text: cssRgb('--color-status-error-text'),
            icon: cssRgb('--color-status-error-icon'),
            DEFAULT: cssRgb('--color-status-error'),
          },
          warning: {
            bg: cssRgb('--color-status-warning-bg'),
            border: cssRgb('--color-status-warning-border'),
            text: cssRgb('--color-status-warning-text'),
            icon: cssRgb('--color-status-warning-icon'),
            DEFAULT: cssRgb('--color-status-warning'),
          },
          info: {
            bg: cssRgb('--color-status-info-bg'),
            border: cssRgb('--color-status-info-border'),
            text: cssRgb('--color-status-info-text'),
            icon: cssRgb('--color-status-info-icon'),
            DEFAULT: cssRgb('--color-status-info'),
          },
        },
        card: {
          bg: cssRgb('--color-bg-primary'),
          border: cssRgb('--color-border'),
          borderHover: cssRgb('--color-border-hover'),
          shadow: 'var(--shadow-sm)',
          shadowHover: 'var(--shadow-md)',
        },
        button: {
          primary: {
            bg: cssRgb('--color-primary'),
            hover: cssRgb('--color-primary-hover'),
            text: cssRgb('--color-text-inverse'),
          },
          secondary: {
            bg: cssRgb('--color-bg-tertiary'),
            hover: cssRgb('--color-secondary-200'),
            text: cssRgb('--color-text-primary'),
          },
          dark: {
            bg: cssRgb('--color-bg-dark'),
            hover: cssRgb('--color-primary-hover'),
            text: cssRgb('--color-text-inverse'),
          },
          ghost: {
            bg: 'transparent',
            hover: cssRgb('--color-bg-tertiary'),
            text: cssRgb('--color-text-secondary'),
          },
        },

        'app-bg': cssRgb('--color-bg-page'),
        'main-bg': cssRgb('--color-bg-page'),
        'sidebar-bg': cssRgb('--color-bg-tertiary'),
        'sidebar-border': cssRgb('--color-border'),
        'header-bg': cssRgb('--color-bg-secondary'),
        'header-border': cssRgb('--color-border-light'),
        'auth-bg': cssRgb('--color-bg-tertiary'),

        'text-primary': cssRgb('--color-text-primary'),
        'text-price': cssRgb('--color-text-price'),
        'text-secondary': cssRgb('--color-text-secondary'),
        'text-muted': cssRgb('--color-text-muted'),

        'btn-primary': cssRgb('--color-primary'),
        'btn-primary-hover': cssRgb('--color-primary-hover'),
        'btn-secondary': cssRgb('--color-bg-tertiary'),
        'btn-secondary-hover': cssRgb('--color-secondary-200'),

        'alert-success': cssRgb('--color-status-success'),
        'alert-error': cssRgb('--color-status-error'),
        'alert-warning': cssRgb('--color-status-warning'),
        'alert-info': cssRgb('--color-status-info'),

        'card-bg': cssRgb('--color-bg-primary'),
        'card-border': cssRgb('--color-border'),
        'card-border-hover': cssRgb('--color-border-hover'),
        'card-text-primary': cssRgb('--color-text-primary'),
        'card-text-secondary': cssRgb('--color-text-secondary'),
        'card-text-muted': cssRgb('--color-text-muted'),
        'highlight': cssRgb('--color-accent-teal'),
        'warning-bg': cssRgb('--color-status-warning-bg'),
        'warning-border': cssRgb('--color-status-warning-border'),
        'warning-text': cssRgb('--color-status-warning-text'),
      },
      boxShadow: {
        ...theme.shadows,
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-default)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      borderRadius: {
        ...theme.borderRadius,
      },
      transitionDuration: {
        fast: theme.transitions.fast,
        DEFAULT: theme.transitions.DEFAULT,
        slow: theme.transitions.slow,
        slower: theme.transitions.slower,
      },
      zIndex: theme.zIndex,
      // Named ratios for image frames and the icon stroke from restrained-ui-design-standard, so pages need no arbitrary values.
      aspectRatio: { '4/3': '4 / 3', '3/4': '3 / 4', '16/10': '16 / 10', '16/11': '16 / 11' },
      strokeWidth: { 1.5: '1.5' },
      // Listing grids fill by card width (about 216-240px), so columns follow the space left by the filter sidebar.
      gridTemplateColumns: { listing: 'repeat(auto-fill, minmax(13.5rem, 1fr))' },
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.fontSize,
    },
  },
  plugins: [],
}
