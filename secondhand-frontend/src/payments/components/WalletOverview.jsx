import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency } from '../../common/formatters.js';
import WalletOperationModal from './modals/WalletOperationModal.jsx';

export const PaymentInfo = () => {
  return (
    <div className="bg-blue-50/80 border border-blue-200/60 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-blue-100 rounded-md flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-blue-900 mb-1">
            Sales Earnings Information
          </h3>
          <p className="text-[11px] text-blue-700 leading-relaxed">
            Your sales earnings are automatically transferred to your{' '}
            <Link
              to={`${ROUTES.PAYMENT_METHODS}?tab=ewallet`}
              className="font-medium text-blue-800 hover:text-blue-900 underline transition-colors"
            >
              eWallet
            </Link>{' '}
            account. You can withdraw your earnings from your{' '}
            <Link
              to={`${ROUTES.PAYMENT_METHODS}?tab=ewallet`}
              className="font-medium text-blue-800 hover:text-blue-900 underline transition-colors"
            >
              eWallet
            </Link>{' '}
            to your bank account at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export const EWalletBalance = ({ eWallet, totalSpent, statisticsLoaded, onLoadStatistics }) => {
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

export const EWalletActions = ({
  eWallet,
  loading,
  onUpdateLimits,
  onUpdateSpendingWarningLimit,
  onDeposit,
  onWithdraw,
}) => {
  const [activeModal, setActiveModal] = useState(null);

  const modalSubmit = useMemo(() => {
    if (activeModal === 'deposit') return onDeposit;
    if (activeModal === 'withdraw') return onWithdraw;
    if (activeModal === 'updateLimit') return onUpdateLimits;
    if (activeModal === 'updateWarning') return onUpdateSpendingWarningLimit;
    return null;
  }, [activeModal, onDeposit, onWithdraw, onUpdateLimits, onUpdateSpendingWarningLimit]);

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setActiveModal('deposit')}
          className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 hover:bg-gray-100"
        >
          Deposit
        </button>
        <button
          onClick={() => setActiveModal('withdraw')}
          className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 hover:bg-gray-100"
        >
          Withdraw
        </button>
        <button
          onClick={() => setActiveModal('updateLimit')}
          className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 hover:bg-gray-100"
        >
          Update Limits
        </button>
        <button
          onClick={() => setActiveModal('updateWarning')}
          className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 hover:bg-gray-100"
        >
          Update Spending Warning
        </button>
      </div>

      <WalletOperationModal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        mode={activeModal || 'deposit'}
        onSubmit={modalSubmit || (() => {})}
        loading={loading}
        eWallet={eWallet}
      />
    </>
  );
};

