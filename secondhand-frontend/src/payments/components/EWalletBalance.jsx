import React from 'react';
import { formatCurrency } from '../../common/formatters.js';

const EWalletBalance = ({ eWallet, totalSpent, statisticsLoaded, onLoadStatistics }) => {
  if (!eWallet) return null;

  return (
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
          {eWallet.spendingWarningLimit && (
            <div className="mt-3 border-t pt-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Total Spent</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {statisticsLoaded && totalSpent != null ? formatCurrency(totalSpent) : (
                  <button 
                    onClick={onLoadStatistics}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Load spending data
                  </button>
                )}
              </p>
              {statisticsLoaded && totalSpent != null && (
                <p className="mt-1 text-sm font-medium text-gray-900">
                  ({eWallet.spendingWarningLimit
                    ? `${((totalSpent / eWallet.spendingWarningLimit) * 100).toFixed(2)}%`
                    : '—'})
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EWalletBalance;
