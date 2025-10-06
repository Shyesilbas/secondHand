import React from 'react';

const EmptyState = ({
  icon: Icon,
  title = 'Nothing Found',
  description,
  primaryAction,
  variant = 'default',
  className = '',
  children
}) => {
  const iconWrapperClass = 'bg-gray-100 text-gray-600';
  const buttonColor = 'bg-gray-900 hover:bg-gray-800';

  return (
    <div className={`bg-white rounded border border-gray-200 p-8 text-center ${className}`}>
      {(Icon || variant !== 'default') && (
        <div className={`w-16 h-16 mx-auto mb-4 ${iconWrapperClass} rounded-full flex items-center justify-center`}>
          {Icon ? <Icon className="w-8 h-8" /> : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 00-2-2H5m4 0h6m0 0h2a2 2 0 012 2v6m-4 0v2a2 2 0 11-4 0v-2m-6 0h16" />
            </svg>
          )}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6">{description}</p>}
      {primaryAction && (
        <button
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
          className={`text-white px-6 py-2 rounded transition-colors disabled:opacity-50 ${buttonColor}`}
        >
          {primaryAction.label}
        </button>
      )}
      {children}
    </div>
  );
};

export default EmptyState;
