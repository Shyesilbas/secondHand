import React from 'react';
import { EMAIL_TYPES, EMAIL_TYPE_LABELS } from '../emails.js';

const EmailFilterTabs = ({ filterType, onFilterChange, onDeleteAll, hasEmails, isDeleting }) => {
    const filterOptions = [];

    return (
        <div className="flex items-center space-x-2">
            {filterOptions.map((type) => (
                <button
                    key={type}
                    onClick={() => onFilterChange(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filterType === type
                            ? 'bg-btn-primary text-white'
                            : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                >
                    {type === 'ALL' ? 'All' : EMAIL_TYPE_LABELS[type]}
                </button>
            ))}
            
            {hasEmails && (
                <button
                    onClick={onDeleteAll}
                    disabled={isDeleting}
                    className="ml-3 text-xs font-medium text-red-500 hover:text-red-600 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 tracking-tight"
                    title="Delete all emails"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete All</span>
                </button>
            )}
        </div>
    );
};

export default EmailFilterTabs;
