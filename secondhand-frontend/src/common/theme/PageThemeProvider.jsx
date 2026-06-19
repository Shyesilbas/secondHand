import React from 'react';
import { createPageTheme } from './createPageTheme.js';
import { ThemeContext } from './PageThemeContext.jsx';

export const PageThemeProvider = ({ children, pageTheme = {} }) => {
  const mergedTheme = createPageTheme(pageTheme);

  return (
    <ThemeContext.Provider value={mergedTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export default PageThemeProvider;




