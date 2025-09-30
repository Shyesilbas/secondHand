import React from 'react';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import {useNotification} from '../../notification/NotificationContext.jsx';
import {paymentService} from '../services/paymentService.js';
import {useEWallet} from '../../ewallet/hooks/useEWallet.js';
import {bankService} from '../services/bankService.js';
import {formatCurrency} from '../../common/formatters.js';

const EWalletSection = () => {
    const notification = useNotification();
    const { eWallet, loading, error, createEWallet, updateLimits, updateSpendingWarningLimit, removeSpendingWarningLimit, deposit, withdraw } = useEWallet();

    const [bankAccounts, setBankAccounts] = React.useState([]);
    const [showModal, setShowModal] = React.useState(false);
    const [action, setAction] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [selectedBankId, setSelectedBankId] = React.useState(null);
    const [showCreateModal, setShowCreateModal] = React.useState(false);
    const [createLimit, setCreateLimit] = React.useState('1000');
    const [createSpendingWarningLimit, setCreateSpendingWarningLimit] = React.useState('200');
    const [totalSpent, setTotalSpent] = React.useState(null);

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
        paymentService.getStatistics('EWALLET').then((stats) => {
            if (stats && typeof stats.totalAmount !== 'undefined') {
                setTotalSpent(stats.totalAmount);
            }
        }).catch(() => {});
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

    const handleCreateWallet = () => {
        setShowCreateModal(true);
    };

    const handleConfirmCreate = async () => {
        const limitVal = parseFloat(createLimit);
        const warnVal = createSpendingWarningLimit === '' ? null : parseFloat(createSpendingWarningLimit);
        if (isNaN(limitVal) || limitVal <= 0) {
            notification.showError('Error', 'Please enter a valid positive limit');
            return;
        }
        if (warnVal !== null && (isNaN(warnVal) || warnVal < 0)) {
            notification.showError('Error', 'Please enter a valid spending warning limit');
            return;
        }
        try {
            await createEWallet({ limit: limitVal, spendingWarningLimit: warnVal });
            setShowCreateModal(false);
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
                case 'updateSpendingWarning':
                    await updateSpendingWarningLimit(numericAmount);
                    break;
                default:
                    notification.showError('Error', 'Invalid action');
                    return;
            }
            closeModal();
        } catch {}
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">eWallet</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your wallet balance, limits and transfers</p>
                </div>
                {eWallet && (
                    <div className="flex gap-2">
                        <button onClick={() => openModal('deposit')}
                                className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 hover:bg-gray-100">
                            Deposit
                        </button>
                        <button onClick={() => openModal('withdraw')}
                                className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 hover:bg-gray-100">
                            Withdraw
                        </button>
                        <button onClick={() => openModal('updateLimit')}
                                className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 hover:bg-gray-100">
                            Update Limits
                        </button>
                        <button onClick={() => openModal('updateSpendingWarning')}
                                className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 hover:bg-gray-100">
                            Update Spending Warning
                        </button>
                    </div>
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
                        onClick: handleCreateWallet,
                        disabled: loading,
                        variant: 'neutral'
                    }}
                />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-medium text-gray-900">Wallet Overview</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-lg p-4 border border-gray-200">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Current Balance</p>
                            <p className="mt-2 text-2xl font-semibold text-gray-900">
                                {formatCurrency(eWallet.balance || 0)}
                            </p>
                        </div>
                        <div className="rounded-lg p-4 border border-gray-200">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Wallet Limit</p>
                            <p className="mt-2 text-lg font-medium text-gray-900">
                                {eWallet.limit ? formatCurrency(eWallet.limit) : 'No limit'}
                            </p>
                        </div>
                        <div className="rounded-lg p-4 border border-gray-200">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Spending Warning</p>
                            <p className="mt-2 text-lg font-medium text-gray-900">
                                {eWallet.spendingWarningLimit ? formatCurrency(eWallet.spendingWarningLimit) : 'Not set'}
                            </p>
                            <div className="mt-3 border-t pt-3">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Total Spent</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {totalSpent != null ? formatCurrency(totalSpent) : '—'}
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    ({eWallet.spendingWarningLimit && totalSpent != null
                                        ? `${((totalSpent / eWallet.spendingWarningLimit) * 100).toFixed(2)}%`
                                        : '—'})
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {action === 'deposit' && 'Deposit Money'}
                                    {action === 'withdraw' && 'Withdraw Money'}
                                    {action === 'updateLimit' && 'Update Wallet Limit'}
                                    {action === 'updateSpendingWarning' && 'Update Spending Warning Limit'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {action === 'deposit' && 'Add money from your bank account to your eWallet.'}
                                    {action === 'withdraw' && 'Transfer money from your eWallet to your bank account.'}
                                    {action === 'updateLimit' && 'Set the maximum allowed balance for your eWallet.'}
                                    {action === 'updateSpendingWarning' && 'Set a threshold to warn you before overspending.'}
                                </p>
                                {(action === 'updateLimit' || action === 'updateSpendingWarning') && (
                                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-600">
                                        <span className="opacity-70">Current:</span>
                                        <span className="font-medium text-gray-900">
                                            {action === 'updateLimit' && (eWallet?.limit ? formatCurrency(eWallet.limit) : 'No limit')}
                                            {action === 'updateSpendingWarning' && (eWallet?.spendingWarningLimit ? formatCurrency(eWallet.spendingWarningLimit) : 'Not set')}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {action === 'deposit' && 'Amount (TL)'}
                                    {action === 'withdraw' && 'Amount (TL)'}
                                    {action === 'updateLimit' && 'New Wallet Limit (TL)'}
                                    {action === 'updateSpendingWarning' && 'New Spending Warning Limit (TL)'}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">TL</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring focus:ring-blue-400 outline-none"
                                        placeholder={action === 'updateLimit' ? 'Enter new limit' : action === 'updateSpendingWarning' ? 'Enter warning limit' : 'Enter amount'}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                {(action === 'updateLimit' || action === 'updateSpendingWarning') && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        {action === 'updateLimit' && 'This defines the maximum balance your eWallet can hold.'}
                                        {action === 'updateSpendingWarning' && 'You will be notified when your spending approaches this limit.'}
                                    </p>
                                )}
                            </div>

                            {(action === 'deposit' || action === 'withdraw') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Bank Account</label>
                                    {bankAccounts.length === 0 ? (
                                        <p className="p-3 bg-gray-50 border rounded text-sm text-gray-600">
                                            No bank account found. Please create one first.
                                        </p>
                                    ) : (
                                        <div className="space-y-2 max-h-52 overflow-auto">
                                            {bankAccounts.map((bank, index) => (
                                                <label key={bank.id || index}
                                                       className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                        type="radio"
                                                        name="bankAccount"
                                                        value={bank.id}
                                                        checked={selectedBankId == bank.id}
                                                        onChange={(e) => setSelectedBankId(e.target.value)}
                                                        className="mr-3"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {bank.holderName} {bank.holderSurname}
                                                            </p>
                                                            <span className="text-xs rounded-full bg-gray-100 text-gray-700 px-2 py-1">
                                                                {formatCurrency(bank.balance || 0)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">IBAN: {bank.IBAN}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={closeModal}
                                    className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={handleConfirm} disabled={loading}
                                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                                {loading ? 'Processing...' :
                                    action === 'deposit' ? 'Deposit' :
                                        action === 'withdraw' ? 'Withdraw' : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Create eWallet</h3>
                                <p className="text-sm text-gray-500 mt-1">Set up your eWallet with an initial limit and optional spending warning.</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Limit (TL)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">TL</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring focus:ring-blue-400 outline-none"
                                        placeholder="Enter wallet limit"
                                        value={createLimit}
                                        onChange={(e) => setCreateLimit(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Controls the maximum balance of your eWallet.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Spending Warning Limit (TL)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">TL</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring focus:ring-blue-400 outline-none"
                                        placeholder="Optional"
                                        value={createSpendingWarningLimit}
                                        onChange={(e) => setCreateSpendingWarningLimit(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Receive warnings before exceeding this spending threshold.</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={handleConfirmCreate} disabled={loading}
                                    className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50">
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EWalletSection;
