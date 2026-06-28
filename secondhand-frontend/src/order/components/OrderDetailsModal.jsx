import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { formatCurrency, formatDateTime, resolveEnumLabel } from '../../common/formatters.js';
import { ReviewButton } from '../../reviews/index.js';
import { getLastUpdateInfo, getStatusColor, isCancellableStatus, isModifiableStatus, isRefundableStatus } from '../orderConstants.js';
import { ORDER_LIMITS, ORDER_STATUSES, ORDER_VIEW_MODES } from '../constants/orderUiConstants.js';
import { getOrderStatusIndicatorClass, getPaymentStatusIndicatorClass, getPaymentStatusTextClass } from '../utils/statusPresentation.js';
import { AddressSection, NotesSection } from './orderDetails/OrderEditableSections.jsx';
import { ShippingDetailsSection } from './orderDetails/ShippingDetailsSection.jsx';
import { ShipOrderForm } from './orderDetails/ShipOrderForm.jsx';
import { OrderPaymentSummary } from './orderDetails/OrderPaymentSummary.jsx';
import { useOrderDetailActions } from '../hooks/useOrderDetailActions.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useEnums } from '../../common/hooks/useEnums.js';
import useAddresses from '../../user/hooks/useAddresses.js';
import { Check, CheckCircle, MapPin, Package, Package2, Pencil, RotateCcw, User, X, AlertCircle, RotateCcw as RefundIcon, Phone, Mail, FileText, ArrowRight } from 'lucide-react';
import CancelRefundModal from './CancelRefundModal.jsx';
import { getCancelRefundReasonLabel } from '../../common/enums/cancelRefundReasons.js';
import { useOrderDetails } from '../hooks/useOrderDetails.js';
import { OrderDetailsSkeleton } from './orderDetails/OrderDetailsSkeleton.jsx';
import { orderService } from '../services/orderService.js';
import apiClient from '../../common/services/api/interceptors.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

const StatusBadge = ({ label, type = 'rose' }) => {
  const styles = {
    rose: 'bg-status-error-bg border-rose-200 text-status-error',
    amber: 'bg-status-warning-bg border-amber-200 text-status-warning',
    success: 'bg-status-success-bg border-emerald-200 text-status-success',
  };
  return (
    <span className={`px-2.5 py-0.5 text-caption font-semibold rounded-md border ${styles[type]}`}>
      {label}
    </span>
  );
};

const OrderCard = React.memo(({ children, className = '' }) => (
  <div className={`bg-white/80 border border-white/60 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] ${className}`}>
    {children}
  </div>
));
OrderCard.displayName = 'OrderCard';

