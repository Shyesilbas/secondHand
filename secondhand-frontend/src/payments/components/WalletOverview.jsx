import { useTranslation } from "react-i18next";
import { useMemo, useState } from 'react';
import { formatCurrency } from '../../common/formatters.js';
import WalletOperationModal from './modals/WalletOperationModal.jsx';
import { Wallet, ArrowUpRight, ArrowDownRight, Settings, AlertCircle, TrendingUp, ShieldAlert, CircleDollarSign } from 'lucide-react';
export const EWalletBalance = ({
 eWallet,
 totalAmount,
 statsData,
 statisticsLoaded,
 onLoadStatistics
}) => {
 const {
 t
 } = useTranslation();
 if (!eWallet) return null;
 const spentPercentage = statisticsLoaded && totalAmount != null && eWallet.spendingWarningLimit ? Math.min(totalAmount / eWallet.spendingWarningLimit * 100, 100).toFixed(1) : 0;
 return <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-1">
 <div className="flex h-full flex-col justify-between rounded border border-border bg-background-primary p-5">
 <div className="flex items-center gap-2 text-sm text-text-secondary">
 <Wallet className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 {t("prime_card")}
 </div>
 <div className="mt-6">
 <p className="text-sm text-text-secondary">{t("available_balance")}</p>
 <p className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">{formatCurrency(eWallet.balance || 0)}</p>
 </div>
 <div className="mt-6 flex items-center justify-between text-sm">
 <span className="inline-flex items-center gap-1.5 text-text-secondary">
 <span className="h-1.5 w-1.5 rounded-full bg-status-success" aria-hidden />{t("active")}
 </span>
 <span className="text-text-tertiary">{t("try")}</span>
 </div>
 </div>
 </div>

 {/* Stats and Limits */}
 <div className="lg:col-span-2 flex justify-between flex-col gap-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
 {/* Wallet Limit Card */}
 <div className="bg-background-primary rounded-md border border-border-light p-5 flex flex-col justify-between transition-shadow relative overflow-hidden group">
 <div className="flex items-center justify-between mb-4">
 <TrendingUp className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} aria-hidden />
 <span className="text-xs font-semibold text-text-muted">{t("account_limit")}</span>
 </div>
 <div>
 <p className="text-sm text-text-tertiary mb-1">{t("maximum_allowed")}</p>
 <p className="text-xl font-semibold text-text-primary tracking-tight">
 {eWallet.limit ? formatCurrency(eWallet.limit) : 'Unlimited'}
 </p>
 </div>
 {!eWallet.limit && <div className="absolute -bottom-4 -right-4 text-secondary-100/50 pointer-events-none">
 <CircleDollarSign className="w-32 h-32" />
 </div>}
 </div>

 {/* Spending Warning Card */}
 <div className="bg-background-primary rounded-md border border-border-light p-5 flex flex-col justify-between transition-shadow relative overflow-hidden group">
 <div className="flex items-center justify-between mb-4">
 <ShieldAlert className="h-5 w-5 shrink-0 text-status-error" strokeWidth={1.5} aria-hidden />
 <span className="text-xs font-semibold text-text-muted">{t("security")}</span>
 </div>
 <div>
 <p className="text-sm text-text-tertiary mb-1">{t("warning_threshold")}</p>
 <div className="flex items-baseline gap-2">
 <p className="text-xl font-semibold text-text-primary tracking-tight">
 {eWallet.spendingWarningLimit ? formatCurrency(eWallet.spendingWarningLimit) : 'Not configured'}
 </p>
 </div>
 
 {eWallet.spendingWarningLimit && <div className="mt-4 pt-4 border-t border-border-light">
 <div className="flex justify-between items-end mb-2">
 <span className="text-xs font-medium text-text-tertiary">{t("current_period_spend")}</span>
 {statisticsLoaded && totalAmount != null ? <span className="text-xs font-semibold text-text-secondary">{formatCurrency(totalAmount)}</span> : <button onClick={onLoadStatistics} className="text-xs text-primary font-semibold hover:text-primary transition-colors">{t("reveal")}</button>}
 </div>
 {statisticsLoaded && totalAmount != null && <div className="w-full h-1.5 bg-background-tertiary rounded-full overflow-hidden">
 <div className={`h-full rounded-full transition-all duration-500 ${spentPercentage > 90 ? 'bg-status-error' : spentPercentage > 75 ? 'bg-status-warning' : 'bg-status-success'}`} style={{
 width: `${spentPercentage}%`
 }} />
 </div>}

 {statisticsLoaded && statsData && <p className="mt-3 text-xs text-text-tertiary">{t("incoming_outgoing_transactions")}<span className="font-semibold text-text-secondary">{statsData.totalPayments ?? 0}</span>
 </p>}
 </div>}
 </div>
 </div>
 </div>
 </div>
 </div>;
};
export const EWalletActions = ({
 eWallet,
 loading,
 onUpdateLimits,
 onUpdateSpendingWarningLimit,
 onDeposit,
 onWithdraw
}) => {
 const {
 t
 } = useTranslation();
 const [activeModal, setActiveModal] = useState(null);
 const modalSubmit = useMemo(() => {
 if (activeModal === 'deposit') return onDeposit;
 if (activeModal === 'withdraw') return onWithdraw;
 if (activeModal === 'updateLimit') return onUpdateLimits;
 if (activeModal === 'updateWarning') return onUpdateSpendingWarningLimit;
 return null;
 }, [activeModal, onDeposit, onWithdraw, onUpdateLimits, onUpdateSpendingWarningLimit]);
 return <>
 <div className="flex flex-wrap items-center gap-3">
 <button onClick={() => setActiveModal('deposit')} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4 group">
 <ArrowDownRight className="w-4 h-4 text-text-secondary transition-transform" />{t("deposit")}</button>
 <button onClick={() => setActiveModal('withdraw')} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-10 px-4 group">
 <ArrowUpRight className="w-4 h-4 text-status-error transition-transform" />{t("withdraw")}</button>

 <div className="h-6 w-px bg-secondary-200 hidden sm:block mx-1" />

 <button onClick={() => setActiveModal('updateLimit')} className="p-2.5 rounded-md bg-background-primary border border-border-light text-text-tertiary hover:text-text-primary hover:bg-background-secondary transition-all" title={t("update_account_limit")}>
 <Settings className="w-4 h-4" />
 </button>
 <button onClick={() => setActiveModal('updateWarning')} className="p-2.5 rounded-md bg-background-primary border border-border-light text-text-tertiary hover:text-text-primary hover:bg-background-secondary transition-all" title={t("update_spending_warning_limit")}>
 <AlertCircle className="w-4 h-4" />
 </button>
 </div>

 <WalletOperationModal isOpen={!!activeModal} onClose={() => setActiveModal(null)} mode={activeModal || 'deposit'} onSubmit={modalSubmit || (() => {})} loading={loading} eWallet={eWallet} />
 </>;
};