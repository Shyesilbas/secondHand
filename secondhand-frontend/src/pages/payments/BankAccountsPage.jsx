import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bankService } from '../../features/payments/services/bankService';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { BankDto } from '../../types/banks';
import BankAccountCard from '../../features/payments/components/BankAccountCard';
import CreateBankAccountModal from '../../features/payments/components/CreateBankAccountModal';
import EmptyState from '../../components/ui/EmptyState';

const BankAccountsPage = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const [rawBankAccounts, setRawBankAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const bankAccounts = Array.isArray(rawBankAccounts)
        ? rawBankAccounts.map(BankDto) 
        : [];

    useEffect(() => {
        fetchBankAccounts();
    }, []);

    const fetchBankAccounts = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await bankService.getBankAccount();
            setRawBankAccounts(Array.isArray(data) ? data : [data].filter(Boolean));
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while listing bank accounts');
            setRawBankAccounts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleError = (err, defaultMessage) => {
        const errorMessage = err.response?.data?.message || defaultMessage;
        setError(errorMessage);
        notification.showError('Error', errorMessage);
    };

    const handleCreateBankAccount = async () => {
        try {
            setIsCreating(true);
            setError(null);
            
            const newBankAccount = await bankService.createBankAccount();
            setRawBankAccounts([newBankAccount]);
            setShowAddForm(false);
            notification.showSuccess('Success', 'Bank account created successfully!');
        } catch (err) {
            handleError(err, 'Error occurred while creating bank account');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteBankAccount = async () => {
        notification.showConfirmation(
            'Delete Bank Account',
            'Are you sure you want to delete this bank account?',
            async () => {
                try {
                    setIsLoading(true);
                    setError(null);
                    await bankService.deleteBankAccount();
                    setRawBankAccounts([]);
                    notification.showSuccess('Success', 'Bank account deleted successfully!');
                } catch (err) {
                    handleError(err, 'Error occurred while deleting bank account');
                } finally {
                    setIsLoading(false);
                }
            }
        );
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg border p-6">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
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
                    Go Back
                </button>
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Bank Accounts
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Manage your bank accounts
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        disabled={isCreating}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {isCreating ? 'Creating...' : 'Add New Account'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {bankAccounts.length === 0 ? (
                <EmptyState
                    title="No Bank Account Found"
                    description="You don't have a registered bank account yet."
                    variant="green"
                    primaryAction={{
                        label: isCreating ? 'Creating...' : 'Create Bank Account',
                        onClick: () => setShowAddForm(true),
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
                            isDeleting={isLoading}
                        />
                    ))}
                </div>
            )}

            <CreateBankAccountModal
                isOpen={showAddForm}
                onClose={() => setShowAddForm(false)}
                onCreate={handleCreateBankAccount}
                isCreating={isCreating}
            />
        </div>
    );
};

export default BankAccountsPage;