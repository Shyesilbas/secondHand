import React, { useEffect, useMemo, useState } from 'react';
import { useBankAccountsQuery } from '../../hooks/queries.js';
import { formatCurrency } from '../../../common/formatters.js';

const WalletOperationModal = ({ isOpen, onClose, mode, onSubmit, loading, eWallet }) => {
  const needsBankAccount = mode === 'deposit' || mode === 'withdraw';
  const { data: bankAccounts = [] } = useBankAccountsQuery({ enabled: isOpen && needsBankAccount });

  const [amount, setAmount] = useState('');
  const [selectedBankId, setSelectedBankId] = useState(null);

  const defaultBankId = useMemo(() => (bankAccounts[0]?.id ? bankAccounts[0].id : null), [bankAccounts]);

  useEffect(() => {
    if (!isOpen) return;
    setAmount('');
    setSelectedBankId(defaultBankId);
  }, [isOpen, defaultBankId]);

  const handleClose = () => {
    setAmount('');
    setSelectedBankId(null);
    onClose();
  };

  const title = (() => {
    if (mode === 'withdraw') return 'Withdraw Money';
    if (mode === 'deposit') return 'Deposit Money';
    if (mode === 'updateLimit') return 'Update Wallet Limit';
    return 'Update Spending Warning Limit';
  })();

  const description = (() => {
    if (mode === 'withdraw') return 'Transfer money from your eWallet to your bank account.';
    if (mode === 'deposit') return 'Add money from your bank account to your eWallet.';
    if (mode === 'updateLimit') return 'Set the maximum allowed balance for your eWallet.';
    return 'Set a threshold to warn you before overspending.';
  })();

  const submitLabel = (() => {
    if (mode === 'withdraw') return 'Withdraw';
    if (mode === 'deposit') return 'Deposit';
    return 'Update';
  })();

  const currentValueLabel = (() => {
    if (mode === 'updateLimit') return 'Current:';
    if (mode === 'updateWarning') return 'Current:';
    return null;
  })();

  const currentValue = (() => {
    if (mode === 'updateLimit') return eWallet?.limit ? formatCurrency(eWallet.limit) : 'No limit';
    if (mode === 'updateWarning') return eWallet?.spendingWarningLimit ? formatCurrency(eWallet.spendingWarningLimit) : 'Not set';
    return null;
  })();

  const amountLabel = (() => {
    if (mode === 'updateLimit') return 'New Wallet Limit (TRY)';
    if (mode === 'updateWarning') return 'New Spending Warning Limit (TRY)';
    return 'Amount (TRY)';
  })();

  const amountPlaceholder = (() => {
    if (mode === 'updateLimit') return 'Enter new limit';
    if (mode === 'updateWarning') return 'Enter warning limit';
    return 'Enter amount';
  })();

  const amountHelp = (() => {
    if (mode === 'updateLimit') return 'This defines the maximum balance your eWallet can hold.';
    if (mode === 'updateWarning') return 'You will be notified when your spending approaches this limit.';
    return null;
  })();

  const handleSubmit = async () => {
    const numericAmount = parseFloat(amount);
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) return;

    try {
      if (needsBankAccount) {
        if (!selectedBankId) return;
        await onSubmit(numericAmount, selectedBankId);
      } else {
        await onSubmit(numericAmount);
      }
      onClose();
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
            {currentValueLabel && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-600">
                <span className="opacity-70">{currentValueLabel}</span>
                <span className="font-medium text-gray-900">{currentValue}</span>
              </div>
            )}
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{amountLabel}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">TRY</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`w-full border rounded-lg pr-3 py-2 focus:ring focus:ring-blue-400 outline-none ${needsBankAccount ? 'pl-14' : 'pl-10'}`}
                placeholder={amountPlaceholder}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            {amountHelp ? (
              <p className="text-xs text-gray-500 mt-2">{amountHelp}</p>
            ) : null}
          </div>

          {needsBankAccount ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Bank Account</label>
              {bankAccounts.length === 0 ? (
                <p className="p-3 bg-gray-50 border rounded text-sm text-gray-600">
                  No bank account found. Please create one first.
                </p>
              ) : (
                <div className="space-y-2 max-h-52 overflow-auto">
                  {bankAccounts.map((bank, index) => (
                    <label
                      key={bank.id || index}
                      className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
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
          ) : null}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletOperationModal;

