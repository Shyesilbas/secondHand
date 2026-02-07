import {formatDateTime, formatPricesInHtml, replaceEnumCodesInHtml} from '../../common/formatters.js';
import {useEnums} from '../../common/hooks/useEnums.js';
import {EMAIL_TYPES} from '../emails.js';

const EmailContent = ({ email }) => {
    const formatDate = (dateString) => formatDateTime(dateString);

    const { enums } = useEnums();

    const dotClass = (() => {
        if (email?.emailType === EMAIL_TYPES.VERIFICATION_CODE) return 'bg-green-500';
        if (email?.emailType === EMAIL_TYPES.PAYMENT_VERIFICATION) return 'bg-orange-500';
        if (email?.emailType && String(email.emailType).startsWith('OFFER_')) return 'bg-emerald-500';
        if (email?.emailType === EMAIL_TYPES.NOTIFICATION) return 'bg-blue-500';
        return 'bg-gray-400';
    })();

    if (!email) {
        return (
            <div className="h-full flex items-center justify-center bg-white">
                <div className="text-center px-8">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.2a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2 tracking-tight">
                        Select an Email
                    </h3>
                    <p className="text-slate-500 tracking-tight">
                        Choose an email from the list to view its content
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-white flex flex-col">
            <div className="px-12 pt-12 pb-8 border-b border-slate-200/60">
                <div className="max-w-3xl">
                    <div className="flex items-start gap-3 mb-6">
                        <div className={`w-2.5 h-2.5 rounded-full mt-2 ${dotClass}`}></div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">
                                {email.subject}
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <span className="font-semibold text-slate-900 w-16 tracking-tight">From:</span>
                                    <span className="tracking-tight">{email.senderEmail}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <span className="font-semibold text-slate-900 w-16 tracking-tight">To:</span>
                                    <span className="tracking-tight">{email.recipientEmail}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <span className="font-semibold text-slate-900 w-16 tracking-tight">Date:</span>
                                    <span className="tracking-tight">{formatDate(email.sentAt)}</span>
                                </div>
                                <div className="pt-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 tracking-tight">
                                        {email.emailType || 'EMAIL'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Email Content - Prose Typography */}
            <div className="flex-1 overflow-y-auto px-12 py-10">
                <div className="max-w-3xl">
                    <div 
                        className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-ul:text-slate-700 prose-ol:text-slate-700 prose-li:text-slate-700 tracking-tight"
                        dangerouslySetInnerHTML={{ 
                            __html: formatPricesInHtml(
                                replaceEnumCodesInHtml(email.content, enums, ['shippingStatuses', 'paymentTypes', 'emailTypes']).replace(/\n/g, '<br/>'),
                                'TRY'
                            )
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default EmailContent;
