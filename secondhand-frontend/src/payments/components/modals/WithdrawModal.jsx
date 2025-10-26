import React, { useState, useEffect } from 'react';
import { bankService } from '../../services/bankService.js';
import { formatCurrency } from '../../../common/formatters.js';

const WithdrawModal = ({ isOpen, onClose, onWithdraw, loading }) => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [bankAccountsLoaded, setBankAccountsLoaded] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedBankId, setSelectedBankId] = useState(null);

  useEffect(() => {
    if (isOpen && !bankAccountsLoaded) {
      fetchBankAccounts();
    }
  }, [isOpen, bankAccountsLoaded]);

  const fetchBankAccounts = async () => {
    try {
      const data = await bankService.getBankAccount();
      const list = Array.isArray(data) ? data : [data].filter(Boolean);
      setBankAccounts(list);
      setBankAccountsLoaded(true);
      if (list.length > 0) {
        setSelectedBankId(list[0].id);
      }
    } catch {
      setBankAccounts([]);
      setBankAccountsLoaded(true);
    }
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      return;
    }
    if (!selectedBankId) {
      return;
    }
    
    try {
      const numericAmount = parseFloat(amount);
      await onWithdraw(numericAmount, selectedBankId);
      onClose();
    } catch {}
  };

  const handleClose = () => {
    setAmount('');
    setSelectedBankId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Withdraw Money
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Transfer money from your eWallet to your bank account.
            </p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (TL)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">TL</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring focus:ring-blue-400 outline-none"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

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
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleClose}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Processing...' : 'Withdraw'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;
