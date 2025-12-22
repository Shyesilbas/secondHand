import React from 'react';
import { formatDateTime } from '../../common/formatters.js';
import { EMAIL_TYPES } from '../emails.js';

const EmailListItem = ({ email, isSelected, onSelect, onDelete, isDeleting }) => {
    const formatDate = (dateString) => formatDateTime(dateString);

    const dotClass = (() => {
        if (email?.emailType === EMAIL_TYPES.VERIFICATION_CODE) return 'bg-green-500';
        if (email?.emailType === EMAIL_TYPES.PAYMENT_VERIFICATION) return 'bg-orange-500';
        if (email?.emailType && String(email.emailType).startsWith('OFFER_')) return 'bg-emerald-500';
        if (email?.emailType === EMAIL_TYPES.NOTIFICATION) return 'bg-blue-500';
        return 'bg-gray-400';
    })();

    return (
        <div
            className={`p-4 transition-all duration-200 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                isSelected ? 'bg-blue-50 border-r-4 border-blue-500' : 'hover:border-gray-200'
            }`}
            onClick={() => onSelect(email)}
        >
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${dotClass}`}></div>
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">
                                {email.subject}
                            </h4>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    {email.emailType || 'EMAIL'}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">
                                    {formatDate(email.sentAt)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span>From: {email.senderEmail}</span>
                                <span>•</span>
                                <span>To: {email.recipientEmail}</span>
                            </div>
                        </div>
                        
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(email.id, email.subject);
                            }}
                            disabled={isDeleting}
                            className="ml-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete email"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailListItem;
