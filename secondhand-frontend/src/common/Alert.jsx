import React from 'react';

const Alert = ({ type = 'error', message }) => {
    if (!message) return null;

    const colors = {
        error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-400' },
        success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'text-green-400' },
        warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: 'text-yellow-400' },
    };

    const c = colors[type];

    return (
        <div className={`${c.bg} ${c.border} border rounded-md p-4`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className={`h-5 w-5 ${c.icon}`} viewBox="0 0 20 20" fill="currentColor">
                        {type === 'error' && (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        )}
                        {type === 'success' && (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7l-3-3 1.414-1.414L9 8.586l4.586-4.586L15 5l-6 6z" clipRule="evenodd" />
                        )}
                        {type === 'warning' && (
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        )}
                    </svg>
                </div>
                <div className="ml-3">
                    <p className={`text-sm font-medium ${c.text}`}>{message}</p>
                </div>
            </div>
        </div>
    );
};

export default Alert;
