import React from 'react';
import { formatDateTime } from '../../common/formatters.js';

const EmailContent = ({ email }) => {
    const formatDate = (dateString) => formatDateTime(dateString);

    if (!email) {
        return (
            <div className="bg-white rounded-lg shadow-sm border flex items-center justify-center h-96">
                <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.2a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
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
        <div className="bg-white rounded-lg shadow-sm border">
            {/* Email Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {email.subject}
                            </h2>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
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
                        className="text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                            __html: email.content.replace(/\n/g, '<br/>') 
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default EmailContent;
