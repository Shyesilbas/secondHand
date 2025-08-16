import React from 'react';
import { formatDateTime } from '../../../utils/formatters';
import { EMAIL_TYPE_LABELS, EMAIL_TYPE_BADGE_COLORS } from '../../../types/emails';
import { getEmailTypeIcon } from '../utils/emailTypeHelpers.jsx';

const EmailListItem = ({ email, isSelected, onSelect, onDelete, isDeleting }) => {
    const formatDate = (dateString) => formatDateTime(dateString);

    return (
        <div
            className={`p-4 transition-colors hover:bg-gray-50 ${
                isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            }`}
        >
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                    {getEmailTypeIcon(email.emailType)}
                </div>
                <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onSelect(email)}
                >
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {email.subject}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {formatDate(email.sentAt)}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${
                        EMAIL_TYPE_BADGE_COLORS[email.emailType] || 'bg-gray-100 text-gray-800'
                    }`}>
                        {EMAIL_TYPE_LABELS[email.emailType] || email.emailType}
                    </span>
                </div>
                <div className="flex-shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(email.id, email.subject);
                        }}
                        disabled={isDeleting}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
