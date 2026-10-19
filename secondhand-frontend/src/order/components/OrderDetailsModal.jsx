import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState } from 'react';
import { formatCurrency, formatDateTime, resolveEnumLabel } from '../../common/formatters.js';
import { getLastUpdateInfo, getStatusColor, isCancellableStatus, isModifiableStatus, isRefundableStatus } from '../orderConstants.js';
import { ORDER_LIMITS, ORDER_STATUSES, ORDER_VIEW_MODES } from '../constants/orderUiConstants.js';
import { getOrderStatusDotClass, getPaymentStatusIndicatorClass, getPaymentStatusTextClass } from '../utils/statusPresentation.js';
import { AddressSection, NotesSection } from './orderDetails/OrderEditableSections.jsx';
import { ShipOrderForm } from './orderDetails/ShipOrderForm.jsx';
import { OrderPaymentSummary } from './orderDetails/OrderPaymentSummary.jsx';
import { OrderItemsSection } from './orderDetails/OrderItemsSection.jsx';
import { useOrderDetailActions } from '../hooks/useOrderDetailActions.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useEnums } from '../../common/hooks/useEnums.js';
import useAddresses from '../../user/hooks/useAddresses.js';
import { AlertCircle, ArrowRight, Check, FileText, Mail, Pencil, Phone, X } from 'lucide-react';
import Modal from '../../common/components/ui/Modal.jsx';
import Button, { buttonClasses } from '../../common/components/ui/Button.jsx';
import MeetupHandoverSection from './orderDetails/MeetupHandoverSection.jsx';
import OrderStepper from './orderDetails/OrderStepper.jsx';
import CancelRefundModal from './CancelRefundModal.jsx';
import { useOrderDetails } from '../hooks/useOrderDetails.js';
import { orderItemIds, useOrderItemReviews } from '../hooks/useOrderItemReviews.js';
import { OrderDetailsSkeleton } from './orderDetails/OrderDetailsSkeleton.jsx';

const OrderCard = React.memo(({ children, className = '' }) => (
 <div className={`rounded border border-border bg-background-primary p-5 ${className}`}>
 {children}
 </div>
));
OrderCard.displayName = 'OrderCard';

