import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState } from 'react';
import { formatCurrency, formatDateTime, resolveEnumLabel } from '../../common/formatters.js';
import { ReviewButton } from '../../reviews/index.js';
import { getLastUpdateInfo, getStatusColor, isCancellableStatus, isModifiableStatus, isRefundableStatus } from '../orderConstants.js';
import { ORDER_LIMITS, ORDER_STATUSES, ORDER_VIEW_MODES } from '../constants/orderUiConstants.js';
import { getOrderStatusIndicatorClass, getPaymentStatusIndicatorClass, getPaymentStatusTextClass } from '../utils/statusPresentation.js';
import { DeliveryCountdown, OrderProgressStepper } from './orderDetails/OrderTimeline.jsx';
import { AddressSection, NotesSection } from './orderDetails/OrderEditableSections.jsx';
import { ShippingDetailsSection } from './orderDetails/ShippingDetailsSection.jsx';
import { ShipOrderForm } from './orderDetails/ShipOrderForm.jsx';
import { OrderPaymentSummary } from './orderDetails/OrderPaymentSummary.jsx';
import { useOrderDetailActions } from '../hooks/useOrderDetailActions.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useEnums } from '../../common/hooks/useEnums.js';
import useAddresses from '../../user/hooks/useAddresses.js';
import { Check, CheckCircle, MapPin, Package, Package2, Pencil, RotateCcw, User, X } from 'lucide-react';
import CancelRefundModal from './CancelRefundModal.jsx';
import { getCancelRefundReasonLabel } from '../../common/enums/cancelRefundReasons.js';
import { AlertCircle, RotateCcw as RefundIcon } from 'lucide-react';
const StatusBadge = ({
  label,
  type = 'rose'
}) => {
  const {
    t
  } = useTranslation();
  const styles = {
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700'
  };
  return <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md border ${styles[type]}`}>{label}</span>;
};
const GlassCard = React.memo(({
  children,
  className = '',
  critical = false
}) => <div className={`rounded-3xl border transition-all duration-300 ${critical ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-800 shadow-lg' : 'bg-white/60 backdrop-blur-lg border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]'} ${className}`}>
    {children}
  </div>);
