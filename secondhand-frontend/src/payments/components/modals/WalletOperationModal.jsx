import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../../../common/formatters.js';
import { WALLET_OPERATION_MODES } from '../../paymentSchema.js';
const WalletOperationModal = ({
  isOpen,
  onClose,
  mode,
  onSubmit,
  loading,
  eWallet
}) => {
  const {
    t
  } = useTranslation();
  const [amount, setAmount] = useState('');
  useEffect(() => {
    if (!isOpen) return;
    setAmount('');
  }, [isOpen]);
  const handleClose = () => {
    setAmount('');
    onClose();
  };
  const title = (() => {
    if (mode === WALLET_OPERATION_MODES.WITHDRAW) return 'Withdraw Money';
    if (mode === WALLET_OPERATION_MODES.DEPOSIT) return 'Deposit Money';
    if (mode === WALLET_OPERATION_MODES.UPDATE_LIMIT) return 'Update Wallet Limit';
    return 'Update Spending Warning Limit';
  })();
  const description = (() => {
    if (mode === WALLET_OPERATION_MODES.WITHDRAW) return 'Withdraw from your eWallet.';
    if (mode === WALLET_OPERATION_MODES.DEPOSIT) return 'Deposit funds to your eWallet.';
    if (mode === WALLET_OPERATION_MODES.UPDATE_LIMIT) return 'Set the maximum allowed balance for your eWallet.';
    return 'Set a threshold to warn you before overspending.';
  })();
  const submitLabel = (() => {
    if (mode === WALLET_OPERATION_MODES.WITHDRAW) return 'Withdraw';
    if (mode === WALLET_OPERATION_MODES.DEPOSIT) return 'Deposit';
    return 'Update';
  })();
  const currentValueLabel = (() => {
    if (mode === WALLET_OPERATION_MODES.UPDATE_LIMIT) return 'Current:';
    if (mode === WALLET_OPERATION_MODES.UPDATE_WARNING) return 'Current:';
    return null;
  })();
  const currentValue = (() => {
    if (mode === WALLET_OPERATION_MODES.UPDATE_LIMIT) return eWallet?.limit ? formatCurrency(eWallet.limit) : 'No limit';
    if (mode === WALLET_OPERATION_MODES.UPDATE_WARNING) return eWallet?.spendingWarningLimit ? formatCurrency(eWallet.spendingWarningLimit) : 'Not set';
    return null;
  })();
  const amountLabel = (() => {
    if (mode === WALLET_OPERATION_MODES.UPDATE_LIMIT) return 'New Wallet Limit (TRY)';
    if (mode === WALLET_OPERATION_MODES.UPDATE_WARNING) return 'New Spending Warning Limit (TRY)';
    return 'Amount (TRY)';
  })();
  const amountPlaceholder = (() => {
    if (mode === WALLET_OPERATION_MODES.UPDATE_LIMIT) return 'Enter new limit';
    if (mode === WALLET_OPERATION_MODES.UPDATE_WARNING) return 'Enter warning limit';
    return 'Enter amount';
  })();
  const amountHelp = (() => {
    if (mode === WALLET_OPERATION_MODES.UPDATE_LIMIT) return 'This defines the maximum balance your eWallet can hold.';
    if (mode === WALLET_OPERATION_MODES.UPDATE_WARNING) return 'You will be notified when your spending approaches this limit.';
    return null;
  })();
  const handleSubmit = async () => {
    const numericAmount = parseFloat(amount);
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) return;
    try {
      await onSubmit(numericAmount);
      onClose();
    } catch {}
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
            {currentValueLabel && <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-600">
                <span className="opacity-70">{currentValueLabel}</span>
                <span className="font-medium text-gray-900">{currentValue}</span>
              </div>}
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{amountLabel}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{t("try")}</span>
              <input type="number" step="0.01" min="0" className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring focus:ring-blue-400 outline-none" placeholder={amountPlaceholder} value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            {amountHelp ? <p className="text-xs text-gray-500 mt-2">{amountHelp}</p> : null}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleClose} className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">{t("cancel")}</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Processing...' : submitLabel}
          </button>
        </div>
      </div>
    </div>;
};
export default WalletOperationModal;