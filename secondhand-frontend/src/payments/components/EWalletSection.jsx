import React from 'react';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useEWallet } from '../../ewallet/hooks/useEWallet.js';
import { bankService } from '../services/bankService.js';
import { formatCurrency } from '../../common/formatters.js';

const EWalletSection = () => {
    const notification = useNotification();
    const { eWallet, loading, error, createEWallet, updateLimits, deposit, withdraw } = useEWallet();

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
        <div className="p-8 bg-white min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-gray-900">eWallet</h2>
                {eWallet && (
                    <div className="flex gap-2">
                        <button onClick={() => openModal('deposit')}
                                className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">
                            Deposit
                        </button>
                        <button onClick={() => openModal('withdraw')}
                                className="px-4 py-2 rounded border text-sm text-gray-700 hover:bg-gray-50">
                            Withdraw
                        </button>
                        <button onClick={() => openModal('updateLimit')}
                                className="px-4 py-2 rounded border text-sm text-gray-700 hover:bg-gray-50">
                            Update Limit
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
                    variant="purple"
                    primaryAction={{
                        label: loading ? 'Creating...' : 'Create eWallet',
                        onClick: handleCreateWallet,
                        disabled: loading,
                        variant: 'purple'
                    }}
                />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">My eWallet</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500">Current Balance</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(eWallet.balance || 0)}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500">Wallet Limit</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {eWallet.limit ? formatCurrency(eWallet.limit) : 'No limit'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {action === 'deposit' && 'Deposit Money'}
                                {action === 'withdraw' && 'Withdraw Money'}
                                {action === 'updateLimit' && 'Update Wallet Limit'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
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
                                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-400 outline-none"
                                    placeholder="Enter amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>

                            {(action === 'deposit' || action === 'withdraw') && (
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Select Bank Account</label>
                                    {bankAccounts.length === 0 ? (
                                        <p className="p-3 bg-gray-50 border rounded text-sm text-gray-600">
                                            No bank account found. Please create one first.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
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
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {bank.holderName} {bank.holderSurname}
                                                        </p>
                                                        <p className="text-xs text-gray-500">IBAN: {bank.IBAN}</p>
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
        </div>
    );
};

export default EWalletSection;
