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
 rose: 'bg-rose-50 border-rose-200 text-rose-700',
 amber: 'bg-amber-50 border-amber-200 text-amber-800',
 success: 'bg-slate-100 border-slate-300 text-slate-900',
 };
 return (
 <span className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md border ${styles[type]}`}>
 {label}
 </span>
 );
};

const OrderCard = React.memo(({ children, className = '' }) => (
 <div className={`bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 transition-all duration-200 hover:border-slate-300 hover:shadow-sm ${className}`}>
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
 <div className="rounded-3xl border-2 border-slate-700/40 bg-slate-100/20 p-6 shadow-xs mb-6 relative overflow-hidden">
 <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-4">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
 <MapPin className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm font-extrabold text-slate-900">{t("elden_g_venli_teslimat_detaylar", "Elden Güvenli Buluşma")}</h3>
 <p className="text-xs text-slate-500 font-medium">{t("g_venli_bulu_ma_noktas_nda_y_z_y_ze_al_v", "Güvenli buluşma noktasında yüz yüze teslimat ve PIN doğrulama.")}</p>
 </div>
 </div>

 <div className="space-y-4">
 <div>
 <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">{t("bulu_ma_konumu", "Buluşma Konumu")}</span>
 <span className="mt-1 block text-sm font-extrabold text-slate-900">📍 {order.meetupLocation || 'Belirtilmedi'}</span>
 </div>

 {/* Contact Info Card */}
 <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-900">
 <Phone className="w-4 h-4" />
 </div>
 <div>
 <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("i_leti_im_bilgileri", "İletişim Bilgileri")}</span>
 {isSeller ? (
 <p className="text-xs font-bold text-slate-900 mt-0.5">
 Alıcı: {order.buyerName} {order.buyerSurname} <span className="text-slate-900 ml-1.5 font-bold">📞 {order.buyerPhone || 'Telefon Yok'}</span>
 </p>
 ) : (
 <p className="text-xs font-bold text-slate-900 mt-0.5">
 Satıcı: {order.sellerFullName || 'Satıcı'} <span className="text-slate-900 ml-1.5 font-bold">📞 {order.sellerPhone || 'Telefon Yok'}</span>
 </p>
 )}
 </div>
 </div>

 {order.status === 'MEETUP_PENDING' && (
 <>
 {!isSeller ? (
 // BUYER VIEW IN MEETUP_PENDING
 <div className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col items-center justify-center text-center shadow-xs">
 <span className="block text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-3">
 {t("sat_c_ya_g_sterilecek_qr_ve_pin", "Satıcıya Gösterilecek Doğrulama PIN Kodu")}
 </span>
 {qrCountdown > 0 ? (
 <>
 <div className="relative p-3 bg-white rounded-2xl border border-slate-200 shadow-xs mb-4">
 {isQrLoading ? (
 <div className="w-[150px] h-[150px] flex items-center justify-center bg-slate-50 rounded-xl">
 <span className="text-xs text-slate-400 font-medium">{t("y_kleniyor", "Yükleniyor...")}</span>
 </div>
 ) : qrImageUrl ? (
 <img src={qrImageUrl} alt={t("meetup_qr_code", "QR Kod")} className="w-[150px] h-[150px] rounded-lg" />
 ) : (
 <div className="w-[150px] h-[150px] flex items-center justify-center bg-rose-50 rounded-xl border border-rose-100">
 <span className="text-xs text-rose-700 text-center px-2 font-semibold">{t("qr_y_klenemedi", "QR Yüklenemedi")}</span>
 </div>
 )}
 </div>
 <span className="block text-3xl font-extrabold tracking-[0.25em] text-slate-900 mb-1 ">
 {order.meetupVerificationCode || '------'}
 </span>
 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-2">
 <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse" />
 Kalan Süre: <span className="text-slate-900 font-extrabold">{formatTime(qrCountdown)}</span>
 </p>

 {/* Buyer Manual Confirmation */}
 <div className="mt-6 pt-5 border-t border-slate-100 w-full text-left">
 <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Alternatif Teslimat Onayı</span>
 <p className="text-xs text-slate-500 mb-3 leading-relaxed font-medium">
 Satıcı kodu sisteme giremezse, ürünü teslim aldıktan sonra doğrudan buradan onaylayabilirsiniz.
 </p>
 <div className="space-y-3">
 <label className="flex items-start gap-2.5 cursor-pointer select-none">
 <input type="checkbox" checked={confirmCheckbox} onChange={e => setConfirmCheckbox(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
 <span className="text-xs font-semibold text-slate-800 leading-normal">Ürünü elden eksiksiz teslim aldım ve işlemi tamamlamak istiyorum.</span>
 </label>

 <button type="button" onClick={handleConfirmCompletion} disabled={isConfirming || !confirmCheckbox} className="w-full py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-900 transition disabled:bg-slate-200 disabled:text-slate-400 shadow-xs active:scale-[0.98]">
 {isConfirming ? 'İşlem Tamamlanıyor...' : 'Teslim Aldım & Onayla'}
 </button>
 {confirmError && <p className="text-xs text-rose-600 font-semibold mt-1">{confirmError}</p>}
 </div>
 </div>
 </>
 ) : (
 <div className="py-6">
 <p className="text-xs text-slate-600 font-semibold mb-3">Kodun geçerlilik süresi doldu.</p>
 <button type="button" onClick={handleRegenerateCode} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-slate-900 rounded-xl hover:bg-slate-900 shadow-xs transition">
 Kodu Yenile
 </button>
 </div>
 )}
 </div>
 ) : (
 // SELLER VIEW IN MEETUP_PENDING
 <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
 <span className="block text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-4">Alıcı Doğrulama Kodu Girişi</span>
 {order.verificationLockedUntil && lockCountdown > 0 ? (
 <div className="text-center py-4 bg-rose-50 border border-rose-200 rounded-xl">
 <p className="text-xs font-bold text-rose-700 uppercase tracking-wide">Doğrulama geçici olarak kilitlendi</p>
 <p className="text-xs text-rose-600 mt-1 font-bold">Lütfen {formatTime(lockCountdown)} sonra tekrar deneyin.</p>
 </div>
 ) : (
 <form onSubmit={handleVerify} className="space-y-3">
 <p className="text-xs text-slate-600 font-medium">Alıcının ekranındaki 6 haneli güvenlik PIN kodunu giriniz:</p>
 <div className="flex gap-2">
 <input type="text" value={pinCode} onChange={e => setPinCode(e.target.value.replace(/\D/g, '').substring(0, 6))} className="flex-1 px-4 py-2.5 text-base font-extrabold tracking-[0.25em] text-center border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 bg-white shadow-xs" placeholder="000000" maxLength={6} disabled={isVerifying} />
 <button type="submit" disabled={isVerifying || pinCode.length !== 6} className="px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white bg-slate-900 rounded-xl hover:bg-slate-900 transition disabled:bg-slate-200 disabled:text-slate-400 shadow-xs">
 {isVerifying ? 'Doğrulanıyor...' : 'Kodu Onayla'}
 </button>
 </div>
 {verifyError && <p className="text-xs text-rose-600 font-semibold">{verifyError}</p>}
 </form>
 )}
 </div>
 )}
 </>
 )}

 {order.status === 'HANDOVER_CONFIRMED' && (
 <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
 <span className="block text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-1.5">
 <span className="w-2.5 h-2.5 rounded-full bg-slate-900 animate-pulse" />
 Ürün Teslimatı Doğrulandı
 </span>
 <p className="text-xs text-slate-600 font-medium mb-4">Teslimat onaylandı. Siparişi tamamlayarak Escrow bakiyesini satıcıya aktarabilirsiniz.</p>

 <div className="space-y-3">
 <label className="flex items-start gap-3 cursor-pointer select-none">
 <input type="checkbox" checked={confirmCheckbox} onChange={e => setConfirmCheckbox(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
 <span className="text-xs font-semibold text-slate-800 leading-normal">Ürünün elden teslim edildiğini ve siparişin tamamlandığını onaylıyorum.</span>
 </label>

 <button type="button" onClick={handleConfirmCompletion} disabled={isConfirming || !confirmCheckbox} className="w-full py-3 text-xs font-extrabold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-900 rounded-xl transition disabled:bg-slate-200 disabled:text-slate-400 shadow-xs active:scale-[0.98]">
 {isConfirming ? 'Tamamlanıyor...' : 'Siparişi Tamamla'}
 </button>
 {confirmError && <p className="text-xs text-rose-600 font-semibold mt-1">{confirmError}</p>}
 </div>
 </div>
 )}

 {order.status === 'COMPLETED' && (
 <div className="bg-slate-100/80 border border-slate-300 rounded-2xl p-5 flex items-start gap-3.5">
 <CheckCircle className="h-5 w-5 text-slate-900 mt-0.5 flex-shrink-0" />
 <div>
 <span className="block text-xs font-extrabold text-slate-950 uppercase tracking-wider">İşlem Başarıyla Tamamlandı</span>
 <p className="text-xs text-slate-900 font-medium mt-0.5">Elden güvenli teslimat onaylandı ve ödeme satıcının cüzdanına aktarıldı.</p>
 {order.completedAt && (
 <p className="text-[11px] text-slate-900 mt-2 font-semibold">
 {order.completedByUserName ? `Onaylayan: ${order.completedByUserName}` : 'Sistem tarafından onaylandı'}
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
  const isMeetup = deliveryMethod === 'SAFE_MEETUP';
  const steps = isMeetup
    ? [
        { key: ORDER_STATUSES.PENDING, label: 'Sipariş Alındı' },
        { key: ORDER_STATUSES.MEETUP_PENDING, label: 'Buluşma Bekleniyor' },
        { key: ORDER_STATUSES.HANDOVER_CONFIRMED, label: 'Teslimat Doğrulandı' },
        { key: ORDER_STATUSES.COMPLETED, label: 'Tamamlandı' },
      ]
    : [
        { key: ORDER_STATUSES.PENDING, label: 'Sipariş Alındı' },
        { key: ORDER_STATUSES.CONFIRMED, label: 'Onaylandı' },
        { key: ORDER_STATUSES.PROCESSING, label: 'Hazırlanıyor' },
        { key: ORDER_STATUSES.SHIPPED, label: 'Kargoya Verildi' },
        { key: ORDER_STATUSES.DELIVERED, label: 'Teslim Edildi' },
      ];

  const isCompleted = currentStatus === ORDER_STATUSES.COMPLETED;
  const rawIndex = steps.findIndex(s => s.key === currentStatus);
  const currentIndex = isCompleted ? steps.length - 1 : (rawIndex !== -1 ? rawIndex : 0);
  const isFailed = currentStatus === ORDER_STATUSES.CANCELLED || currentStatus === ORDER_STATUSES.REFUNDED || currentStatus === ORDER_STATUSES.VERIFICATION_LOCKED;

  return (
    <div className="py-3">
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 z-0">
        {/* Connection Line */}
        <div className="absolute top-4 left-0 w-full h-[3px] bg-slate-100 z-0 hidden md:block" />
        <div
          className="absolute top-4 left-0 h-[3px] bg-slate-900 z-0 hidden md:block transition-all duration-500 ease-out"
          style={{ width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = isCompleted ? true : idx < currentIndex;
          const isCurrent = isCompleted ? idx === steps.length - 1 : idx === currentIndex;

          return (
            <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-0 w-full md:w-auto relative group z-10">
              <div className="relative bg-white rounded-full">
                {isCurrent && !isCompleted && (
                  <span className="absolute inset-0 rounded-full bg-slate-800/20 animate-ping opacity-70" aria-hidden />
                )}
                <div
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isDone
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-white border-2 border-slate-900 text-slate-900 ring-4 ring-slate-900/10 font-bold'
                      : 'bg-white border-slate-300 text-slate-400 font-semibold'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 stroke-[3px]" />
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>
              </div>
              <span className={`md:mt-3 text-[11px] font-bold uppercase tracking-wider ${
                isDone
                  ? 'text-slate-900 font-extrabold'
                  : isCurrent
                  ? 'text-slate-900 font-extrabold'
                  : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {isFailed && (
        <div className="mt-4 flex justify-center">
          <span className="px-3.5 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 flex items-center gap-1.5 shadow-xs">
            <AlertCircle className="w-4 h-4" /> Durum: {currentStatus}
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
 className="w-full sm:max-w-6xl h-full sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-3xl border border-slate-200 shadow-2xl bg-slate-50 overflow-hidden flex flex-col relative"
 >
 {/* Header (sticky at top) */}
 <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-white/95 backdrop-blur-md z-10 shrink-0">
 <div className="flex items-center gap-4 min-w-0">
 <div className="w-10 h-10 rounded-2xl border border-slate-200 bg-slate-100/80 flex items-center justify-center shrink-0">
 <Package className="w-5 h-5 text-slate-700" />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2.5 flex-wrap mb-0.5">
 {!isSellerView && isEditingName ? (
 <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
 <input type="text" value={orderName} onChange={e => setOrderName(e.target.value)} className="flex-1 px-3 py-1.5 text-xs font-semibold text-slate-900 border border-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 bg-white shadow-xs" placeholder={t("order_name")} maxLength={ORDER_LIMITS.ORDER_NAME_MAX_LENGTH} autoFocus />
 <button onClick={handleSaveName} disabled={isSavingName} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-900 disabled:opacity-50">
 <Check className="w-4 h-4" />
 </button>
 <button onClick={handleCancelEditName} disabled={isSavingName} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 disabled:opacity-50">
 <X className="w-4 h-4" />
 </button>
 </div>
 ) : (
 <>
 <h2 id="modal-title" className="text-base font-extrabold text-slate-900 tracking-tight truncate">
 {headerTitle}
 </h2>
 {!isSellerView && selectedOrder?.name ? <span className="text-xs text-slate-400 font-bold">#{selectedOrder.orderNumber}</span> : null}
 {!isSellerView && selectedOrder && (
 <button onClick={() => setIsEditingName(true)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700" title={t("edit_order_name")}>
 <Pencil className="w-3.5 h-3.5" />
 </button>
 )}
 </>
 )}
 </div>
 {selectedOrder && (
 <div className="flex items-center gap-2 flex-wrap">
 <div className={`w-2 h-2 rounded-full shrink-0 ${getOrderStatusIndicatorClass(selectedOrder.status)}`} />
 <span className={`text-[11px] font-bold uppercase tracking-wider ${getStatusColor(selectedOrder.status)}`}>
 {resolveEnumLabel(enums, 'orderStatuses', selectedOrder.status) || selectedOrder.status}
 </span>
 <span className="text-slate-300">•</span>
 <span className="text-xs text-slate-500 font-semibold">{formatDateTime(selectedOrder.createdAt)}</span>
 </div>
 )}
 </div>
 </div>
 <button onClick={onClose} aria-label={t("close")} className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-700 border border-slate-200">
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Scrollable Modal Content */}
 <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50">
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
 <div
 onClick={() => {
 if (item.listing?.id) {
 navigate(ROUTES.LISTING_DETAIL(item.listing.id));
 onClose();
 }
 }}
 className="w-16 h-16 rounded-lg border border-border-light bg-slate-50 overflow-hidden flex-shrink-0 relative cursor-pointer hover:opacity-80 transition-opacity"
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
 className="text-xs font-bold text-text-primary line-clamp-1 cursor-pointer hover:text-primary hover:underline transition-colors"
 >
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