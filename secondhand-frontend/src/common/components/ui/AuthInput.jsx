
const AuthInput = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    error,
    required = false,
    className = '',
    inputClassName = '',
    labelClassName = '',
    errorClassName = '',
    leftIcon = null,
    rightElement = null,
    ...rest
}) => {
    const hasLeftIcon = Boolean(leftIcon);
    const hasRightElement = Boolean(rightElement);

    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className={`block text-sm font-medium text-text-secondary ${labelClassName}`}
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                {hasLeftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        {leftIcon}
                    </div>
                )}
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={`
                        appearance-none block w-full border rounded-xl shadow-sm
                        placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500
                        transition-colors duration-200
                        ${hasLeftIcon ? 'pl-10' : 'px-3'}
                        ${hasRightElement ? 'pr-12' : 'pr-3'}
                        py-2.5
                        ${error
                            ? 'border-red-300 bg-red-50 focus:ring-red-500'
                            : 'border-header-border bg-white hover:border-gray-400'
                        }
                        ${inputClassName}
                    `}
                    {...rest}
                />
                {hasRightElement && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && (
                <p className={`text-sm text-red-600 mt-1 ${errorClassName}`}>
                    {error}
                </p>
            )}
        </div>
    );
};

export default AuthInput;