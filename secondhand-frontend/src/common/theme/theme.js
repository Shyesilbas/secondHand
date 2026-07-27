export const theme = {
  colors: {
    primary: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
      DEFAULT: '#059669',
      hover: '#047857',
      light: '#ECFDF5',
      dark: '#064E3B',
    },
    secondary: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
      DEFAULT: '#475569',
      hover: '#334155',
      light: '#F1F5F9',
      dark: '#0F172A',
    },
    accent: {
      primary: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        200: '#A7F3D0',
        400: '#34D399',
        500: '#10B981',
        600: '#059669',
        700: '#047857',
        DEFAULT: '#059669',
      },
      teal: {
        DEFAULT: '#059669',
        50: '#ECFDF5',
        100: '#D1FAE5',
        200: '#A7F3D0',
        400: '#34D399',
        500: '#10B981',
        600: '#059669',
        700: '#047857',
      },
      slate: {
        DEFAULT: '#475569',
        50: '#F8FAFC',
        100: '#F1F5F9',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
      },
      amber: {
        DEFAULT: '#F59E0B',
        50: '#FFFBEB',
        100: '#FEF3C7',
        400: '#FBBF24',
        500: '#F59E0B',
        600: '#D97706',
      },
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      tertiary: '#F1F5F9',
      dark: '#0F172A',
    },
    text: {
      primary: '#0F172A',
      secondary: '#334155',
      tertiary: '#64748B',
      muted: '#94A3B8',
      inverse: '#FFFFFF',
      link: '#059669',
      linkHover: '#047857',
    },
    border: {
      light: '#F1F5F9',
      DEFAULT: '#E2E8F0',
      dark: '#64748B',
      focus: '#059669',
    },
    status: {
      success: {
        bg: '#ECFDF5',
        border: '#A7F3D0',
        text: '#047857',
        icon: '#059669',
        DEFAULT: '#059669',
      },
      error: {
        bg: '#FFF1F2',
        border: '#FECDD3',
        text: '#BE123C',
        icon: '#E11D48',
        DEFAULT: '#E11D48',
      },
      warning: {
        bg: '#FFFBEB',
        border: '#FDE68A',
        text: '#B45309',
        icon: '#D97706',
        DEFAULT: '#D97706',
      },
      info: {
        bg: '#EFF6FF',
        border: '#BFDBFE',
        text: '#1D4ED8',
        icon: '#2563EB',
        DEFAULT: '#2563EB',
      },
    },
    card: {
      bg: '#FFFFFF',
      border: '#E2E8F0',
      borderHover: '#CBD5E1',
      shadow: '0 1px 3px rgba(0,0,0,0.05)',
      shadowHover: '0 10px 25px -5px rgba(0,0,0,0.1)',
    },
    button: {
      primary: {
        bg: '#059669',
        hover: '#047857',
        text: '#FFFFFF',
      },
      secondary: {
        bg: '#F1F5F9',
        hover: '#E2E8F0',
        text: '#0F172A',
      },
      dark: {
        bg: '#0F172A',
        hover: '#1E293B',
        text: '#FFFFFF',
      },
      ghost: {
        bg: 'transparent',
        hover: '#F8FAFC',
        text: '#334155',
      },
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
  },
  borderRadius: {
    sm: '0.375rem',
    DEFAULT: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.04)',
    DEFAULT: '0 1px 3px rgba(0,0,0,0.08)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.08)',
    xl: '0 20px 25px rgba(0,0,0,0.08)',
    '2xl': '0 25px 50px rgba(0,0,0,0.15)',
  },
  transitions: {
    fast: '150ms',
    DEFAULT: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  zIndex: {
    dropdown: 50,
    modal: 100,
    tooltip: 1000,
  },
  typography: {
    fontFamily: {
      sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
    },
    fontSize: {
      body: ['0.75rem', { lineHeight: '1.125rem' }],
      caption: ['0.6875rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
  },
};

export const getThemeColor = (path) => {
  const keys = path.split('.');
  let value = theme;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return null;
  }
  
  return value;
};

export const getColorClass = (colorPath, type = 'bg') => {
  const color = getThemeColor(colorPath);
  if (!color) return '';
  
  if (typeof color === 'string') {
    return `${type}-[${color}]`;
  }
  
  return `${type}-${color.DEFAULT || color}`;
};
