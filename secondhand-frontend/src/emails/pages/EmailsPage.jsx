import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useNavigate} from 'react-router-dom';
import {
    ArrowLeft as ArrowLeftIcon,
    Bell,
    CreditCard,
    MailOpen,
    Megaphone,
    RefreshCw,
    Search as MagnifyingGlassIcon,
    Shield,
    Tag,
    Trash2
} from 'lucide-react';
import {emailService} from '../services/emailService.js';
import {useNotification} from '../../notification/NotificationContext.jsx';
import {handleError, parseError} from '../../common/errorHandler.js';
import {extractSuccessMessage} from '../../common/successHandler.js';
import EmailListItem from '../components/EmailListItem';
import EmailContent from '../components/EmailContent';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {EMAIL_TYPES} from '../emails.js';
import { EMAIL_DEFAULTS, EMAIL_FILTERS, EMAIL_MESSAGES } from '../emailConstants.js';

const EmailsPageLoader = () => (
    <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
                <div className="space-y-4">
                    <div className="h-8 bg-secondary-200 rounded w-1/4"></div>
                    <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-slate-200 overflow-hidden">
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
                    <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-slate-200 p-6">
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
                    <h3 className="text-sm font-medium text-status-error-text">{EMAIL_MESSAGES.LOAD_ERROR_TITLE}</h3>
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
                    {EMAIL_MESSAGES.NO_EMAILS_TITLE}
                </h3>
                <p className="text-slate-500 tracking-tight">
                    {filterType === EMAIL_FILTERS.ALL
                        ? EMAIL_MESSAGES.NO_EMAILS_ALL
                        : `No ${filterType?.toLowerCase?.() || ''} emails found.`}
                </p>
            </div>
        </div>
    );
    return null;
};

const getEmailMatchesFilter = (email, filterType) => {
    if (filterType === EMAIL_FILTERS.ALL) return true;
    if (filterType === EMAIL_FILTERS.OFFER) return String(email?.emailType || '').startsWith('OFFER_');
    if (filterType === EMAIL_FILTERS.SECURITY) return [EMAIL_TYPES.VERIFICATION_CODE, EMAIL_TYPES.PASSWORD_RESET].includes(email?.emailType);
    return email?.emailType === filterType;
};

