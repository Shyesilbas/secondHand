import { useTranslation } from "react-i18next";
import { formatDateTime } from '../../common/formatters.js';
import { Trash2 } from 'lucide-react';
import { EMAIL_TYPE_LABELS, EMAIL_TYPE_BADGE_COLORS } from '../emails.js';
const MS_HEADER = '#f3f2f1';
const MS_BORDER = '#edebe9';

/** Outlook benzeri: yerel parçadan baş harf (avatar). */
const senderInitials = emailAddr => {
  if (!emailAddr || typeof emailAddr !== 'string') return '?';
  const local = emailAddr.split('@')[0] || '';
  const parts = local.replace(/[._+-]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
  }
  return local.slice(0, 2).toUpperCase() || '?';
};
const EmailContent = ({
  email,
  onDelete,
  isDeleting
}) => {
  const {
    t
  } = useTranslation();
  const formatDate = dateString => formatDateTime(dateString);
  if (!email) return null;
  const initials = senderInitials(email.senderEmail);
    const getProcessedContent = (content) => {
        if (!content) return '';
        const isHtml = /<[a-z][\s\S]*>/i.test(content);
        if (isHtml) return content;
        
        return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; line-height: 1.6; color: #323130; white-space: pre-wrap; word-wrap: break-word; margin: 0; }</style></head><body>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body></html>`;
    };

    return <div className="flex h-full min-h-0 flex-col bg-main-bg">
            {/* Compact Header: Merged subject, sender, recipient, date, tag and actions */}
            <header className="shrink-0 border-b border-border-light bg-background-secondary px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white bg-primary-600" aria-hidden>
                        {initials}
                    </div>
                    
                    {/* Mid section: Subject & Metadata */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-sm sm:text-base font-semibold text-text-primary truncate" title={email.subject}>
                                {email.subject}
                            </h2>
                            <span className={`shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${EMAIL_TYPE_BADGE_COLORS[email.emailType] || 'border-border-light bg-main-bg text-text-secondary'}`}>
                                {EMAIL_TYPE_LABELS[email.emailType] || email.emailType || 'Email'}
                            </span>
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-secondary">
                            <span className="font-semibold text-text-primary truncate max-w-[200px]" title={email.senderEmail}>
                                {email.senderEmail}
                            </span>
                            <span className="text-text-muted text-[10px]">&rarr;</span>
                            <span className="truncate max-w-[200px]" title={email.recipientEmail}>
                                {email.recipientEmail}
                            </span>
                        </div>
                    </div>
                    
                    {/* Right side: Date & Actions */}
                    <div className="flex items-center gap-2">
                        <time className="text-[11px] sm:text-xs tabular-nums text-text-secondary" dateTime={email.sentAt}>
                            {formatDate(email.sentAt)}
                        </time>
                        {onDelete && (
                            <button type="button" onClick={() => onDelete(email.id)} disabled={isDeleting} className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-background-tertiary hover:text-status-error-text disabled:opacity-40" title={t("delete")}>
                                <Trash2 className="h-4.5 w-4.5" aria-hidden />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Gövde: render full HTML inside an iframe to prevent CSS bleeding */}
            <div className="min-h-0 flex-1 bg-main-bg relative">
                <iframe srcDoc={getProcessedContent(email.content)} title={t("email_content")} className="absolute inset-0 w-full h-full border-0" sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox" />
            </div>
        </div>;
};
export default EmailContent;