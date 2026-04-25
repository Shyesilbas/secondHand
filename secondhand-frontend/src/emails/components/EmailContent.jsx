import {formatDateTime, formatPricesInHtml, replaceEnumCodesInHtml} from '../../common/formatters.js';
import {useEnums} from '../../common/hooks/useEnums.js';

const EmailContent = ({ email }) => {
    const formatDate = (dateString) => formatDateTime(dateString);
    const { enums } = useEnums();

    if (!email) return null;

    return (
        <div className="h-full bg-white flex flex-col">
            <div className="px-6 py-8 border-b border-gray-200">
                <div className="max-w-3xl">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">
                        {email.subject}
                    </h2>
                    <div className="flex flex-col gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <span className="w-12 font-bold text-gray-400 uppercase text-[10px] tracking-wider">From</span> 
                            <span className="font-medium text-gray-900">{email.senderEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-12 font-bold text-gray-400 uppercase text-[10px] tracking-wider">To</span> 
                            <span>{email.recipientEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-12 font-bold text-gray-400 uppercase text-[10px] tracking-wider">Date</span> 
                            <span>{formatDate(email.sentAt)}</span>
                        </div>
                        <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                                {email.emailType || 'EMAIL'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-3xl">
                    <div 
                        className="prose prose-gray prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-800 prose-p:leading-relaxed prose-a:text-gray-900 prose-a:underline hover:prose-a:text-gray-600 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700"
                        dangerouslySetInnerHTML={{ 
                            __html: formatPricesInHtml(
                                replaceEnumCodesInHtml(email.content, enums, ['shippingStatuses', 'paymentTypes', 'emailTypes'])
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                    .replace(/\n/g, '<br/>'),
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