const EmailsPage = ({ embedded = false }) => {
    const navigate = useNavigate();
    const notification = useNotification();
    const queryClient = useQueryClient();
    const { user, isAuthenticated } = useAuthState();
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [filterType, setFilterType] = useState(EMAIL_FILTERS.ALL);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(EMAIL_DEFAULTS.PAGE);
    const pageSize = EMAIL_DEFAULTS.PAGE_SIZE;
    const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

    useEffect(() => {
        setSelectedEmail(null);
        setFilterType(EMAIL_FILTERS.ALL);
        setSearchTerm('');
        setPage(EMAIL_DEFAULTS.PAGE);
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

    const handleDelete = async ({ title, deleteFunc, onSuccess }) => {
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

    const handleDeleteEmail = (emailId) => {
        if (!emailId) {
            notification.showError(EMAIL_MESSAGES.EMAIL_ID_MISSING);
            return;
        }
        handleDelete({
            title: 'Email',
            deleteFunc: () => emailService.deleteEmail(emailId),
            onSuccess: () => {
                if (selectedEmail?.id === emailId) {
                    setSelectedEmail(null);
                    setMobileDetailOpen(false);
                }
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
        { id: EMAIL_FILTERS.ALL, label: 'Inbox', icon: MailOpen },
        { id: EMAIL_FILTERS.OFFER, label: 'Offers', icon: Tag },
        { id: EMAIL_FILTERS.SECURITY, label: 'Security', icon: Shield },
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
    const unreadCount = useMemo(() => (emails || []).filter((e) => !e?.read && !e?.isRead).length, [emails]);
    const selectedFolderLabel = useMemo(
        () => folderItems.find((item) => item.id === filterType)?.label || 'Inbox',
        [folderItems, filterType]
    );
    const handleFolderSelect = useCallback((folderId) => {
        setFilterType(folderId);
        setSelectedEmail(null);
        setMobileDetailOpen(false);
    }, []);

    const onSelectEmail = useCallback(async (email) => {
        setSelectedEmail(email);
        setMobileDetailOpen(true);
        if (!email.read && !email.isRead) {
            try {
                await emailService.markAsRead(email.id);
                queryClient.setQueryData(['myEmails', user?.id, page], (oldData) => {
                    if (!oldData || !oldData.content) return oldData;
                    return {
                        ...oldData,
                        content: oldData.content.map(e => e.id === email.id ? { ...e, isRead: true, read: true } : e)
                    };
                });
            } catch (err) {
                console.error("Error marking email as read", err);
            }
        }
    }, [queryClient, user?.id, page]);

    if (isLoading) {
        return embedded ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500 shadow-sm">
                Loading mail…
            </div>
        ) : (
            <EmailsPageLoader />
        );
    }

    return (
        <div className={embedded ? 'min-h-0 bg-transparent' : 'min-h-screen bg-slate-50'}>
            <div className={`sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md ${embedded ? 'rounded-t-2xl' : ''}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
                    {!embedded && (
                        <button
                            onClick={() => navigate(-1)}
                            className="h-10 px-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-300 inline-flex items-center gap-2"
                            type="button"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                            <span className="text-sm font-medium hidden sm:inline">Back</span>
                        </button>
                    )}

                    <div className="hidden md:flex flex-col border-r border-slate-200 pr-3">
                        <span className="text-sm font-semibold text-slate-900">Mailbox</span>
                        <span className="text-xs text-slate-500">
                            {pageInfo.totalElements} total - {unreadCount} unread
                        </span>
                    </div>

                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search mail"
                                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 text-sm"
                            />
                            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['myEmails', user?.id] })}
                            className="h-10 w-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 inline-flex items-center justify-center transition-colors duration-300"
                            title="Refresh"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteAllEmails}
                            disabled={isDeleting || filteredEmails.length === 0}
                            className="h-10 w-10 rounded-xl border border-slate-200 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 inline-flex items-center justify-center transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Delete all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 lg:hidden">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                        {folderItems.map((item) => {
                            const Icon = item.icon;
                            const active = filterType === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleFolderSelect(item.id)}
                                    className={`shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                                        active
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{item.label}</span>
                                    <span className={`tabular-nums ${active ? 'text-slate-200' : 'text-slate-500'}`}>
                                        {counts[item.id] ?? 0}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                        <span className="text-slate-500">
                            Folder: <span className="font-semibold text-slate-900">{selectedFolderLabel}</span>
                        </span>
                        <span className="text-slate-300 hidden sm:inline">|</span>
                        <span className="text-slate-500">
                            Visible: <span className="font-semibold text-slate-900 tabular-nums">{filteredEmails.length}</span>
                        </span>
                        <span className="text-slate-300 hidden sm:inline">|</span>
                        <span className="text-slate-500">
                            Unread: <span className="font-semibold text-indigo-700 tabular-nums">{unreadCount}</span>
                        </span>
                    </div>
                </div>

                <EmailsPageFeedback
                    error={error ? parseError(error).message : null}
                    emails={filteredEmails}
                    filterType={filterType}
                />

                {filteredEmails.length > 0 && (
                    <div className="hidden lg:grid grid-cols-12 gap-5">
                        <aside className="col-span-4 xl:col-span-3">
                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100">
                                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Folders</p>
                                </div>
                                <div className="p-2.5">
                                    {folderItems.map((item) => {
                                        const Icon = item.icon;
                                        const active = filterType === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => handleFolderSelect(item.id)}
                                                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-300 ${active ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700 hover:bg-slate-50'}`}
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
                            <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-3">
                                <p className="text-xs text-slate-500">Page</p>
                                <div className="mt-2 flex items-center justify-between gap-2">
                                    <button
                                        disabled={pageInfo.page === 0}
                                        onClick={() => setPage(pageInfo.page - 1)}
                                        className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
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
                                        className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                                        type="button"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </aside>

                        <section className="col-span-8 xl:col-span-9">
                            {!selectedEmail && (
                                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden h-[calc(100vh-200px)]">
                                    <div className="px-4 py-3 border-b border-slate-100 bg-white sticky top-0 z-10">
                                        <p className="text-sm font-semibold text-slate-900">{selectedFolderLabel}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {filteredEmails.length} shown - {unreadCount} unread
                                        </p>
                                    </div>
                                    <div className="h-[calc(100%-56px)] overflow-y-auto">
                                        {filteredEmails.map((email) => (
                                            <EmailListItem
                                                key={email.id}
                                                email={email}
                                                isSelected={false}
                                                onSelect={onSelectEmail}
                                                onDelete={handleDeleteEmail}
                                                isDeleting={isDeleting}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedEmail && (
                                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden h-[calc(100vh-200px)]">
                                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedEmail(null);
                                                setMobileDetailOpen(false);
                                            }}
                                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-200"
                                        >
                                            <ArrowLeftIcon className="w-4 h-4" />
                                            Back to list
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (selectedEmail?.id) handleDeleteEmail(selectedEmail.id);
                                            }}
                                            disabled={isDeleting || !selectedEmail?.id}
                                            className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 inline-flex items-center justify-center transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="h-[calc(100%-56px)] overflow-y-auto">
                                        <EmailContent email={selectedEmail} />
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {filteredEmails.length > 0 && (
                    <div className="lg:hidden">
                        {!mobileDetailOpen && (
                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{selectedFolderLabel}</p>
                                        <p className="text-xs text-slate-500">{filteredEmails.length} shown • {unreadCount} unread</p>
                                    </div>
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
                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setMobileDetailOpen(false)}
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-200"
                                    >
                                        <ArrowLeftIcon className="w-4 h-4" />
                                        Back to list
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (selectedEmail?.id) handleDeleteEmail(selectedEmail.id);
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
