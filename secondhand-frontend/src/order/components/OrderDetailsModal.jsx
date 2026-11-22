import { useTranslation } from "react-i18next";
import React, { useEffect, useId, useMemo, useState } from 'react';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { getLastUpdateInfo, hasOrderAction } from '../orderConstants.js';
import { ORDER_ACTIONS, ORDER_LIMITS, ORDER_VIEW_MODES } from '../constants/orderUiConstants.js';
import {
  getOrderStatusBadgeVariant,
  getOrderStatusLabel,
  getPaymentStatusIndicatorClass,
  getPaymentStatusTextClass,
} from '../utils/statusPresentation.js';
import { AddressSection, NotesSection } from './orderDetails/OrderEditableSections.jsx';
import { ShipOrderForm } from './orderDetails/ShipOrderForm.jsx';
import { OrderPaymentSummary } from './orderDetails/OrderPaymentSummary.jsx';
import { OrderItemsSection } from './orderDetails/OrderItemsSection.jsx';
import { ShippingDetailsSection } from './orderDetails/ShippingDetailsSection.jsx';
import { useOrderDetailActions } from '../hooks/useOrderDetailActions.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useEnums } from '../../common/hooks/useEnums.js';
import useAddresses from '../../user/hooks/useAddresses.js';
import { ArrowRight, Check, FileText, Mail, Package, Pencil, Phone, X } from 'lucide-react';
import Modal from '../../common/components/ui/Modal.jsx';
import Button, { buttonClasses } from '../../common/components/ui/Button.jsx';
import { Badge, Card, EmptyState, ErrorState } from '../../common/components/ui/index.js';
import { inputNormal } from '../../common/components/forms/inputStyles.js';
import MeetupHandoverSection from './orderDetails/MeetupHandoverSection.jsx';
import OrderStepper from './orderDetails/OrderStepper.jsx';
import CancelRefundModal from './CancelRefundModal.jsx';
import { useOrderDetails } from '../hooks/useOrderDetails.js';
import { orderItemIds, useOrderItemReviews } from '../hooks/useOrderItemReviews.js';
import { OrderDetailsSkeleton } from './orderDetails/OrderDetailsSkeleton.jsx';

