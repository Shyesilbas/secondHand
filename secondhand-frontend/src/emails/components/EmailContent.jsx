import {formatDateTime, formatPricesInHtml, replaceEnumCodesInHtml} from '../../common/formatters.js';
import {useEnums} from '../../common/hooks/useEnums.js';

const EmailContent = ({ email }) => {
    const formatDate = (dateString) => formatDateTime(dateString);

    const { enums } = useEnums();

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
            <div className="px-12 pt-8 pb-5 border-b border-slate-200/60">
                <div className="max-w-3xl">
                    <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">
                        {email.subject}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span><span className="font-medium text-slate-400">From:</span> {email.senderEmail}</span>
                        <span><span className="font-medium text-slate-400">To:</span> {email.recipientEmail}</span>
                        <span><span className="font-medium text-slate-400">Date:</span> {formatDate(email.sentAt)}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                            {email.emailType || 'EMAIL'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Email Content - Prose Typography */}
            <div className="flex-1 overflow-y-auto px-12 py-10 bg-slate-50/50">
                <div className="max-w-3xl">
                    <div 
                        className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-800 prose-p:leading-relaxed prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-ul:text-slate-700 prose-ol:text-slate-700 prose-li:text-slate-700 tracking-tight"
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
