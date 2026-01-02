export const theme = {
  colors: {
    primary: {
      50: '#fef3c7',
      100: '#fde68a',
      200: '#fcd34d',
      300: '#fbbf24',
      400: '#f59e0b',
      500: '#d97706',
      600: '#b45309',
      700: '#92400e',
      800: '#78350f',
      900: '#451a03',
      DEFAULT: '#f59e0b',
      hover: '#d97706',
      light: '#fde68a',
      dark: '#92400e',
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
      indigo: {
        DEFAULT: '#4f46e5',
        50: '#eef2ff',
        100: '#e0e7ff',
        400: '#818cf8',
        500: '#6366f1',
        600: '#4f46e5',
        700: '#4338ca',
      },
      emerald: {
        DEFAULT: '#10b981',
        50: '#ecfdf5',
        100: '#d1fae5',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
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
      link: '#0284c7',
      linkHover: '#0369a1',
    },
    border: {
      light: '#e2e8f0',
      DEFAULT: '#cbd5e1',
      dark: '#94a3b8',
      focus: '#0ea5e9',
    },
    status: {
      success: {
        bg: '#ecfdf5',
        border: '#a7f3d0',
        text: '#065f46',
        icon: '#10b981',
        DEFAULT: '#10b981',
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
        bg: '#eff6ff',
        border: '#bfdbfe',
        text: '#1e40af',
        icon: '#3b82f6',
        DEFAULT: '#3b82f6',
      },
    },
    card: {
      bg: '#ffffff',
      border: '#e2e8f0',
      borderHover: '#cbd5e1',
      shadow: '0 1px 2px rgba(0,0,0,0.05)',
      shadowHover: '0 4px 6px rgba(0,0,0,0.1)',
    },
    button: {
      primary: {
        bg: '#0f172a',
        hover: '#1e293b',
        text: '#ffffff',
      },
      secondary: {
        bg: '#f1f5f9',
        hover: '#e2e8f0',
        text: '#475569',
      },
      accent: {
        bg: '#4f46e5',
        hover: '#4338ca',
        text: '#ffffff',
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
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    DEFAULT: '0 1px 3px rgba(0,0,0,0.1)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.1)',
    '2xl': '0 25px 50px rgba(0,0,0,0.25)',
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

