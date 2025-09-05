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
                       className = ''
                   }) => {
    return (
        <div className={`space-y-1 ${className}`}>
            <label
                htmlFor={name}
                className="block text-sm font-medium text-text-secondary"
            >
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`
          appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm 
          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 
          focus:border-transparent transition-colors duration-200
          ${error
                    ? 'border-red-300 bg-red-50 focus:ring-red-500'
                    : 'border-header-border bg-white hover:border-gray-400'
                }
        `}
            />
            {error && (
                <p className="text-sm text-red-600 mt-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default AuthInput;