GlassCard.displayName = 'GlassCard';
import { orderService } from '../services/orderService.js';
import apiClient from '../../common/services/api/interceptors.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
const MeetupHandoverSection = ({
  order,
  isSeller,
  onActionSuccess
}) => {
  const {
    t
  } = useTranslation();
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
  }, [order.verificationLockedUntil]);

  // QR expiration countdown (5 mins)
  const [qrCountdown, setQrCountdown] = useState(300);
  useEffect(() => {
    if (!isSeller && order.status === 'MEETUP_PENDING') {
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
  }, [order.status, isSeller]);

  // Authenticated dynamic QR Code fetching
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [qrFetchTrigger, setQrFetchTrigger] = useState(0);
  useEffect(() => {
    let url = '';
    if (order.status === 'MEETUP_PENDING' && !isSeller) {
      const fetchQrCode = async () => {
        setIsQrLoading(true);
        try {
          const response = await apiClient.get(API_ENDPOINTS.ORDERS.GET_MEETUP_QR(order.orderNumber), {
            responseType: 'blob'
          });
          url = URL.createObjectURL(response.data);
          setQrImageUrl(url);
        } catch (err) {
          console.error('Failed to load QR code image', err);
        } finally {
          setIsQrLoading(false);
        }
      };
      fetchQrCode();
    }
    return () => {
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
  return <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/20 to-violet-50/20 p-6 shadow-sm mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
      <div className="flex items-center gap-3 border-b border-indigo-100/50 pb-4 mb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shadow-sm">
          <MapPin className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{t("elden_g_venli_teslimat_detaylar")}</h3>
          <p className="text-xs text-slate-500">{t("g_venli_bulu_ma_noktas_nda_y_z_y_ze_al_v")}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("bulu_ma_konumu")}</span>
          <span className="mt-1 block text-sm font-semibold text-slate-800">{order.meetupLocation || 'Belirtilmedi'}</span>
        </div>

        {/* Contact Info Card */}
        <div className="p-3 bg-white rounded-xl border border-indigo-100/50 shadow-sm flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shadow-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("i_leti_im_bilgileri")}</span>
            {isSeller ? <p className="text-xs font-semibold text-slate-800 mt-0.5">{t("al_c")}{order.buyerName} {order.buyerSurname} <span className="text-emerald-600 ml-1">📞 {order.buyerPhone || 'Telefon Yok'}</span>
              </p> : <p className="text-xs font-semibold text-slate-800 mt-0.5">{t("sat_c")}{order.sellerFullName || 'Satıcı'} <span className="text-emerald-600 ml-1">📞 {order.sellerPhone || 'Telefon Yok'}</span>
              </p>}
          </div>
        </div>

        {order.status === 'MEETUP_PENDING' && <>
            {!isSeller ?
        // BUYER VIEW IN MEETUP_PENDING
        <div className="bg-white rounded-2xl border border-indigo-100/60 p-5 flex flex-col items-center justify-center text-center shadow-inner">
                <span className="block text-xs font-bold text-indigo-700 uppercase tracking-widest mb-3">{t("sat_c_ya_g_sterilecek_qr_ve_pin")}</span>
                {qrCountdown > 0 ? <>
                    <div className="relative p-3 bg-white rounded-xl border border-slate-100 shadow-sm mb-4">
                      {isQrLoading ? <div className="w-[150px] h-[150px] flex items-center justify-center bg-slate-50 rounded-lg">
                          <span className="text-xs text-slate-400">{t("y_kleniyor")}</span>
                        </div> : qrImageUrl ? <img src={qrImageUrl} alt={t("meetup_qr_code")} className="w-[150px] h-[150px]" /> : <div className="w-[150px] h-[150px] flex items-center justify-center bg-rose-50 rounded-lg border border-rose-100">
                          <span className="text-xs text-rose-500 text-center px-2">{t("qr_y_klenemedi")}</span>
                        </div>}
                    </div>
                    <span className="block text-[28px] font-extrabold tracking-[0.25em] text-slate-900 mb-1 font-mono">
                      {order.meetupVerificationCode || '------'}
                    </span>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 mt-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />{t("yenilenme_s_resi")}{formatTime(qrCountdown)}
                    </p>

                    {/* Buyer Manual Confirmation Option inside MEETUP_PENDING */}
                    <div className="mt-5 pt-4 border-t border-slate-100 w-full text-left">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t("alternatif_teslimat_onay")}</span>
                      <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">{t("e_er_sat_c_do_rulama_kodunu_sisteme_gire")}</p>
                      <div className="space-y-3">
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                          <input type="checkbox" checked={confirmCheckbox} onChange={e => setConfirmCheckbox(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20" />
                          <span className="text-[11px] font-semibold text-slate-700 leading-normal">{t("r_n_elden_teslim_ald_m_ve_i_lemi_tamamla")}</span>
                        </label>

                        <button type="button" onClick={handleConfirmCompletion} disabled={isConfirming || !confirmCheckbox} className="w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-slate-950 hover:bg-black transition disabled:opacity-50 shadow-sm">
                          {isConfirming ? 'İşlem Tamamlanıyor...' : 'Teslim Aldım & Onayla'}
                        </button>
                        {confirmError && <p className="text-[10px] text-rose-500 font-semibold mt-1">{confirmError}</p>}
                      </div>
                    </div>
                  </> : <div className="py-6">
                    <p className="text-sm text-slate-500 mb-3">{t("qr_kod_ve_pin_kodunun_s_resi_doldu")}</p>
                    <button type="button" onClick={handleRegenerateCode} className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">{t("kodu_yenile")}</button>
                  </div>}
              </div> :
        // SELLER VIEW IN MEETUP_PENDING
        <div className="bg-white rounded-2xl border border-indigo-100/60 p-5 shadow-inner">
                <span className="block text-xs font-bold text-indigo-700 uppercase tracking-widest mb-4">{t("al_c_do_rulama_kodu")}</span>
                
                {order.verificationLockedUntil && lockCountdown > 0 ? <div className="text-center py-4 bg-rose-50 border border-rose-100 rounded-xl">
                    <p className="text-xs font-bold text-rose-700 uppercase tracking-wide">{t("do_rulama_ge_ici_olarak_kilitlendi")}</p>
                    <p className="text-xs text-rose-500 mt-1">{t("l_tfen")}{formatTime(lockCountdown)}{t("dakika_sonra_tekrar_deneyin")}</p>
                  </div> : <form onSubmit={handleVerify} className="space-y-3">
                    <p className="text-xs text-slate-500">{t("al_c_n_n_ekran_ndaki_6_haneli_kodu_veya_")}</p>
                    <div className="flex gap-2">
                      <input type="text" value={pinCode} onChange={e => setPinCode(e.target.value.replace(/\D/g, '').substring(0, 6))} className="flex-1 px-4 py-2.5 text-sm font-semibold tracking-[0.2em] font-mono text-center border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 bg-white shadow-sm" placeholder="000000" maxLength={6} disabled={isVerifying} />
                      <button type="submit" disabled={isVerifying || pinCode.length !== 6} className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
                        {isVerifying ? 'Doğrulanıyor...' : 'Kodu Doğrula'}
                      </button>
                    </div>
                    {verifyError && <p className="text-xs text-rose-500 font-semibold">{verifyError}</p>}
                  </form>}
              </div>}
          </>}

        {order.status === 'HANDOVER_CONFIRMED' && <div className="bg-white rounded-2xl border border-indigo-100/60 p-5 shadow-inner">
            <span className="block text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />{t("r_n_teslimat_do_ruland")}</span>
            <p className="text-xs text-slate-500 mb-4">{t("r_n_elden_teslim_ald_n_z_veya_teslim_ett")}</p>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={confirmCheckbox} onChange={e => setConfirmCheckbox(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20" />
                <span className="text-xs font-medium text-slate-800 leading-normal">{t("r_n_n_elden_teslim_edildi_ini_ve_i_lemi_")}</span>
              </label>

              <button type="button" onClick={handleConfirmCompletion} disabled={isConfirming || !confirmCheckbox} className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-slate-900 rounded-xl hover:bg-black transition disabled:opacity-50 shadow-sm">
                {isConfirming ? 'Tamamlanıyor...' : 'Siparişi Tamamla'}
              </button>
              {confirmError && <p className="text-xs text-rose-500 font-semibold mt-1">{confirmError}</p>}
            </div>
          </div>}

        {order.status === 'COMPLETED' && <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="block text-xs font-bold text-emerald-700 uppercase tracking-wider">{t("i_lem_tamamland")}</span>
              <p className="text-xs text-slate-500 mt-1">{t("elden_g_venli_teslimat_ba_ar_yla_tamamla")}</p>
              {order.completedAt && <p className="text-[10px] text-slate-400 mt-2 font-medium">
                  {order.completedByUserName ? `Onaylayan: ${order.completedByUserName}` : 'Sistem tarafından otomatik onaylandı'}
                  {` — ${formatDateTime(order.completedAt)}`}
                </p>}
            </div>
          </div>}
      </div>
    </div>;
};
const OrderDetailsModal = React.memo(({
  isOpen,
  selectedOrder,
  onClose,
  onOpenReceipt,
  viewMode = ORDER_VIEW_MODES.BUYER,
  orderReviews = {},
  reviewsLoading = false,
  onReviewSuccess
}) => {
  const isSellerView = viewMode === ORDER_VIEW_MODES.SELLER;
  const {
    enums
  } = useEnums();
  const notification = useNotification();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [orderName, setOrderName] = useState(selectedOrder?.name || '');

  // --- Address editing state ---
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState(null);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState(null);

  // --- Notes editing state ---
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [orderNotes, setOrderNotes] = useState(selectedOrder?.notes || '');
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
    onReviewSuccess,
    notification,
    setIsEditingName,
    setOrderName,
    setIsEditingAddress,
    setIsEditingNotes
  });
  const isModifiable = !isSellerView && isModifiableStatus(selectedOrder?.status, enums);
  const {
    addresses,
    loading: addressesLoading
  } = useAddresses({
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
  if (!isOpen || !selectedOrder) return null;
  const headerTitle = isSellerView ? `Order #${selectedOrder.orderNumber}` : selectedOrder.name || `Order #${selectedOrder.orderNumber}`;
  const stepperVariant = isSellerView ? 'wide' : 'compact';
  return <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300`} style={{
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  }}>
        <div className={`w-full ${isSellerView ? 'max-w-5xl' : 'max-w-6xl'} max-h-[92vh] rounded-[2rem] border border-white/40 shadow-2xl shadow-indigo-900/20 bg-[#f8fafc]/95 backdrop-blur-xl overflow-hidden flex flex-col relative`}>
          {/* Decorative glows inside the modal */}
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-indigo-400/5 blur-[80px] rounded-full pointer-events-none mix-blend-multiply" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-violet-400/5 blur-[60px] rounded-full pointer-events-none mix-blend-multiply" />

          <div className="relative z-10 px-6 sm:px-8 py-5 bg-white/60 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-11 h-11 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap mb-0.5">
                  {!isSellerView && isEditingName ? <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                      <input type="text" value={orderName} onChange={e => setOrderName(e.target.value)} className="flex-1 px-3 py-1.5 text-sm font-semibold text-slate-900 border border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 bg-white shadow-sm" placeholder={t("order_name")} maxLength={ORDER_LIMITS.ORDER_NAME_MAX_LENGTH} autoFocus />
                      <button onClick={handleSaveName} disabled={isSavingName} className="p-2 hover:bg-indigo-50 rounded-xl transition-colors text-indigo-600 disabled:opacity-50">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={handleCancelEditName} disabled={isSavingName} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 disabled:opacity-50">
                        <X className="w-4 h-4" />
                      </button>
                    </div> : <>
                      <h2 className="text-lg font-bold text-slate-900 tracking-tight truncate">
                        {headerTitle}
                      </h2>
                      {!isSellerView && selectedOrder.name ? <span className="text-sm text-slate-400 font-medium">#{selectedOrder.orderNumber}</span> : null}
                      {!isSellerView ? <button onClick={() => setIsEditingName(true)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-300 hover:text-slate-500" title={t("edit_order_name")}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button> : null}
                    </>}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${getOrderStatusIndicatorClass(selectedOrder.status)}`} />
                  <span className={`text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {resolveEnumLabel(enums, 'orderStatuses', selectedOrder.status) || selectedOrder.status}
                  </span>
                  <span className="text-slate-200">·</span>
                  <span className="text-xs text-slate-400 font-medium">{formatDateTime(selectedOrder.createdAt)}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
            <div className={`${isSellerView ? 'p-8' : 'p-6 sm:p-8'}`}>
              <GlassCard className={`p-6 mb-8`}>
                <h3 className={`${isSellerView ? 'text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4' : 'text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-5'}`}>{t("tracking_progress")}</h3>
                <OrderProgressStepper currentStatus={selectedOrder.status} deliveryMethod={selectedOrder.deliveryMethod} variant={stepperVariant} />
                <div className={`${isSellerView ? 'text-xs text-slate-500' : 'text-xs text-slate-500 font-medium'} mt-2`}>{t("last_update")}{resolveEnumLabel(enums, 'orderStatuses', lastUpdate.status) || lastUpdate.status}
                  {lastUpdate.updatedAt ? ` • ${formatDateTime(lastUpdate.updatedAt)}` : ''}
                </div>

                {!isSellerView && selectedOrder.status === ORDER_STATUSES.DELIVERED && selectedOrder.shipping?.deliveredAt ? <DeliveryCountdown deliveredAt={selectedOrder.shipping.deliveredAt} /> : null}

                {!isSellerView ? <div className="mt-6 flex justify-center gap-3">
                    {isCancellableStatus(selectedOrder.status, enums) ? <button onClick={() => setCancelModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition-all">
                        <X className="w-4 h-4" />{t("cancel_order")}</button> : null}
                    {isRefundableStatus(selectedOrder.status, enums) ? <>
                        <button onClick={handleCompleteOrder} disabled={isProcessing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                          <CheckCircle className="w-4 h-4" />{t("approve_complete")}</button>
                        <button onClick={() => setRefundModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
                          <RotateCcw className="w-4 h-4" />{t("request_refund")}</button>
                      </> : null}
                  </div> : null}
              </GlassCard>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {selectedOrder.deliveryMethod === 'SAFE_MEETUP' && <MeetupHandoverSection order={selectedOrder} isSeller={isSellerView} onActionSuccess={onReviewSuccess} />}

                  <GlassCard className={`p-6`}>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className={`${isSellerView ? 'text-sm font-semibold text-slate-900 flex items-center gap-2' : 'text-xs font-semibold text-gray-900 flex items-center gap-2'}`}>
                        <Package2 className={`${isSellerView ? 'w-4 h-4 text-indigo-500' : 'w-3.5 h-3.5 text-gray-600'}`} />{' '}
                        {isSellerView ? 'Sold Items' : 'Order Items'}
                      </h3>
                      <span className={`${isSellerView ? 'text-xs text-slate-400 font-normal' : 'text-[10px] text-gray-500 font-medium'}`}>
                        {orderItems.length} {orderItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className={`${isSellerView ? 'divide-y divide-slate-50' : 'divide-y divide-gray-100'}`}>
                      {orderItems.map((item, idx) => {
                    const isCancelled = item.cancelledQuantity && item.cancelledQuantity > 0;
                    const isRefunded = item.refundedQuantity && item.refundedQuantity > 0;
                    const isFullyCancelled = isCancelled && item.cancelledQuantity >= item.quantity;
                    const isFullyRefunded = isRefunded && item.refundedQuantity >= item.quantity;
                    const isPartiallyCancelled = isCancelled && item.cancelledQuantity < item.quantity;
                    const isPartiallyRefunded = isRefunded && item.refundedQuantity < item.quantity;
                    const rawOi = item?.id ?? item?.orderItemId;
                    const reviewKey = rawOi === undefined || rawOi === null || rawOi === '' ? null : String(rawOi);
                    return <div key={reviewKey || `row-${idx}`} className={`py-4 first:pt-0 last:pb-0 flex gap-3 ${isFullyCancelled || isFullyRefunded ? 'opacity-60' : ''}`}>
                            <div className={`${isSellerView ? 'w-20 h-20 rounded-xl border border-slate-100 bg-slate-50' : 'w-16 h-16 rounded-lg border border-gray-200/60 bg-gray-50'} overflow-hidden flex-shrink-0 relative`}>
                              <img src={item.listing?.imageUrl} className="w-full h-full object-cover" alt={item.listing?.title || 'Listing'} />
                              {isFullyCancelled || isFullyRefunded ? <div className={`absolute inset-0 ${isSellerView ? 'bg-slate-900/40' : 'bg-gray-900/40'} flex items-center justify-center`}>
                                  <X className={`${isSellerView ? 'w-6 h-6' : 'w-5 h-5'} text-white`} />
                                </div> : null}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`${isSellerView ? 'text-sm font-semibold text-slate-900' : 'text-xs font-semibold text-gray-900'} line-clamp-1`}>
                                  {item.listing?.title}
                                </h4>
                                {isFullyCancelled ? <StatusBadge label={t("cancelled")} type="rose" /> : null}
                                {isFullyRefunded ? <StatusBadge label={t("refunded")} type="amber" /> : null}
                                {isPartiallyCancelled ? <StatusBadge label={t("partially_cancelled")} type="rose" /> : null}
                                {isPartiallyRefunded ? <StatusBadge label={t("partially_refunded")} type="amber" /> : null}
                              </div>
                              <p className={`${isSellerView ? 'text-xs text-slate-500 mt-1 font-normal' : 'text-[11px] text-gray-600 mt-1 font-medium'}`}>{t("qty")}{item.quantity} × {formatCurrency(item.unitPrice, selectedOrder.currency)}
                                {isCancelled ? <span className="ml-2 text-rose-600">({item.cancelledQuantity}{t("cancelled")}</span> : null}
                                {isRefunded ? <span className="ml-2 text-amber-600">({item.refundedQuantity}{t("refunded")}</span> : null}
                              </p>
                              {!isSellerView ? <p className="text-[11px] text-gray-600 mt-1 font-medium">{t("seller")}{' '}
                                  <span className="font-semibold">
                                    {[item.sellerName, item.sellerSurname].filter(Boolean).join(' ') || '—'}
                                  </span>
                                </p> : null}
                              {item.campaignName ? <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 ${isSellerView ? 'bg-emerald-50 text-emerald-600 font-semibold' : 'bg-emerald-50/80 text-emerald-600 font-medium border border-emerald-200/60'} rounded-md`}>{t("promo")}{item.campaignName}
                                </span> : null}

                              {/* Cancellation/Refund Reasons */}
                              {(item.cancelReason || item.refundReason) && <div className="mt-2 space-y-1.5">
                                  {item.cancelReason && <div className={`flex items-start gap-1.5 p-2 rounded-lg ${isSellerView ? 'bg-rose-50/50' : 'bg-rose-50/80'} border border-rose-100`}>
                                      <AlertCircle className="w-3 h-3 text-rose-500 mt-0.5 flex-shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-semibold text-rose-700 leading-tight">{t("cancellation")}{getCancelRefundReasonLabel(item.cancelReason)}
                                        </p>
                                        {item.cancelReasonText && <p className="text-[10px] text-rose-600 mt-0.5 italic leading-tight break-words">
                                            "{item.cancelReasonText}"
                                          </p>}
                                      </div>
                                    </div>}
                                  {item.refundReason && <div className={`flex items-start gap-1.5 p-2 rounded-lg ${isSellerView ? 'bg-amber-50/50' : 'bg-amber-50/80'} border border-amber-100`}>
                                      <RefundIcon className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-semibold text-amber-700 leading-tight">{t("refund")}{getCancelRefundReasonLabel(item.refundReason)}
                                        </p>
                                        {item.refundReasonText && <p className="text-[10px] text-amber-600 mt-0.5 italic leading-tight break-words">
                                            "{item.refundReasonText}"
                                          </p>}
                                      </div>
                                    </div>}
                                </div>}
                            </div>
                            <div className="text-right flex flex-col justify-between items-end flex-shrink-0">
                              <span className={`${isSellerView ? 'text-sm font-semibold text-slate-900' : 'text-xs font-semibold text-gray-900'}`}>
                                {formatCurrency(item.totalPrice, selectedOrder.currency)}
                              </span>
                              {!isSellerView ? <ReviewButton key={reviewKey || `rev-${idx}`} orderItem={item} existingReview={reviewKey ? orderReviews[reviewKey] : null} reviewsLoading={reviewsLoading} skipIndividualFetch onReviewCreated={onReviewSuccess} orderStatus={selectedOrder.status} /> : null}
                            </div>
                          </div>;
                  })}
                    </div>
                  </GlassCard>

                  {selectedOrder.shipping && <ShippingDetailsSection shipping={selectedOrder.shipping} deliveryAddress={selectedOrder.shippingAddress} CardComponent={GlassCard} internalTracking={{
                orderId: selectedOrder.id,
                isSellerView,
                onBeforeNavigate: onClose
              }} />}

                  {isSellerView && (selectedOrder.status === 'CONFIRMED' || selectedOrder.status === 'PROCESSING') && <ShipOrderForm carriers={enums.carriers || []} isProcessing={isProcessing} onShip={handleShipOrder} CardComponent={GlassCard} />}

                  {!isSellerView ? <>
                      <AddressSection CardComponent={GlassCard} isEditingAddress={isEditingAddress} addressesLoading={addressesLoading} addresses={addresses} selectedShippingAddressId={selectedShippingAddressId} selectedBillingAddressId={selectedBillingAddressId} setSelectedShippingAddressId={setSelectedShippingAddressId} setSelectedBillingAddressId={setSelectedBillingAddressId} handleSaveAddress={handleSaveAddress} handleCancelEditAddress={handleCancelEditAddress} handleStartEditAddress={handleStartEditAddress} isSavingAddress={isSavingAddress} selectedOrder={selectedOrder} isModifiable={isModifiable} />

                      <NotesSection CardComponent={GlassCard} isEditingNotes={isEditingNotes} orderNotes={orderNotes} setOrderNotes={setOrderNotes} handleSaveNotes={handleSaveNotes} handleCancelEditNotes={handleCancelEditNotes} handleStartEditNotes={handleStartEditNotes} isSavingNotes={isSavingNotes} selectedOrder={selectedOrder} isModifiable={isModifiable} />
                    </> : null}
                </div>

                <div className="space-y-4">
                  {isSellerView ? <GlassCard className="p-6">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">{t("buyer")}</h3>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {selectedOrder.buyerName || selectedOrder.buyerSurname ? `${selectedOrder.buyerName || ''} ${selectedOrder.buyerSurname || ''}`.trim() : `User #${selectedOrder.userId}`}
                          </div>
                          {selectedOrder.buyerEmail ? <div className="text-xs text-slate-500 mt-0.5 truncate">{selectedOrder.buyerEmail}</div> : null}
                        </div>
                      </div>
                    </GlassCard> : null}

                  <OrderPaymentSummary CardComponent={GlassCard} isSellerView={isSellerView} selectedOrder={selectedOrder} sellerTotalAmount={sellerTotalAmount} onOpenReceipt={onOpenReceipt} resolveEnumLabel={(group, value) => resolveEnumLabel(enums, group, value)} formatCurrency={formatCurrency} getPaymentStatusIndicatorClass={getPaymentStatusIndicatorClass} getPaymentStatusTextClass={getPaymentStatusTextClass} />
                </div>
              </div>
            </div>
          </div>

          {!isSellerView ? <>
              <CancelRefundModal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} onSubmit={handleCancelOrder} type="cancel" order={selectedOrder} />
              <CancelRefundModal isOpen={refundModalOpen} onClose={() => setRefundModalOpen(false)} onSubmit={handleRefundOrder} type="refund" order={selectedOrder} />
            </> : null}
        </div>
      </div>;
});
OrderDetailsModal.displayName = 'OrderDetailsModal';
export default OrderDetailsModal;