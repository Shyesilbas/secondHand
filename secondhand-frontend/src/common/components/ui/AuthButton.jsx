import React from 'react';

const AuthButton = ({
                        children,
                        type = 'button',
                        onClick,
                        isLoading = false,
                        disabled = false,
                        variant = 'primary',
                        className = ''
                    }) => {
    const baseClasses = `
    w-full flex justify-center py-2.5 px-4 border border-transparent 
    rounded text-sm font-medium focus:outline-none 
    focus:ring-2 focus:ring-offset-2 transition-colors
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

    const variants = {
        primary: `
      text-button-primary-text bg-button-primary-bg hover:bg-button-primary-hover 
      focus:ring-primary-500 active:bg-secondary-800
    `,
        secondary: `
      text-button-secondary-text bg-button-secondary-bg hover:bg-button-secondary-hover 
      focus:ring-primary-500 active:bg-secondary-200
    `
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`${baseClasses} ${variants[variant]} ${className}`}
        >
            {isLoading ? (
                <div className="flex items-center">
                    <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Processing...
                </div>
            ) : (
                children
            )}
        </button>
    );
};

export default AuthButton;