import React from 'react';
import { useTranslation } from "react-i18next";
import { formatDateTime } from '../../common/formatters.js';
import { Trash2, User, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { EMAIL_TYPE_LABELS, EMAIL_TYPE_BADGE_COLORS } from '../emails.js';

/** Avatar harfleri */
const senderInitials = emailAddr => {
  if (!emailAddr || typeof emailAddr !== 'string') return 'SH';
  const local = emailAddr.split('@')[0] || '';
  const parts = local.replace(/[._+-]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
  }
  return local.slice(0, 2).toUpperCase() || 'SH';
};

const EmailContent = ({
  email,
  onDelete,
  isDeleting
}) => {
  const { t } = useTranslation();
  const formatDate = dateString => formatDateTime(dateString);

  if (!email) return null;

  const initials = senderInitials(email.senderEmail);

  const getProcessedContent = (content) => {
    if (!content) return '';
    const isHtml = /<[a-z][\s\S]*>/i.test(content);
    
    let processed = content;
    if (isHtml) {
      if (processed.includes('<head>')) {
        processed = processed.replace('<head>', '<head><base target="_top">');
      } else {
        processed = `<base target="_top">${processed}`;
      }
      return processed;
    }
    
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><base target="_top"><style>body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; padding: 24px; line-height: 1.6; color: #1e293b; white-space: pre-wrap; word-wrap: break-word; margin: 0; background-color: #ffffff; }</style></head><body>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body></html>`;
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* Header Bar */}
      <header className="shrink-0 border-b border-slate-200/90 bg-slate-50/70 px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            {/* Avatar Badge */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-black text-white bg-slate-900 shadow-xs mt-0.5">
              {initials}
            </div>

            {/* Subject & Chips */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 tracking-tight truncate max-w-xl" title={email.subject}>
                  {email.subject || '(Başlıksız E-Posta)'}
                </h2>
                <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[11px] font-bold tracking-wide border ${EMAIL_TYPE_BADGE_COLORS[email.emailType] || 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                  {EMAIL_TYPE_LABELS[email.emailType] || email.emailType || 'E-Posta'}
                </span>
              </div>

              {/* Sender & Recipient Chips */}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 text-slate-700 font-medium">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-900">{email.senderEmail}</span>
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 text-slate-600 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{email.recipientEmail}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Actions */}
          <div className="flex items-center gap-3 shrink-0 mt-0.5">
            <time className="text-xs font-medium text-slate-500 tabular-nums" dateTime={email.sentAt}>
              {formatDate(email.sentAt)}
            </time>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(email.id, email.subject)}
                disabled={isDeleting}
                className="rounded-xl p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all disabled:opacity-40"
                title={t("delete", "Sil")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Gövde: Sandbox iframe */}
      <div className="min-h-0 flex-1 bg-white relative">
        <iframe
          srcDoc={getProcessedContent(email.content)}
          title={t("email_content", "E-Posta İçeriği")}
          className="absolute inset-0 w-full h-full border-0"
          sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
};

export default EmailContent;