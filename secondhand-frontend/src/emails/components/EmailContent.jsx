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

const SecurityEmailDetail = ({ email }) => {
    const content = email.content || '';
    
    // Parse the lines
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    
    // Find the introduction (usually the first line)
    const intro = lines[0] || '';
    
    // Find key-value details
    const details = [];
    let closing = '';
    
    lines.slice(1).forEach(line => {
        if (line.includes(':')) {
            const idx = line.indexOf(':');
            const key = line.substring(0, idx)
                .replace('Ip Adresi', 'IP Adresi')
                .replace('Zaman', 'Tarih / Saat')
                .replace('Tarayıcı (User-Agent)', 'Tarayıcı / Cihaz')
                .trim();
            const val = line.substring(idx + 1).trim();
            details.push({ key, val });
        } else if (!line.toLowerCase().startsWith('detaylar')) {
            closing += (closing ? '\n' : '') + line;
        }
    });

    const isSuccess = !email.subject?.includes('Başarısız') && !email.subject?.includes('Failure');

    return (
        <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3.5 mb-6">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm ${
                    isSuccess 
                        ? 'bg-emerald-50 border-emerald-100/80 text-emerald-600 shadow-emerald-100/20' 
                        : 'bg-rose-50 border-rose-100/80 text-rose-600 shadow-rose-100/20'
                }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        {isSuccess ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        )}
                    </svg>
                </div>
                <div>
                    <h3 className="text-[15px] font-bold text-slate-800">Güvenlik Denetimi Raporu</h3>
                    <p className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">Sistem Tarafından Doğrulanmış Bildirim</p>
                </div>
            </div>

            <p className="text-sm font-semibold text-slate-700 leading-relaxed mb-6">
                {intro}
            </p>

            {details.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/60 divide-y divide-slate-100 overflow-hidden mb-6 shadow-sm">
                    {details.map((d, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-start justify-between p-4 text-[13px] gap-1 sm:gap-6">
                            <span className="font-bold text-slate-500 sm:w-1/4 shrink-0">{d.key}</span>
                            <span className="font-semibold text-slate-800 break-all text-left sm:text-right flex-1 leading-relaxed">{d.val}</span>
                        </div>
                    ))}
                </div>
            )}

            {closing && (
                <div className={`p-4 rounded-2xl border text-[13px] font-semibold leading-relaxed flex items-start gap-2 ${
                    isSuccess
                        ? 'bg-amber-50/60 border-amber-100 text-amber-800/90'
                        : 'bg-indigo-50/60 border-indigo-100 text-indigo-800/90'
                }`}>
                    <span className="text-base shrink-0 mt-0.5">⚠️</span>
                    <span>{closing}</span>
                </div>
            )}
        </div>
    );
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
    const isSecurity = email.subject?.includes('Güvenlik') || email.subject?.includes('Security') || email.emailType === 'PASSWORD_RESET';

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
                        {isSecurity ? (
                            <SecurityEmailDetail email={email} />
                        ) : (
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
                        )}
                    </article>
                </div>
            </div>
        </div>
    );
};

export default EmailContent;
