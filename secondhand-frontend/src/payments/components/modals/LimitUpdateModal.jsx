import React, { useState } from 'react';
import { formatCurrency } from '../../../common/formatters.js';

const LimitUpdateModal = ({ isOpen, onClose, onUpdateLimits, loading, eWallet, action }) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      return;
    }
    
    try {
      const numericAmount = parseFloat(amount);
      await onUpdateLimits(numericAmount);
      onClose();
    } catch {}
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  if (!isOpen) return null;

  const isLimitUpdate = action === 'updateLimit';
  const isSpendingWarningUpdate = action === 'updateSpendingWarning';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {isLimitUpdate ? 'Update Wallet Limit' : 'Update Spending Warning Limit'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isLimitUpdate 
                ? 'Set the maximum allowed balance for your eWallet.'
                : 'Set a threshold to warn you before overspending.'
              }
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-600">
              <span className="opacity-70">Current:</span>
              <span className="font-medium text-gray-900">
                {isLimitUpdate 
                  ? (eWallet?.limit ? formatCurrency(eWallet.limit) : 'No limit')
                  : (eWallet?.spendingWarningLimit ? formatCurrency(eWallet.spendingWarningLimit) : 'Not set')
                }
              </span>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isLimitUpdate ? 'New Wallet Limit (TL)' : 'New Spending Warning Limit (TL)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">TL</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring focus:ring-blue-400 outline-none"
                placeholder={isLimitUpdate ? 'Enter new limit' : 'Enter warning limit'}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isLimitUpdate 
                ? 'This defines the maximum balance your eWallet can hold.'
                : 'You will be notified when your spending approaches this limit.'
              }
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleClose}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Processing...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LimitUpdateModal;
