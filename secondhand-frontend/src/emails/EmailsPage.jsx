import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, EnvelopeIcon, MagnifyingGlassIcon, TrashIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { emailService } from './services/emailService.js';
import { useNotification } from '../notification/NotificationContext.jsx';
import EmailListItem from '../emails/components/EmailListItem';
import EmailContent from '../emails/components/EmailContent';
import EmailFilterTabs from '../emails/components/EmailFilterTabs';
import EmptyState from '../common/components/ui/EmptyState.jsx';

const EmailsPageLoader = () => (
    <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-8">
                {/* Header skeleton */}
                <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                
                {/* Search and filters skeleton */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-4">
                        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-10 bg-gray-200 rounded w-32"></div>
                    </div>
                </div>
                
                {/* Main content skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        </div>
                        <div className="p-4 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                        <div className="space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-4 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const EmailsPageFeedback = ({ error, emails, filterType }) => {
    if (error) return (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading emails</h3>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
            </div>
        </div>
    );
    if (!emails.length) return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <EmptyState
                title="No Emails Found"
                description={filterType === 'ALL'
                    ? "You haven't received any emails yet."
                    : `No ${filterType?.toLowerCase?.() || ''} emails found.`}
            />
        </div>
    );
    return null;
};

const EmailsGrid = ({ emails, selectedEmail, setSelectedEmail, handleDeleteEmail, isDeleting }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email List */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Email Inbox</h3>
                        <p className="text-sm text-gray-600">{emails.length} {emails.length === 1 ? 'email' : 'emails'}</p>
                    </div>
                </div>
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
        
        {/* Email Content */}
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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5 mr-2" />
                            <span className="text-sm font-medium">Back</span>
                        </button>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Email History
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                View and manage all emails sent to your account
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Filters Section */}
                <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center space-x-3">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
                            <h2 className="text-lg font-medium text-gray-900">Search & Filter</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search emails by subject, sender, recipient, or content"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                    />
                                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                            <div className="flex-none">
                                <EmailFilterTabs 
                                    filterType={filterType} 
                                    onFilterChange={setFilterType} 
                                    onDeleteAll={handleDeleteAllEmails} 
                                    hasEmails={filteredEmails.length > 0} 
                                    isDeleting={isDeleting} 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback Section */}
                <EmailsPageFeedback error={error} emails={filteredEmails} filterType={filterType} />

                {/* Main Content */}
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
        </div>
    );
};

export default EmailsPage;
