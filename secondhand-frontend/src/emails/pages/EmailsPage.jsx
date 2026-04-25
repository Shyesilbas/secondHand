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
import { EMAIL_DEFAULTS, EMAIL_FILTERS, EMAIL_MESSAGES } from '../emailConstants.js';

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
        <div className={embedded ? 'min-h-0 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden h-[800px]' : 'h-screen flex flex-col bg-white overflow-hidden'}>
            
            {/* Top Navigation Bar */}
            <header className="shrink-0 h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    {!embedded && (
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                    )}
                    <h1 className="text-base font-bold text-gray-900 tracking-tight hidden sm:block">Mailbox</h1>
                </div>

                <div className="flex-1 max-w-md px-4 hidden sm:block">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search mail..."
                            className="w-full h-9 pl-9 pr-3 rounded-md bg-gray-50 border-none text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-1 focus:ring-gray-300 transition-colors outline-none"
                        />
                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['myEmails', user?.id] })}
                        className="p-2 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleDeleteAllEmails}
                        disabled={isDeleting || filteredEmails.length === 0}
                        className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                        title="Delete all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Main 3-Column Area */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* 1. Sidebar (Folders) - Hidden on Mobile */}
                <aside className="hidden lg:flex w-60 flex-col border-r border-gray-200 bg-gray-50/30">
                    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                        {folderItems.map(item => {
                            const Icon = item.icon;
                            const active = filterType === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleFolderSelect(item.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                        active ? 'bg-zinc-900 text-white font-medium' : 'text-gray-600 hover:bg-gray-100/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Icon className={`w-4 h-4 ${active ? 'text-gray-300' : 'text-gray-400'}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    {counts[item.id] > 0 && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                            active ? 'bg-zinc-800 text-gray-300' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {counts[item.id]}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* 2. Email List Column */}
                <section className={`flex-col border-r border-gray-200 bg-white w-full lg:w-[320px] xl:w-[380px] shrink-0 ${
                    selectedEmail ? 'hidden lg:flex' : 'flex'
                }`}>
                    <div className="shrink-0 px-4 py-3 border-b border-gray-200 bg-white/95 backdrop-blur z-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-bold text-gray-900 tracking-tight">{selectedFolderLabel}</h2>
                                {unreadCount > 0 && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                                )}
                            </div>
                        </div>
                        
                        {/* Pagination Inline */}
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-md p-0.5 border border-gray-100">
                            <button 
                                onClick={() => setPage(p => p - 1)} 
                                disabled={pageInfo.page === 0} 
                                className="p-1 rounded-sm text-gray-400 hover:text-gray-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <ArrowLeftIcon className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] font-bold text-gray-500 tabular-nums px-1">
                                {pageInfo.page + 1}/{Math.max(pageInfo.totalPages, 1)}
                            </span>
                            <button 
                                onClick={() => setPage(p => p + 1)} 
                                disabled={pageInfo.page + 1 >= pageInfo.totalPages} 
                                className="p-1 rounded-sm text-gray-400 hover:text-gray-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <ArrowLeftIcon className="w-3.5 h-3.5 rotate-180" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Mobile Folders Dropdown / Horizontal Scroll could go here if needed, but we keep it simple for now */}
                    <div className="lg:hidden shrink-0 border-b border-gray-100 bg-white px-2 py-2 flex items-center overflow-x-auto no-scrollbar gap-1">
                        {folderItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleFolderSelect(item.id)}
                                className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                    filterType === item.id ? 'bg-zinc-900 text-white' : 'bg-gray-50 text-gray-600 border border-gray-100'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto">
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

                {/* 3. Email Content Column */}
                <section className={`flex-1 bg-white flex-col ${
                    !selectedEmail ? 'hidden lg:flex' : 'flex'
                }`}>
                    {selectedEmail ? (
                        <>
                            <div className="lg:hidden shrink-0 px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-white/95 backdrop-blur z-10">
                                <button 
                                    onClick={() => setSelectedEmail(null)} 
                                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
                                >
                                    <ArrowLeftIcon className="w-4 h-4"/> Back
                                </button>
                                <button 
                                    onClick={() => handleDeleteEmail(selectedEmail.id)} 
                                    disabled={isDeleting}
                                    className="p-1.5 text-gray-400 hover:text-red-600"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            </div>
                            
                            <div className="hidden lg:flex shrink-0 px-6 py-3 border-b border-gray-100 justify-end">
                                <button 
                                    onClick={() => handleDeleteEmail(selectedEmail.id)} 
                                    disabled={isDeleting}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Delete email"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <EmailContent email={selectedEmail} />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/30">
                            <MailOpen className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm font-bold text-gray-900">No message selected</p>
                            <p className="text-xs text-gray-500 mt-1 max-w-xs">
                                Select a message from the list to read it here.
                            </p>
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
};

export default EmailsPage;
