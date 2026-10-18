import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { Button, Modal } from '../../common/components/ui/index.js';
import { CANCEL_REFUND_REASON_LABELS } from '../../common/enums/cancelRefundReasons.js';
import { ORDER_MESSAGES } from '../constants/orderUiConstants.js';
const CancelRefundModal = ({
 isOpen,
 onClose,
 onSubmit,
 type,
 order
}) => {
 const {
 t
 } = useTranslation();
 const [reason, setReason] = useState('');
 const [reasonText, setReasonText] = useState('');
 const [selectedItems, setSelectedItems] = useState([]);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState('');
 useEffect(() => {
 if (isOpen && order?.orderItems) {
 setSelectedItems(order.orderItems.map(item => item.id));
 }
 }, [isOpen, order]);
 if (!isOpen || !order) return null;
 const isCancel = type === 'cancel';
 const title = isCancel ? 'Cancel Order' : 'Refund Order';
 const submitLabel = isCancel ? 'Cancel Order' : 'Request Refund';
 const handleItemToggle = itemId => {
 setSelectedItems(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
 };
 const handleSelectAll = () => {
 if (selectedItems.length === order.orderItems?.length) {
 setSelectedItems([]);
 } else {
 setSelectedItems(order.orderItems?.map(item => item.id) || []);
 }
 };
 const handleSubmit = async e => {
 e.preventDefault();
 setError('');
 if (!reason) {
 setError('Please select a reason');
 return;
 }
 if (selectedItems.length === 0) {
 setError('Please select at least one item');
 return;
 }
 setIsSubmitting(true);
 try {
 const allItemsSelected = selectedItems.length === order.orderItems?.length;
 const payload = {
 reason,
 reasonText: reasonText.trim() || null,
 orderItemIds: allItemsSelected ? null : selectedItems
 };
 await onSubmit(payload);
 handleClose();
 } catch (err) {
 setError(err.response?.data?.message || err.message || ORDER_MESSAGES.UNKNOWN_ERROR);
 } finally {
 setIsSubmitting(false);
 }
 };
 const handleClose = () => {
 setReason('');
 setReasonText('');
 setSelectedItems([]);
 setError('');
 onClose();
 };
 const allItemsSelected = selectedItems.length === order.orderItems?.length;
 return <Modal isOpen={isOpen} onClose={isSubmitting ? () => {} : handleClose} title={title} size="lg" footer={<>
 <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>{t("cancel")}</Button>
 <Button type="submit" form="cancel-refund-form" disabled={isSubmitting || !reason}>{isSubmitting ? 'Processing...' : submitLabel}</Button>
 </>}>
 <form id="cancel-refund-form" onSubmit={handleSubmit} noValidate className="space-y-5">
 {order.orderItems && order.orderItems.length > 0 && <fieldset>
 <div className="mb-2 flex items-center justify-between">
 <legend className="text-sm font-medium text-text-primary">{t("select_items")} <span className="tabular-nums text-text-tertiary">({selectedItems.length} {t("of")} {order.orderItems.length} {t("selected")})</span></legend>
 {order.orderItems.length > 1 && <button type="button" onClick={handleSelectAll} className="text-sm text-text-secondary underline-offset-2 hover:text-text-primary hover:underline">
 {allItemsSelected ? 'Deselect all' : 'Select all'}
 </button>}
 </div>
 <div className="max-h-48 divide-y divide-border-light overflow-y-auto rounded border border-border">
 {order.orderItems.map(item => <label key={item.id} className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-background-secondary">
 <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => handleItemToggle(item.id)} className="h-4 w-4 rounded-sm border-border text-primary focus:ring-border-focus" />
 <span className="min-w-0 flex-1">
 <span className="block truncate text-sm text-text-primary">{item.listing?.title || item.listing?.listingNo}</span>
 <span className="block text-xs tabular-nums text-text-tertiary">{t("qty")}{item.quantity} · {item.totalPrice} {order.currency}</span>
 </span>
 </label>)}
 </div>
 </fieldset>}

 <div>
 <label htmlFor="cancel-refund-reason" className="mb-1 block text-sm font-medium text-text-primary">{t("reason")}</label>
 <select id="cancel-refund-reason" value={reason} onChange={e => setReason(e.target.value)} className="h-10 w-full rounded border border-border bg-background-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus" required>
 <option value="">{t("select_a_reason")}</option>
 {Object.entries(CANCEL_REFUND_REASON_LABELS).map(([value, label]) => <option key={value} value={value}>
 {label}
 </option>)}
 </select>
 </div>

 <div>
 <label htmlFor="cancel-refund-details" className="mb-1 block text-sm font-medium text-text-primary">{t("additional_details_optional")}</label>
 <textarea id="cancel-refund-details" value={reasonText} onChange={e => setReasonText(e.target.value)} rows={4} className="resize-none py-2 w-full rounded border border-border bg-background-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder={t("please_provide_more_details_about_your_r")} />
 </div>

 {error && <p role="alert" className="text-sm text-status-error-text">{error}</p>}
 </form>
 </Modal>;
};
export default CancelRefundModal;
