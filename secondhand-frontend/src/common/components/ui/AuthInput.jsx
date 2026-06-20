import React from 'react';

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
        <div className={`flex flex-col w-full ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className={`block text-caption font-semibold tracking-[0.12em] uppercase text-stone-500 mb-2 ${labelClassName}`}
                >
                    {label} {required && <span className="text-status-error font-normal">*</span>}
                </label>
            )}
            <div className="relative w-full group">
                {hasLeftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-stone-700 transition-colors duration-200">
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
                        appearance-none block w-full rounded-xl text-sm font-normal text-stone-900
                        placeholder-stone-400 bg-stone-100/40 border border-stone-200/60
                        focus:bg-background-primary focus:border-stone-900 focus:ring-4 focus:ring-stone-900/5
                        transition-all duration-300 outline-none
                        ${hasLeftIcon ? 'pl-10' : 'px-4'}
                        ${hasRightElement ? 'pr-12' : 'pr-4'}
                        py-3
                        ${error
                            ? 'border-rose-200 bg-rose-50/30 focus:ring-rose-500/10 focus:border-rose-400'
                            : ''
                        }
                        ${inputClassName}
                    `}
                    {...rest}
                />
                {hasRightElement && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && (
                <div className={`mt-2 p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-xs text-rose-600 leading-normal flex items-start gap-2 animate-fade-in ${errorClassName}`}>
                    <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default AuthInput;