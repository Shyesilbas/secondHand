import React from 'react';

const PasswordRequirements = ({ validation }) => {
    const rules = [
        { label: 'At least 8 characters long', valid: validation.minLength },
        { label: 'At least one Lower Case (a-z)', valid: validation.hasLowercase },
        { label: 'At least one Upper Case (A-Z)', valid: validation.hasUppercase },
        { label: 'Number (0-9)', valid: validation.hasNumber },
        { label: 'Special Character (@$!%*?&.)', valid: validation.hasSpecialChar },
    ];

    return (
        <div className="bg-app-bg rounded-md p-3">
            <p className="text-sm font-medium text-text-secondary mb-2">Password Requirements:</p>
            <div className="space-y-1">
                {rules.map((rule, idx) => (
                    <div key={idx} className={`text-xs flex items-center ${rule.valid ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="mr-2">{rule.valid ? '✓' : '✗'}</span>
                        {rule.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PasswordRequirements;
