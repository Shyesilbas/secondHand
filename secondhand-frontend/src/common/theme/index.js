export { theme, getThemeColor, getColorClass } from './theme.js';
export { createPageTheme } from './createPageTheme.js';
export { PageThemeProvider, usePageTheme as usePageThemeContext } from './PageThemeProvider.jsx';
export { usePageTheme } from './usePageTheme.js';

export const themeColors = {
  primary: 'primary',
  secondary: 'secondary',
  accent: {
    indigo: 'accent-indigo',
    emerald: 'accent-emerald',
    amber: 'accent-amber',
  },
  background: 'background',
  text: 'text',
  border: 'border',
  status: {
    success: 'status-success',
    error: 'status-error',
    warning: 'status-warning',
    info: 'status-info',
  },
};

export const getStatusClasses = (type = 'success') => {
  const statusMap = {
    success: 'bg-status-success-bg border-status-success-border text-status-success-text',
    error: 'bg-status-error-bg border-status-error-border text-status-error-text',
    warning: 'bg-status-warning-bg border-status-warning-border text-status-warning-text',
    info: 'bg-status-info-bg border-status-info-border text-status-info-text',
  };
  return statusMap[type] || statusMap.success;
};
