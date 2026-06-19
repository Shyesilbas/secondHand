import { useTranslation } from "react-i18next";
import { formatDateTime, formatPricesInHtml, replaceEnumCodesInHtml } from '../../common/formatters.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import { Trash2 } from 'lucide-react';
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
  return <div className="flex h-full min-h-0 flex-col bg-white">
            {/* Üst: konu + araç (Outlook’ta sağda sil vb.) */}
            <header className="shrink-0 border-b px-4 py-4 sm:px-6 lg:px-8 lg:py-5" style={{
      borderColor: MS_BORDER,
      backgroundColor: MS_HEADER
    }}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <h1 className="min-w-0 flex-1 text-xl font-semibold leading-tight tracking-tight text-[#323130] sm:text-2xl lg:text-[1.65rem]">
                        {email.subject}
                    </h1>
                    {onDelete && <div className="flex shrink-0 items-center gap-1 sm:pt-0.5">
                            <button type="button" onClick={() => onDelete(email.id)} disabled={isDeleting} className="rounded-md p-2 text-[#605e5c] transition-colors hover:bg-black/[0.05] hover:text-[#d13438] disabled:opacity-40" title={t("delete")}>
                                <Trash2 className="h-5 w-5" aria-hidden />
                            </button>
                        </div>}
                </div>

                {/* Gönderen satırı: avatar + kimlik + zaman */}
                <div className="mt-5 flex flex-wrap items-start gap-3 border-t border-black/[0.06] pt-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white" style={{
          backgroundColor: '#0078d4'
        }} aria-hidden>
                        {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-[#323130]">
                            {email.senderEmail}
                        </div>
                        <div className="mt-0.5 text-xs text-[#605e5c]">
                            <span className="font-medium text-[#605e5c]">{t("to")}</span>
                            <span className="break-all">{email.recipientEmail}</span>
                        </div>
                        <div className="mt-2">
                            <span className="inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#605e5c]" style={{
              borderColor: MS_BORDER,
              backgroundColor: '#fff'
            }}>
                                {email.emailType || 'Email'}
                            </span>
                        </div>
                    </div>
                    <time className="ml-auto shrink-0 text-xs tabular-nums text-[#605e5c] sm:text-sm" dateTime={email.sentAt}>
                        {formatDate(email.sentAt)}
                    </time>
                </div>
            </header>

            {/* Gövde: render full HTML inside an iframe to prevent CSS bleeding */}
            <div className="min-h-0 flex-1 bg-white relative">
                <iframe srcDoc={email.content} title={t("email_content")} className="absolute inset-0 w-full h-full border-0" sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox" />
            </div>
        </div>;
};
export default EmailContent;