const OrderDetailsModal = React.memo(({
 isOpen,
 selectedOrderId,
 selectedOrder: initialSelectedOrder,
 onClose,
 onOpenReceipt,
 viewMode = ORDER_VIEW_MODES.BUYER,
 onReviewSuccess
}) => {
 const { t } = useTranslation();
 const isSellerView = viewMode === ORDER_VIEW_MODES.SELLER;
 const { enums } = useEnums();
 const notification = useNotification();
 const [cancelModalOpen, setCancelModalOpen] = useState(false);
 const [refundModalOpen, setRefundModalOpen] = useState(false);
 const [isEditingName, setIsEditingName] = useState(false);
 const [orderName, setOrderName] = useState('');

 // --- Address editing state ---
 const [isEditingAddress, setIsEditingAddress] = useState(false);
 const [selectedShippingAddressId, setSelectedShippingAddressId] = useState(null);
 const [selectedBillingAddressId, setSelectedBillingAddressId] = useState(null);

 // --- Notes editing state ---
 const [isEditingNotes, setIsEditingNotes] = useState(false);
 const [orderNotes, setOrderNotes] = useState('');

 // Fetch using hook
 const orderId = selectedOrderId || initialSelectedOrder?.id;
 const { order: selectedOrder, isLoading, error, refetch } = useOrderDetails(orderId, isSellerView, {
 enabled: isOpen && !!orderId
 });

 const {
 flags: {
 isSavingName,
 isProcessing,
 isSavingAddress,
 isSavingNotes
 },
 actions: {
 handleSaveName,
 handleCancelEditName,
 handleCancelOrder,
 handleRefundOrder,
 handleCompleteOrder,
 handleSaveAddress,
 handleSaveNotes,
 handleShipOrder
 }
 } = useOrderDetailActions({
 isSellerView,
 selectedOrder,
 orderName,
 orderNotes,
 selectedShippingAddressId,
 selectedBillingAddressId,
 onReviewSuccess: () => {
 refetch();
 if (onReviewSuccess) onReviewSuccess();
 },
 notification,
 setIsEditingName,
 setOrderName,
 setIsEditingAddress,
 setIsEditingNotes
 });

 const isModifiable = !isSellerView && isModifiableStatus(selectedOrder?.status, enums);
 const { addresses, loading: addressesLoading } = useAddresses({
 enabled: isEditingAddress
 });

 // Only a different order resets editing; a background refetch must not discard an open draft.
 useEffect(() => {
 setIsEditingName(false);
 setIsEditingAddress(false);
 setIsEditingNotes(false);
 }, [orderId]);

 const orderItems = useMemo(() => selectedOrder?.orderItems || [], [selectedOrder]);
 const reviewItemIds = useMemo(() => (selectedOrder ? orderItemIds([selectedOrder]) : []), [selectedOrder]);
 const { reviews: orderReviews, isLoading: reviewsLoading } = useOrderItemReviews(reviewItemIds, {
 enabled: isOpen && !isSellerView && [ORDER_STATUSES.DELIVERED, ORDER_STATUSES.COMPLETED].includes(selectedOrder?.status)
 });
 const sellerTotalAmount = useMemo(() => {
 if (!isSellerView) return null;
 return orderItems.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0);
 }, [isSellerView, orderItems]);

 const lastUpdate = useMemo(() => getLastUpdateInfo(selectedOrder), [selectedOrder]);

 const handleStartEditName = () => {
 setOrderName(selectedOrder?.name || '');
 setIsEditingName(true);
 };

 const handleStartEditAddress = () => {
 setSelectedShippingAddressId(selectedOrder.shippingAddress?.id || null);
 setSelectedBillingAddressId(selectedOrder.billingAddress?.id || null);
 setIsEditingAddress(true);
 };

 const handleCancelEditAddress = () => {
 setIsEditingAddress(false);
 };

 const handleStartEditNotes = () => {
 setOrderNotes(selectedOrder.notes || '');
 setIsEditingNotes(true);
 };

 const handleCancelEditNotes = () => {
 setOrderNotes(selectedOrder.notes || '');
 setIsEditingNotes(false);
 };

 if (!isOpen) return null;

 const headerTitle = selectedOrder?.name || orderItems[0]?.listing?.title || t('order_details', 'Sipariş Detayı');

const header = (
 <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
 <div className="min-w-0 flex-1">
 <div className="mb-0.5 flex flex-wrap items-center gap-2.5">
 {!isSellerView && isEditingName ? (
 <div className="flex min-w-0 flex-1 items-center gap-1.5">
 <input type="text" value={orderName} onChange={e => setOrderName(e.target.value)} aria-label={t("order_name")} className="h-9 flex-1 rounded border border-border-focus bg-background-primary px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder={t("order_name")} maxLength={ORDER_LIMITS.ORDER_NAME_MAX_LENGTH} autoFocus />
 <Button size="sm" className="w-9" onClick={handleSaveName} disabled={isSavingName} aria-label={t("save", "Kaydet")}>
 <Check className="h-4 w-4" strokeWidth={1.5} />
 </Button>
 <Button variant="secondary" size="sm" className="w-9" onClick={handleCancelEditName} disabled={isSavingName} aria-label={t("cancel", "İptal")}>
 <X className="h-4 w-4" strokeWidth={1.5} />
 </Button>
 </div>
 ) : (
 <>
 <h2 className="truncate text-lg font-semibold text-text-primary">{headerTitle}</h2>
 {!isSellerView && selectedOrder && (
 <button type="button" onClick={handleStartEditName} aria-label={t("edit_order_name")} className="-m-2.5 rounded p-2.5 text-text-muted transition-colors hover:text-text-primary">
 <Pencil className="h-4 w-4" strokeWidth={1.5} />
 </button>
 )}
 </>
 )}
 </div>
 {selectedOrder && (
 <div className="flex flex-wrap items-center gap-x-2 text-sm">
 <span className="inline-flex items-center gap-1.5">
 <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${getOrderStatusDotClass(selectedOrder.status)}`} aria-hidden />
 <span className={getStatusColor(selectedOrder.status)}>
 {resolveEnumLabel(enums, 'orderStatuses', selectedOrder.status) || selectedOrder.status}
 </span>
 </span>
 <span className="text-text-muted" aria-hidden>·</span>
 <span className="tabular-nums text-text-tertiary">{formatDateTime(selectedOrder.createdAt)}</span>
 </div>
 )}
 </div>
 <Button variant="ghost" size="sm" className="w-9 shrink-0" onClick={onClose} aria-label={t("close")}>
 <X className="h-5 w-5" strokeWidth={1.5} />
 </Button>
 </div>
 );

 const showInvoice = !isLoading && selectedOrder?.paymentReference && onOpenReceipt;
 const showBuyerActions = !isLoading && selectedOrder && !isSellerView;
 const showCancel = showBuyerActions && isCancellableStatus(selectedOrder.status, enums);
 const showRefund = showBuyerActions && isRefundableStatus(selectedOrder.status, enums);
 const trackingUrl = !isLoading ? selectedOrder?.shipping?.trackingUrl : null;
 const footer = showInvoice || showCancel || showRefund || trackingUrl ? (
 <div className="flex w-full flex-wrap items-center justify-between gap-3">
 <div>
 {showInvoice && (
 <Button variant="ghost" size="sm" onClick={() => onOpenReceipt(selectedOrder.paymentReference)}>
 <FileText className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 {t("view_invoice")}
 </Button>
 )}
 </div>
 <div className="flex flex-wrap gap-2">
 {showCancel && (
 <Button variant="danger" onClick={() => setCancelModalOpen(true)}>{t("cancel_order")}</Button>
 )}
 {showRefund && (
 <>
 <Button variant="secondary" onClick={() => setRefundModalOpen(true)}>{t("request_refund")}</Button>
 <Button onClick={handleCompleteOrder} disabled={isProcessing}>{t("approve_complete")}</Button>
 </>
 )}
 {trackingUrl && (
 <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses('secondary')}>
 {t('od_track_order', 'Kargoyu takip et')} <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 </a>
 )}
 </div>
 </div>
 ) : null;

 return (
 <>
 <Modal isOpen={!cancelModalOpen && !refundModalOpen} onClose={onClose} title={headerTitle} header={header} footer={footer} size="xl">
 {isLoading ? (
 <OrderDetailsSkeleton />
 ) : error ? (
 <div className="text-center py-12">
 <AlertCircle className="mx-auto mb-3 h-5 w-5 text-status-error" strokeWidth={1.5} aria-hidden />
 <h3 className="mb-2 text-sm font-medium text-text-primary">{t('od_load_failed', 'Sipariş detayları yüklenemedi')}</h3>
 <p className="mb-4 text-sm text-text-secondary">{error}</p>
 <Button variant="secondary" onClick={() => refetch()}>{t('try_again', 'Tekrar Dene')}</Button>
 </div>
 ) : selectedOrder ? (
 <div className="space-y-6">
 {/* Stepper (Horizontal Progress Tracker) */}
 <OrderCard>
 <h3 className="mb-5 text-lg font-semibold text-text-primary">{t("tracking_progress")}</h3>
 <OrderStepper currentStatus={selectedOrder.status} deliveryMethod={selectedOrder.deliveryMethod} />
 <div className="mt-4 text-sm tabular-nums text-text-tertiary">
 {t("last_update")}: {resolveEnumLabel(enums, 'orderStatuses', lastUpdate.status) || lastUpdate.status}
 {lastUpdate.updatedAt ? ` • ${formatDateTime(lastUpdate.updatedAt)}` : ''}
 </div>
 </OrderCard>

 {/* Two Column Layout */}
 <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
 {/* Left Column: Summary, items, shipping Details */}
 <div className="lg:col-span-7 space-y-6">
 {selectedOrder.deliveryMethod === 'SAFE_MEETUP' && (
 <MeetupHandoverSection order={selectedOrder} isSeller={isSellerView} onActionSuccess={onReviewSuccess} />
 )}

 <OrderItemsSection CardComponent={OrderCard} items={orderItems} order={selectedOrder} isSellerView={isSellerView} orderReviews={orderReviews} reviewsLoading={reviewsLoading} onReviewSuccess={onReviewSuccess} onClose={onClose} />

  {/* Ship Order Form */}
 {isSellerView && (selectedOrder.status === 'CONFIRMED' || selectedOrder.status === 'PROCESSING') && (
 <ShipOrderForm carriers={enums.carriers || []} isProcessing={isProcessing} onShip={handleShipOrder} CardComponent={OrderCard} />
 )}

 {/* Addresses and Notes */}
 {!isSellerView && (
 <>
 <AddressSection CardComponent={OrderCard} isEditingAddress={isEditingAddress} addressesLoading={addressesLoading} addresses={addresses} selectedShippingAddressId={selectedShippingAddressId} selectedBillingAddressId={selectedBillingAddressId} setSelectedShippingAddressId={setSelectedShippingAddressId} setSelectedBillingAddressId={setSelectedBillingAddressId} handleSaveAddress={handleSaveAddress} handleCancelEditAddress={handleCancelEditAddress} handleStartEditAddress={handleStartEditAddress} isSavingAddress={isSavingAddress} selectedOrder={selectedOrder} isModifiable={isModifiable} />
 <NotesSection CardComponent={OrderCard} isEditingNotes={isEditingNotes} orderNotes={orderNotes} setOrderNotes={setOrderNotes} handleSaveNotes={handleSaveNotes} handleCancelEditNotes={handleCancelEditNotes} handleStartEditNotes={handleStartEditNotes} isSavingNotes={isSavingNotes} selectedOrder={selectedOrder} isModifiable={isModifiable} />
 </>
 )}
 </div>

 {/* Right Column: Payment & Partner info */}
 <div className="lg:col-span-5 space-y-6">
 {/* Buyer details for seller view */}
 {isSellerView && (
 <OrderCard>
 <h3 className="mb-4 text-lg font-semibold text-text-primary">{t("buyer")}</h3>
 <div>
 <div className="min-w-0">
 <div className="truncate text-sm font-medium text-text-primary">
 {selectedOrder.buyerName || selectedOrder.buyerSurname ? `${selectedOrder.buyerName || ''} ${selectedOrder.buyerSurname || ''}`.trim() : t('od_user_fallback', { defaultValue: 'Kullanıcı #{{id}}', id: selectedOrder.userId })}
 </div>
 {selectedOrder.buyerEmail && (
 <div className="mt-1 flex items-center gap-1.5 truncate text-sm text-text-secondary">
 <Mail className="h-4 w-4 flex-shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 {selectedOrder.buyerEmail}
 </div>
 )}
 {selectedOrder.buyerPhone && (
 <div className="mt-1 flex items-center gap-1.5 truncate text-sm tabular-nums text-text-secondary">
 <Phone className="h-4 w-4 flex-shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 {selectedOrder.buyerPhone}
 </div>
 )}
 </div>
 </div>
 </OrderCard>
 )}

 {/* Payment Details */}
 <OrderPaymentSummary CardComponent={OrderCard} isSellerView={isSellerView} selectedOrder={selectedOrder} sellerTotalAmount={sellerTotalAmount} resolveEnumLabel={(group, value) => resolveEnumLabel(enums, group, value)} formatCurrency={formatCurrency} getPaymentStatusIndicatorClass={getPaymentStatusIndicatorClass} getPaymentStatusTextClass={getPaymentStatusTextClass} />
 </div>
 </div>
 </div>
 ) : (
 <div className="py-12 text-center text-sm text-text-tertiary">{t('od_no_order', 'Sipariş seçilmedi')}</div>
 )}

 {/* Rendered as siblings of the details dialog, which is hidden while one is open. */}
 </Modal>
 {!isSellerView && selectedOrder && (
 <>
 <CancelRefundModal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} onSubmit={handleCancelOrder} type="cancel" order={selectedOrder} />
 <CancelRefundModal isOpen={refundModalOpen} onClose={() => setRefundModalOpen(false)} onSubmit={handleRefundOrder} type="refund" order={selectedOrder} />
 </>
 )}
 </>
 );
});

OrderDetailsModal.displayName = 'OrderDetailsModal';
export default OrderDetailsModal;