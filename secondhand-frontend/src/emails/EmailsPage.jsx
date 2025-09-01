import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { emailService } from './services/emailService.js';
import { useNotification } from '../notification/NotificationContext.jsx';
import EmailListItem from '../emails/components/EmailListItem';
import EmailContent from '../emails/components/EmailContent';
import EmailFilterTabs from '../emails/components/EmailFilterTabs';
import EmptyState from '../common/components/ui/EmptyState.jsx';
import PageHeader from '../listing/components/PageHeader.jsx';

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
            <PageHeader
                title="Email History"
                subtitle="View all emails sent to your account"
                onBack={() => navigate(-1)}
            />

            <div className="flex justify-end mb-6">
                <EmailFilterTabs
                    filterType={filterType}
                    onFilterChange={setFilterType}
                    onDeleteAll={handleDeleteAllEmails}
                    hasEmails={filteredEmails.length > 0}
                    isDeleting={isDeleting}
                />
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {filteredEmails.length === 0 ? (
                <EmptyState
                    title="No Emails Found"
                    description={filterType === 'ALL' ? "You haven't received any emails yet." : `No ${filterType?.toLowerCase?.() || ''} emails found.`}
                />
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
                                    <EmailListItem
                                        key={index}
                                        email={email}
                                        isSelected={selectedEmail === email}
                                        onSelect={setSelectedEmail}
                                        onDelete={handleDeleteEmail}
                                        isDeleting={isDeleting}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Email Content */}
                    <div className="lg:col-span-2">
                        <EmailContent email={selectedEmail} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailsPage;