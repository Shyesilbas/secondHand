import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { formatDateTime } from '../../common/formatters.js';
import { Trash2 } from 'lucide-react';
const listInitials = (subject, senderEmail) => {
  const s = String(senderEmail || '').split('@')[0] || '';
  if (s.length >= 2) return s.slice(0, 2).toUpperCase();
  const sub = String(subject || '').trim();
  if (sub.length >= 2) return sub.slice(0, 2).toUpperCase();
  return '•';
};
const EmailListItem = ({
  email,
  isSelected,
  onSelect,
  onDelete,
  isDeleting
}) => {
  const {
    t
  } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const formatShort = dateString => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      const now = new Date();
      const sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
      if (sameDay) {
        return d.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return formatDateTime(dateString);
    } catch {
      return formatDateTime(dateString);
    }
  };
  const rawContent = String(email?.content || '');
  const cleanContent = rawContent
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
  const previewText = cleanContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const isUnread = !email.read && !email.isRead;
  const initials = listInitials(email.subject, email.senderEmail);
  return <div role="button" tabIndex={0} onKeyDown={e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(email);
    }
  }} className={`group relative cursor-pointer border-b border-border-light transition-all duration-150 ${isSelected ? 'bg-primary-50 border-l-[3px] border-l-primary-500 pl-0' : 'bg-main-bg hover:bg-background-secondary border-l-[3px] border-l-transparent'}`} onClick={() => onSelect(email)} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div className="flex gap-3 px-3 py-3 pr-2 sm:px-4">
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-caption font-semibold text-white ${isSelected ? 'bg-primary-600' : 'bg-secondary-400'}`}>
                    {initials}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className={`truncate text-sm leading-snug sm:text-sm ${isUnread ? 'font-semibold text-text-primary' : 'font-normal text-text-secondary'}`}>
                            {email.subject || '(No subject)'}
                        </h4>
                        <span className="shrink-0 text-caption tabular-nums text-text-muted">
                            {formatShort(email.sentAt)}
                        </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-text-muted">{email.senderEmail}</p>
                    {previewText && <p className="mt-1 line-clamp-2 text-caption leading-4 text-text-secondary sm:text-xs">
                            {previewText}
                        </p>}
                </div>

                <button type="button" onClick={e => {
        e.stopPropagation();
        onDelete(email.id, email.subject);
      }} disabled={isDeleting} className={`mt-1 shrink-0 rounded-md p-1.5 text-text-muted transition-opacity hover:bg-background-tertiary hover:text-status-error-text disabled:cursor-not-allowed disabled:opacity-40 ${isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} title={t("delete")}>
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>;
};
export default EmailListItem;