import React, { useState } from 'react';
import { formatDateTime } from '../../common/formatters.js';
import { EMAIL_TYPES } from '../emails.js';
import { Trash2 } from 'lucide-react';

const EmailListItem = ({ email, isSelected, onSelect, onDelete, isDeleting }) => {
    const [isHovered, setIsHovered] = useState(false);
    const formatDate = (dateString) => formatDateTime(dateString);

    const dotClass = (() => {
        if (email?.emailType === EMAIL_TYPES.VERIFICATION_CODE) return 'bg-green-500';
        if (email?.emailType === EMAIL_TYPES.PAYMENT_VERIFICATION) return 'bg-orange-500';
        if (email?.emailType && String(email.emailType).startsWith('OFFER_')) return 'bg-emerald-500';
        if (email?.emailType === EMAIL_TYPES.NOTIFICATION) return 'bg-blue-500';
        return 'bg-slate-400';
    })();

    const isUnread = !email.read;

    return (
        <div
            className={`relative px-4 py-3.5 transition-all duration-300 ease-in-out cursor-pointer group ${
                isSelected 
                    ? 'bg-indigo-50 border-l-4 border-indigo-600' 
                    : 'hover:bg-slate-100/50'
            }`}
            onClick={() => onSelect(email)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1.5">
                    <div className={`w-2 h-2 rounded-full ${dotClass}`}></div>
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h4 className={`text-sm truncate mb-1.5 tracking-tight ${
                                isUnread ? 'font-bold text-slate-900' : 'font-normal text-slate-500'
                            }`}>
                                {email.subject}
                            </h4>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                                    {email.emailType || 'EMAIL'}
                                </span>
                                <span className="text-xs text-slate-300">•</span>
                                <span className="text-xs text-slate-500 tracking-tight">
                                    {formatDate(email.sentAt)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                                <span className="truncate">{email.senderEmail}</span>
                            </div>
                        </div>
                        
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(email.id, email.subject);
                            }}
                            disabled={isDeleting}
                            className={`opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${
                                isHovered ? 'opacity-100' : ''
                            }`}
                            title="Delete email"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailListItem;
