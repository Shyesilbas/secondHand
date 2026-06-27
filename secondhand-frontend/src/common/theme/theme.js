export const theme = {
  colors: {
    primary: {
      50: '#F4F6F8',
      100: '#E8ECF1',
      200: '#CCD7E3',
      300: '#9BB2CA',
      400: '#6484A8',
      500: '#3B4856',
      600: '#2D3844',
      700: '#212933',
      800: '#161B22',
      900: '#0C1014',
      DEFAULT: '#3B4856',
      hover: '#2D3844',
      light: '#E8ECF1',
      dark: '#0C1014',
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
      900: '#0f172a',
      DEFAULT: '#64748B',
      hover: '#475569',
      light: '#F1F5F9',
      dark: '#1E293B',
    },
    accent: {
      primary: {
        50: '#F4F6F8',
        100: '#E8ECF1',
        200: '#CCD7E3',
        400: '#6484A8',
        500: '#3B4856',
        600: '#2D3844',
        700: '#212933',
        DEFAULT: '#3B4856',
      },
      teal: {
        DEFAULT: '#1E5041',
        50: '#EAF2EE',
        100: '#C4E8D5',
        200: '#A7F3D0',
        400: '#34D399',
        500: '#1E5041',
        600: '#123329',
        700: '#064E3B',
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
      secondary: '#F8FAFC',
      tertiary: '#F1F5F9',
      dark: '#0C1014',
    },
    text: {
      primary: '#1E293B',
      secondary: '#475569',
      tertiary: '#64748B',
      muted: '#94A3B8',
      inverse: '#ffffff',
      link: '#3B4856',
      linkHover: '#2D3844',
    },
    border: {
      light: '#E2E8F0',
      DEFAULT: '#CBD5E1',
      dark: '#94A3B8',
      focus: '#3B4856',
    },
    status: {
      success: {
        bg: '#EBF6F0',
        border: '#C4E8D5',
        text: '#1A5335',
        icon: '#1A5335',
        DEFAULT: '#1A5335',
      },
      error: {
        bg: '#FDF2F2',
        border: '#FCD4D4',
        text: '#8C1D1D',
        icon: '#8C1D1D',
        DEFAULT: '#8C1D1D',
      },
      warning: {
        bg: '#FFFDF0',
        border: '#FFF1B8',
        text: '#806000',
        icon: '#806000',
        DEFAULT: '#806000',
      },
      info: {
        bg: '#F0F6FC',
        border: '#D2E5FA',
        text: '#1A539B',
        icon: '#1A539B',
        DEFAULT: '#1A539B',
      },
    },
    card: {
      bg: '#ffffff',
      border: '#E2E8F0',
      borderHover: '#CBD5E1',
      shadow: '0 1px 2px rgba(0,0,0,0.04)',
      shadowHover: '0 4px 6px rgba(0,0,0,0.07)',
    },
    button: {
      primary: {
        bg: '#3B4856',
        hover: '#2D3844',
        text: '#ffffff',
      },
      secondary: {
        bg: '#E8ECF1',
        hover: '#CCD7E3',
        text: '#3B4856',
      },
      ghost: {
        bg: 'transparent',
        hover: '#F1F5F9',
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

