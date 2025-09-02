import React from 'react';

const typeBadgeStyles = {
    PAYMENT_VERIFICATION: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
    WELCOME: 'bg-green-100 text-green-800 ring-green-200',
    PAYMENT_SUCCESS: 'bg-blue-100 text-blue-800 ring-blue-200',
};

const EmailDisplayModal = ({ emails, onClose }) => {
    const formatDate = (date) => {
        try {
            return new Date(date).toLocaleString('tr-TR');
        } catch (e) { return String(date || ''); }
    };

    const getTypeBadgeClass = (type) => typeBadgeStyles[type] || 'bg-gray-100 text-gray-700 ring-gray-200';

    const copyToClipboard = async (text) => {
        try { await navigator.clipboard.writeText(text || ''); } catch {}
    };

    const extractVerificationCode = (email) => {
        if (email?.emailType !== 'PAYMENT_VERIFICATION') return null;
        const match = (email.content || '').match(/\b\d{6}\b/);
        return match ? match[0] : null;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-3xl mx-4 overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/40">
                    <h3 className="text-lg font-semibold text-gray-900">Email Geçmişi</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
                    {emails.map((email, index) => {
                        const code = extractVerificationCode(email);
                        return (
                            <div key={index} className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="px-4 py-3 border-b flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${getTypeBadgeClass(email.emailType)}`}>
                                                {email.emailType}
                                            </span>
                                            <span className="text-xs text-gray-500">{formatDate(email.createdAt || email.sentAt)}</span>
                                        </div>
                                        <h4 className="mt-1 truncate text-sm font-semibold text-gray-900">{email.subject}</h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {code && (
                                            <div className="flex items-center gap-1 rounded-lg bg-yellow-50 px-2 py-1 text-xs font-mono text-yellow-800 ring-1 ring-yellow-200">
                                                <span>Kod:</span>
                                                <span>{code}</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => copyToClipboard(email.content)}
                                            className="rounded-lg border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="rounded-lg bg-gray-50 p-3 text-sm font-mono text-gray-800 border" style={{ whiteSpace: 'pre-wrap' }}>
                                        {email.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default EmailDisplayModal;