const MeetupHandoverSection = ({ order, isSeller, onActionSuccess }) => {
  const { t } = useTranslation();
  const [pinCode, setPinCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  // Lock timer
  const [lockCountdown, setLockCountdown] = useState(0);
  useEffect(() => {
    if (order.verificationLockedUntil) {
      const lockTime = new Date(order.verificationLockedUntil).getTime();
      const timer = setInterval(() => {
        const diff = Math.max(0, Math.ceil((lockTime - Date.now()) / 1000));
        setLockCountdown(diff);
        if (diff === 0) {
          clearInterval(timer);
          onActionSuccess();
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [order.verificationLockedUntil, onActionSuccess]);

  // QR expiration countdown (5 mins)
  const [qrCountdown, setQrCountdown] = useState(300);
  useEffect(() => {
    if (!isSeller && order.status === 'MEETUP_PENDING') {
      const calculateRemaining = () => {
        if (!order.meetupVerificationCodeGeneratedAt) return 300;
        const generatedTime = new Date(order.meetupVerificationCodeGeneratedAt).getTime();
        const elapsedSeconds = Math.floor((Date.now() - generatedTime) / 1000);
        return Math.max(0, 300 - elapsedSeconds);
      };
      
      setQrCountdown(calculateRemaining());

      const timer = setInterval(() => {
        setQrCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [order.status, order.meetupVerificationCodeGeneratedAt, isSeller]);

  // Authenticated dynamic QR Code fetching
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [qrFetchTrigger, setQrFetchTrigger] = useState(0);
  useEffect(() => {
    let url = '';
    let active = true;
    if (order.status === 'MEETUP_PENDING' && !isSeller) {
      const fetchQrCode = async () => {
        setIsQrLoading(true);
        try {
          const response = await apiClient.get(API_ENDPOINTS.ORDERS.GET_MEETUP_QR(order.orderNumber), {
            responseType: 'blob'
          });
          if (active) {
            url = URL.createObjectURL(response.data);
            setQrImageUrl(url);
          }
        } catch (err) {
          console.error('Failed to load QR code image', err);
        } finally {
          if (active) {
            setIsQrLoading(false);
          }
        }
      };
      fetchQrCode();
    }
    return () => {
      active = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [order.status, order.orderNumber, isSeller, qrFetchTrigger]);

  const handleRegenerateCode = async () => {
    try {
      await orderService.regenerateMeetupCode(order.orderNumber);
      setQrCountdown(300);
      setQrFetchTrigger(prev => prev + 1);
      onActionSuccess();
    } catch (err) {
      setConfirmError(err?.response?.data?.message || 'Kod yenilenirken hata oluştu.');
    }
  };

  const handleVerify = async e => {
    e.preventDefault();
    if (!pinCode || pinCode.trim().length !== 6) {
      setVerifyError('Lütfen 6 haneli kodu eksiksiz girin.');
      return;
    }
    setIsVerifying(true);
    setVerifyError('');
    try {
      const res = await orderService.verifyMeetupCode(order.orderNumber, pinCode.trim());
      if (res.error) {
        setVerifyError(res.message || 'Kod doğrulama başarısız.');
      } else {
        setPinCode('');
        onActionSuccess();
      }
    } catch (err) {
      setVerifyError(err?.response?.data?.message || 'Doğrulama hatası oluştu.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmCompletion = async () => {
    if (!confirmCheckbox) {
      setConfirmError('Lütfen onay kutusunu işaretleyin.');
      return;
    }
    setIsConfirming(true);
    setConfirmError('');
    try {
      const res = await orderService.confirmHandoverCompletion(order.orderNumber, true);
      if (res.error) {
        setConfirmError(res.message || 'İşlem tamamlanamadı.');
      } else {
        onActionSuccess();
      }
    } catch (err) {
      setConfirmError(err?.response?.data?.message || 'İşlem tamamlanırken hata oluştu.');
    } finally {
      setIsConfirming(false);
    }
  };

  const formatTime = secs => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="rounded-lg border border-border-light bg-card-bg p-6 shadow-sm mb-6 relative overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border-light pb-4 mb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-primary shadow-sm">
          <MapPin className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{t("elden_g_venli_teslimat_detaylar")}</h3>
          <p className="text-xs text-text-muted">{t("g_venli_bulu_ma_noktas_nda_y_z_y_ze_al_v")}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <span className="block text-caption font-bold uppercase tracking-wider text-text-muted">{t("bulu_ma_konumu")}</span>
          <span className="mt-1 block text-sm font-semibold text-text-primary">{order.meetupLocation || 'Belirtilmedi'}</span>
        </div>

        {/* Contact Info Card */}
        <div className="p-3 bg-secondary rounded-lg border border-border-light shadow-sm flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-status-success-bg text-status-success shadow-sm">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-caption font-bold text-text-muted uppercase tracking-wider">{t("i_leti_im_bilgileri")}</span>
            {isSeller ? (
              <p className="text-xs font-semibold text-text-primary mt-0.5">
                {t("al_c")}: {order.buyerName} {order.buyerSurname} <span className="text-status-success ml-1">📞 {order.buyerPhone || 'Telefon Yok'}</span>
              </p>
            ) : (
              <p className="text-xs font-semibold text-text-primary mt-0.5">
                {t("sat_c")}: {order.sellerFullName || 'Satıcı'} <span className="text-status-success ml-1">📞 {order.sellerPhone || 'Telefon Yok'}</span>
              </p>
            )}
          </div>
        </div>

        {order.status === 'MEETUP_PENDING' && (
          <>
            {!isSeller ? (
              // BUYER VIEW IN MEETUP_PENDING
              <div className="bg-card-bg rounded-lg border border-border-light p-5 flex flex-col items-center justify-center text-center">
                <span className="block text-xs font-bold text-primary uppercase tracking-widest mb-3">{t("sat_c_ya_g_sterilecek_qr_ve_pin")}</span>
                {qrCountdown > 0 ? (
                  <>
                    <div className="relative p-3 bg-card-bg rounded-lg border border-border-light shadow-sm mb-4">
                      {isQrLoading ? (
                        <div className="w-[150px] h-[150px] flex items-center justify-center bg-slate-50 rounded-lg">
                          <span className="text-xs text-text-muted">{t("y_kleniyor")}</span>
                        </div>
                      ) : qrImageUrl ? (
                        <img src={qrImageUrl} alt={t("meetup_qr_code")} className="w-[150px] h-[150px]" />
                      ) : (
                        <div className="w-[150px] h-[150px] flex items-center justify-center bg-rose-50 rounded-lg border border-rose-100">
                          <span className="text-xs text-status-error text-center px-2">{t("qr_y_klenemedi")}</span>
                        </div>
                      )}
                    </div>
                    <span className="block text-3xl font-bold tracking-[0.25em] text-text-primary mb-1 font-mono">
                      {order.meetupVerificationCode || '------'}
                    </span>
                    <p className="text-caption text-text-muted font-semibold uppercase tracking-wider flex items-center gap-1.5 mt-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      {t("yenilenme_s_resi")}: {formatTime(qrCountdown)}
                    </p>

                    {/* Buyer Manual Confirmation */}
                    <div className="mt-5 pt-4 border-t border-border-light w-full text-left">
                      <span className="block text-caption font-bold text-text-muted uppercase tracking-wider mb-2">{t("alternatif_teslimat_onay")}</span>
                      <p className="text-caption text-text-secondary mb-3 leading-relaxed">{t("e_er_sat_c_do_rulama_kodunu_sisteme_gire")}</p>
                      <div className="space-y-3">
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                          <input type="checkbox" checked={confirmCheckbox} onChange={e => setConfirmCheckbox(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-border-light text-primary focus:ring-primary/20" />
                          <span className="text-caption font-semibold text-text-primary leading-normal">{t("r_n_elden_teslim_ald_m_ve_i_lemi_tamamla")}</span>
                        </label>

                        <button type="button" onClick={handleConfirmCompletion} disabled={isConfirming || !confirmCheckbox} className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary-hover transition disabled:opacity-50 shadow-sm">
                          {isConfirming ? 'İşlem Tamamlanıyor...' : 'Teslim Aldım & Onayla'}
                        </button>
                        {confirmError && <p className="text-caption text-status-error font-semibold mt-1">{confirmError}</p>}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-6">
                    <p className="text-sm text-text-secondary mb-3">{t("qr_kod_ve_pin_kodunun_s_resi_doldu")}</p>
                    <button type="button" onClick={handleRegenerateCode} className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-lg hover:bg-primary-hover transition">{t("kodu_yenile")}</button>
                  </div>
                )}
              </div>
            ) : (
              // SELLER VIEW IN MEETUP_PENDING
              <div className="bg-card-bg rounded-lg border border-border-light p-5 shadow-sm">
                <span className="block text-xs font-bold text-primary uppercase tracking-widest mb-4">{t("al_c_do_rulama_kodu")}</span>
                {order.verificationLockedUntil && lockCountdown > 0 ? (
                  <div className="text-center py-4 bg-status-error-bg border border-rose-100 rounded-lg">
                    <p className="text-xs font-bold text-status-error uppercase tracking-wide">{t("do_rulama_ge_ici_olarak_kilitlendi")}</p>
                    <p className="text-xs text-status-error mt-1">{t("l_tfen")} {formatTime(lockCountdown)} {t("dakika_sonra_tekrar_deneyin")}</p>
                  </div>
                ) : (
                  <form onSubmit={handleVerify} className="space-y-3">
                    <p className="text-xs text-text-secondary">{t("al_c_n_n_ekran_ndaki_6_haneli_kodu_veya_")}</p>
                    <div className="flex gap-2">
                      <input type="text" value={pinCode} onChange={e => setPinCode(e.target.value.replace(/\D/g, '').substring(0, 6))} className="flex-1 px-4 py-2.5 text-sm font-semibold tracking-[0.2em] font-mono text-center border border-border-light rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-card-bg shadow-sm" placeholder="000000" maxLength={6} disabled={isVerifying} />
                      <button type="submit" disabled={isVerifying || pinCode.length !== 6} className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-primary rounded-lg hover:bg-primary-hover transition disabled:opacity-50">
                        {isVerifying ? 'Doğrulanıyor...' : 'Kodu Doğrula'}
                      </button>
                    </div>
                    {verifyError && <p className="text-xs text-status-error font-semibold">{verifyError}</p>}
                  </form>
                )}
              </div>
            )}
          </>
        )}

        {order.status === 'HANDOVER_CONFIRMED' && (
          <div className="bg-card-bg rounded-lg border border-border-light p-5 shadow-sm">
            <span className="block text-xs font-bold text-status-success uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse" />
              {t("r_n_teslimat_do_ruland")}
            </span>
            <p className="text-xs text-text-secondary mb-4">{t("r_n_elden_teslim_ald_n_z_veya_teslim_ett")}</p>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={confirmCheckbox} onChange={e => setConfirmCheckbox(e.target.checked)} className="mt-1 h-4 w-4 rounded border-border-light text-primary focus:ring-primary/20" />
                <span className="text-xs font-medium text-text-primary leading-normal">{t("r_n_n_elden_teslim_edildi_ini_ve_i_lemi_")}</span>
              </label>

              <button type="button" onClick={handleConfirmCompletion} disabled={isConfirming || !confirmCheckbox} className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary-hover rounded-lg transition disabled:opacity-50 shadow-sm">
                {isConfirming ? 'Tamamlanıyor...' : 'Siparişi Tamamla'}
              </button>
              {confirmError && <p className="text-xs text-status-error font-semibold mt-1">{confirmError}</p>}
            </div>
          </div>
        )}

        {order.status === 'COMPLETED' && (
          <div className="bg-status-success-bg border border-emerald-100 rounded-lg p-5 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-status-success mt-0.5 flex-shrink-0" />
            <div>
              <span className="block text-xs font-bold text-status-success uppercase tracking-wider">{t("i_lem_tamamland")}</span>
              <p className="text-xs text-text-secondary mt-1">{t("elden_g_venli_teslimat_ba_ar_yla_tamamla")}</p>
              {order.completedAt && (
                <p className="text-caption text-text-muted mt-2 font-medium">
                  {order.completedByUserName ? `Onaylayan: ${order.completedByUserName}` : 'Sistem tarafından otomatik onaylandı'}
                  {` — ${formatDateTime(order.completedAt)}`}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Redesigned timeline component
const CustomOrderStepper = ({ currentStatus, deliveryMethod }) => {
  const { t } = useTranslation();
  const isMeetup = deliveryMethod === 'SAFE_MEETUP';
  const steps = isMeetup
    ? [
        { key: ORDER_STATUSES.PENDING, label: 'Placed' },
        { key: ORDER_STATUSES.MEETUP_PENDING, label: 'Meetup Pending' },
        { key: ORDER_STATUSES.HANDOVER_CONFIRMED, label: 'Handover Confirmed' },
        { key: ORDER_STATUSES.COMPLETED, label: 'Delivered & Confirmed' },
      ]
    : [
        { key: ORDER_STATUSES.PENDING, label: 'Placed' },
        { key: ORDER_STATUSES.CONFIRMED, label: 'Confirmed' },
        { key: ORDER_STATUSES.PROCESSING, label: 'Preparing' },
        { key: ORDER_STATUSES.SHIPPED, label: 'Shipped' },
        { key: ORDER_STATUSES.DELIVERED, label: 'Delivered' },
      ];

  const currentIndex = steps.findIndex(s => s.key === currentStatus);
  const isFailed = currentStatus === ORDER_STATUSES.CANCELLED || currentStatus === ORDER_STATUSES.REFUNDED || currentStatus === ORDER_STATUSES.VERIFICATION_LOCKED;

  return (
    <div className="py-4">
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 z-0">
        {/* Connection Line (desktop only) */}
        <div className="absolute top-4 left-0 w-full h-[3px] bg-slate-100 z-0 hidden md:block" />
        <div 
          className="absolute top-4 left-0 h-[3px] bg-gradient-to-r from-blue-600 to-indigo-600 z-0 hidden md:block transition-all duration-500 ease-out" 
          style={{ width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-0 w-full md:w-auto relative group z-10">
              <div className="relative bg-white sm:bg-transparent rounded-full">
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping opacity-70" aria-hidden />
                )}
                <div 
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isDone 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-none text-white shadow-md shadow-emerald-500/20 scale-[1.05]' 
                      : isCurrent 
                        ? 'bg-white border-2 border-blue-600 text-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.15)] ring-4 ring-blue-600/5 scale-[1.05]' 
                        : 'bg-white border border-border-light text-text-muted'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 stroke-[3px]" />
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>
              </div>
              <span className={`md:mt-3 text-[10px] font-bold uppercase tracking-wider ${
                isDone 
                  ? 'text-emerald-600' 
                  : isCurrent 
                    ? 'text-blue-600 font-extrabold' 
                    : 'text-text-muted'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {isFailed && (
        <div className="mt-6 flex justify-center">
          <span className="px-3.5 py-1.5 bg-status-error-bg text-status-error text-xs font-bold rounded-lg border border-rose-200 flex items-center gap-1.5 shadow-sm">
            <AlertCircle className="w-4 h-4" /> {t("status")}: {currentStatus}
          </span>
        </div>
      )}
    </div>
  );
};

const OrderDetailsModal = React.memo(({
  isOpen,
  selectedOrderId,
  selectedOrder: initialSelectedOrder,
  onClose,
  onOpenReceipt,
  viewMode = ORDER_VIEW_MODES.BUYER,
  orderReviews = {},
  reviewsLoading = false,
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

  const modalRef = useRef(null);

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

  // Keyboard navigation / Focus management / Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const previousActiveElement = document.activeElement;

    if (modalRef.current) {
      modalRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const headerTitle = isSellerView ? `Order #${selectedOrder?.orderNumber || orderId}` : selectedOrder?.name || `Order #${selectedOrder?.orderNumber || orderId}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
    >
      <div 
        className="w-full sm:max-w-6xl h-full sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-3xl border border-white/60 shadow-2xl bg-gradient-to-tr from-[#fbfaf8] via-[#f8f6f0] to-[#f3efe5] overflow-hidden flex flex-col relative"
      >
        {/* Header (sticky at top) */}
        <div className="px-6 py-5 border-b border-border-light flex items-center justify-between gap-4 bg-white/95 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-lg border border-border-light bg-slate-50 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-0.5">
                {!isSellerView && isEditingName ? (
                  <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                    <input type="text" value={orderName} onChange={e => setOrderName(e.target.value)} className="flex-1 px-3 py-1.5 text-sm font-semibold text-text-primary border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card-bg shadow-sm" placeholder={t("order_name")} maxLength={ORDER_LIMITS.ORDER_NAME_MAX_LENGTH} autoFocus />
                    <button onClick={handleSaveName} disabled={isSavingName} className="p-2 hover:bg-indigo-50 rounded-lg transition-colors text-primary disabled:opacity-50">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={handleCancelEditName} disabled={isSavingName} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-text-secondary disabled:opacity-50">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 id="modal-title" className="text-md font-bold text-text-primary tracking-tight truncate">
                      {headerTitle}
                    </h2>
                    {!isSellerView && selectedOrder?.name ? <span className="text-xs text-text-muted font-medium">#{selectedOrder.orderNumber}</span> : null}
                    {!isSellerView && selectedOrder && (
                      <button onClick={() => setIsEditingName(true)} className="p-1 hover:bg-slate-100 rounded transition-colors text-text-muted hover:text-text-primary" title={t("edit_order_name")}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
              {selectedOrder && (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${getOrderStatusIndicatorClass(selectedOrder.status)}`} />
                  <span className={`text-xs font-bold uppercase tracking-wide ${getStatusColor(selectedOrder.status)}`}>
                    {resolveEnumLabel(enums, 'orderStatuses', selectedOrder.status) || selectedOrder.status}
                  </span>
                  <span className="text-border-light">•</span>
                  <span className="text-xs text-text-muted font-semibold">{formatDateTime(selectedOrder.createdAt)}</span>
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} aria-label={t("close")} className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all text-text-muted hover:text-text-primary border border-border-light">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-gradient-to-b from-white/20 to-[#f5f3eb]/40">
          {isLoading ? (
            <OrderDetailsSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-status-error mx-auto mb-3" />
              <h3 className="text-base font-bold text-text-primary mb-2">Failed to load order details</h3>
              <p className="text-sm text-text-muted mb-4">{error}</p>
              <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase rounded-lg hover:bg-primary-hover transition">
                Retry
              </button>
            </div>
          ) : selectedOrder ? (
            <div className="space-y-6">
              {/* Stepper (Horizontal Progress Tracker) */}
              <OrderCard>
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-6">{t("tracking_progress")}</h3>
                <CustomOrderStepper currentStatus={selectedOrder.status} deliveryMethod={selectedOrder.deliveryMethod} />
                <div className="text-caption text-text-muted font-semibold uppercase tracking-wider mt-4">
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
                    <div className="flex items-center justify-between mb-5 border-b border-border-light pb-3">
                      <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                        <Package2 className="w-4 h-4 text-text-secondary" />
                        {isSellerView ? 'Sold Items' : 'Order Items'}
                      </h3>
                      <span className="text-xs text-text-muted font-bold">
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
                            <div className="w-16 h-16 rounded-lg border border-border-light bg-slate-50 overflow-hidden flex-shrink-0 relative">
                              <img src={item.listing?.imageUrl} className="w-full h-full object-cover" alt={item.listing?.title || 'Listing'} />
                              {(isFullyCancelled || isFullyRefunded) && (
                                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                                  <X className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs font-bold text-text-primary line-clamp-1">
                                  {item.listing?.title}
                                </h4>
                                {isFullyCancelled ? <StatusBadge label={t("cancelled")} type="rose" /> : null}
                                {isFullyRefunded ? <StatusBadge label={t("refunded")} type="amber" /> : null}
                                {isPartiallyCancelled ? <StatusBadge label={t("partially_cancelled")} type="rose" /> : null}
                                {isPartiallyRefunded ? <StatusBadge label={t("partially_refunded")} type="amber" /> : null}
                              </div>
                              <p className="text-caption text-text-secondary mt-1 font-semibold">
                                {t("qty")}: {item.quantity} × {formatCurrency(item.unitPrice, selectedOrder.currency)}
                                {isCancelled ? <span className="ml-2 text-status-error">({item.cancelledQuantity} {t("cancelled")})</span> : null}
                                {isRefunded ? <span className="ml-2 text-status-warning">({item.refundedQuantity} {t("refunded")})</span> : null}
                              </p>
                              {!isSellerView && (
                                <p className="text-caption text-text-muted mt-0.5">
                                  {t("seller")}: <span className="font-bold text-text-secondary">{[item.sellerName, item.sellerSurname].filter(Boolean).join(' ') || '—'}</span>
                                </p>
                              )}
                              {item.campaignName ? (
                                <span className="inline-block mt-1.5 text-caption px-2 py-0.5 bg-status-success-bg text-status-success font-bold rounded">
                                  {t("promo")}: {item.campaignName}
                                </span>
                              ) : null}

                              {/* Cancellation/Refund Reasons */}
                              {(item.cancelReason || item.refundReason) && (
                                <div className="mt-2 space-y-1.5">
                                  {item.cancelReason && (
                                    <div className="flex items-start gap-1.5 p-2 rounded-lg bg-status-error-bg border border-rose-100">
                                      <AlertCircle className="w-3.5 h-3.5 text-status-error mt-0.5 flex-shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-caption font-bold text-status-error leading-tight">{t("cancellation")}: {getCancelRefundReasonLabel(item.cancelReason)}</p>
                                        {item.cancelReasonText && (
                                          <p className="text-caption text-status-error mt-0.5 italic leading-tight break-words">"{item.cancelReasonText}"</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {item.refundReason && (
                                    <div className="flex items-start gap-1.5 p-2 rounded-lg bg-status-warning-bg border border-amber-100">
                                      <RefundIcon className="w-3.5 h-3.5 text-status-warning mt-0.5 flex-shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-caption font-bold text-status-warning leading-tight">{t("refund")}: {getCancelRefundReasonLabel(item.refundReason)}</p>
                                        {item.refundReasonText && (
                                          <p className="text-caption text-status-warning mt-0.5 italic leading-tight break-words">"{item.refundReasonText}"</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="text-right flex flex-col justify-between items-end flex-shrink-0">
                              <span className="text-xs font-bold text-text-primary">
                                {formatCurrency(item.totalPrice, selectedOrder.currency)}
                              </span>
                              {!isSellerView && (
                                <ReviewButton key={reviewKey || `rev-${idx}`} orderItem={item} existingReview={reviewKey ? orderReviews[reviewKey] : null} reviewsLoading={reviewsLoading} skipIndividualFetch onReviewCreated={onReviewSuccess} orderStatus={selectedOrder.status} />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </OrderCard>

                  {/* Shipping Details */}
                  {selectedOrder.shipping && (
                    <ShippingDetailsSection shipping={selectedOrder.shipping} deliveryAddress={selectedOrder.shippingAddress} CardComponent={OrderCard} internalTracking={{
                      orderId: selectedOrder.id,
                      isSellerView,
                      onBeforeNavigate: onClose
                    }} />
                  )}

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
                      <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4">{t("buyer")}</h3>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg border border-border-light flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-text-secondary" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-text-primary truncate">
                            {selectedOrder.buyerName || selectedOrder.buyerSurname ? `${selectedOrder.buyerName || ''} ${selectedOrder.buyerSurname || ''}`.trim() : `User #${selectedOrder.userId}`}
                          </div>
                          {selectedOrder.buyerEmail && (
                            <div className="text-caption text-text-muted mt-0.5 truncate flex items-center gap-1">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              {selectedOrder.buyerEmail}
                            </div>
                          )}
                          {selectedOrder.buyerPhone && (
                            <div className="text-caption text-text-muted mt-0.5 truncate flex items-center gap-1">
                              <Phone className="w-3 h-3 flex-shrink-0" />
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
            <div className="text-center py-12 text-text-muted">No order selected</div>
          )}
        </div>

        {/* Footer (sticky at bottom) */}
        <div className="sticky bottom-0 bg-card-bg border-t border-border-light px-6 py-4 flex items-center justify-between shrink-0 z-20">
          {/* Left Footer Action: View Invoice */}
          <div>
            {!isLoading && selectedOrder && onOpenReceipt && (
              <button 
                type="button" 
                onClick={() => onOpenReceipt(selectedOrder)} 
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1.5 hover:underline focus:outline-none focus:underline"
              >
                <FileText className="w-4 h-4" />
                {t("view_invoice")}
              </button>
            )}
          </div>

          {/* Right Footer Action buttons */}
          <div className="flex gap-3">
            {/* Context-specific Actions */}
            {!isLoading && selectedOrder && !isSellerView && (
              <>
                {isCancellableStatus(selectedOrder.status, enums) && (
                  <button onClick={() => setCancelModalOpen(true)} className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-status-error bg-status-error-bg border border-rose-200 hover:bg-rose-100 rounded-lg transition-all focus:ring-2 focus:ring-rose-500/20">
                    {t("cancel_order")}
                  </button>
                )}
                {isRefundableStatus(selectedOrder.status, enums) && (
                  <>
                    <button onClick={() => setRefundModalOpen(true)} className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-text-secondary bg-white border border-border-light hover:bg-slate-50 rounded-lg transition-all focus:ring-2 focus:ring-slate-500/20">
                      <RotateCcw className="w-4 h-4 inline mr-1" />{t("request_refund")}
                    </button>
                    <button onClick={handleCompleteOrder} disabled={isProcessing} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary-hover rounded-lg transition-all disabled:opacity-50 shadow-sm focus:ring-2 focus:ring-primary/20">
                      <CheckCircle className="w-4 h-4 inline mr-1" />{t("approve_complete")}
                    </button>
                  </>
                )}
              </>
            )}

            {/* Track Order CTA (Primary Button if shipped/delivered) */}
            {!isLoading && selectedOrder && selectedOrder.shipping?.trackingNumber && (
              <a 
                href={selectedOrder.shipping.trackingUrl || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary-hover rounded-lg transition-all shadow-sm flex items-center gap-1.5 focus:ring-2 focus:ring-primary/20"
              >
                Track Order <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}

            <button 
              onClick={onClose} 
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-text-secondary bg-white border border-border-light hover:bg-slate-50 rounded-lg transition-all focus:ring-2 focus:ring-slate-500/20"
            >
              {t("close")}
            </button>
          </div>
        </div>

        {/* Modal Modals */}
        {!isSellerView && selectedOrder && (
          <>
            <CancelRefundModal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} onSubmit={handleCancelOrder} type="cancel" order={selectedOrder} />
            <CancelRefundModal isOpen={refundModalOpen} onClose={() => setRefundModalOpen(false)} onSubmit={handleRefundOrder} type="refund" order={selectedOrder} />
          </>
        )}
      </div>
    </div>
  );
});

OrderDetailsModal.displayName = 'OrderDetailsModal';
export default OrderDetailsModal;