import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { emailService } from '../../features/emails/services/emailService';
import { formatDateTime } from '../../utils/formatters';
import { useNotification } from '../../context/NotificationContext';
import { EMAIL_TYPES, EMAIL_TYPE_LABELS, EMAIL_TYPE_BADGE_COLORS } from '../../types/emails';

const EmailsPage = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const [emails, setEmails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [filterType, setFilterType] = useState('ALL');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchEmails();
    }, []);

    const fetchEmails = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await emailService.getMyEmails();
            setEmails(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while loading emails');
            setEmails([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteEmail = async (emailId, emailSubject) => {
        if (!emailId) {
            notification.showError('Error', 'Email ID is missing. Cannot delete email.');
            return;
        }
        
        notification.showConfirmation(
            'Delete Email',
            `Are you sure you want to delete "${emailSubject}"?`,
            async () => {
                try {
                    setIsDeleting(true);
                    await emailService.deleteEmail(emailId);
                    notification.showSuccess('Success', 'Email deleted successfully.');
                    
                    // Remove the deleted email from the list
                    setEmails(prevEmails => prevEmails.filter(email => email.id !== emailId));
                    
                    // If the deleted email was selected, clear the selection
                    if (selectedEmail && selectedEmail.id === emailId) {
                        setSelectedEmail(null);
                    }
                } catch (err) {
                    notification.showError('Error', err.response?.data?.message || 'Failed to delete email.');
                } finally {
                    setIsDeleting(false);
                }
            }
        );
    };

    const handleDeleteAllEmails = async () => {
        notification.showConfirmation(
            'Delete All Emails',
            'Are you sure you want to delete all emails? This action cannot be undone.',
            async () => {
                try {
                    setIsDeleting(true);
                    await emailService.deleteAll();
                    notification.showSuccess('Success', 'All emails deleted successfully.');
                    
                    // Clear all emails from the list
                    setEmails([]);
                    setSelectedEmail(null);
                } catch (err) {
                    notification.showError('Error', err.response?.data?.message || 'Failed to delete all emails.');
                } finally {
                    setIsDeleting(false);
                }
            }
        );
    };

    const formatDate = (dateString) => formatDateTime(dateString);

    const getEmailTypeIcon = (type) => {
        switch (type) {
            case EMAIL_TYPES.VERIFICATION_CODE:
                return (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                );
            case EMAIL_TYPES.WELCOME:
                return (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                    </svg>
                );
            case EMAIL_TYPES.PASSWORD_RESET:
                return (
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                );
            case EMAIL_TYPES.NOTIFICATION:
                return (
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 3h16a1 1 0 011 1v12a1 1 0 01-1 1H5l-4 4V4a1 1 0 011-1z" />
                    </svg>
                );
            case EMAIL_TYPES.PROMOTIONAL:
                return (
                    <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v3.586l2.707 2.707A1 1 0 0121 11v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8a1 1 0 01.293-.707L6 7.586V4a1 1 0 011-1h0z" />
                    </svg>
                );
            case EMAIL_TYPES.SYSTEM:
                return (
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.2a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                );
        }
    };

    const getEmailTypeLabel = (type) => {
        return EMAIL_TYPE_LABELS[type] || type;
    };

    const getEmailTypeBadgeColor = (type) => {
        return EMAIL_TYPE_BADGE_COLORS[type] || 'bg-gray-100 text-gray-800';
    };

    const filteredEmails = filterType === 'ALL' 
        ? emails 
        : emails.filter(email => email.emailType === filterType);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
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
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg border p-6">
                                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="space-y-2">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className="h-4 bg-gray-200 rounded"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Email History
                        </h1>
                        <p className="text-gray-600 mt-2">
                            View all emails sent to your account
                        </p>
                    </div>
                    
                    {/* Filter Tabs and Delete All Button */}
                    <div className="flex items-center space-x-2">
                        {['ALL', EMAIL_TYPES.VERIFICATION_CODE, EMAIL_TYPES.WELCOME, EMAIL_TYPES.NOTIFICATION].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filterType === type
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {type === 'ALL' ? 'All' : getEmailTypeLabel(type)}
                            </button>
                        ))}
                        
                        {filteredEmails.length > 0 && (
                            <button
                                onClick={handleDeleteAllEmails}
                                disabled={isDeleting}
                                className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Delete All</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {filteredEmails.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.2a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Emails Found
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {filterType === 'ALL' 
                            ? "You haven't received any emails yet." 
                            : `No ${getEmailTypeLabel(filterType).toLowerCase()} emails found.`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Email List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-semibold text-gray-900">
                                    Emails ({filteredEmails.length})
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                                {filteredEmails.map((email, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 transition-colors hover:bg-gray-50 ${
                                            selectedEmail === email ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                                        }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getEmailTypeIcon(email.emailType)}
                                            </div>
                                            <div 
                                                className="flex-1 min-w-0 cursor-pointer"
                                                onClick={() => setSelectedEmail(email)}
                                            >
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {email.subject}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatDate(email.sentAt)}
                                                </p>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${
                                                    getEmailTypeBadgeColor(email.emailType)
                                                }`}>
                                                    {getEmailTypeLabel(email.emailType)}
                                                </span>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('Email object for deletion:', email); // Debug log
                                                        const emailId = email.id
                                                        console.log('Using email ID:', emailId); // Debug log
                                                        handleDeleteEmail(emailId, email.subject);
                                                    }}
                                                    disabled={isDeleting}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Delete email"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Email Content */}
                    <div className="lg:col-span-2">
                        {selectedEmail ? (
                            <div className="bg-white rounded-lg shadow-sm border">
                                {/* Email Header */}
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            {getEmailTypeIcon(selectedEmail.emailType)}
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">
                                                    {selectedEmail.subject}
                                                </h2>
                                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                    <span>From: {selectedEmail.senderEmail}</span>
                                                    <span>To: {selectedEmail.recipientEmail}</span>
                                                    <span>{formatDate(selectedEmail.sentAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                            getEmailTypeBadgeColor(selectedEmail.emailType)
                                        }`}>
                                            {getEmailTypeLabel(selectedEmail.emailType)}
                                        </span>
                                    </div>
                                </div>

                                {/* Email Content */}
                                <div className="px-6 py-6">
                                    <div className="prose max-w-none">
                                        <div 
                                            className="text-gray-700 leading-relaxed"
                                            dangerouslySetInnerHTML={{ 
                                                __html: selectedEmail.content.replace(/\n/g, '<br/>') 
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
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
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailsPage;