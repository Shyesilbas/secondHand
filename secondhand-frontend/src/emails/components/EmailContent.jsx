import {formatDateTime, formatPricesInHtml, replaceEnumCodesInHtml} from '../../common/formatters.js';
import {useEnums} from '../../common/hooks/useEnums.js';
import {Trash2} from 'lucide-react';

const MS_HEADER = '#f3f2f1';
const MS_BORDER = '#edebe9';

/** Outlook benzeri: yerel parçadan baş harf (avatar). */
const senderInitials = (emailAddr) => {
    if (!emailAddr || typeof emailAddr !== 'string') return '?';
    const local = emailAddr.split('@')[0] || '';
    const parts = local.replace(/[._+-]/g, ' ').trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
    }
    return local.slice(0, 2).toUpperCase() || '?';
};

/**
 * Okuma paneli — geniş alan, üstte konu + gönderen satırı (Outlook tarzı).
 * @param {{ email: object, onDelete?: (id: string) => void, isDeleting?: boolean }} props
 */
const EmailContent = ({ email, onDelete, isDeleting }) => {
    const formatDate = (dateString) => formatDateTime(dateString);
    const { enums } = useEnums();

    if (!email) return null;

    const initials = senderInitials(email.senderEmail);

    return (
        <div className="flex h-full min-h-0 flex-col bg-white">
            {/* Üst: konu + araç (Outlook’ta sağda sil vb.) */}
            <header
                className="shrink-0 border-b px-4 py-4 sm:px-6 lg:px-8 lg:py-5"
                style={{ borderColor: MS_BORDER, backgroundColor: MS_HEADER }}
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <h1 className="min-w-0 flex-1 text-xl font-semibold leading-tight tracking-tight text-[#323130] sm:text-2xl lg:text-[1.65rem]">
                        {email.subject}
                    </h1>
                    {onDelete && (
                        <div className="flex shrink-0 items-center gap-1 sm:pt-0.5">
                            <button
                                type="button"
                                onClick={() => onDelete(email.id)}
                                disabled={isDeleting}
                                className="rounded-md p-2 text-[#605e5c] transition-colors hover:bg-black/[0.05] hover:text-[#d13438] disabled:opacity-40"
                                title="Delete"
                            >
                                <Trash2 className="h-5 w-5" aria-hidden />
                            </button>
                        </div>
                    )}
                </div>

                {/* Gönderen satırı: avatar + kimlik + zaman */}
                <div className="mt-5 flex flex-wrap items-start gap-3 border-t border-black/[0.06] pt-4">
                    <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{ backgroundColor: '#0078d4' }}
                        aria-hidden
                    >
                        {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-[#323130]">
                            {email.senderEmail}
                        </div>
                        <div className="mt-0.5 text-xs text-[#605e5c]">
                            <span className="font-medium text-[#605e5c]">To </span>
                            <span className="break-all">{email.recipientEmail}</span>
                        </div>
                        <div className="mt-2">
                            <span
                                className="inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#605e5c]"
                                style={{ borderColor: MS_BORDER, backgroundColor: '#fff' }}
                            >
                                {email.emailType || 'Email'}
                            </span>
                        </div>
                    </div>
                    <time
                        className="ml-auto shrink-0 text-xs tabular-nums text-[#605e5c] sm:text-sm"
                        dateTime={email.sentAt}
                    >
                        {formatDate(email.sentAt)}
                    </time>
                </div>
            </header>

            {/* Gövde: panel tam genişlikte; metin okuma ölçüsü ortalanır (Outlook’taki ferahlık) */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-white">
                <div className="mx-auto w-full max-w-none px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12 xl:px-16 2xl:px-20">
                    <article className="mx-auto max-w-[52rem]">
                        <div
                            className="prose prose-gray max-w-none text-[#323130] prose-p:text-[15px] prose-p:leading-8 prose-headings:font-semibold prose-headings:text-[#323130] prose-p:text-[#323130] prose-a:font-medium prose-a:text-[#0078d4] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#323130] prose-ul:text-[#323130] prose-ol:text-[#323130] prose-li:my-1.5 prose-li:leading-relaxed sm:prose-p:text-base"
                            dangerouslySetInnerHTML={{
                                __html: formatPricesInHtml(
                                    replaceEnumCodesInHtml(email.content, enums, [
                                        'shippingStatuses',
                                        'paymentTypes',
                                        'emailTypes',
                                    ])
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                        .replace(/\n/g, '<br/>'),
                                    'TRY'
                                ),
                            }}
                        />
                    </article>
                </div>
            </div>
        </div>
    );
};

export default EmailContent;
