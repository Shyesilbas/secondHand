export const colorMapping = {
  slate: {
    50: 'secondary-50',
    100: 'secondary-100',
    200: 'secondary-200',
    300: 'secondary-300',
    400: 'secondary-400',
    500: 'secondary-500',
    600: 'secondary-600',
    700: 'secondary-700',
    800: 'secondary-800',
    900: 'secondary-900',
  },
  gray: {
    50: 'gray-50',
    100: 'gray-100',
    200: 'gray-200',
    300: 'gray-300',
    400: 'gray-400',
    500: 'gray-500',
    600: 'gray-600',
    700: 'gray-700',
    800: 'gray-800',
    900: 'gray-900',
  },
  indigo: {
    400: 'accent-indigo-400',
    500: 'accent-indigo-500',
    600: 'accent-indigo-600',
  },
  emerald: {
    500: 'accent-emerald-DEFAULT',
    600: 'accent-emerald-600',
  },
};

export const getMappedColor = (originalColor) => {
  const [colorName, shade] = originalColor.split('-');
  
  if (colorMapping[colorName] && colorMapping[colorName][shade]) {
    return colorMapping[colorName][shade];
  }
  
  return originalColor;
};



