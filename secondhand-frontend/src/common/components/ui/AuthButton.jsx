
const AuthButton = ({
                        children,
                        type = 'button',
                        onClick,
                        isLoading = false,
                        disabled = false,
                        variant = 'primary',
                        size = 'md',
                        leftIcon = null,
                        rightIcon = null,
                        className = ''
                    }) => {
    const baseClasses = `
    w-full inline-flex items-center justify-center gap-2 border
    rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
  `;

    const variants = {
        primary: `
      text-white bg-slate-900 border-slate-900 hover:bg-slate-800
      focus:ring-slate-700/30
    `,
        secondary: `
      text-slate-700 bg-white border-slate-200 hover:bg-slate-50
      focus:ring-slate-300
    `,
        outline: `
      text-slate-800 bg-white border-slate-300 hover:bg-slate-50
      focus:ring-slate-300
    `,
        ghost: `
      text-slate-700 bg-transparent border-transparent hover:bg-slate-100
      focus:ring-slate-300
    `
    };

    const sizes = {
        sm: 'py-2 px-3 text-sm',
        md: 'py-2.5 px-4 text-sm',
        lg: 'py-3.5 px-5 text-sm'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`${baseClasses} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
        >
            {isLoading ? (
                <div className="flex items-center">
                    <svg
                        className="animate-spin h-5 w-5"
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
                <>
                    {leftIcon}
                    {children}
                    {rightIcon}
                </>
            )}
        </button>
    );
};

export default AuthButton;