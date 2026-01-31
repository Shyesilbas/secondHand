import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, EnvelopeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { MailOpen } from 'lucide-react';
import { emailService } from './services/emailService.js';
import { useNotification } from '../notification/NotificationContext.jsx';
import { parseError, handleError } from '../common/errorHandler.js';
import { extractSuccessMessage } from '../common/successHandler.js';
import EmailListItem from '../emails/components/EmailListItem';
import EmailContent from '../emails/components/EmailContent';
import EmailFilterTabs from '../emails/components/EmailFilterTabs';
import EmptyState from '../common/components/ui/EmptyState.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

const EmailsPageLoader = () => (
    <div className="min-h-screen bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-8">
                {/* Header skeleton */}
                <div className="space-y-4">
                    <div className="h-8 bg-secondary-200 rounded w-1/4"></div>
                    <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                </div>
                
                {/* Search and filters skeleton */}
                <div className="bg-background-primary rounded-lg border border-border-light p-6">
                    <div className="flex items-center space-x-4">
                        <div className="h-10 bg-secondary-200 rounded w-1/3"></div>
                        <div className="h-10 bg-secondary-200 rounded w-32"></div>
                    </div>
                </div>
                
                {/* Main content skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-background-primary rounded-lg border border-border-light overflow-hidden">
                        <div className="p-4 border-b border-border-light">
                            <div className="h-6 bg-secondary-200 rounded w-1/3"></div>
                        </div>
                        <div className="p-4 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-secondary-200 rounded w-full"></div>
                                    <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-background-primary rounded-lg border border-border-light p-6">
                        <div className="space-y-4">
                            <div className="h-6 bg-secondary-200 rounded w-1/2"></div>
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-4 bg-secondary-200 rounded"></div>
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
        <div className="mb-6 bg-status-error-bg border border-status-error-border rounded-lg p-4">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-status-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-status-error-text">Error loading emails</h3>
                    <p className="text-sm text-status-error-text mt-1">{error}</p>
                </div>
            </div>
        </div>
    );
    if (!emails.length) return (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm py-16">
            <div className="text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MailOpen className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2 tracking-tight">
                    No Emails Found
                </h3>
                <p className="text-slate-500 tracking-tight">
                    {filterType === 'ALL'
                        ? "You haven't received any emails yet."
                        : `No ${filterType?.toLowerCase?.() || ''} emails found.`}
                </p>
            </div>
        </div>
    );
    return null;
};

const EmailsGrid = ({ emails, selectedEmail, setSelectedEmail, handleDeleteEmail, isDeleting, pageInfo, onPageChange }) => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Email List */}
        <div className="lg:col-span-2 border-r border-slate-200/60 bg-slate-50/30 flex flex-col h-[calc(100vh-280px)] min-h-[600px]">
            <div className="px-5 py-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Inbox</h3>
                        <p className="text-xs text-slate-500 mt-0.5 tracking-tight">
                            {pageInfo.totalElements} {pageInfo.totalElements === 1 ? 'email' : 'emails'} total
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={pageInfo.page === 0}
                            onClick={() => onPageChange(pageInfo.page - 1)}
                            className="px-2 py-1 text-xs rounded border border-slate-200 disabled:opacity-40"
                        >
                            Prev
                        </button>
                        <span className="text-xs text-slate-500">
                            Page {pageInfo.page + 1} / {Math.max(pageInfo.totalPages, 1)}
                        </span>
                        <button
                            disabled={pageInfo.page + 1 >= pageInfo.totalPages}
                            onClick={() => onPageChange(pageInfo.page + 1)}
                            className="px-2 py-1 text-xs rounded border border-slate-200 disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
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
        <div className="lg:col-span-3 bg-white h-[calc(100vh-280px)] min-h-[600px] overflow-y-auto">
            <EmailContent email={selectedEmail} />
        </div>
    </div>
);

const EmailsPage = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const queryClient = useQueryClient();
    const { user, isAuthenticated } = useAuth();
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [filterType, setFilterType] = useState('ALL');
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const pageSize = 20;

    useEffect(() => {
        setSelectedEmail(null);
        setFilterType('ALL');
        setSearchTerm('');
        setPage(0);
    }, [user?.id]);

    const { 
        data: emailPage, 
        isLoading, 
        error 
    } = useQuery({
        queryKey: ['myEmails', user?.id, page],
        queryFn: async () => {
            return await emailService.getMyEmails(page, pageSize);
        },
        enabled: !!(isAuthenticated && user?.id),
        keepPreviousData: true,
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
    });

    const emails = emailPage?.content ?? [];
    const pageInfo = {
        page: emailPage?.number ?? page,
        size: emailPage?.size ?? pageSize,
        totalPages: emailPage?.totalPages ?? 0,
        totalElements: emailPage?.totalElements ?? emails.length
    };

    const handleDelete = async ({ id, title, deleteFunc, onSuccess }) => {
        notification.showConfirmation(`Delete ${title}`, `Are you sure you want to delete "${title}"?`, async () => {
            try {
                setIsDeleting(true);
                await deleteFunc();
                const res = await deleteFunc();
                const msg = typeof res === 'string' ? res : extractSuccessMessage(res);
                if (msg) {
                    notification.showSuccess(null, msg);
                }
                onSuccess?.();
            } catch (err) {
                handleError(err, notification.showError);
            } finally {
                setIsDeleting(false);
            }
        });
    };

    const handleDeleteEmail = (emailId, emailSubject) => {
        if (!emailId) {
            notification.showError('Email ID missing.');
            return;
        }
        handleDelete({
            id: emailId,
            title: 'Email',
            deleteFunc: () => emailService.deleteEmail(emailId),
            onSuccess: () => {
                if (selectedEmail?.id === emailId) setSelectedEmail(null);
            }
        });
    };

    const handleDeleteAllEmails = () => handleDelete({
        title: 'All Emails',
        deleteFunc: () => emailService.deleteAll(),
        onSuccess: () => {
            setSelectedEmail(null);
            queryClient.invalidateQueries({ queryKey: ['myEmails', user?.id] });
        }
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
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-6">
                {/* Header Section */}
                <div className="mb-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-slate-600 hover:text-slate-900 transition-all duration-300 ease-in-out px-3 py-2 rounded-xl hover:bg-slate-100/50"
                        >
                            <ArrowLeftIcon className="w-5 h-5 mr-2" />
                            <span className="text-sm font-medium tracking-tight">Back</span>
                        </button>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                Email History
                            </h1>
                            <p className="text-sm text-slate-500 mt-1 tracking-tight">
                                View and manage all emails sent to your account
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Filters Section - Sticky */}
                <div className="sticky top-0 z-40 mb-6 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm">
                    <div className="p-5">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <div className="flex-1">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search emails by subject, sender, recipient, or content"
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 ease-in-out text-sm tracking-tight"
                                    />
                                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ease-in-out group-focus-within:text-indigo-500" />
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
                <EmailsPageFeedback 
                    error={error ? parseError(error).message : null} 
                    emails={filteredEmails} 
                    filterType={filterType} 
                />

                {/* Main Content */}
                {filteredEmails.length > 0 && (
                    <EmailsGrid
                        emails={filteredEmails}
                        selectedEmail={selectedEmail}
                        setSelectedEmail={setSelectedEmail}
                        handleDeleteEmail={handleDeleteEmail}
                        isDeleting={isDeleting}
                        pageInfo={pageInfo}
                        onPageChange={setPage}
                    />
                )}
            </div>
        </div>
    );
};

export default EmailsPage;
