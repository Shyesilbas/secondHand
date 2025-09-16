import React from 'react';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useEWallet } from '../../ewallet/hooks/useEWallet.js';
import { bankService } from '../services/bankService.js';

const EWalletSection = () => {
    const notification = useNotification();

    const {
        eWallet,
        loading,
        error,
        createEWallet,
        updateLimits,
        deposit,
        withdraw,
    } = useEWallet();

    const [bankAccounts, setBankAccounts] = React.useState([]);
    const [showModal, setShowModal] = React.useState(false);
    const [action, setAction] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [selectedBankId, setSelectedBankId] = React.useState(null);

    const fetchBankAccounts = React.useCallback(async () => {
        try {
            const data = await bankService.getBankAccount();
            const list = Array.isArray(data) ? data : [data].filter(Boolean);
            setBankAccounts(list);
        } catch {
            setBankAccounts([]);
        }
    }, []);

    React.useEffect(() => {
        fetchBankAccounts();
    }, [fetchBankAccounts]);

    const openModal = (nextAction) => {
        setAction(nextAction);
        if ((nextAction === 'deposit' || nextAction === 'withdraw') && bankAccounts.length > 0) {
            setSelectedBankId(bankAccounts[0].id);
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setAmount('');
        setAction('');
        setSelectedBankId(null);
    };

    const handleCreateWallet = async () => {
        try {
            await createEWallet();
        } catch {}
    };

    const handleConfirm = async () => {
        if (!amount || isNaN(parseFloat(amount))) {
            notification.showError('Error', 'Please enter a valid amount');
            return;
        }
        if ((action === 'deposit' || action === 'withdraw') && !selectedBankId) {
            notification.showError('Error', 'Please select a bank account');
            return;
        }
        try {
            const numericAmount = parseFloat(amount);
            switch (action) {
                case 'deposit':
                    await deposit(numericAmount, selectedBankId);
                    break;
                case 'withdraw':
                    await withdraw(numericAmount, selectedBankId);
                    break;
                case 'updateLimit':
                    await updateLimits(numericAmount);
                    break;
                default:
                    notification.showError('Error', 'Invalid action');
                    return;
            }
            closeModal();
        } catch {}
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-medium text-gray-700">eWallet</h2>
                </div>
                {eWallet && (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => openModal('deposit')}
                            className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors flex items-center"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Deposit
                        </button>
                        <button
                            onClick={() => openModal('withdraw')}
                            className="bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors flex items-center"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M12 6l-6 6 6 6" />
                            </svg>
                            Withdraw
                        </button>
                        <button
                            onClick={() => openModal('updateLimit')}
                            className="bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors flex items-center"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996 .608 2.296 .07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Update Limit
                        </button>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-sm">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Content */}
            {!eWallet ? (
                <EmptyState
                    title="No eWallet Found"
                    description="You don't have an eWallet yet. Create one to start using digital payments."
                    variant="purple"
                    primaryAction={{
                        label: loading ? 'Creating...' : 'Create eWallet',
                        onClick: handleCreateWallet,
                        disabled: loading,
                        variant: 'purple'
                    }}
                />
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-700">My eWallet</h3>
                        <div className="text-gray-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded p-4">
                            <p className="text-gray-500 text-sm mb-1">Current Balance</p>
                            <p className="text-2xl font-semibold text-gray-700">{eWallet.balance?.toFixed(2) || '0.00'} TL</p>
                        </div>
                        <div className="bg-gray-50 rounded p-4">
                            <p className="text-gray-500 text-sm mb-1">Wallet Limit</p>
                            <p className="text-lg font-medium text-gray-700">
                                {eWallet.limit ? `${eWallet.limit.toFixed(2)} TL` : 'No limit'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">Available to spend</span>
                            <span className="font-medium text-gray-700">{eWallet.balance?.toFixed(2) || '0.00'} TL</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-700">
                                    {action === 'deposit' && 'Deposit Money'}
                                    {action === 'withdraw' && 'Withdraw Money'}
                                    {action === 'updateLimit' && 'Update Wallet Limit'}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        {action === 'deposit' && 'Deposit Amount (TL)'}
                                        {action === 'withdraw' && 'Withdrawal Amount (TL)'}
                                        {action === 'updateLimit' && 'New Limit (TL)'}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                        placeholder="Enter amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                    {action === 'withdraw' && eWallet && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Available: {eWallet.balance?.toFixed(2) || '0.00'} TL
                                        </p>
                                    )}
                                </div>

                                {(action === 'deposit' || action === 'withdraw') && (
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-2">
                                            Select Bank Account
                                        </label>
                                        {bankAccounts.length === 0 ? (
                                            <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm">
                                                <p className="text-gray-600">
                                                    No bank account found. Please create a bank account first.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {bankAccounts.map((bank, index) => (
                                                    <label key={bank.id || index} className="flex items-center p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                                                        <input
                                                            type="radio"
                                                            name="bankAccount"
                                                            value={bank.id}
                                                            checked={selectedBankId == bank.id}
                                                            onChange={(e) => setSelectedBankId(e.target.value)}
                                                            className="mr-3"
                                                        />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-700">
                                                                {bank.holderName} {bank.holderSurname}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                IBAN: {bank.IBAN}
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded hover:bg-gray-50 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
                                >
                                    {loading ? 'Processing...' :
                                        action === 'deposit' ? 'Deposit' :
                                            action === 'withdraw' ? 'Withdraw' : 'Update'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EWalletSection;