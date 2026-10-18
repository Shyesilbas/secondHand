import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency, formatDateTime, resolveEnumLabel } from '../../common/formatters.js';
import { ReviewButton } from '../../reviews/index.js';
import { getLastUpdateInfo, getStatusColor, isCancellableStatus, isModifiableStatus, isRefundableStatus } from '../orderConstants.js';
import { ORDER_LIMITS, ORDER_STATUSES, ORDER_VIEW_MODES } from '../constants/orderUiConstants.js';
import { getOrderStatusDotClass, getPaymentStatusIndicatorClass, getPaymentStatusTextClass } from '../utils/statusPresentation.js';
import { AddressSection, NotesSection } from './orderDetails/OrderEditableSections.jsx';
import { ShipOrderForm } from './orderDetails/ShipOrderForm.jsx';
import { OrderPaymentSummary } from './orderDetails/OrderPaymentSummary.jsx';
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
import { getCancelRefundReasonLabel } from '../../common/enums/cancelRefundReasons.js';
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
 const navigate = useNavigate();
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

 useEffect(() => {
 if (selectedOrder) {
 setOrderName(selectedOrder.name || '');
 setOrderNotes(selectedOrder.notes || '');
 setIsEditingAddress(false);
 setIsEditingNotes(false);
 }
 }, [selectedOrder]);

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

 const headerTitle = isSellerView ? `Order #${selectedOrder?.orderNumber || orderId}` : selectedOrder?.name || `Order #${selectedOrder?.orderNumber || orderId}`;

