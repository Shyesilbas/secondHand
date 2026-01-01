import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const EmptyState = ({
  icon: Icon,
  title = 'Nothing Found',
  description,
  primaryAction,
  variant = 'default',
  size = 'default',
  className = '',
  children
}) => {
  const isCompact = size === 'compact';
  const padding = isCompact ? 'p-6' : 'p-8';
  const iconSize = isCompact ? 'w-12 h-12' : 'w-16 h-16';
  const iconInnerSize = isCompact ? 'w-6 h-6' : 'w-8 h-8';
  
  const iconWrapperClass = 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400';
  const buttonColor = 'bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all duration-200';

  const defaultIcon = Icon || MagnifyingGlassIcon;

  return (
    <div className={`bg-white rounded-xl border border-gray-200/60 shadow-sm ${padding} text-center ${className}`}>
      {(defaultIcon || variant !== 'default') && (
        <div className={`${iconSize} mx-auto mb-4 ${iconWrapperClass} rounded-2xl flex items-center justify-center backdrop-blur-sm`}>
          <defaultIcon className={iconInnerSize} />
        </div>
      )}
      <h3 className={`${isCompact ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-2`}>{title}</h3>
      {description && (
        <p className={`text-gray-500 ${isCompact ? 'text-sm mb-4' : 'mb-6'}`}>{description}</p>
      )}
      {primaryAction && (
        <button
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
          className={`text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonColor}`}
        >
          {primaryAction.label}
        </button>
      )}
      {children}
    </div>
  );
};

export default EmptyState;

