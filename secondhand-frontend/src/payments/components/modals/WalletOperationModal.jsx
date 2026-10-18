import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import Modal from '../../../common/components/ui/Modal.jsx';
import Button from '../../../common/components/ui/Button.jsx';
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
 const [error, setError] = useState('');
 useEffect(() => {
 if (!isOpen) return;
 setAmount('');
 setError('');
 }, [isOpen]);
 const handleClose = () => {
 setAmount('');
 setError('');
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
 const handleSubmit = async e => {
 e.preventDefault();
 const numericAmount = parseFloat(amount);
 if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
 setError('Enter an amount greater than zero.');
 return;
 }
 try {
 await onSubmit(numericAmount);
 onClose();
 } catch {
 // The wallet mutation already shows the error toast; keep the dialog open so the amount can be corrected.
 }
 };
 return <Modal isOpen={isOpen} onClose={handleClose} title={title} size="md" footer={<>
 <Button variant="secondary" onClick={handleClose}>{t("cancel")}</Button>
 <Button type="submit" form="wallet-operation-form" disabled={loading}>{loading ? 'Processing...' : submitLabel}</Button>
 </>}>
 <form id="wallet-operation-form" onSubmit={handleSubmit} noValidate className="space-y-4">
 <p className="text-sm text-text-secondary">{description}</p>
 {currentValueLabel && <p className="text-sm text-text-secondary">
 {currentValueLabel} <span className="font-medium tabular-nums text-text-primary">{currentValue}</span>
 </p>}
 <div>
 <label htmlFor="wallet-operation-amount" className="mb-1 block text-sm font-medium text-text-primary">{amountLabel}</label>
 <input id="wallet-operation-amount" type="number" inputMode="decimal" step="0.01" min="0" autoFocus className="h-10 w-full rounded border border-border bg-background-primary px-3 text-sm tabular-nums text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder={amountPlaceholder} value={amount} aria-invalid={Boolean(error)} aria-describedby={error ? 'wallet-operation-error' : undefined} onChange={e => {
 setAmount(e.target.value);
 setError('');
 }} />
 {error ? <p id="wallet-operation-error" className="mt-1 text-xs text-status-error-text">{error}</p> : amountHelp ? <p className="mt-1 text-xs text-text-tertiary">{amountHelp}</p> : null}
 </div>
 </form>
 </Modal>;
};
export default WalletOperationModal;
