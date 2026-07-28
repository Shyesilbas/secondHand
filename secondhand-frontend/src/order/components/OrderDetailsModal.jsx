import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
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
import { 
  Check, 
  CheckCircle, 
  MapPin, 
  Package, 
  Package2, 
  Pencil, 
  RotateCcw, 
  User, 
  X, 
  AlertCircle, 
  RotateCcw as RefundIcon, 
  Phone, 
  Mail, 
  FileText, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import CancelRefundModal from './CancelRefundModal.jsx';
import { getCancelRefundReasonLabel } from '../../common/enums/cancelRefundReasons.js';
import { useOrderDetails } from '../hooks/useOrderDetails.js';
import { OrderDetailsSkeleton } from './orderDetails/OrderDetailsSkeleton.jsx';
import { orderService } from '../services/orderService.js';
import apiClient from '../../common/services/api/interceptors.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

const StatusBadge = ({ label, type = 'rose' }) => {
  const styles = {
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    slate: 'bg-slate-100 border-slate-200 text-slate-700',
  };
  return (
    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${styles[type] || styles.slate}`}>
      {label}
    </span>
  );
};

const OrderCard = React.memo(({ children, className = '' }) => (
  <div className={`bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-slate-300 ${className}`}>
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
    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-3 border-b border-emerald-100 pb-4 mb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">{t("elden_g_venli_teslimat_detaylar", "Elden Güvenli Teslimat")}</h3>
          <p className="text-xs text-slate-600 font-medium">{t("g_venli_bulu_ma_noktas_nda_y_z_y_ze_al_v", "Güvenli buluşma noktasında teslimat")}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{t("bulu_ma_konumu", "Buluşma Konumu")}</span>
          <span className="mt-0.5 block text-xs font-black text-slate-800">{order.meetupLocation || 'Belirtilmedi'}</span>
        </div>

        {/* Contact Info Card */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t("i_leti_im_bilgileri", "İletişim Bilgileri")}</span>
            {isSeller ? (
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                {t("al_c", "Alıcı")}: {order.buyerName} {order.buyerSurname} <span className="text-emerald-700 ml-1 font-mono font-black">📞 {order.buyerPhone || 'Telefon Yok'}</span>
              </p>
            ) : (
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                {t("sat_c", "Satıcı")}: {order.sellerFullName || 'Satıcı'} <span className="text-emerald-700 ml-1 font-mono font-black">📞 {order.sellerPhone || 'Telefon Yok'}</span>
              </p>
            )}
          </div>
        </div>

        {order.status === 'MEETUP_PENDING' && (
          <>
            {!isSeller ? (
              <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col items-center justify-center text-center">
                <span className="block text-xs font-black text-emerald-800 uppercase tracking-wider mb-3">{t("sat_c_ya_g_sterilecek_qr_ve_pin", "Satıcıya Gösterilecektir QR & PIN")}</span>
                {qrCountdown > 0 ? (
                  <>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs mb-3">
                      {isQrLoading ? (
                        <div className="w-[140px] h-[140px] flex items-center justify-center bg-slate-50 rounded-lg">
                          <span className="text-xs text-slate-400">{t("y_kleniyor")}</span>
                        </div>
                      ) : qrImageUrl ? (
                        <img src={qrImageUrl} alt={t("meetup_qr_code")} className="w-[140px] h-[140px]" />
                      ) : (
                        <div className="w-[140px] h-[140px] flex items-center justify-center bg-rose-50 rounded-lg border border-rose-100">
                          <span className="text-xs text-rose-600 text-center px-2">{t("qr_y_klenemedi")}</span>
                        </div>
                      )}
                    </div>
                    <span className="block text-2xl font-black tracking-[0.25em] text-slate-900 mb-1 font-mono">
                      {order.meetupVerificationCode || '------'}
                    </span>
                    <p className="text-xs text-slate-500 font-bold tracking-wider flex items-center gap-1.5 mt-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {t("yenilenme_s_resi", "Kalan Süre")}: {formatTime(qrCountdown)}
                    </p>

                    <div className="mt-4 pt-4 border-t border-slate-100 w-full text-left">
                      <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">{t("alternatif_teslimat_onay")}</span>
                      <div className="space-y-3 mt-2">
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                          <input type="checkbox" checked={confirmCheckbox} onChange={e => setConfirmCheckbox(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20" />
                          <span className="text-xs font-bold text-slate-700 leading-normal">{t("r_n_elden_teslim_ald_m_ve_i_lemi_tamamla", "Ürünü elden teslim aldım, onaylıyorum.")}</span>
                        </label>

                        <button type="button" onClick={handleConfirmCompletion} disabled={isConfirming || !confirmCheckbox} className="w-full py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition disabled:opacity-40 shadow-sm cursor-pointer">
                          {isConfirming ? 'İşlem Tamamlanıyor...' : 'Teslim Aldım & Onayla'}
                        </button>
                        {confirmError && <p className="text-xs text-rose-600 font-extrabold mt-1">{confirmError}</p>}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-4">
                    <p className="text-xs text-slate-600 font-medium mb-3">{t("qr_kod_ve_pin_kodunun_s_resi_doldu", "QR/PIN kodunun süresi doldu.")}</p>
                    <button type="button" onClick={handleRegenerateCode} className="px-4 py-2 text-xs font-black text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition cursor-pointer">{t("kodu_yenile", "Yeni Kod Üret")}</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <span className="block text-xs font-black text-emerald-800 uppercase tracking-wider mb-3">{t("al_c_do_rulama_kodu", "Alıcı Doğrulama Kodu")}</span>
                {order.verificationLockedUntil && lockCountdown > 0 ? (
                  <div className="text-center py-3 bg-rose-50 border border-rose-200 rounded-xl">
                    <p className="text-xs font-black text-rose-700 uppercase tracking-wide">{t("do_rulama_ge_ici_olarak_kilitlendi")}</p>
                    <p className="text-xs text-rose-600 mt-0.5">{t("l_tfen")} {formatTime(lockCountdown)} {t("dakika_sonra_tekrar_deneyin")}</p>
                  </div>
                ) : (
                  <form onSubmit={handleVerify} className="space-y-3">
                    <p className="text-xs text-slate-600 font-medium">{t("al_c_n_n_ekran_ndaki_6_haneli_kodu_veya_")}</p>
                    <div className="flex gap-2">
                      <input type="text" value={pinCode} onChange={e => setPinCode(e.target.value.replace(/\D/g, '').substring(0, 6))} className="flex-1 px-4 py-2 text-sm font-black tracking-[0.2em] font-mono text-center border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-slate-50" placeholder="000000" maxLength={6} disabled={isVerifying} />
                      <button type="submit" disabled={isVerifying || pinCode.length !== 6} className="px-5 py-2 text-xs font-black uppercase tracking-wider text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition disabled:opacity-40 cursor-pointer">
                        {isVerifying ? 'Doğrulanıyor...' : 'Doğrula'}
                      </button>
                    </div>
                    {verifyError && <p className="text-xs text-rose-600 font-extrabold">{verifyError}</p>}
                  </form>
                )}
              </div>
            )}
          </>
        )}

        {order.status === 'HANDOVER_CONFIRMED' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <span className="block text-xs font-black text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              {t("r_n_teslimat_do_ruland", "Ürün Teslimatı Doğrulandı")}
            </span>
            <p className="text-xs text-slate-600 mb-4">{t("r_n_elden_teslim_ald_n_z_veya_teslim_ett")}</p>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={confirmCheckbox} onChange={e => setConfirmCheckbox(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20" />
                <span className="text-xs font-bold text-slate-700 leading-normal">{t("r_n_n_elden_teslim_edildi_ini_ve_i_lemi_")}</span>
              </label>

              <button type="button" onClick={handleConfirmCompletion} disabled={isConfirming || !confirmCheckbox} className="w-full py-2.5 text-xs font-extrabold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition disabled:opacity-40 shadow-xs cursor-pointer">
                {isConfirming ? 'Tamamlanıyor...' : 'Siparişi Tamamla'}
              </button>
              {confirmError && <p className="text-xs text-rose-600 font-extrabold mt-1">{confirmError}</p>}
            </div>
          </div>
        )}

        {order.status === 'COMPLETED' && (
          <div className="bg-emerald-100/60 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
            <div>
              <span className="block text-xs font-black text-emerald-900 uppercase tracking-wider">{t("i_lem_tamamland", "Teslimat Tamamlandı")}</span>
              <p className="text-xs text-emerald-800 font-medium mt-0.5">{t("elden_g_venli_teslimat_ba_ar_yla_tamamla")}</p>
              {order.completedAt && (
                <p className="text-[11px] text-emerald-700 mt-1 font-mono font-bold">
                  {order.completedByUserName ? `Onaylayan: ${order.completedByUserName}` : 'Sistem Onayı'}
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
        { key: ORDER_STATUSES.PENDING, label: t("placed", "Sipariş Alındı") },
        { key: ORDER_STATUSES.MEETUP_PENDING, label: t("meetup_pending", "Buluşma Bekleniyor") },
        { key: ORDER_STATUSES.HANDOVER_CONFIRMED, label: t("handover_confirmed", "Teslimat Doğrulandı") },
        { key: ORDER_STATUSES.COMPLETED, label: t("completed", "Tamamlandı") },
      ]
    : [
        { key: ORDER_STATUSES.PENDING, label: t("placed", "Sipariş Alındı") },
        { key: ORDER_STATUSES.CONFIRMED, label: t("confirmed", "Onaylandı") },
        { key: ORDER_STATUSES.PROCESSING, label: t("preparing", "Hazırlanıyor") },
        { key: ORDER_STATUSES.SHIPPED, label: t("shipped", "Kargoya Verildi") },
        { key: ORDER_STATUSES.DELIVERED, label: t("delivered", "Teslim Edildi") },
      ];

  const currentIndex = steps.findIndex(s => s.key === currentStatus);
  const isFailed = currentStatus === ORDER_STATUSES.CANCELLED || currentStatus === ORDER_STATUSES.REFUNDED || currentStatus === ORDER_STATUSES.VERIFICATION_LOCKED;

  return (
    <div className="py-2">
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 z-0">
        <div className="absolute top-4 left-0 w-full h-[2px] bg-slate-200 z-0 hidden md:block" />
        <div 
          className="absolute top-4 left-0 h-[2px] bg-emerald-600 z-0 hidden md:block transition-all duration-500 ease-out" 
          style={{ width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-0 w-full md:w-auto relative group z-10">
              <div className="relative bg-white rounded-full">
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" aria-hidden />
                )}
                <div 
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isDone 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs font-black' 
                      : isCurrent 
                        ? 'bg-white border-2 border-emerald-600 text-emerald-700 shadow-xs ring-4 ring-emerald-500/10 font-black' 
                        : 'bg-white border-slate-300 text-slate-400 font-bold'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 stroke-[3px]" />
                  ) : (
                    <span className="text-xs">{idx + 1}</span>
                  )}
                </div>
              </div>
              <span className={`md:mt-2.5 text-[11px] font-extrabold uppercase tracking-wider ${
                isDone 
                  ? 'text-emerald-700' 
                  : isCurrent 
                    ? 'text-emerald-800 font-black' 
                    : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {isFailed && (
        <div className="mt-5 flex justify-center">
          <span className="px-3.5 py-1 bg-rose-50 text-rose-700 text-xs font-extrabold rounded-full border border-rose-200 flex items-center gap-1.5">
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

  const headerTitle = isSellerView 
    ? `Sipariş #${selectedOrder?.orderNumber || orderId}` 
    : selectedOrder?.name || `Sipariş #${selectedOrder?.orderNumber || orderId}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
    >
      <div 
        className="w-full sm:max-w-5xl h-full sm:h-auto sm:max-h-[88vh] rounded-none sm:rounded-3xl border border-slate-200/80 shadow-2xl bg-slate-50 overflow-hidden flex flex-col relative"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between gap-4 bg-white shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {!isSellerView && isEditingName ? (
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <input 
                      type="text" 
                      value={orderName} 
                      onChange={e => setOrderName(e.target.value)} 
                      className="flex-1 px-3 py-1 text-xs font-extrabold text-slate-900 border border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white" 
                      placeholder={t("order_name", "Sipariş Adı")} 
                      maxLength={ORDER_LIMITS.ORDER_NAME_MAX_LENGTH} 
                      autoFocus 
                    />
                    <button onClick={handleSaveName} disabled={isSavingName} className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-700 transition">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={handleCancelEditName} disabled={isSavingName} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 id="modal-title" className="text-base font-black text-slate-900 tracking-tight truncate">
                      {headerTitle}
                    </h2>
                    {!isSellerView && selectedOrder?.name ? (
                      <span className="text-xs text-slate-500 font-mono font-bold">#{selectedOrder.orderNumber}</span>
                    ) : null}
                    {!isSellerView && selectedOrder && (
                      <button onClick={() => setIsEditingName(true)} className="p-1 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-700" title={t("edit_order_name")}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
              {selectedOrder && (
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${getOrderStatusIndicatorClass(selectedOrder.status)}`} />
                  <span className={`text-xs font-extrabold uppercase tracking-wide ${getStatusColor(selectedOrder.status)}`}>
                    {resolveEnumLabel(enums, 'orderStatuses', selectedOrder.status) || selectedOrder.status}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 font-semibold">{formatDateTime(selectedOrder.createdAt)}</span>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={onClose} 
            aria-label={t("close")} 
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-800 border border-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {isLoading ? (
            <OrderDetailsSkeleton />
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
              <h3 className="text-sm font-black text-slate-900 mb-1">Sipariş detayları yüklenemedi</h3>
              <p className="text-xs text-slate-500 mb-4">{error}</p>
              <button onClick={() => refetch()} className="px-4 py-2 bg-emerald-600 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition cursor-pointer">
                Tekrar Dene
              </button>
            </div>
          ) : selectedOrder ? (
            <div className="space-y-6">
              {/* Stepper */}
              <OrderCard>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">{t("tracking_progress", "Sipariş Durumu")}</h3>
                <CustomOrderStepper currentStatus={selectedOrder.status} deliveryMethod={selectedOrder.deliveryMethod} />
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-4 pt-3 border-t border-slate-100 flex justify-between">
                  <span>{t("last_update", "Son Güncelleme")}: {resolveEnumLabel(enums, 'orderStatuses', lastUpdate.status) || lastUpdate.status}</span>
                  {lastUpdate.updatedAt ? <span>{formatDateTime(lastUpdate.updatedAt)}</span> : null}
                </div>

                {isModifiable && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Hızlı İşlemler:
                    </span>
                    <button
                      type="button"
                      onClick={handleStartEditAddress}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition cursor-pointer shadow-2xs"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Adres Değiştir <ArrowRight className="w-3 h-3 text-emerald-600" />
                    </button>
                    <button
                      type="button"
                      onClick={handleStartEditNotes}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer shadow-2xs"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-500" /> Not Ekle / Düzenle <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                )}
              </OrderCard>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-6">
                  {selectedOrder.deliveryMethod === 'SAFE_MEETUP' && (
                    <MeetupHandoverSection order={selectedOrder} isSeller={isSellerView} onActionSuccess={onReviewSuccess} />
                  )}

                  {/* Items List */}
                  <OrderCard>
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Package2 className="w-4 h-4 text-emerald-600" />
                        {isSellerView ? 'Satılan Ürünler' : 'Sipariş Kalemleri'}
                      </h3>
                      <span className="text-xs text-slate-500 font-bold">
                        {orderItems.length} Ürün
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
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
                              className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0 relative cursor-pointer hover:opacity-80 transition"
                            >
                              <img src={item.listing?.imageUrl} className="w-full h-full object-cover" alt={item.listing?.title || 'Listing'} />
                              {(isFullyCancelled || isFullyRefunded) && (
                                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                                  <X className="w-5 h-5 text-white" />
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
                                  className="text-xs font-extrabold text-slate-900 line-clamp-1 cursor-pointer hover:text-emerald-700 transition"
                                >
                                  {item.listing?.title}
                                </h4>
                                {isFullyCancelled ? <StatusBadge label={t("cancelled", "İptal Edildi")} type="rose" /> : null}
                                {isFullyRefunded ? <StatusBadge label={t("refunded", "İade Edildi")} type="amber" /> : null}
                                {isPartiallyCancelled ? <StatusBadge label={t("partially_cancelled", "Kısmi İptal")} type="rose" /> : null}
                                {isPartiallyRefunded ? <StatusBadge label={t("partially_refunded", "Kısmi İade")} type="amber" /> : null}
                              </div>
                              <p className="text-xs text-slate-600 mt-1 font-bold">
                                {t("qty", "Adet")}: {item.quantity} × <span className="font-mono">{formatCurrency(item.unitPrice, selectedOrder.currency)}</span>
                                {isCancelled ? <span className="ml-2 text-rose-600">({item.cancelledQuantity} İptal)</span> : null}
                                {isRefunded ? <span className="ml-2 text-amber-600">({item.refundedQuantity} İade)</span> : null}
                              </p>
                              {!isSellerView && (
                                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                                  {t("seller", "Satıcı")}: <span className="font-bold text-slate-800">{[item.sellerName, item.sellerSurname].filter(Boolean).join(' ') || '—'}</span>
                                </p>
                              )}
                              {item.campaignName ? (
                                <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold rounded-md border border-emerald-200">
                                  {t("promo", "Kampanya")}: {item.campaignName}
                                </span>
                              ) : null}

                              {(item.cancelReason || item.refundReason) && (
                                <div className="mt-2 space-y-1.5">
                                  {item.cancelReason && (
                                    <div className="flex items-start gap-1.5 p-2 rounded-xl bg-rose-50 border border-rose-200">
                                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-xs font-black text-rose-700 leading-tight">{t("cancellation")}: {getCancelRefundReasonLabel(item.cancelReason)}</p>
                                        {item.cancelReasonText && (
                                          <p className="text-xs text-rose-600 mt-0.5 italic break-words">"{item.cancelReasonText}"</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {item.refundReason && (
                                    <div className="flex items-start gap-1.5 p-2 rounded-xl bg-amber-50 border border-amber-200">
                                      <RefundIcon className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-xs font-black text-amber-700 leading-tight">{t("refund")}: {getCancelRefundReasonLabel(item.refundReason)}</p>
                                        {item.refundReasonText && (
                                          <p className="text-xs text-amber-600 mt-0.5 italic break-words">"{item.refundReasonText}"</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="text-right flex flex-col justify-between items-end shrink-0">
                              <span className="text-xs font-black text-slate-900 font-mono">
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

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Buyer details for seller view */}
                  {isSellerView && (
                    <OrderCard>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">{t("buyer", "Müşteri Bilgileri")}</h3>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 truncate">
                            {selectedOrder.buyerName || selectedOrder.buyerSurname ? `${selectedOrder.buyerName || ''} ${selectedOrder.buyerSurname || ''}`.trim() : `Kullanıcı #${selectedOrder.userId}`}
                          </div>
                          {selectedOrder.buyerEmail && (
                            <div className="text-[11px] text-slate-500 mt-0.5 truncate flex items-center gap-1">
                              <Mail className="w-3 h-3 shrink-0" />
                              {selectedOrder.buyerEmail}
                            </div>
                          )}
                          {selectedOrder.buyerPhone && (
                            <div className="text-[11px] text-slate-500 mt-0.5 truncate flex items-center gap-1 font-mono font-bold">
                              <Phone className="w-3 h-3 shrink-0" />
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
            <div className="text-center py-12 text-slate-400 font-bold">Sipariş bulunamadı</div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 z-20">
          <div>
            {!isLoading && selectedOrder && onOpenReceipt && (
              <button 
                type="button" 
                onClick={() => onOpenReceipt(selectedOrder)} 
                className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                {t("view_invoice", "Faturayı Görüntüle")}
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {!isLoading && selectedOrder && !isSellerView && (
              <>
                {isCancellableStatus(selectedOrder.status, enums) && (
                  <button onClick={() => setCancelModalOpen(true)} className="px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition cursor-pointer">
                    {t("cancel_order", "Siparişi İptal Et")}
                  </button>
                )}
                {isRefundableStatus(selectedOrder.status, enums) && (
                  <>
                    <button onClick={() => setRefundModalOpen(true)} className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer">
                      <RotateCcw className="w-4 h-4 inline mr-1" />{t("request_refund", "İade Talebi")}
                    </button>
                    <button onClick={handleCompleteOrder} disabled={isProcessing} className="px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition disabled:opacity-40 shadow-xs cursor-pointer">
                      <CheckCircle className="w-4 h-4 inline mr-1" />{t("approve_complete", "Onayla & Tamamla")}
                    </button>
                  </>
                )}
              </>
            )}

            <button 
              onClick={onClose} 
              className="px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer"
            >
              {t("close", "Kapat")}
            </button>
          </div>
        </div>

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