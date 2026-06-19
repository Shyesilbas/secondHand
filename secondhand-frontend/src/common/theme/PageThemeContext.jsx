import { createContext, useContext } from 'react';
import { theme } from './theme.js';

export const ThemeContext = createContext(theme);

export const usePageTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return theme;
  }
  return context;
};