const header = (
 <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
 <div className="min-w-0 flex-1">
 <div className="mb-0.5 flex flex-wrap items-center gap-2.5">
 {!isSellerView && isEditingName ? (
 <div className="flex min-w-0 flex-1 items-center gap-1.5">
 <input type="text" value={orderName} onChange={e => setOrderName(e.target.value)} aria-label={t("order_name")} className="h-9 flex-1 rounded border border-border-focus bg-background-primary px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder={t("order_name")} maxLength={ORDER_LIMITS.ORDER_NAME_MAX_LENGTH} autoFocus />
 <button type="button" onClick={handleSaveName} disabled={isSavingName} aria-label={t("save", "Kaydet")} className="rounded p-2 text-text-primary transition-colors hover:bg-background-secondary disabled:opacity-50">
 <Check className="h-4 w-4" strokeWidth={1.5} />
 </button>
 <button type="button" onClick={handleCancelEditName} disabled={isSavingName} aria-label={t("cancel", "İptal")} className="rounded p-2 text-text-tertiary transition-colors hover:bg-background-secondary disabled:opacity-50">
 <X className="h-4 w-4" strokeWidth={1.5} />
 </button>
 </div>
 ) : (
 <>
 <h2 className="truncate text-lg font-semibold text-text-primary">{headerTitle}</h2>
 {!isSellerView && selectedOrder?.name ? <span className="text-sm tabular-nums text-text-tertiary">#{selectedOrder.orderNumber}</span> : null}
 {!isSellerView && selectedOrder && (
 <button type="button" onClick={() => setIsEditingName(true)} aria-label={t("edit_order_name")} className="rounded p-1 text-text-muted transition-colors hover:bg-background-secondary hover:text-text-secondary">
 <Pencil className="h-4 w-4" strokeWidth={1.5} />
 </button>
 )}
 </>
 )}
 </div>
 {selectedOrder && (
 <div className="flex flex-wrap items-center gap-2 text-sm">
 <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${getOrderStatusDotClass(selectedOrder.status)}`} aria-hidden />
 <span className={getStatusColor(selectedOrder.status)}>
 {resolveEnumLabel(enums, 'orderStatuses', selectedOrder.status) || selectedOrder.status}
 </span>
 <span className="tabular-nums text-text-tertiary">{formatDateTime(selectedOrder.createdAt)}</span>
 </div>
 )}
 </div>
 <button type="button" onClick={onClose} aria-label={t("close")} className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-text-tertiary transition-colors hover:bg-background-secondary hover:text-text-primary">
 <X className="h-5 w-5" strokeWidth={1.5} />
 </button>
 </div>
 );

 const footer = (
 <div className="flex w-full flex-wrap items-center justify-between gap-3">
 <div>
 {!isLoading && selectedOrder?.paymentReference && onOpenReceipt && (
 <Button variant="ghost" size="sm" onClick={() => onOpenReceipt(selectedOrder.paymentReference)}>
 <FileText className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 {t("view_invoice")}
 </Button>
 )}
 </div>
 <div className="flex flex-wrap gap-2">
 {!isLoading && selectedOrder && !isSellerView && (
 <>
 {isCancellableStatus(selectedOrder.status, enums) && (
 <Button variant="danger" onClick={() => setCancelModalOpen(true)}>{t("cancel_order")}</Button>
 )}
 {isRefundableStatus(selectedOrder.status, enums) && (
 <>
 <Button variant="secondary" onClick={() => setRefundModalOpen(true)}>{t("request_refund")}</Button>
 <Button onClick={handleCompleteOrder} disabled={isProcessing}>{t("approve_complete")}</Button>
 </>
 )}
 </>
 )}
 {!isLoading && selectedOrder && selectedOrder.shipping?.trackingNumber && (
 <a href={selectedOrder.shipping.trackingUrl || '#'} target="_blank" rel="noopener noreferrer" className={buttonClasses('secondary')}>
 Track Order <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 </a>
 )}
 <Button variant="ghost" onClick={onClose}>{t("close")}</Button>
 </div>
 </div>
 );

 return (
 <Modal isOpen={isOpen} onClose={onClose} title={headerTitle} header={header} footer={footer} size="2xl">
 {isLoading ? (
 <OrderDetailsSkeleton />
 ) : error ? (
 <div className="text-center py-12">
 <AlertCircle className="mx-auto mb-3 h-5 w-5 text-status-error" strokeWidth={1.5} aria-hidden />
 <h3 className="mb-2 text-sm font-medium text-text-primary">Failed to load order details</h3>
 <p className="mb-4 text-sm text-text-secondary">{error}</p>
 <Button variant="secondary" onClick={() => refetch()}>Retry</Button>
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
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 {/* Left Column: Summary, items, shipping Details */}
 <div className="lg:col-span-8 space-y-6">
 {selectedOrder.deliveryMethod === 'SAFE_MEETUP' && (
 <MeetupHandoverSection order={selectedOrder} isSeller={isSellerView} onActionSuccess={onReviewSuccess} />
 )}

 {/* Items List */}
 <OrderCard>
 <div className="mb-4 flex items-center justify-between border-b border-border-light pb-3">
 <h3 className="text-lg font-semibold text-text-primary">
 {isSellerView ? 'Sold Items' : 'Order Items'}
 </h3>
 <span className="text-sm tabular-nums text-text-tertiary">
 {orderItems.length} {orderItems.length === 1 ? 'item' : 'items'}
 </span>
 </div>

 <div className="divide-y divide-border-light">
 {orderItems.map((item, idx) => {
 const isCancelled = item.cancelledQuantity && item.cancelledQuantity > 0;
 const isRefunded = item.refundedQuantity && item.refundedQuantity > 0;
 const isFullyCancelled = isCancelled && item.cancelledQuantity >= item.quantity;
 const isFullyRefunded = isRefunded && item.refundedQuantity >= item.quantity;
 const isPartiallyCancelled = isCancelled && item.cancelledQuantity < item.quantity;
 const isPartiallyRefunded = isRefunded && item.refundedQuantity < item.quantity;
 const rawOi = item?.id ?? item?.orderItemId;
 const reviewKey = rawOi === undefined || rawOi === null || rawOi === '' ? null : String(rawOi);

 return (
 <div key={reviewKey || `row-${idx}`} className={`py-4 first:pt-0 last:pb-0 flex gap-4 ${isFullyCancelled || isFullyRefunded ? 'opacity-50' : ''}`}>
 <div
 onClick={() => {
 if (item.listing?.id) {
 navigate(ROUTES.LISTING_DETAIL(item.listing.id));
 onClose();
 }
 }}
 className="relative h-16 w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded border border-border-light bg-background-secondary transition-opacity hover:opacity-80"
 >
 <img src={item.listing?.imageUrl} className="w-full h-full object-cover" alt={item.listing?.title || 'Listing'} />
 {(isFullyCancelled || isFullyRefunded) && (
 <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
 <X className="h-5 w-5 text-white" strokeWidth={1.5} aria-hidden />
 </div>
 )}
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <h4
 onClick={() => {
 if (item.listing?.id) {
 navigate(ROUTES.LISTING_DETAIL(item.listing.id));
 onClose();
 }
 }}
 className="line-clamp-1 cursor-pointer text-sm font-medium text-text-primary hover:underline"
 >
 {item.listing?.title}
 </h4>
 {isFullyCancelled ? <span className="text-sm text-status-error-text">{t("cancelled")}</span> : null}
 {isFullyRefunded ? <span className="text-sm text-status-warning-text">{t("refunded")}</span> : null}
 {isPartiallyCancelled ? <span className="text-sm text-status-error-text">{t("partially_cancelled")}</span> : null}
 {isPartiallyRefunded ? <span className="text-sm text-status-warning-text">{t("partially_refunded")}</span> : null}
 </div>
 <p className="mt-1 text-sm tabular-nums text-text-secondary">
 {t("qty")}: {item.quantity} × {formatCurrency(item.unitPrice, selectedOrder.currency)}
 {isCancelled ? <span className="ml-2 text-status-error-text">({item.cancelledQuantity} {t("cancelled")})</span> : null}
 {isRefunded ? <span className="ml-2 text-status-warning-text">({item.refundedQuantity} {t("refunded")})</span> : null}
 </p>
 {!isSellerView && (
 <p className="mt-0.5 text-sm text-text-tertiary">
 {t("seller")}: <span className="text-text-secondary">{[item.sellerName, item.sellerSurname].filter(Boolean).join(' ') || '—'}</span>
 </p>
 )}
 {item.campaignName ? (
 <span className="mt-1 inline-block text-sm text-status-success-text">
 {t("promo")}: {item.campaignName}
 </span>
 ) : null}

 {/* Cancellation/Refund Reasons */}
 {(item.cancelReason || item.refundReason) && (
 <div className="mt-2 space-y-1.5">
 {item.cancelReason && (
 <div className="rounded border border-border-light p-2">
 <div className="min-w-0">
 <p className="text-sm text-status-error-text">{t("cancellation")}: {getCancelRefundReasonLabel(item.cancelReason)}</p>
 {item.cancelReasonText && (
 <p className="mt-0.5 break-words text-sm text-text-secondary">"{item.cancelReasonText}"</p>
 )}
 </div>
 </div>
 )}
 {item.refundReason && (
 <div className="rounded border border-border-light p-2">
 <div className="min-w-0">
 <p className="text-sm text-status-warning-text">{t("refund")}: {getCancelRefundReasonLabel(item.refundReason)}</p>
 {item.refundReasonText && (
 <p className="mt-0.5 break-words text-sm text-text-secondary">"{item.refundReasonText}"</p>
 )}
 </div>
 </div>
 )}
 </div>
 )}
 </div>

 <div className="text-right flex flex-col justify-between items-end flex-shrink-0">
 <span className="text-sm font-semibold tabular-nums text-text-primary">
 {formatCurrency(item.totalPrice, selectedOrder.currency)}
 </span>
 {!isSellerView && (
 <ReviewButton key={reviewKey || `rev-${idx}`} orderItem={item} existingReview={reviewKey ? orderReviews[reviewKey] : null} reviewsLoading={reviewsLoading} onReviewCreated={onReviewSuccess} orderStatus={selectedOrder.status} />
 )}
 </div>
 </div>
 );
 })}
 </div>
 </OrderCard>

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
 <div className="lg:col-span-4 space-y-6">
 {/* Buyer details for seller view */}
 {isSellerView && (
 <OrderCard>
 <h3 className="mb-4 text-lg font-semibold text-text-primary">{t("buyer")}</h3>
 <div>
 <div className="min-w-0">
 <div className="truncate text-sm font-medium text-text-primary">
 {selectedOrder.buyerName || selectedOrder.buyerSurname ? `${selectedOrder.buyerName || ''} ${selectedOrder.buyerSurname || ''}`.trim() : `User #${selectedOrder.userId}`}
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
 <OrderPaymentSummary CardComponent={OrderCard} isSellerView={isSellerView} selectedOrder={selectedOrder} sellerTotalAmount={sellerTotalAmount} onOpenReceipt={onOpenReceipt} resolveEnumLabel={(group, value) => resolveEnumLabel(enums, group, value)} formatCurrency={formatCurrency} getPaymentStatusIndicatorClass={getPaymentStatusIndicatorClass} getPaymentStatusTextClass={getPaymentStatusTextClass} />
 </div>
 </div>
 </div>
 ) : (
 <div className="py-12 text-center text-sm text-text-tertiary">No order selected</div>
 )}

 {/* Modal Modals */}
 {!isSellerView && selectedOrder && (
 <>
 <CancelRefundModal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} onSubmit={handleCancelOrder} type="cancel" order={selectedOrder} />
 <CancelRefundModal isOpen={refundModalOpen} onClose={() => setRefundModalOpen(false)} onSubmit={handleRefundOrder} type="refund" order={selectedOrder} />
 </>
 )}
 </Modal>
 );
});

OrderDetailsModal.displayName = 'OrderDetailsModal';
export default OrderDetailsModal;