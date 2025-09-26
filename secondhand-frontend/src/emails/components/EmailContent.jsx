import React from 'react';
import { formatDateTime, replaceEnumCodesInHtml, formatPricesInHtml } from '../../common/formatters.js';
import { useEnums } from '../../common/hooks/useEnums.js';

const EmailContent = ({ email }) => {
    const formatDate = (dateString) => formatDateTime(dateString);

    const { enums } = useEnums();

    if (!email) {
        return (
            <div className="bg-white rounded-lg shadow-sm border flex items-center justify-center h-96">
                <div className="text-center">
                    <svg className="w-12 h-12 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.2a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-text-primary mb-2">
                        Select an Email
                    </h3>
                    <p className="text-text-secondary">
                        Choose an email from the list to view its content
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border">
            {/* Email Header */}
            <div className="px-6 py-4 border-b border-sidebar-border">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div>
                            <h2 className="text-xl font-semibold text-text-primary">
                                {email.subject}
                            </h2>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-text-muted">
                                <span>From: {email.senderEmail}</span>
                                <span>To: {email.recipientEmail}</span>
                                <span>{formatDate(email.sentAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Email Content */}
            <div className="px-6 py-6">
                <div className="prose max-w-none">
                    <div 
                        className="text-text-secondary leading-relaxed"
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
