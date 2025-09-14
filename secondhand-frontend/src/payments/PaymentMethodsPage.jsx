import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bankService } from './services/bankService.js';
import { useNotification } from '../notification/NotificationContext.jsx';
import { BankDto } from './banks.js';
import { useCreditCard } from './hooks/useCreditCard.js';
import { useEWallet } from '../ewallet/hooks/useEWallet.js';
import EmptyState from '../common/components/ui/EmptyState.jsx';
import BankAccountCard from './components/BankAccountCard.jsx';
import CreditCardItem from './components/CreditCardItem.jsx';

const PaymentMethodsPage = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const [activeTab, setActiveTab] = useState('bank-accounts');

    const [rawBankAccounts, setRawBankAccounts] = useState([]);
    const [bankLoading, setBankLoading] = useState(true);
    const [bankError, setBankError] = useState(null);
    const [isCreatingBank, setIsCreatingBank] = useState(false);
    const [showCreditCardModal, setShowCreditCardModal] = useState(false);
    const [creditCardLimit, setCreditCardLimit] = useState('');
    const [showEWalletModal, setShowEWalletModal] = useState(false);
    const [ewalletAction, setEWalletAction] = useState(''); // 'deposit', 'withdraw', 'updateLimit'
    const [ewalletAmount, setEWalletAmount] = useState('');
    const [selectedBankId, setSelectedBankId] = useState(null);

    const {
        creditCards,
        isLoading: cardsLoading,
        error: cardsError,
        createCreditCard,
        deleteCreditCard,
    } = useCreditCard();

    const {
        eWallet,
        loading: ewalletLoading,
        error: ewalletError,
        createEWallet,
        updateLimits,
        deposit,
        withdraw,
        refreshWallet
    } = useEWallet();

    const bankAccounts = Array.isArray(rawBankAccounts)
        ? rawBankAccounts.map(BankDto)
        : [];

    useEffect(() => {
        if (activeTab === 'bank-accounts') {
            fetchBankAccounts();
        }
    }, [activeTab]);

    const fetchBankAccounts = async () => {
        try {
            setBankLoading(true);
            setBankError(null);
            const data = await bankService.getBankAccount();
            setRawBankAccounts(Array.isArray(data) ? data : [data].filter(Boolean));
        } catch (err) {
            setBankError(err.response?.data?.message || 'An error occurred while listing bank accounts');
            setRawBankAccounts([]);
        } finally {
            setBankLoading(false);
        }
    };

    const handleError = (err, defaultMessage) => {
        const errorMessage = err.response?.data?.message || defaultMessage;
        setBankError(errorMessage);
        notification.showError('Error', errorMessage);
    };

    const handleCreateBankAccount = async () => {
        try {
            setIsCreatingBank(true);
            setBankError(null);
            const newBankAccount = await bankService.createBankAccount();
            setRawBankAccounts((prev) => [newBankAccount, ...prev]);
            notification.showSuccess('Success', 'Bank account created successfully!');
        } catch (err) {
            handleError(err, 'Error occurred while creating bank account');
        } finally {
            setIsCreatingBank(false);
        }
    };

    const handleDeleteBankAccount = async () => {
        notification.showConfirmation(
            'Delete Bank Account',
            'Are you sure you want to delete this bank account?',
            async () => {
                try {
                    setBankLoading(true);
                    setBankError(null);
                    await bankService.deleteBankAccount();
                    setRawBankAccounts([]);
                    notification.showSuccess('Success', 'Bank account deleted successfully!');
                } catch (err) {
                    handleError(err, 'Error occurred while deleting bank account');
                } finally {
                    setBankLoading(false);
                }
            }
        );
    };

    const handleCreateCreditCard = async () => {
        if (!creditCardLimit || isNaN(parseFloat(creditCardLimit))) {
            notification.showError('Error', 'Please enter a valid limit amount');
            return;
        }
        try {
            await createCreditCard(parseFloat(creditCardLimit));
            setShowCreditCardModal(false);
            setCreditCardLimit('');
        } catch {
            // error already handled in hook
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

    const isLoading = activeTab === 'bank-accounts' ? bankLoading : 
                      activeTab === 'credit-cards' ? cardsLoading : ewalletLoading;
    const error = activeTab === 'bank-accounts' ? bankError : 
                  activeTab === 'credit-cards' ? cardsError : ewalletError;

    const handleEWalletAction = async () => {
        if (!ewalletAmount || isNaN(parseFloat(ewalletAmount))) {
            notification.showError('Error', 'Please enter a valid amount');
            return;
        }

        // For deposit and withdraw, check if bank account is selected
        if ((ewalletAction === 'deposit' || ewalletAction === 'withdraw') && !selectedBankId) {
            notification.showError('Error', 'Please select a bank account');
            return;
        }

        try {
            const amount = parseFloat(ewalletAmount);
            console.log('EWallet action:', ewalletAction, 'Amount:', amount, 'BankId:', selectedBankId, 'Type:', typeof selectedBankId);
            
            switch (ewalletAction) {
                case 'deposit':
                    await deposit(amount, selectedBankId);
                    break;
                case 'withdraw':
                    await withdraw(amount, selectedBankId);
                    break;
                case 'updateLimit':
                    await updateLimits(amount);
                    break;
                default:
                    notification.showError('Error', 'Invalid action');
                    return;
            }
            
            setShowEWalletModal(false);
            setEWalletAmount('');
            setEWalletAction('');
            setSelectedBankId(null);
        } catch (error) {
            // Error is already handled in the hook
        }
    };

    const handleCreateEWallet = async () => {
        try {
            await createEWallet();
        } catch (error) {
            // Error is already handled in the hook
        }
    };

    const tabs = [
        { id: 'bank-accounts', label: 'Bank Accounts', icon: '🏦', color: 'green' },
        { id: 'credit-cards', label: 'Credit Cards', icon: '💳', color: 'blue' },
        { id: 'ewallet', label: 'eWallet', icon: '👛', color: 'purple' }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-text-secondary hover:text-text-primary transition-colors mb-4"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Go Back
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">Payment Methods</h1>
                        <p className="text-text-secondary mt-2">
                            Manage your payment methods and financial information
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <div className="border-b border-sidebar-border">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                    activeTab === tab.id
                                        ? `border-${tab.color}-500 text-${tab.color}-600`
                                        : 'border-transparent text-text-muted hover:text-text-secondary hover:border-header-border'
                                }`}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {isLoading && (
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div
                        className={`grid grid-cols-1 ${
                            activeTab === 'credit-cards' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'
                        } gap-6`}
                    >
                        {[...Array(activeTab === 'credit-cards' ? 3 : 2)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg border p-6">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isLoading && (
                <>
                    {activeTab === 'bank-accounts' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-text-primary">
                                    Bank Accounts ({bankAccounts.length})
                                </h2>
                                <button
                                    onClick={() =>
                                        notification.showConfirmation(
                                            'Create Bank Account',
                                            'Are you sure you want to create a new bank account?',
                                            handleCreateBankAccount
                                        )
                                    }
                                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                                    disabled={isCreatingBank}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    {isCreatingBank ? 'Creating...' : 'Add Bank Account'}
                                </button>
                            </div>

                            {bankAccounts.length === 0 ? (
                                <EmptyState
                                    title="No Bank Account Found"
                                    description="You don't have a registered bank account yet."
                                    variant="green"
                                    primaryAction={{
                                        label: isCreatingBank ? 'Creating...' : 'Create Bank Account',
                                        onClick: () =>
                                            notification.showConfirmation(
                                                'Create Bank Account',
                                                'Are you sure you want to create a new bank account?',
                                                handleCreateBankAccount
                                            ),
                                        disabled: isCreatingBank,
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
                                            isDeleting={bankLoading}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'credit-cards' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-text-primary">
                                    Credit Cards ({creditCards.length})
                                </h2>
                                <button
                                    onClick={() => setShowCreditCardModal(true)}
                                    className="bg-btn-primary text-white px-6 py-3 rounded-lg hover:bg-btn-primary-hover transition-colors flex items-center"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m-6-6h6m-6 0H6" />
                                    </svg>
                                    Create Credit Card
                                </button>
                            </div>

                            {creditCards.length === 0 ? (
                                <EmptyState
                                    title="No Credit Cards Found"
                                    description="You don't have any credit cards registered yet."
                                    variant="blue"
                                    primaryAction={{
                                        label: 'Create your first credit card',
                                        onClick: () => setShowCreditCardModal(true),
                                        variant: 'blue'
                                    }}
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {creditCards.map((card, index) => (
                                        <CreditCardItem
                                            key={card.number || card.cardNumber || card.last4 || index}
                                            card={card}
                                            onDelete={handleDeleteCreditCard}
                                            isDeleting={cardsLoading}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'ewallet' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-text-primary">
                                    eWallet
                                </h2>
                                {eWallet && (
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => {
                                                setEWalletAction('deposit');
                                                if (bankAccounts.length > 0) {
                                                    console.log('Setting first bank ID:', bankAccounts[0].id);
                                                    setSelectedBankId(bankAccounts[0].id);
                                                }
                                                setShowEWalletModal(true);
                                            }}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Deposit
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEWalletAction('withdraw');
                                                if (bankAccounts.length > 0) {
                                                    console.log('Setting first bank ID:', bankAccounts[0].id);
                                                    setSelectedBankId(bankAccounts[0].id);
                                                }
                                                setShowEWalletModal(true);
                                            }}
                                            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M12 6l-6 6 6 6" />
                                            </svg>
                                            Withdraw
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEWalletAction('updateLimit');
                                                setShowEWalletModal(true);
                                            }}
                                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Update Limit
                                        </button>
                                    </div>
                                )}
                            </div>

                            {!eWallet ? (
                                <EmptyState
                                    title="No eWallet Found"
                                    description="You don't have an eWallet yet. Create one to start using digital payments."
                                    variant="purple"
                                    primaryAction={{
                                        label: ewalletLoading ? 'Creating...' : 'Create eWallet',
                                        onClick: handleCreateEWallet,
                                        disabled: ewalletLoading,
                                        variant: 'purple'
                                    }}
                                />
                            ) : (
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-2xl font-bold">My eWallet</h3>
                                        <div className="text-purple-200">👛</div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-purple-200 text-sm mb-1">Current Balance</p>
                                            <p className="text-3xl font-bold">{eWallet.balance?.toFixed(2) || '0.00'} TL</p>
                                        </div>
                                        
                                        <div>
                                            <p className="text-purple-200 text-sm mb-1">Wallet Limit</p>
                                            <p className="text-xl font-semibold">{eWallet.limit?.toFixed(2) || 'No limit'} TL</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-purple-400">
                                        <div className="flex items-center justify-between">
                                            <span className="text-purple-200">Available to spend</span>
                                            <span className="font-semibold">{eWallet.balance?.toFixed(2) || '0.00'} TL</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {showCreditCardModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Create Credit Card</h3>
                                <button
                                    onClick={() => setShowCreditCardModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Credit Limit (TRY)
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
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowCreditCardModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateCreditCard}
                                    disabled={cardsLoading}
                                    className="flex-1 bg-btn-primary text-white px-4 py-2 rounded-lg hover:bg-btn-primary-hover transition-colors disabled:opacity-50"
                                >
                                    {cardsLoading ? 'Creating...' : 'Create Card'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEWalletModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {ewalletAction === 'deposit' && 'Deposit Money'}
                                    {ewalletAction === 'withdraw' && 'Withdraw Money'}
                                    {ewalletAction === 'updateLimit' && 'Update Wallet Limit'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowEWalletModal(false);
                                        setEWalletAmount('');
                                        setEWalletAction('');
                                        setSelectedBankId(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {ewalletAction === 'deposit' && 'Deposit Amount (TRY)'}
                                    {ewalletAction === 'withdraw' && 'Withdrawal Amount (TRY)'}
                                    {ewalletAction === 'updateLimit' && 'New Limit (TRY)'}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder={
                                        ewalletAction === 'deposit' ? 'Enter amount to deposit' :
                                        ewalletAction === 'withdraw' ? 'Enter amount to withdraw' :
                                        'Enter new limit'
                                    }
                                    value={ewalletAmount}
                                    onChange={(e) => setEWalletAmount(e.target.value)}
                                />
                                {ewalletAction === 'withdraw' && eWallet && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Available balance: {eWallet.balance?.toFixed(2) || '0.00'} TL
                                    </p>
                                )}
                            </div>

                            {(ewalletAction === 'deposit' || ewalletAction === 'withdraw') && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Bank Account
                                    </label>
                                    {bankAccounts.length === 0 ? (
                                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-sm text-yellow-800">
                                                No bank account found. Please create a bank account first.
                                            </p>
                                            <button 
                                                onClick={() => {
                                                    setShowEWalletModal(false);
                                                    setActiveTab('bank-accounts');
                                                }}
                                                className="mt-2 text-blue-600 hover:text-blue-800 underline text-sm"
                                            >
                                                Go to Bank Accounts
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {bankAccounts.map((bank, index) => {
                                                console.log('Bank account:', bank, 'Selected ID:', selectedBankId);
                                                return (
                                                <label key={bank.id || index} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                        type="radio"
                                                        name="bankAccount"
                                                        value={bank.id}
                                                        checked={selectedBankId == bank.id}
                                                        onChange={(e) => {
                                                            console.log('Bank selected:', e.target.value);
                                                            setSelectedBankId(e.target.value);
                                                        }}
                                                        className="mr-3"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900">
                                                            {bank.holderName} {bank.holderSurname}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            IBAN: {bank.IBAN}
                                                        </div>
                                                        {bank.balance !== undefined && (
                                                            <div className="text-sm text-gray-500">
                                                                Balance: {bank.balance} TL
                                                            </div>
                                                        )}
                                                    </div>
                                                </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setShowEWalletModal(false);
                                        setEWalletAmount('');
                                        setEWalletAction('');
                                        setSelectedBankId(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEWalletAction}
                                    disabled={ewalletLoading}
                                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {ewalletLoading ? 'Processing...' : 
                                     ewalletAction === 'deposit' ? 'Deposit' :
                                     ewalletAction === 'withdraw' ? 'Withdraw' : 'Update'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentMethodsPage;
