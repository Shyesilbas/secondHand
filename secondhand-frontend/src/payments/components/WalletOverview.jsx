import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency } from '../../common/formatters.js';
import WalletOperationModal from './modals/WalletOperationModal.jsx';
import { Wallet, ArrowUpRight, ArrowDownRight, Settings, AlertCircle, TrendingUp, ShieldAlert, CircleDollarSign } from 'lucide-react';

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

  const spentPercentage = (statisticsLoaded && totalSpent != null && eWallet.spendingWarningLimit)
    ? Math.min(((totalSpent / eWallet.spendingWarningLimit) * 100), 100).toFixed(1)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Wallet Virtual Card */}
      <div className="lg:col-span-1">
        <div className="relative h-full rounded-3xl bg-gradient-to-bl from-slate-900 via-slate-800 to-black p-6 text-white shadow-2xl overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <Wallet className="w-5 h-5 opacity-80" />
              <span className="text-xs font-semibold tracking-wider uppercase letter-spacing-1">Prime Card</span>
            </div>
            <div className="w-10 h-6 rounded-md bg-white/10 backdrop-blur border border-white/20 flex flex-col items-center justify-center gap-0.5 pointer-events-none">
              <div className="h-[2px] w-4 bg-white/40 rounded-full" />
              <div className="h-[2px] w-4 bg-white/40 rounded-full" />
              <div className="h-[2px] w-4 bg-white/40 rounded-full" />
            </div>
          </div>

          <div className="relative z-10 mt-8 mb-4">
            <p className="text-sm font-medium text-slate-400 mb-1">Available Balance</p>
            <p className="text-4xl font-light tracking-tight text-white tabular-nums">
              {formatCurrency(eWallet.balance || 0)}
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Status</span>
              <span className="font-medium text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Currency</span>
              <span className="font-medium tracking-wider text-slate-200">TRY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats and Limits */}
      <div className="lg:col-span-2 flex justify-between flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
          {/* Wallet Limit Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Limit</span>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Maximum allowed</p>
              <p className="text-xl font-bold text-slate-900 tracking-tight">
                {eWallet.limit ? formatCurrency(eWallet.limit) : 'Unlimited'}
              </p>
            </div>
            {!eWallet.limit && (
              <div className="absolute -bottom-4 -right-4 text-slate-100/50 pointer-events-none">
                <CircleDollarSign className="w-32 h-32" />
              </div>
            )}
          </div>

          {/* Spending Warning Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security</span>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Warning Threshold</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold text-slate-900 tracking-tight">
                  {eWallet.spendingWarningLimit ? formatCurrency(eWallet.spendingWarningLimit) : 'Not configured'}
                </p>
              </div>
              
              {eWallet.spendingWarningLimit && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-end mb-2">
                     <span className="text-xs font-medium text-slate-500">Current Period Spend</span>
                     {statisticsLoaded && totalSpent != null ? (
                       <span className="text-xs font-bold text-slate-700">{formatCurrency(totalSpent)}</span>
                     ) : (
                        <button onClick={onLoadStatistics} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">Reveal</button>
                     )}
                  </div>
                  {statisticsLoaded && totalSpent != null && (
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${spentPercentage > 90 ? 'bg-red-500' : spentPercentage > 75 ? 'bg-amber-400' : 'bg-emerald-400'}`} 
                        style={{ width: `${spentPercentage}%` }} 
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
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
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setActiveModal('deposit')}
          className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <ArrowDownRight className="w-4 h-4 text-emerald-400 group-hover:translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          Deposit
        </button>
        <button
          onClick={() => setActiveModal('withdraw')}
          className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowUpRight className="w-4 h-4 text-rose-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          Withdraw
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1" />

        <button
          onClick={() => setActiveModal('updateLimit')}
          className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-sm"
          title="Update Account Limit"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveModal('updateWarning')}
          className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-sm"
          title="Update Spending Warning Limit"
        >
          <AlertCircle className="w-4 h-4" />
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
