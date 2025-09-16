import React from 'react';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import BankAccountCard from './BankAccountCard.jsx';
import { bankService } from '../services/bankService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { BankDto } from '../banks.js';

const BankAccountsSection = () => {
    const notification = useNotification();

    const [rawBankAccounts, setRawBankAccounts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [isCreating, setIsCreating] = React.useState(false);

    const bankAccounts = Array.isArray(rawBankAccounts)
        ? rawBankAccounts.map(BankDto)
        : [];

    const fetchBankAccounts = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await bankService.getBankAccount();
            setRawBankAccounts(Array.isArray(data) ? data : [data].filter(Boolean));
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while listing bank accounts');
            setRawBankAccounts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchBankAccounts();
    }, [fetchBankAccounts]);

    const handleError = (err, defaultMessage) => {
        const errorMessage = err.response?.data?.message || defaultMessage;
        setError(errorMessage);
        notification.showError('Error', errorMessage);
    };

    const handleCreateBankAccount = async () => {
        notification.showConfirmation(
            'Create Bank Account',
            'Are you sure you want to create a new bank account?',
            async () => {
                try {
                    setIsCreating(true);
                    setError(null);
                    const newBankAccount = await bankService.createBankAccount();
                    setRawBankAccounts((prev) => [newBankAccount, ...prev]);
                    notification.showSuccess('Success', 'Bank account created successfully!');
                } catch (err) {
                    handleError(err, 'Error occurred while creating bank account');
                } finally {
                    setIsCreating(false);
                }
            }
        );
    };

    const handleDeleteBankAccount = async () => {
        notification.showConfirmation(
            'Delete Bank Account',
            'Are you sure you want to delete this bank account?',
            async () => {
                try {
                    setLoading(true);
                    setError(null);
                    await bankService.deleteBankAccount();
                    setRawBankAccounts([]);
                    notification.showSuccess('Success', 'Bank account deleted successfully!');
                } catch (err) {
                    handleError(err, 'Error occurred while deleting bank account');
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary">
                    Bank Accounts ({bankAccounts.length})
                </h2>
                <button
                    onClick={handleCreateBankAccount}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                    disabled={isCreating}
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {isCreating ? 'Creating...' : 'Add Bank Account'}
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="animate-pulse space-y-6">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg border p-6">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                        <div className="bg-white rounded-lg border p-6">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
            ) : bankAccounts.length === 0 ? (
                <EmptyState
                    title="No Bank Account Found"
                    description="You don't have a registered bank account yet."
                    variant="green"
                    primaryAction={{
                        label: isCreating ? 'Creating...' : 'Create Bank Account',
                        onClick: handleCreateBankAccount,
                        disabled: isCreating,
                        variant: 'green'
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bankAccounts.map((account, index) => (
                        <BankAccountCard
                            key={index}
                            account={account}
                            onDelete={handleDeleteBankAccount}
                            isDeleting={loading}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BankAccountsSection;


