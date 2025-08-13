import React from 'react';

const Input = ({
                       label,
                       type = 'text',
                       name,
                       value,
                       onChange,
                       placeholder,
                       error,
                       required = false,
                       className = '',
                       rows = 3 // Added for textarea
                   }) => {
    const inputClasses = `
          appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm 
          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 
          focus:border-transparent transition-colors duration-200
          ${error
                        ? 'border-red-300 bg-red-50 focus:ring-red-500'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }
        `;

    const renderInput = () => {
        if (type === 'textarea') {
            return (
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    rows={rows}
                    className={`${inputClasses} resize-none`}
                />
            );
        }
        return (
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={inputClasses}
            />
        );
    };

    return (
        <div className={`space-y-1 ${className}`}>
            <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-700"
            >
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {renderInput()}
            {error && (
                <p className="text-sm text-red-600 mt-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;