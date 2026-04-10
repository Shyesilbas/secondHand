import {formatDateTime, formatPricesInHtml, replaceEnumCodesInHtml} from '../../common/formatters.js';
import {useEnums} from '../../common/hooks/useEnums.js';

const EmailContent = ({ email }) => {
    const formatDate = (dateString) => formatDateTime(dateString);

    const { enums } = useEnums();

    if (!email) return null;

    return (
        <div className="h-full bg-white flex flex-col">
            <div className="px-5 sm:px-8 lg:px-12 pt-6 sm:pt-8 pb-5 border-b border-slate-200/60 bg-white">
                <div className="max-w-3xl">
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4">
                        {email.subject}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
                        <span><span className="font-medium text-slate-400">From:</span> {email.senderEmail}</span>
                        <span><span className="font-medium text-slate-400">To:</span> {email.recipientEmail}</span>
                        <span><span className="font-medium text-slate-400">Date:</span> {formatDate(email.sentAt)}</span>
                        <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                            {email.emailType || 'EMAIL'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-8 lg:px-12 py-6 sm:py-9 bg-slate-50/60">
                <div className="max-w-3xl">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
                        <div 
                        className="prose prose-slate prose-sm sm:prose-base lg:prose-base max-w-none prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-800 prose-p:leading-7 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-ul:text-slate-700 prose-ol:text-slate-700 prose-li:text-slate-700"
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
        </div>
    );
};

export default EmailContent;
