import { useTranslation } from "react-i18next";
import { Copy } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../formatters.js';
import { PAYMENT_DIRECTIONS, PAYMENT_STATUSES, TRANSACTION_TYPE_LABELS } from '../../../payments/paymentSchema.js';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';
const StatusText = ({
 status,
 isSuccess
}) => {
 const {
 t
 } = useTranslation();
 const [dot, label] = status === PAYMENT_STATUSES.ESCROW ? ['bg-status-warning', t("in_escrow")] : isSuccess ? ['bg-status-success', t("confirmed")] : ['bg-status-error', t("failed")];
 return <span className="inline-flex items-center gap-1.5">
 <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
 {label}
 </span>;
};
const InfoRow = ({
 label,
 value,
 isCopyable
}) => <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
 <dt className="shrink-0 text-text-secondary">{label}</dt>
 <dd className="flex min-w-0 items-center gap-2 text-right text-text-primary">
 <span className="break-words">{value || '-'}</span>
 {isCopyable && value && <button type="button" onClick={() => navigator.clipboard.writeText(value)} aria-label={`Copy ${label}`} className="rounded p-1 text-text-tertiary transition-colors hover:text-text-primary print:hidden">
 <Copy className="h-4 w-4" strokeWidth={1.5} />
 </button>}
 </dd>
 </div>;
const PaymentReceiptModal = ({
 isOpen,
 onClose,
 payment
}) => {
 const {
 t
 } = useTranslation();
 if (!payment) return null;
 const isIncoming = payment.paymentDirection === PAYMENT_DIRECTIONS.INCOMING;
 const transactionId = String(payment.paymentId || payment.id || 'N/A').slice(0, 12);
 return <Modal isOpen={isOpen} onClose={onClose} title={t("digital_invoice")} size="sm" footer={<div className="flex gap-2 print:hidden">
 <Button variant="secondary" onClick={onClose}>{t("back")}</Button>
 <Button onClick={() => window.print()}>{t("download_pdf")}</Button>
 </div>}>
 <div className="border-b border-border-light pb-4 text-center">
 <p className="text-sm text-text-secondary">{t("total_amount")}</p>
 <p className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">
 {isIncoming ? '+' : '-'}{formatCurrency(payment.amount)}
 </p>
 <p className="mt-2 flex items-center justify-center gap-3 text-sm text-text-secondary">
 <StatusText status={payment.status} isSuccess={payment.isSuccess} />
 <span aria-hidden>·</span>
 <span>{isIncoming ? 'Incoming' : 'Outgoing'}</span>
 </p>
 </div>
 <dl className="divide-y divide-border-light">
 <InfoRow label={t("transaction_category")} value={TRANSACTION_TYPE_LABELS[payment.transactionType] || payment.transactionType} />
 <InfoRow label={t("date")} value={formatDateTime(payment.processedAt || payment.createdAt)} />
 <InfoRow label={t("payment_method")} value={payment.paymentType || 'E-Wallet'} />
 <InfoRow label={t("reference_id")} value={transactionId} isCopyable />
 {payment.listingTitle && <InfoRow label={t("product_item")} value={payment.listingTitle} />}
 <InfoRow label={t("sender")} value={payment.senderDisplayName || 'Anonymous'} />
 <InfoRow label={t("recipient")} value={payment.receiverDisplayName || 'Anonymous'} />
 </dl>
 <p className="mt-4 text-xs leading-relaxed text-text-tertiary">{t("verified_by_secondhand_pay")}. {t("this_digital_invoice_is_a_confirmation_o")}</p>
 </Modal>;
};
export default PaymentReceiptModal;
