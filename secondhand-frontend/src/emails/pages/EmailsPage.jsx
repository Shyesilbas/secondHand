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
    Trash2,
    Inbox
} from 'lucide-react';
import {emailService} from '../services/emailService.js';
import {useNotification} from '../../notification/NotificationContext.jsx';
import {handleError, parseError} from '../../common/errorHandler.js';
import {extractSuccessMessage} from '../../common/successHandler.js';
import EmailListItem from '../components/EmailListItem';
import EmailContent from '../components/EmailContent';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {EMAIL_TYPES} from '../emails.js';
import { EMAIL_DEFAULTS, EMAIL_FILTERS, EMAIL_MESSAGES, EMAIL_QUERY_STALE_MS } from '../emailConstants.js';

const EmailsPageLoader = () => (
    <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center text-gray-400 gap-4">
            <MailOpen className="w-8 h-8 animate-pulse" />
            <span className="text-sm font-medium">Loading mailbox...</span>
        </div>
    </div>
);

const EmailsPageFeedback = ({ error, emails, filterType }) => {
    if (error) return (
        <div className="m-4 bg-red-50 border border-red-100 rounded-lg p-4">
            <h3 className="text-sm font-bold text-red-800">{EMAIL_MESSAGES.LOAD_ERROR_TITLE}</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
    );
    if (!emails.length) return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-6 h-6 text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
                {EMAIL_MESSAGES.NO_EMAILS_TITLE}
            </h3>
            <p className="text-sm text-gray-500">
                {filterType === EMAIL_FILTERS.ALL
                    ? EMAIL_MESSAGES.NO_EMAILS_ALL
                    : `No ${filterType?.toLowerCase?.() || ''} emails found.`}
            </p>
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
        staleTime: EMAIL_QUERY_STALE_MS,
        refetchOnMount: 'always',
        refetchOnWindowFocus: false,
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
        if (!emailId) return;
        handleDelete({
            title: 'Email',
            deleteFunc: () => emailService.deleteEmail(emailId),
            onSuccess: () => {
                if (selectedEmail?.id === emailId) {
                    setSelectedEmail(null);
                }
                queryClient.invalidateQueries({ queryKey: ['myEmails', user?.id] });
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
    }, []);

    const onSelectEmail = useCallback(async (email) => {
        setSelectedEmail(email);
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
            <div className="px-6 py-16 text-center text-sm text-gray-500">Loading mail…</div>
        ) : <EmailsPageLoader />;
    }

    return (
        <div className={embedded ? 'min-h-0 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden h-[clamp(480px,min(88vh,920px))]' : 'min-h-0 h-[min(100dvh,100vh)] flex flex-col bg-white overflow-hidden'}>
            
            {/* Outlook tarzı üst şerit: arama ortada, aksiyonlar sağda */}
            <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#edebe9] bg-[#f3f2f1] px-3 sm:px-4">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    {!embedded && (
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="shrink-0 rounded-md p-2 text-[#605e5c] transition-colors hover:bg-black/[0.05] hover:text-[#323130]"
                            aria-label="Back"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </button>
                    )}
                    <div className="hidden min-w-0 sm:block">
                        <h1 className="truncate text-sm font-semibold text-[#323130]">Mailbox</h1>
                    </div>
                </div>

                <div className="min-w-0 flex-1 px-1 sm:px-4">
                    <div className="relative mx-auto max-w-2xl xl:max-w-3xl">
                        <label className="sr-only" htmlFor="mail-search">Search mail</label>
                        <input
                            id="mail-search"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search mail"
                            className="h-9 w-full rounded border border-[#edebe9] bg-white pl-9 pr-3 text-sm text-[#323130] shadow-sm placeholder:text-[#8a8886] focus:border-[#0078d4] focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
                        />
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8886]" />
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-0.5">
                    <button
                        type="button"
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['myEmails', user?.id] })}
                        className="rounded-md p-2 text-[#605e5c] transition-colors hover:bg-black/[0.05] hover:text-[#323130]"
                        title="Refresh"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={handleDeleteAllEmails}
                        disabled={isDeleting || filteredEmails.length === 0}
                        className="rounded-md p-2 text-[#605e5c] transition-colors hover:bg-red-50 hover:text-[#d13438] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#605e5c]"
                        title="Delete all"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </header>

            {/* 3 sütun: klasör | liste | okuma (lg+); okuma 1fr → ekranın çoğu */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[220px_minmax(260px,400px)_minmax(0,1fr)]">
                
                {/* 1. Klasörler (Outlook sol navigasyon) */}
                <aside className="hidden min-h-0 w-full min-w-0 flex-col border-[#edebe9] bg-[#faf9f8] lg:flex lg:border-r">
                    <div className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
                        {folderItems.map((item) => {
                            const Icon = item.icon;
                            const active = filterType === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleFolderSelect(item.id)}
                                    className={`flex w-full items-center justify-between gap-2 rounded-sm py-2.5 pl-3 pr-2 text-left text-sm transition-colors ${
                                        active
                                            ? 'border-l-[3px] border-l-[#0078d4] bg-white font-semibold text-[#0078d4] shadow-sm'
                                            : 'border-l-[3px] border-l-transparent text-[#323130] hover:bg-black/[0.04]'
                                    }`}
                                >
                                    <span className="flex min-w-0 items-center gap-2.5">
                                        <Icon
                                            className={`h-4 w-4 shrink-0 ${active ? 'text-[#0078d4]' : 'text-[#605e5c]'}`}
                                        />
                                        <span className="truncate">{item.label}</span>
                                    </span>
                                    {counts[item.id] > 0 && (
                                        <span
                                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                                                active
                                                    ? 'bg-[#deecf9] text-[#0078d4]'
                                                    : 'bg-[#edebe9] text-[#605e5c]'
                                            }`}
                                        >
                                            {counts[item.id]}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* 2. Mesaj listesi */}
                <section
                    className={`flex min-h-0 w-full min-w-0 flex-col border-[#edebe9] bg-white lg:border-r ${
                        selectedEmail ? 'hidden lg:flex' : 'flex'
                    }`}
                >
                    <div className="flex shrink-0 items-center justify-between border-b border-[#edebe9] bg-[#faf9f8] px-4 py-2.5">
                        <div className="flex min-w-0 items-center gap-2">
                            <h2 className="truncate text-xs font-bold uppercase tracking-wide text-[#605e5c]">
                                {selectedFolderLabel}
                            </h2>
                            {unreadCount > 0 && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-[#0078d4]" title="Unread" />
                            )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1 rounded border border-[#edebe9] bg-white p-0.5">
                            <button
                                type="button"
                                onClick={() => setPage((p) => p - 1)}
                                disabled={pageInfo.page === 0}
                                className="rounded p-1 text-[#605e5c] hover:bg-[#f3f2f1] disabled:opacity-30"
                                aria-label="Previous page"
                            >
                                <ArrowLeftIcon className="h-3.5 w-3.5" />
                            </button>
                            <span className="px-1.5 text-[10px] font-semibold tabular-nums text-[#605e5c]">
                                {pageInfo.page + 1}/{Math.max(pageInfo.totalPages, 1)}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={pageInfo.page + 1 >= pageInfo.totalPages}
                                className="rounded p-1 text-[#605e5c] hover:bg-[#f3f2f1] disabled:opacity-30"
                                aria-label="Next page"
                            >
                                <ArrowLeftIcon className="h-3.5 w-3.5 rotate-180" />
                            </button>
                        </div>
                    </div>

                    <div className="lg:hidden shrink-0 border-b border-[#edebe9] bg-white px-2 py-2">
                        <div className="flex items-center gap-1 overflow-x-auto overflow-y-hidden pb-0.5">
                            {folderItems.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleFolderSelect(item.id)}
                                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                        filterType === item.id
                                            ? 'bg-[#0078d4] text-white'
                                            : 'border border-[#edebe9] bg-[#faf9f8] text-[#323130]'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <EmailsPageFeedback error={error ? parseError(error).message : null} emails={filteredEmails} filterType={filterType} />
                        {filteredEmails.map(email => (
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
                </section>

                {/* 3. Okuma paneli — kalan tüm genişlik (Outlook’ta en geniş sütun) */}
                <section
                    className={`flex min-h-0 min-w-0 flex-1 flex-col border-[#edebe9] bg-white lg:border-l ${
                        !selectedEmail ? 'hidden lg:flex' : 'flex'
                    }`}
                >
                    {selectedEmail ? (
                        <>
                            <div className="flex shrink-0 items-center justify-between border-b border-[#edebe9] bg-[#faf9f8] px-4 py-2.5 lg:hidden">
                                <button
                                    type="button"
                                    onClick={() => setSelectedEmail(null)}
                                    className="flex items-center gap-2 text-sm font-medium text-[#0078d4]"
                                >
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    List
                                </button>
                            </div>

                            <div className="min-h-0 flex-1 overflow-hidden">
                                <EmailContent
                                    email={selectedEmail}
                                    onDelete={handleDeleteEmail}
                                    isDeleting={isDeleting}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center gap-2 p-10 text-center text-[#605e5c]">
                            <MailOpen className="h-14 w-14 opacity-[0.2]" aria-hidden />
                            <p className="text-base font-semibold text-[#323130]">Select an item to read</p>
                            <p className="max-w-sm text-sm">Nothing is selected. Choose a message in the list.</p>
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
};

export default EmailsPage;
