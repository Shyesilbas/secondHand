import React, { useState } from 'react';

const CreateWalletModal = ({ isOpen, onClose, onCreateEWallet, loading }) => {
  const [createLimit, setCreateLimit] = useState('1000');
  const [createSpendingWarningLimit, setCreateSpendingWarningLimit] = useState('200');

  const handleSubmit = async () => {
    const limitVal = parseFloat(createLimit);
    const warnVal = createSpendingWarningLimit === '' ? null : parseFloat(createSpendingWarningLimit);
    
    if (isNaN(limitVal) || limitVal <= 0) {
      return;
    }
    if (warnVal !== null && (isNaN(warnVal) || warnVal < 0)) {
      return;
    }
    
    try {
      await onCreateEWallet({ limit: limitVal, spendingWarningLimit: warnVal });
      onClose();
    } catch {}
  };

  const handleClose = () => {
    setCreateLimit('1000');
    setCreateSpendingWarningLimit('200');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Create eWallet</h3>
            <p className="text-sm text-gray-500 mt-1">Set up your eWallet with an initial limit and optional spending warning.</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">✕</button>
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
          <button onClick={handleClose}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWalletModal;
