import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bankService } from '../../features/payments/services/bankService';
import { useNotification } from '../../context/NotificationContext';
import { BankDTO } from '../../types/payments';

const BankAccountsPage = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const [bankAccounts, setBankAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchBankAccounts();
    }, []);

    const fetchBankAccounts = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await bankService.getBankAccount();
            setBankAccounts(Array.isArray(data) ? data : [data].filter(Boolean));
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while listing bank accounts');
            setBankAccounts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const handleCreateBankAccount = async () => {
        try {
            setIsCreating(true);
            setError(null);
            
            const newBankAccount = await bankService.createBankAccount();
            
            // Update the bank accounts list
            setBankAccounts([newBankAccount]);
            setShowAddForm(false);
            notification.showSuccess('Başarılı', 'Banka hesabı başarıyla oluşturuldu!');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error occurred while creating bank account';
            setError(errorMessage);
            notification.showError('Hata', errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteBankAccount = async () => {
        if (!window.confirm('Are you sure you want to delete this bank account?')) {
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            
            await bankService.deleteBankAccount();
            
            // Clear the bank accounts list
            setBankAccounts([]);
            notification.showSuccess('Başarılı', 'Banka hesabı başarıyla silindi!');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error occurred while deleting bank account';
            setError(errorMessage);
            notification.showError('Hata', errorMessage);
        } finally {
            setIsLoading(false);
        }
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
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Bank Account Found
                    </h3>
                    <p className="text-gray-600 mb-6">
                        You don't have a registered bank account yet.
                    </p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        disabled={isCreating}
                    >
                        {isCreating ? 'Creating...' : 'Create Bank Account'}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bankAccounts.map((account, index) => (
                        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-4">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            Bank Account
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Current Account
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={handleDeleteBankAccount}
                                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                        title="Delete Account"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">IBAN</p>
                                    <p className="font-mono text-sm text-gray-900">
                                        {account.IBAN}
                                    </p>
                                </div>
                                
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Account Holder</p>
                                    <p className="text-sm text-gray-900">
                                        {account.holderName} {account.holderSurname}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Balance</span>
                                    <span className="text-xl font-bold text-green-600">
                                        {formatCurrency(parseFloat(account.balance) || 0)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 flex space-x-2">
                                <button className="flex-1 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Deposit
                                </button>
                                <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                    Transfer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Bank Account Confirmation Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Create New Bank Account</h3>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h4 className="text-sm font-medium text-blue-800">
                                        Automatic Account Creation
                                    </h4>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>System will automatically generate an IBAN for you</li>
                                            <li>Your name and surname will be used as account holder</li>
                                            <li>Initial balance will be set to 0 TRY</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to create a bank account?
                        </p>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                disabled={isCreating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateBankAccount}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                disabled={isCreating}
                            >
                                {isCreating ? 'Creating...' : 'Create Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BankAccountsPage;