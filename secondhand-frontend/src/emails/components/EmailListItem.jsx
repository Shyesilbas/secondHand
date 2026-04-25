import React, { useState } from 'react';
import { formatDateTime } from '../../common/formatters.js';
import { EMAIL_TYPES } from '../emails.js';
import { Trash2 } from 'lucide-react';

const EmailListItem = ({ email, isSelected, onSelect, onDelete, isDeleting }) => {
    const [isHovered, setIsHovered] = useState(false);
    const formatDate = (dateString) => formatDateTime(dateString);
    const previewText = String(email?.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    const isUnread = !email.read && !email.isRead;

    return (
        <div
            className={`relative px-4 py-4 transition-all duration-200 ease-out cursor-pointer group border-b border-gray-100 last:border-b-0 ${
                isSelected 
                    ? 'bg-gray-100/80' 
                    : 'hover:bg-gray-50 bg-white'
            }`}
            onClick={() => onSelect(email)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-2 w-2">
                    {isUnread && <div className="w-2 h-2 rounded-full bg-zinc-900"></div>}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h4 className={`text-sm truncate mb-1.5 ${
                                isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
                            }`}>
                                {email.subject}
                            </h4>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                                    {email.emailType || 'EMAIL'}
                                </span>
                                <span className="text-gray-300 text-xs">•</span>
                                <span className="text-xs text-gray-500 font-medium">
                                    {formatDate(email.sentAt)}
                                </span>
                            </div>
                            <div className="text-xs text-gray-600 truncate mb-1.5">
                                {email.senderEmail}
                            </div>
                            {previewText && (
                                <p className="text-xs leading-5 text-gray-400 line-clamp-2 pr-2">
                                    {previewText}
                                </p>
                            )}
                        </div>
                        
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(email.id, email.subject);
                            }}
                            disabled={isDeleting}
                            className={`opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed ${
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
