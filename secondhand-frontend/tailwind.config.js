export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-bg': '#f5f6f7',
        'main-bg': '#ffffff',
        'sidebar-bg': '#f3f4f6',
        'sidebar-border': '#e5e7eb',
        'header-bg': '#f9fafb',
        'header-border': '#e5e7eb',
        'auth-bg': '#f3f4f6',

        'text-primary': '#374151',
        'text-price': '#059669',
        'text-secondary': '#6b7280',
        'text-muted': '#9ca3af',

        'btn-primary': '#3b82f6',
        'btn-primary-hover': '#2563eb',
        'btn-secondary': '#6b7280',
        'btn-secondary-hover': '#4b5563',

        'alert-success': '#34d399',
        'alert-error': '#f87171',
        'alert-warning': '#fbbf24',
        'alert-info': '#60a5fa',

        'card-bg': '#ffffff',
        'card-border': '#e5e7eb',
        'card-border-hover': '#d1d5db',
        'card-text-primary': '#374151',
        'card-text-secondary': '#6b7280',
        'card-text-muted': '#9ca3af',
        'highlight': '#10b981',
        'warning-bg': '#fef3c7',
        'warning-border': '#fde68a',
        'warning-text': '#b45309'
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0,0,0,0.05)',
        'card-lg': '0 4px 6px rgba(0,0,0,0.1)'
      },
      borderRadius: {
        'card': '1rem',
        'card-2xl': '1.5rem'
      },
      transitionDuration: {
        200: '200ms'
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}
