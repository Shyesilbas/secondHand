import React from 'react';

const PasswordRequirements = ({ validation }) => {
    const rules = [
        { label: 'At least 8 characters long', valid: validation.minLength },
        { label: 'At least one lowercase letter (a-z)', valid: validation.hasLowercase },
        { label: 'At least one uppercase letter (A-Z)', valid: validation.hasUppercase },
        { label: 'At least one number (0-9)', valid: validation.hasNumber },
        { label: 'At least one special character (@$!%*?&.)', valid: validation.hasSpecialChar },
    ];

    const getIcon = (valid) => {
        if (valid) {
            return (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            );
        }
        return (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        );
    };

    return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Requirements:</p>
            <div className="space-y-1">
                {rules.map((rule, idx) => (
                    <div key={idx} className={`flex items-center text-xs ${rule.valid ? 'text-green-700' : 'text-gray-600'}`}>
                        <span className="mr-2 flex-shrink-0">
                            {getIcon(rule.valid)}
                        </span>
                        <span className={rule.valid ? 'font-medium' : ''}>{rule.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PasswordRequirements;
