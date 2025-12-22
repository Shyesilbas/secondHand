import React from 'react';
import { formatDateTime, replaceEnumCodesInHtml, formatPricesInHtml } from '../../common/formatters.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import { EMAIL_TYPES } from '../emails.js';

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
            <div className="bg-white rounded-lg border border-gray-200 flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.2a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Select an Email
                    </h3>
                    <p className="text-gray-600">
                        Choose an email from the list to view its content
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Modern Email Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full mt-2 ${dotClass}`}></div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                {email.subject}
                            </h2>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                    <span className="font-medium">From:</span>
                                    <span>{email.senderEmail}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                    <span className="font-medium">To:</span>
                                    <span>{email.recipientEmail}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{formatDate(email.sentAt)}</span>
                                </div>
                            </div>
                            <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {email.emailType || 'EMAIL'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern Email Content */}
            <div className="px-6 py-6">
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <div 
                        className="text-gray-800 leading-relaxed prose prose-sm max-w-none prose-gray"
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
