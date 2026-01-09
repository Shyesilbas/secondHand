import React, { createContext, useContext } from 'react';
import { theme } from './theme.js';
import { createPageTheme } from './createPageTheme.js';

const ThemeContext = createContext(theme);

export const PageThemeProvider = ({ children, pageTheme = {} }) => {
  const mergedTheme = createPageTheme(pageTheme);

  return (
    <ThemeContext.Provider value={mergedTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const usePageTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return theme;
  }
  return context;
};

export default PageThemeProvider;



