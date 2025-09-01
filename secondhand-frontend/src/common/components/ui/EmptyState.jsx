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
  const iconWrapperClass = variant === 'blue'
    ? 'bg-blue-100 text-blue-600'
    : variant === 'green'
      ? 'bg-green-100 text-green-600'
      : 'bg-gray-100 text-gray-400';

  const buttonColor = (primaryAction?.variant || variant) === 'blue'
    ? 'bg-blue-600 hover:bg-blue-700'
    : (primaryAction?.variant || variant) === 'green'
      ? 'bg-green-600 hover:bg-green-700'
      : 'bg-gray-800 hover:bg-gray-900';

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-8 text-center ${className}`}>
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
          className={`text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 ${buttonColor}`}
        >
          {primaryAction.label}
        </button>
      )}
      {children}
    </div>
  );
};

export default EmptyState;
