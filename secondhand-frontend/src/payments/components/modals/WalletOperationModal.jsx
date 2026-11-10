import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from 'react';
import Modal from '../../../common/components/ui/Modal.jsx';
import Button from '../../../common/components/ui/Button.jsx';
import { FieldError } from '../../../common/components/forms/FormPrimitives.jsx';
import { inputError, inputNormal } from '../../../common/components/forms/inputStyles.js';
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
 // One key per intended operation: a retry or double submit of the same amount reuses it, so the
 // backend applies a deposit/withdrawal once. A new dialog or a changed amount gets a new key.
 const idempotencyKeyRef = useRef(null);
 useEffect(() => {
 idempotencyKeyRef.current = null;
 }, [isOpen, amount, mode]);
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
 if (mode === WALLET_OPERATION_MODES.WITHDRAW) return t("withdraw_money", "Para Çek");
 if (mode === WALLET_OPERATION_MODES.DEPOSIT) return t("deposit_money", "Bakiye Yükle");
 if (mode === WALLET_OPERATION_MODES.UPDATE_LIMIT) return t("update_wallet_limit", "Cüzdan Limitini Güncelle");
 return t("update_spending_limit", "Harcama Uyarı Limitini Güncelle");
 })();
 const description = (() => {
 if (mode === WALLET_OPERATION_MODES.WITHDRAW) return t("withdraw_desc", "E-Cüzdanınızdan hesabınıza para çekin.");
 if (mode === WALLET_OPERATION_MODES.DEPOSIT) return t("deposit_desc", "E-Cüzdanınıza bakiye yükleyin.");
 if (mode === WALLET_OPERATION_MODES.UPDATE_LIMIT) return t("update_limit_desc", "E-Cüzdanınız için tutulabilecek azami bakiyeyi belirleyin.");
 return t("update_warning_desc", "Harcamalarınız bu tutara yaklaştığında bildirim alın.");
 })();
 const submitLabel = (() => {
 if (mode === WALLET_OPERATION_MODES.WITHDRAW) return t("withdraw", "Para Çek");
 if (mode === WALLET_OPERATION_MODES.DEPOSIT) return t("deposit", "Yükle");
 return t("update", "Güncelle");
 })();
 const currentValueLabel = (() => {
 if (mode === WALLET_OPERATION_MODES.UPDATE_LIMIT) return t("current_label", "Mevcut:");
 if (mode === WALLET_OPERATION_MODES.UPDATE_WARNING) return t("current_label", "Mevcut:");
 return null;
 })();
 const currentValue = (() => {
 if (mode === WALLET_OPERATION_MODES.UPDATE_LIMIT) return eWallet?.limit ? formatCurrency(eWallet.limit) : t("unlimited", "Limitsiz");
 if (mode === WALLET_OPERATION_MODES.UPDATE_WARNING) return eWallet?.spendingWarningLimit ? formatCurrency(eWallet.spendingWarningLimit) : t("not_configured", "Tanımlanmamış");
 return null;
 })();
 const amountLabel = (() => {
 if (mode === WALLET_OPERATION_MODES.UPDATE_LIMIT) return t("new_wallet_limit_try", "Yeni Cüzdan Limiti (TRY)");
 if (mode === WALLET_OPERATION_MODES.UPDATE_WARNING) return t("new_warning_limit_try", "Yeni Harcama Uyarı Limiti (TRY)");
 return t("amount_try", "Tutar (TRY)");
 })();
 const amountPlaceholder = (() => {
 if (mode === WALLET_OPERATION_MODES.UPDATE_LIMIT) return t("enter_new_limit", "Yeni limit girin");
 if (mode === WALLET_OPERATION_MODES.UPDATE_WARNING) return t("enter_warning_limit", "Uyarı limiti girin");
 return t("enter_amount", "Tutar girin");
 })();
 const amountHelp = (() => {
 if (mode === WALLET_OPERATION_MODES.UPDATE_LIMIT) return t("wallet_limit_help", "Cüzdanınızda tutabileceğiniz azami bakiyeyi tanımlar.");
 if (mode === WALLET_OPERATION_MODES.UPDATE_WARNING) return t("wallet_warning_help", "Harcamanız bu limite yaklaştığında uyarılacaksınız.");
 return null;
 })();
 const handleSubmit = async e => {
 e.preventDefault();
 const numericAmount = parseFloat(amount);
 if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
 setError(t("enter_amount_greater_than_zero", "Sıfırdan büyük bir tutar girin."));
 return;
 }
 try {
 if (!idempotencyKeyRef.current) idempotencyKeyRef.current = crypto.randomUUID();
 await onSubmit(numericAmount, idempotencyKeyRef.current);
 onClose();
 } catch {
 // The wallet mutation already shows the error toast; keep the dialog open so the amount can be corrected.
 }
 };
 return <Modal isOpen={isOpen} onClose={handleClose} title={title} size="md" footer={<>
 <Button variant="secondary" onClick={handleClose}>{t("cancel")}</Button>
 <Button type="submit" form="wallet-operation-form" disabled={loading}>{loading ? t("processing", "İşleniyor...") : submitLabel}</Button>
 </>}>
 <form id="wallet-operation-form" onSubmit={handleSubmit} noValidate className="space-y-4">
 <p className="text-sm text-text-secondary">{description}</p>
 {currentValueLabel && <p className="text-sm text-text-secondary">
 {currentValueLabel} <span className="font-medium tabular-nums text-text-primary">{currentValue}</span>
 </p>}
 <div>
 <label htmlFor="wallet-operation-amount" className="mb-1.5 block text-sm font-medium text-text-primary">{amountLabel}</label>
 <input id="wallet-operation-amount" type="number" inputMode="decimal" step="0.01" min="0" autoFocus className={`${error ? inputError : inputNormal} h-10 tabular-nums`} placeholder={amountPlaceholder} value={amount} aria-invalid={Boolean(error)} aria-describedby={error ? 'wallet-operation-error' : undefined} onChange={e => {
 setAmount(e.target.value);
 setError('');
 }} />
 <FieldError error={error} id="wallet-operation-error" />
 {!error && amountHelp ? <p className="mt-1.5 text-xs text-text-tertiary">{amountHelp}</p> : null}
 </div>
 </form>
 </Modal>;
};
export default WalletOperationModal;
