import os
import re

FRONTEND_DIR = '/Users/serhat/IdeaProjects/secondHand/secondhand-frontend/src'
THEME_JS_PATH = os.path.join(FRONTEND_DIR, 'common/theme/theme.js')

new_theme = """export const theme = {
  colors: {
    primary: {
      50: '#f0fdf9',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
      DEFAULT: '#0d9488',
      hover: '#0f766e',
      light: '#ccfbf1',
      dark: '#134e4a',
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
      teal: {
        DEFAULT: '#0d9488',
        50: '#f0fdf9',
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
      link: '#0d9488',
      linkHover: '#0f766e',
    },
    border: {
      light: '#e2e8f0',
      DEFAULT: '#cbd5e1',
      dark: '#94a3b8',
      focus: '#0d9488',
    },
    status: {
      success: {
        bg: '#f0fdf9',
        border: '#99f6e4',
        text: '#134e4a',
        icon: '#0d9488',
        DEFAULT: '#0d9488',
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
        bg: '#f0fdf9',
        border: '#99f6e4',
        text: '#0f766e',
        icon: '#0d9488',
        DEFAULT: '#0d9488',
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
        bg: '#0d9488',
        hover: '#0f766e',
        text: '#ffffff',
      },
      secondary: {
        bg: '#f0fdf9',
        hover: '#ccfbf1',
        text: '#0f766e',
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
};"""

with open(THEME_JS_PATH, 'r', encoding='utf-8') as f:
    theme_content = f.read()

theme_content = re.sub(r'export const theme = \{[\s\S]*?\};\n*(?=export const getThemeColor)', new_theme + '\n\n', theme_content)

with open(THEME_JS_PATH, 'w', encoding='utf-8') as f:
    f.write(theme_content)

def make_pattern(s):
    return r'(?<![a-zA-Z0-9-])' + s + r'(?![a-zA-Z0-9-])'

class_replacements = [
    (make_pattern(r'bg-(blue-600|indigo-600|indigo-400|violet-[a-z0-9-]+)'), 'bg-primary'),
    (make_pattern(r'text-(blue-600|indigo-600|indigo-[a-z0-9-]+)'), 'text-primary'),
    (make_pattern(r'border-(blue-[a-z0-9-]+|indigo-[a-z0-9-]+)'), 'border-primary'),
    (make_pattern(r'bg-slate-(400|500)'), 'bg-text-muted'),
    
    (make_pattern(r'bg-(gray-50|\[#f7f6f5\]|\[#f8f8f8\])'), 'bg-secondary'),
    (make_pattern(r'bg-gray-(100|200)'), 'bg-tertiary'),
    (make_pattern(r'bg-white'), 'bg-background-primary'),
    
    (make_pattern(r'text-(gray-900|slate-900)'), 'text-text-primary'),
    (make_pattern(r'text-(gray-600|gray-700|\[#5f5b57\])'), 'text-text-secondary'),
    (make_pattern(r'text-(gray-400|gray-500|\[#9c9894\])'), 'text-text-muted'),
    
    (make_pattern(r'border-(gray-200|slate-200)'), 'border-border-light'),
    (make_pattern(r'border-(gray-300|gray-400)'), 'border-border-DEFAULT'),
    
    (make_pattern(r'text-(green-600|emerald-600)'), 'text-status-success'),
    (make_pattern(r'text-(red-500|red-600)'), 'text-status-error'),
    (make_pattern(r'text-(yellow-600|amber-600)'), 'text-status-warning'),
    (make_pattern(r'bg-(green-[a-z0-9-]+|emerald-[a-z0-9-]+)'), 'bg-status-success-bg'),
    (make_pattern(r'bg-red-[a-z0-9-]+'), 'bg-status-error-bg'),
    (make_pattern(r'bg-(yellow-[a-z0-9-]+|amber-[a-z0-9-]+)'), 'bg-status-warning-bg'),
    
    (make_pattern(r'text-\[(10px|11px)\]'), 'text-caption'),
    (make_pattern(r'text-\[(13px|14px)\]'), 'text-body'),
    (make_pattern(r'text-\[(15px|16px)\]'), 'text-sm'),
]

def process_file(filepath):
    if filepath.endswith('theme.js'): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    for pattern, repl in class_replacements:
        content = re.sub(pattern, repl, content)

    # Clean inline styles if possible
    # We will do a generic replace for common ones:
    # Example: style={{ backgroundColor: '#f7f6f5' }}
    # We'll just leave them for manual regex if there are complex ones,
    # but the ones user mentioned are simple hex replacements to tailwind classes if we can safely do it.
    # It's safer to just let the script finish and check git diff.

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

for root, _, files in os.walk(FRONTEND_DIR):
    for f in files:
        if f.endswith('.jsx') or f.endswith('.js'):
            process_file(os.path.join(root, f))

print("Done")
