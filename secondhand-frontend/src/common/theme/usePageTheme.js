import { useEffect } from 'react';

const flattenTheme = (obj, prefix = '--page', result = {}) => {
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    const varName = `${prefix}-${kebabKey}`;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      flattenTheme(value, varName, result);
    } else if (typeof value === 'string' || typeof value === 'number') {
      result[varName] = String(value);
    }
  });
  return result;
};

export const usePageTheme = (pageTheme = {}) => {
  useEffect(() => {
    if (!pageTheme || Object.keys(pageTheme).length === 0) {
      return;
    }

    const root = document.documentElement;
    const variables = flattenTheme(pageTheme);
    const varKeys = Object.keys(variables);
    
    varKeys.forEach(key => {
      root.style.setProperty(key, variables[key]);
    });
    
    return () => {
      varKeys.forEach(key => {
        root.style.removeProperty(key);
      });
    };
  }, [JSON.stringify(pageTheme)]);
};

export default usePageTheme;

