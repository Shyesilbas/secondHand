import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {
    ArrowLeft as ArrowLeftIcon,
    Banknote as BanknotesIcon,
    CreditCard as CreditCardIcon,
    Wallet as WalletIcon
} from 'lucide-react';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import FinancialCards from '../components/FinancialCards.jsx';
import {useNotification} from '../../notification/NotificationContext.jsx';
import {formatCurrency} from '../../common/formatters.js';
import {useBankAccountMutations, useCreditCard} from '../hooks/useFinancialAccountManager.js';
import {useBankAccountsQuery, usePaymentStatisticsQuery} from '../hooks/queries.js';
import {useEWallet} from '../../ewallet/hooks/useEWallet.js';
import {EWalletActions, EWalletBalance} from '../components/WalletOverview.jsx';

const BankAccountsSection = () => {
    const notification = useNotification();
    const { data: bankAccounts = [], isLoading, error } = useBankAccountsQuery();
    const { createBankAccount, deleteBankAccount, isCreating, isDeleting } = useBankAccountMutations();
    const { data: statsData } = usePaymentStatisticsQuery('TRANSFER');
    const totalSpent = typeof statsData?.totalAmount !== 'undefined' ? statsData.totalAmount : null;

    const handleCreateBankAccount = async () => {
        notification.showConfirmation(
            'Create Bank Account',
            'Are you sure you want to create a new bank account?',
            async () => {
                try {
                    await createBankAccount();
                    notification.showSuccess('Success', 'Bank account created successfully!');
                } catch (err) {
                    const errorMessage = err.response?.data?.message || 'Error occurred while creating bank account';
                    notification.showError('Error', errorMessage);
                } finally {
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
                    await deleteBankAccount();
                    notification.showSuccess('Success', 'Bank account deleted successfully!');
                } catch (err) {
                    const errorMessage = err.response?.data?.message || 'Error occurred while deleting bank account';
                    notification.showError('Error', errorMessage);
                } finally {
                }
            }
        );
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-text-primary">
                        Bank Accounts ({bankAccounts.length})
                    </h2>
                    {totalSpent != null && (
                        <div className="mt-2 text-sm text-text-secondary">
                            Total Spent (Bank Transfer):
                            <span className="ml-2 font-medium text-text-primary">{formatCurrency(totalSpent)}</span>
                        </div>
                    )}
                </div>
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
                    <p className="text-red-600">{error?.response?.data?.message || error?.message || error}</p>
                </div>
            )}

            {isLoading ? (
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
                        <FinancialCards
                            key={index}
                            account={account}
                            onDelete={handleDeleteBankAccount}
                            isDeleting={isDeleting}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const CreditCardsSection = () => {
    const notification = useNotification();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creditCardLimit, setCreditCardLimit] = useState('');

    const {
        creditCards,
        isLoading,
        error,
        createCreditCard,
        deleteCreditCard,
    } = useCreditCard();

    const handleCreateCreditCard = async () => {
        if (!creditCardLimit || isNaN(parseFloat(creditCardLimit))) {
            notification.showError('Error', 'Please enter a valid limit amount');
            return;
        }
        try {
            await createCreditCard(parseFloat(creditCardLimit));
            setShowCreateModal(false);
            setCreditCardLimit('');
        } catch {
        }
    };

    const handleDeleteCreditCard = async () => {
        notification.showConfirmation(
            'Delete Credit Card',
            'Are you sure you want to delete this credit card?',
            async () => {
                try {
                    await deleteCreditCard();
                    notification.showSuccess('Success', 'Credit card deleted successfully!');
                } catch (err) {
                    const errorMessage = err.response?.data?.message || 'Error occurred while deleting credit card';
                    notification.showError('Error', errorMessage);
                }
            }
        );
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary">
                    Credit Cards ({creditCards.length})
                </h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-btn-primary text-white px-6 py-3 rounded-lg hover:bg-btn-primary-hover transition-colors flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m-6-6h6m-6 0H6" />
                    </svg>
                    Create Credit Card
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {creditCards.length === 0 ? (
                <EmptyState
                    title="No Credit Cards Found"
                    description="You don't have any credit cards registered yet."
                    variant="blue"
                    primaryAction={{
                        label: 'Create your first credit card',
                        onClick: () => setShowCreateModal(true),
                        variant: 'blue'
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {creditCards.map((card, index) => (
                        <FinancialCards
                            key={card.number || card.cardNumber || card.last4 || index}
                            card={card}
                            onDelete={handleDeleteCreditCard}
                            isDeleting={isLoading}
                        />
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Create Credit Card</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Credit Limit
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-btn-primary focus:border-transparent"
                                    placeholder="Enter credit limit"
                                    value={creditCardLimit}
                                    onChange={(e) => setCreditCardLimit(e.target.value)}
                                />
                                {creditCardLimit && !isNaN(parseFloat(creditCardLimit)) && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Preview: {formatCurrency(parseFloat(creditCardLimit))}
                                    </p>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateCreditCard}
                                    disabled={isLoading}
                                    className="flex-1 bg-btn-primary text-white px-4 py-2 rounded-lg hover:bg-btn-primary-hover transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Creating...' : 'Create Card'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const EWalletSection = () => {
    const { eWallet, loading, error, createEWallet, updateLimits, updateSpendingWarningLimit, deposit, withdraw } = useEWallet({ enabled: true });

    const [statisticsLoaded, setStatisticsLoaded] = useState(false);
    const { data: statsData, refetch: refetchStats } = usePaymentStatisticsQuery('EWALLET', { enabled: false });
    const totalSpent = typeof statsData?.totalAmount !== 'undefined' ? statsData.totalAmount : null;

    const fetchStatistics = useCallback(async () => {
        if (statisticsLoaded) return;
        try {
            await refetchStats();
        } finally {
            setStatisticsLoaded(true);
        }
    }, [statisticsLoaded, refetchStats]);

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">eWallet</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your wallet balance, limits and transfers</p>
                </div>
                {eWallet && (
                    <EWalletActions
                        eWallet={eWallet}
                        loading={loading}
                        onCreateEWallet={createEWallet}
                        onUpdateLimits={updateLimits}
                        onUpdateSpendingWarningLimit={updateSpendingWarningLimit}
                        onDeposit={deposit}
                        onWithdraw={withdraw}
                    />
                )}
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                    {error}
                </div>
            )}

            {!eWallet ? (
                <EmptyState
                    title="No eWallet Found"
                    description="You don't have an eWallet yet. Create one to start using digital payments."
                    variant="neutral"
                    primaryAction={{
                        label: loading ? 'Creating...' : 'Create eWallet',
                        onClick: createEWallet,
                        disabled: loading,
                        variant: 'neutral'
                    }}
                />
            ) : (
                <EWalletBalance
                    eWallet={eWallet}
                    totalSpent={totalSpent}
                    statisticsLoaded={statisticsLoaded}
                    onLoadStatistics={fetchStatistics}
                />
            )}

        </div>
    );
};

const PaymentMethodsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('bank-accounts');

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam && ['bank-accounts', 'credit-cards', 'ewallet'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    const tabs = [
        { 
            id: 'bank-accounts', 
            label: 'Bank Accounts', 
            icon: BanknotesIcon 
        },
        { 
            id: 'credit-cards', 
            label: 'Credit Cards', 
            icon: CreditCardIcon 
        },
        { 
            id: 'ewallet', 
            label: 'eWallet', 
            icon: WalletIcon 
        }
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        const url = new URL(window.location);
        url.searchParams.set('tab', tabId);
        window.history.replaceState({}, '', url);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] tracking-tight">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all duration-200 shadow-sm hover:shadow-md mb-6 group"
                    >
                        <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                    </button>

                    <div className="mb-8">
                        <h1 className="text-3xl font-semibold text-slate-900 mb-2 tracking-tight">
                            Payment Methods
                        </h1>
                        <p className="text-sm text-slate-500 tracking-tight">
                            Manage your payment methods and financial information
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="p-4">
                        <nav className="relative flex bg-slate-100 rounded-2xl p-1.5" aria-label="Tabs">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`
                                            relative flex-1 flex items-center justify-center py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200 tracking-tight
                                            ${isActive
                                                ? 'text-indigo-600 bg-white shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-5 h-5 mr-2 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="px-6 pb-6">
                        <div key={activeTab} className="opacity-0 animate-[fadeIn_0.25s_ease-in-out_forwards]">
                            {activeTab === 'bank-accounts' && <BankAccountsSection />}
                            {activeTab === 'credit-cards' && <CreditCardsSection />}
                            {activeTab === 'ewallet' && <EWalletSection />}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default PaymentMethodsPage;

