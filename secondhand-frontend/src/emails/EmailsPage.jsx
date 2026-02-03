import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Bell, CreditCard, MailOpen, Megaphone, RefreshCw, Shield, Tag, Trash2 } from 'lucide-react';
import { emailService } from './services/emailService.js';
import { useNotification } from '../notification/NotificationContext.jsx';
import { parseError, handleError } from '../common/errorHandler.js';
import { extractSuccessMessage } from '../common/successHandler.js';
import EmailListItem from '../emails/components/EmailListItem';
import EmailContent from '../emails/components/EmailContent';
import { useAuth } from '../auth/AuthContext.jsx';
import { EMAIL_TYPES } from './emails.js';

const EmailsPageLoader = () => (
    <div className="min-h-screen bg-slate-50">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-6">
            <div className="animate-pulse space-y-8">
                <div className="space-y-4">
                    <div className="h-8 bg-secondary-200 rounded w-1/4"></div>
                    <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center space-x-4">
                        <div className="h-10 bg-secondary-200 rounded w-1/3"></div>
                        <div className="h-10 bg-secondary-200 rounded w-32"></div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
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
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
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

const getEmailMatchesFilter = (email, filterType) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'OFFER') return String(email?.emailType || '').startsWith('OFFER_');
    if (filterType === 'SECURITY') return [EMAIL_TYPES.VERIFICATION_CODE, EMAIL_TYPES.PASSWORD_RESET].includes(email?.emailType);
    return email?.emailType === filterType;
};

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
    const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

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
            const byType = emails.filter((email) => getEmailMatchesFilter(email, filterType));
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

    const folderItems = useMemo(() => ([
        { id: 'ALL', label: 'Inbox', icon: MailOpen },
        { id: 'OFFER', label: 'Offers', icon: Tag },
        { id: 'SECURITY', label: 'Security', icon: Shield },
        { id: EMAIL_TYPES.PAYMENT_VERIFICATION, label: 'Payments', icon: CreditCard },
        { id: EMAIL_TYPES.NOTIFICATION, label: 'Notifications', icon: Bell },
        { id: EMAIL_TYPES.PROMOTIONAL, label: 'Promotions', icon: Megaphone },
    ]), []);

    const counts = useMemo(() => {
        const base = emails || [];
        return folderItems.reduce((acc, item) => {
            acc[item.id] = base.filter((e) => getEmailMatchesFilter(e, item.id)).length;
            return acc;
        }, {});
    }, [emails, folderItems]);

    const onSelectEmail = useCallback((email) => {
        setSelectedEmail(email);
        setMobileDetailOpen(true);
    }, []);

    if (isLoading) return <EmailsPageLoader />;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="h-9 px-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-300 inline-flex items-center gap-2"
                        type="button"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span className="text-sm font-medium tracking-tight hidden sm:inline">Back</span>
                    </button>

                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search mail"
                                className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 text-sm"
                            />
                            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['myEmails', user?.id] })}
                            className="h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 inline-flex items-center justify-center transition-colors duration-300"
                            title="Refresh"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteAllEmails}
                            disabled={isDeleting || filteredEmails.length === 0}
                            className="h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 inline-flex items-center justify-center transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Delete all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <EmailsPageFeedback
                    error={error ? parseError(error).message : null}
                    emails={filteredEmails}
                    filterType={filterType}
                />

                {filteredEmails.length > 0 && (
                    <div className="hidden lg:grid grid-cols-12 gap-4">
                        <aside className="col-span-2">
                            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="px-3 py-3 border-b border-slate-100">
                                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Folders</p>
                                </div>
                                <div className="p-2">
                                    {folderItems.map((item) => {
                                        const Icon = item.icon;
                                        const active = filterType === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => { setFilterType(item.id); setSelectedEmail(null); setMobileDetailOpen(false); }}
                                                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-300 ${active ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700 hover:bg-slate-50'}`}
                                            >
                                                <span className="flex items-center gap-2 min-w-0">
                                                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-500'}`} />
                                                    <span className="truncate">{item.label}</span>
                                                </span>
                                                <span className="text-xs text-slate-500 tabular-nums">{counts[item.id] ?? 0}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </aside>

                        <section className="col-span-4">
                            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 tracking-tight">Inbox</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{pageInfo.totalElements} total</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={pageInfo.page === 0}
                                            onClick={() => setPage(pageInfo.page - 1)}
                                            className="px-2 py-1 text-xs rounded border border-slate-200 disabled:opacity-40"
                                            type="button"
                                        >
                                            Prev
                                        </button>
                                        <span className="text-xs text-slate-500 tabular-nums">
                                            {pageInfo.page + 1} / {Math.max(pageInfo.totalPages, 1)}
                                        </span>
                                        <button
                                            disabled={pageInfo.page + 1 >= pageInfo.totalPages}
                                            onClick={() => setPage(pageInfo.page + 1)}
                                            className="px-2 py-1 text-xs rounded border border-slate-200 disabled:opacity-40"
                                            type="button"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>

                                <div className="h-[calc(100vh-190px)] overflow-y-auto">
                                    {filteredEmails.map((email) => (
                                        <EmailListItem
                                            key={email.id}
                                            email={email}
                                            isSelected={selectedEmail?.id === email.id}
                                            onSelect={onSelectEmail}
                                            onDelete={handleDeleteEmail}
                                            isDeleting={isDeleting}
                                        />
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="col-span-6">
                            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden h-[calc(100vh-190px)]">
                                <div className="h-full overflow-y-auto">
                                    <EmailContent email={selectedEmail} />
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {filteredEmails.length > 0 && (
                    <div className="lg:hidden">
                        {!mobileDetailOpen && (
                            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-900 tracking-tight">Inbox</p>
                                    <span className="text-xs text-slate-500 tabular-nums">{filteredEmails.length}</span>
                                </div>
                                <div className="max-h-[70vh] overflow-y-auto">
                                    {filteredEmails.map((email) => (
                                        <EmailListItem
                                            key={email.id}
                                            email={email}
                                            isSelected={selectedEmail?.id === email.id}
                                            onSelect={onSelectEmail}
                                            onDelete={handleDeleteEmail}
                                            isDeleting={isDeleting}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {mobileDetailOpen && (
                            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setMobileDetailOpen(false)}
                                        className="text-sm font-medium text-slate-700 hover:text-slate-900"
                                    >
                                        Back to list
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (selectedEmail?.id) handleDeleteEmail(selectedEmail.id, selectedEmail.subject);
                                        }}
                                        disabled={isDeleting || !selectedEmail?.id}
                                        className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 inline-flex items-center justify-center transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="max-h-[70vh] overflow-y-auto">
                                    <EmailContent email={selectedEmail} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailsPage;