// Cards inside the white dialog: light edge only, no shadow (shadows are for cards on the page canvas).
const OrderCard = React.memo(({ children, className = '' }) => (
  <Card shadow={false} className={className}>{children}</Card>
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
  const titleId = useId();
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

  const isModifiable = !isSellerView && hasOrderAction(selectedOrder, ORDER_ACTIONS.EDIT);
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
    enabled: isOpen && !isSellerView && hasOrderAction(selectedOrder, ORDER_ACTIONS.REVIEW)
  });

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

  const headerTitle = selectedOrder?.name || orderItems[0]?.listing?.title || t('order_details', 'Sipariş detayı');
  const orderDisplayNumber = selectedOrder?.orderNumber || selectedOrder?.orderNo || (selectedOrder?.id ? `#${selectedOrder.id}` : '');
  const formattedOrderNumber = orderDisplayNumber
    ? (String(orderDisplayNumber).startsWith('#') ? orderDisplayNumber : `#${orderDisplayNumber}`)
    : '';
  const orderStatusLabel = getOrderStatusLabel(t, enums, selectedOrder?.status);
  const lastUpdateStatusLabel = getOrderStatusLabel(t, enums, lastUpdate.status);
  const lastUpdatePrefix = t('last_update', 'Son güncelleme').replace(/:+\s*$/, '');

  const header = (
    <header className="flex items-start justify-between gap-4 border-b border-border-light px-5 py-4">
      <div className="min-w-0 flex-1 space-y-2">
        {!isSellerView && isEditingName ? (
          <div className="flex min-w-0 items-center gap-1.5">
            <input
              type="text"
              value={orderName}
              onChange={e => setOrderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  handleCancelEditName();
                }
              }}
              aria-label={t('order_name', 'Sipariş adı')}
              className={`${inputNormal} h-9 flex-1`}
              placeholder={t('order_name', 'Sipariş adı')}
              maxLength={ORDER_LIMITS.ORDER_NAME_MAX_LENGTH}
              autoFocus
            />
            <Button size="icon" onClick={handleSaveName} disabled={isSavingName} aria-label={t('save', 'Kaydet')}>
              <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </Button>
            <Button variant="secondary" size="icon" onClick={handleCancelEditName} disabled={isSavingName} aria-label={t('cancel', 'İptal')}>
              <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </Button>
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-1.5">
            <h2 id={titleId} className="truncate text-lg font-semibold text-text-primary">{headerTitle}</h2>
            {!isSellerView && selectedOrder && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStartEditName}
                aria-label={t('edit_order_name', 'Sipariş adını düzenle')}
                className="shrink-0 text-text-tertiary hover:text-text-primary"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              </Button>
            )}
          </div>
        )}

        {(formattedOrderNumber || selectedOrder) && (
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            {formattedOrderNumber && (
              <Badge variant="neutral">{formattedOrderNumber}</Badge>
            )}
            {selectedOrder && (
              <Badge variant={getOrderStatusBadgeVariant(selectedOrder.status)} dot>
                {orderStatusLabel}
              </Badge>
            )}
            {selectedOrder?.createdAt && (
              <span className="text-sm tabular-nums text-text-tertiary">
                {t('order_date', 'Sipariş tarihi')}: {formatDateTime(selectedOrder.createdAt)}
              </span>
            )}
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label={t('close', 'Kapat')}
        className="shrink-0 text-text-tertiary hover:text-text-primary"
      >
        <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      </Button>
    </header>
  );

  const showInvoice = !isLoading && selectedOrder?.paymentReference && onOpenReceipt;
  const showBuyerActions = !isLoading && selectedOrder && !isSellerView;
  const showCancel = showBuyerActions && hasOrderAction(selectedOrder, ORDER_ACTIONS.CANCEL);
  const showRefund = showBuyerActions && hasOrderAction(selectedOrder, ORDER_ACTIONS.REFUND);
  // Safe Meetup completion runs through MeetupHandoverSection (CONFIRM_HANDOVER), not this footer.
  const showComplete = showBuyerActions && selectedOrder.deliveryMethod !== 'SAFE_MEETUP' && hasOrderAction(selectedOrder, ORDER_ACTIONS.COMPLETE);
  const trackingUrl = !isLoading ? selectedOrder?.shipping?.trackingUrl : null;
  const footer = showInvoice || showCancel || showRefund || showComplete || trackingUrl ? (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <div>
        {showInvoice && (
          <Button variant="ghost" size="sm" onClick={() => onOpenReceipt(selectedOrder.paymentReference)}>
            <FileText className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            {t('view_invoice', 'Faturayı görüntüle')}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {showCancel && (
          <Button variant="danger" onClick={() => setCancelModalOpen(true)} disabled={isProcessing}>
            {t('cancel_order', 'Siparişi iptal et')}
          </Button>
        )}
        {showRefund && (
          <Button variant="secondary" onClick={() => setRefundModalOpen(true)} disabled={isProcessing}>
            {t('request_refund', 'İade talep et')}
          </Button>
        )}
        {showComplete && (
          <Button onClick={handleCompleteOrder} disabled={isProcessing}>
            {isProcessing ? t('completing', 'Tamamlanıyor...') : t('approve_complete', 'Teslimatı onayla')}
          </Button>
        )}
        {trackingUrl && (
          <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses('secondary')}>
            {t('od_track_order', 'Kargoyu takip et')}
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </a>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <Modal
        isOpen={!cancelModalOpen && !refundModalOpen}
        onClose={onClose}
        title={headerTitle}
        ariaLabelledBy={!isSellerView && isEditingName ? undefined : titleId}
        header={header}
        footer={footer}
        size="xl"
      >
        {isLoading ? (
          <OrderDetailsSkeleton />
        ) : error ? (
          <ErrorState
            bordered={false}
            title={t('od_load_failed', 'Sipariş detayları yüklenemedi')}
            description={error}
            onRetry={refetch}
          />
        ) : selectedOrder ? (
          <div className="space-y-6">
            {/* Stepper (Horizontal Progress Tracker) */}
            <div className="rounded bg-background-secondary p-4">
              <OrderStepper
                currentStatus={selectedOrder.status}
                deliveryMethod={selectedOrder.deliveryMethod}
                statusLabel={orderStatusLabel}
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border-light pt-3 text-sm tabular-nums text-text-tertiary">
                <span>
                  {lastUpdatePrefix}: {lastUpdateStatusLabel}
                  {lastUpdate.updatedAt ? ` · ${formatDateTime(lastUpdate.updatedAt)}` : ''}
                </span>
                <span className="font-medium text-text-secondary">
                  {selectedOrder.deliveryMethod === 'SAFE_MEETUP'
                    ? t('safe_meetup', 'Güvenli buluşma')
                    : t('cargo_delivery', 'Kargo teslimatı')}
                </span>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column: Summary, items, shipping details */}
              <div className="space-y-6 lg:col-span-7">
                {selectedOrder.deliveryMethod === 'SAFE_MEETUP' && (
                  <MeetupHandoverSection
                    order={selectedOrder}
                    isSeller={isSellerView}
                    onActionSuccess={onReviewSuccess}
                    CardComponent={OrderCard}
                  />
                )}

                <OrderItemsSection
                  CardComponent={OrderCard}
                  items={orderItems}
                  order={selectedOrder}
                  isSellerView={isSellerView}
                  orderReviews={orderReviews}
                  reviewsLoading={reviewsLoading}
                  onReviewSuccess={onReviewSuccess}
                  onClose={onClose}
                />

                {/* Shipping Details for Cargo Orders */}
                {selectedOrder.deliveryMethod !== 'SAFE_MEETUP' && selectedOrder.shipping && (
                  <ShippingDetailsSection
                    shipping={selectedOrder.shipping}
                    deliveryAddress={selectedOrder.shippingAddress}
                    CardComponent={OrderCard}
                    internalTracking={{ orderId: selectedOrder.id, isSellerView, onBeforeNavigate: onClose }}
                  />
                )}

                {/* Ship Order Form */}
                {isSellerView && hasOrderAction(selectedOrder, ORDER_ACTIONS.SHIP) && (
                  <ShipOrderForm
                    carriers={enums.carriers || []}
                    isProcessing={isProcessing}
                    onShip={handleShipOrder}
                    CardComponent={OrderCard}
                  />
                )}

                {/* Addresses and Notes */}
                {!isSellerView && (
                  <>
                    <AddressSection
                      CardComponent={OrderCard}
                      isEditingAddress={isEditingAddress}
                      addressesLoading={addressesLoading}
                      addresses={addresses}
                      selectedShippingAddressId={selectedShippingAddressId}
                      selectedBillingAddressId={selectedBillingAddressId}
                      setSelectedShippingAddressId={setSelectedShippingAddressId}
                      setSelectedBillingAddressId={setSelectedBillingAddressId}
                      handleSaveAddress={handleSaveAddress}
                      handleCancelEditAddress={handleCancelEditAddress}
                      handleStartEditAddress={handleStartEditAddress}
                      isSavingAddress={isSavingAddress}
                      selectedOrder={selectedOrder}
                      isModifiable={isModifiable}
                    />
                    <NotesSection
                      CardComponent={OrderCard}
                      isEditingNotes={isEditingNotes}
                      orderNotes={orderNotes}
                      setOrderNotes={setOrderNotes}
                      handleSaveNotes={handleSaveNotes}
                      handleCancelEditNotes={handleCancelEditNotes}
                      handleStartEditNotes={handleStartEditNotes}
                      isSavingNotes={isSavingNotes}
                      selectedOrder={selectedOrder}
                      isModifiable={isModifiable}
                    />
                  </>
                )}
              </div>

              {/* Right Column: Payment & Partner info */}
              <div className="space-y-6 lg:col-span-5">
                {/* Buyer details for seller view */}
                {isSellerView && (
                  <OrderCard>
                    <h3 className="mb-4 text-base font-semibold text-text-primary">{t('buyer', 'Alıcı')}</h3>
                    <div className="min-w-0 space-y-1.5">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {selectedOrder.buyerName || selectedOrder.buyerSurname
                          ? `${selectedOrder.buyerName || ''} ${selectedOrder.buyerSurname || ''}`.trim()
                          : t('od_user_fallback', { defaultValue: 'Kullanıcı #{{id}}', id: selectedOrder.userId })}
                      </p>
                      {selectedOrder.buyerEmail && (
                        <p className="flex items-center gap-1.5 truncate text-sm text-text-secondary">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                          <span className="truncate">{selectedOrder.buyerEmail}</span>
                        </p>
                      )}
                      {selectedOrder.buyerPhone && (
                        <p className="flex items-center gap-1.5 truncate text-sm tabular-nums text-text-secondary">
                          <Phone className="h-3.5 w-3.5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                          <span>{selectedOrder.buyerPhone}</span>
                        </p>
                      )}
                    </div>
                  </OrderCard>
                )}

                {/* Payment Details */}
                <OrderPaymentSummary
                  CardComponent={OrderCard}
                  isSellerView={isSellerView}
                  selectedOrder={selectedOrder}
                  enums={enums}
                  formatCurrency={formatCurrency}
                  getPaymentStatusIndicatorClass={getPaymentStatusIndicatorClass}
                  getPaymentStatusTextClass={getPaymentStatusTextClass}
                />
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Package}
            size="compact"
            className="border-0"
            title={t('od_no_order', 'Sipariş seçilmedi')}
          />
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
