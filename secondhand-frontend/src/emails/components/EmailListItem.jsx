import React from 'react';
import { formatDateTime } from '../../common/formatters.js';

const EmailListItem = ({ email, isSelected, onSelect, onDelete, isDeleting }) => {
    const formatDate = (dateString) => formatDateTime(dateString);

    return (
        <div
            className={`p-4 transition-colors hover:bg-app-bg ${
                isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            }`}
        >
            <div className="flex items-start space-x-3">
                <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onSelect(email)}
                >
                    <p className="text-sm font-medium text-text-primary truncate">
                        {email.subject}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                        {formatDate(email.sentAt)}
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(email.id, email.subject);
                        }}
                        disabled={isDeleting}
                        className="p-1 text-text-muted hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete email"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailListItem;
