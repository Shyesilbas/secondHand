import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { emailService } from './services/emailService.js';
import { useNotification } from '../notification/NotificationContext.jsx';
import EmailListItem from '../emails/components/EmailListItem';
import EmailContent from '../emails/components/EmailContent';
import EmailFilterTabs from '../emails/components/EmailFilterTabs';
import EmptyState from '../common/components/ui/EmptyState.jsx';
import PageHeader from '../listing/components/PageHeader.jsx';

const EmailsPageLoader = () => (
    <div className="container mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg border p-4">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
            <div className="lg:col-span-2 bg-white rounded-lg border p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded mb-2"></div>
                ))}
            </div>
        </div>
    </div>
);

const EmailsPageFeedback = ({ error, emails, filterType }) => {
    if (error) return <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>;
    if (!emails.length) return <EmptyState
        title="No Emails Found"
        description={filterType === 'ALL'
            ? "You haven't received any emails yet."
            : `No ${filterType?.toLowerCase?.() || ''} emails found.`}
    />;
    return null;
};

const EmailsGrid = ({ emails, selectedEmail, setSelectedEmail, handleDeleteEmail, isDeleting }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="font-semibold text-gray-900">Email Inbox</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">{emails.length} emails</p>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
                {emails.map((email, i) => (
                    <EmailListItem
                        key={i}
                        email={email}
                        isSelected={selectedEmail === email}
                        onSelect={setSelectedEmail}
                        onDelete={handleDeleteEmail}
                        isDeleting={isDeleting}
                    />
                ))}
            </div>
        </div>
        <div className="lg:col-span-2">
            <EmailContent email={selectedEmail} />
        </div>
    </div>
);

const EmailsPage = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const [emails, setEmails] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [filterType, setFilterType] = useState('ALL');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchEmails(); }, []);

    const fetchEmails = async () => {
        try {
            setIsLoading(true); setError(null);
            const data = await emailService.getMyEmails();
            setEmails(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.response?.data?.message || 'Error loading emails');
            setEmails([]);
        } finally { setIsLoading(false); }
    };

    const handleDelete = async ({ id, title, deleteFunc, onSuccess }) => {
        notification.showConfirmation(`Delete ${title}`, `Are you sure you want to delete "${title}"?`, async () => {
            try { setIsDeleting(true); await deleteFunc(); notification.showSuccess('Success', `${title} deleted successfully.`); onSuccess?.(); }
            catch (err) { notification.showError('Error', err.response?.data?.message || `Failed to delete ${title.toLowerCase()}.`); }
            finally { setIsDeleting(false); }
        });
    };

    const handleDeleteEmail = (emailId, emailSubject) => {
        if (!emailId) return notification.showError('Error', 'Email ID missing.');
        handleDelete({
            id: emailId,
            title: 'Email',
            deleteFunc: () => emailService.deleteEmail(emailId),
            onSuccess: () => {
                setEmails(prev => prev.filter(email => email.id !== emailId));
                if (selectedEmail?.id === emailId) setSelectedEmail(null);
            }
        });
    };

    const handleDeleteAllEmails = () => handleDelete({
        title: 'All Emails',
        deleteFunc: () => emailService.deleteAll(),
        onSuccess: () => { setEmails([]); setSelectedEmail(null); }
    });

    const filteredEmails = useMemo(() => {
            const byType = filterType === 'ALL' ? emails : emails.filter(email => email.emailType === filterType);
            if (!searchTerm || !searchTerm.trim()) return byType;
            const q = searchTerm.toLowerCase().trim();
            return byType.filter(e =>
                e.subject?.toLowerCase().includes(q) ||
                e.senderEmail?.toLowerCase().includes(q) ||
                e.recipientEmail?.toLowerCase().includes(q) ||
                e.content?.toLowerCase().includes(q)
            );
        }, [emails, filterType, searchTerm]
    );

    if (isLoading) return <EmailsPageLoader />;

    return (
        <div className="container mx-auto px-4 py-8">
            <PageHeader title="Email History" subtitle="View all emails sent to your account" onBack={() => navigate(-1)} />
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-6">
                <div className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search emails by subject, sender, recipient, or content"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                        </svg>
                    </div>
                </div>
                <div className="flex-none">
                    <EmailFilterTabs filterType={filterType} onFilterChange={setFilterType} onDeleteAll={handleDeleteAllEmails} hasEmails={filteredEmails.length > 0} isDeleting={isDeleting} />
                </div>
            </div>
            <EmailsPageFeedback error={error} emails={filteredEmails} filterType={filterType} />
            {filteredEmails.length > 0 && (
                <EmailsGrid
                    emails={filteredEmails}
                    selectedEmail={selectedEmail}
                    setSelectedEmail={setSelectedEmail}
                    handleDeleteEmail={handleDeleteEmail}
                    isDeleting={isDeleting}
                />
            )}
        </div>
    );
};

export default EmailsPage;
