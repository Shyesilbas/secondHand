export const theme = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      DEFAULT: '#0ea5e9',
      hover: '#0284c7',
      light: '#e0f2fe',
      dark: '#0c4a6e',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      DEFAULT: '#64748b',
      hover: '#475569',
      light: '#f1f5f9',
      dark: '#1e293b',
    },
    accent: {
      primary: {
        DEFAULT: '#0ea5e9',
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
      },
      teal: {
        DEFAULT: '#14b8a6',
        50: '#f0fdfa',
        100: '#ccfbf1',
        200: '#99f6e4',
        400: '#2dd4bf',
        500: '#14b8a6',
        600: '#0d9488',
        700: '#0f766e',
      },
      slate: {
        DEFAULT: '#475569',
        50: '#f8fafc',
        100: '#f1f5f9',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
      },
      amber: {
        DEFAULT: '#f59e0b',
        50: '#fffbeb',
        100: '#fef3c7',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
      },
    },
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      dark: '#0f172a',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      muted: '#94a3b8',
      inverse: '#ffffff',
      link: '#0ea5e9',
      linkHover: '#0284c7',
    },
    border: {
      light: '#e2e8f0',
      DEFAULT: '#cbd5e1',
      dark: '#94a3b8',
      focus: '#0ea5e9',
    },
    status: {
      success: {
        bg: '#f0fdf4',
        border: '#bbf7d0',
        text: '#166534',
        icon: '#22c55e',
        DEFAULT: '#22c55e',
      },
      error: {
        bg: '#fef2f2',
        border: '#fecaca',
        text: '#991b1b',
        icon: '#ef4444',
        DEFAULT: '#ef4444',
      },
      warning: {
        bg: '#fffbeb',
        border: '#fde68a',
        text: '#92400e',
        icon: '#f59e0b',
        DEFAULT: '#f59e0b',
      },
      info: {
        bg: '#f0f9ff',
        border: '#bae6fd',
        text: '#075985',
        icon: '#0ea5e9',
        DEFAULT: '#0ea5e9',
      },
    },
    card: {
      bg: '#ffffff',
      border: '#e2e8f0',
      borderHover: '#cbd5e1',
      shadow: '0 1px 2px rgba(0,0,0,0.04)',
      shadowHover: '0 4px 6px rgba(0,0,0,0.07)',
    },
    button: {
      primary: {
        bg: '#0ea5e9',
        hover: '#0284c7',
        text: '#ffffff',
      },
      secondary: {
        bg: '#f0f9ff',
        hover: '#e0f2fe',
        text: '#0284c7',
      },
      ghost: {
        bg: 'transparent',
        hover: '#f1f5f9',
        text: '#475569',
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
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
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

