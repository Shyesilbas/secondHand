import React from 'react';

const EmailDisplayModal = ({ emails, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Email Geçmişi
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-4">
                    {emails.map((email, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-gray-900">{email.subject}</h4>
                                <span className="text-xs text-gray-500">
                                    {new Date(email.createdAt || email.sentAt).toLocaleString('tr-TR')}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{email.emailType}</p>
                            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                                {email.content}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmailDisplayModal;
