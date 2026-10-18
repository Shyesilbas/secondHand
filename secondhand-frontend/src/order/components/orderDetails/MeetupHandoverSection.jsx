import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, MapPin, Phone } from 'lucide-react';
import { formatDateTime } from '../../../common/formatters.js';
import { orderService } from '../../services/orderService.js';
import apiClient from '../../../common/services/api/interceptors.js';
import { API_ENDPOINTS } from '../../../common/constants/apiEndpoints.js';
import Button from '../../../common/components/ui/Button.jsx';

const PANEL = 'rounded border border-border-light p-5';

const ConfirmCheckbox = ({ checked, onChange, label }) => (
 <label className="flex cursor-pointer select-none items-start gap-2.5">
 <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 rounded-sm border-border text-primary focus:ring-border-focus" />
 <span className="text-sm text-text-primary">{label}</span>
 </label>
);

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

 // The QR endpoint needs auth headers, so it is fetched as a blob and shown through an object URL.
 const { data: qrBlob, isLoading: isQrLoading, refetch: refetchQr } = useQuery({
 queryKey: ['orders', 'meetupQr', order.orderNumber],
 queryFn: async () => (await apiClient.get(API_ENDPOINTS.ORDERS.GET_MEETUP_QR(order.orderNumber), { responseType: 'blob' })).data,
 enabled: order.status === 'MEETUP_PENDING' && !isSeller,
 staleTime: 0,
 gcTime: 0,
 });
 const qrImageUrl = useMemo(() => (qrBlob ? URL.createObjectURL(qrBlob) : ''), [qrBlob]);
 useEffect(() => () => {
 if (qrImageUrl) URL.revokeObjectURL(qrImageUrl);
 }, [qrImageUrl]);

 const handleRegenerateCode = async () => {
 try {
 await orderService.regenerateMeetupCode(order.orderNumber);
 setQrCountdown(300);
 refetchQr();
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
 <section className="rounded border border-border bg-background-primary p-5">
 <div className="mb-4 border-b border-border-light pb-4">
 <h3 className="text-lg font-semibold text-text-primary">{t("elden_g_venli_teslimat_detaylar", "Elden Güvenli Buluşma")}</h3>
 <p className="mt-1 text-sm text-text-secondary">{t("g_venli_bulu_ma_noktas_nda_y_z_y_ze_al_v", "Güvenli buluşma noktasında yüz yüze teslimat ve PIN doğrulama.")}</p>
 </div>

 <div className="space-y-4">
 <div>
 <span className="block text-sm text-text-tertiary">{t("bulu_ma_konumu", "Buluşma Konumu")}</span>
 <span className="mt-1 flex items-center gap-1.5 text-sm font-medium text-text-primary">
 <MapPin className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 {order.meetupLocation || 'Belirtilmedi'}
 </span>
 </div>

 <div>
 <span className="block text-sm text-text-tertiary">{t("i_leti_im_bilgileri", "İletişim Bilgileri")}</span>
 <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-primary">
 <span>{isSeller ? `Alıcı: ${order.buyerName} ${order.buyerSurname}` : `Satıcı: ${order.sellerFullName || 'Satıcı'}`}</span>
 <span className="inline-flex items-center gap-1 tabular-nums">
 <Phone className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 {(isSeller ? order.buyerPhone : order.sellerPhone) || 'Telefon Yok'}
 </span>
 </p>
 </div>

 {order.status === 'MEETUP_PENDING' && (!isSeller ? (
 <div className={`${PANEL} flex flex-col items-center text-center`}>
 <span className="mb-3 block text-sm font-medium text-text-primary">
 {t("sat_c_ya_g_sterilecek_qr_ve_pin", "Satıcıya Gösterilecek Doğrulama PIN Kodu")}
 </span>
 {qrCountdown > 0 ? (
 <>
 <div className="mb-4 flex h-40 w-40 items-center justify-center rounded border border-border p-2">
 {isQrLoading ? (
 <span className="text-sm text-text-muted">{t("y_kleniyor", "Yükleniyor...")}</span>
 ) : qrImageUrl ? (
 <img src={qrImageUrl} alt={t("meetup_qr_code", "QR Kod")} className="h-full w-full" />
 ) : (
 <button type="button" onClick={() => refetchQr()} className="px-2 text-sm text-status-error-text underline-offset-2 hover:underline">{t("qr_y_klenemedi", "QR Yüklenemedi")} · {t("try_again")}</button>
 )}
 </div>
 <span className="mb-1 block text-3xl font-semibold tabular-nums text-text-primary">
 {order.meetupVerificationCode || '------'}
 </span>
 <p className="mt-2 text-sm text-text-secondary">
 Kalan Süre: <span className="font-medium tabular-nums text-text-primary">{formatTime(qrCountdown)}</span>
 </p>

 <div className="mt-6 w-full space-y-3 border-t border-border-light pt-5 text-left">
 <span className="block text-sm font-medium text-text-primary">Alternatif Teslimat Onayı</span>
 <p className="text-sm text-text-secondary">
 Satıcı kodu sisteme giremezse, ürünü teslim aldıktan sonra doğrudan buradan onaylayabilirsiniz.
 </p>
 <ConfirmCheckbox checked={confirmCheckbox} onChange={setConfirmCheckbox} label="Ürünü elden eksiksiz teslim aldım ve işlemi tamamlamak istiyorum." />
 <Button className="w-full" onClick={handleConfirmCompletion} disabled={isConfirming || !confirmCheckbox}>
 {isConfirming ? 'İşlem Tamamlanıyor...' : 'Teslim Aldım & Onayla'}
 </Button>
 {confirmError && <p className="text-sm text-status-error-text">{confirmError}</p>}
 </div>
 </>
 ) : (
 <div className="py-6">
 <p className="mb-3 text-sm text-text-secondary">Kodun geçerlilik süresi doldu.</p>
 <Button onClick={handleRegenerateCode}>Kodu Yenile</Button>
 </div>
 )}
 </div>
 ) : (
 <div className={PANEL}>
 <span className="mb-4 block text-sm font-medium text-text-primary">Alıcı Doğrulama Kodu Girişi</span>
 {order.verificationLockedUntil && lockCountdown > 0 ? (
 <div className="rounded border border-border py-4 text-center" role="status">
 <p className="text-sm font-medium text-status-error-text">Doğrulama geçici olarak kilitlendi</p>
 <p className="mt-1 text-sm tabular-nums text-text-secondary">Lütfen {formatTime(lockCountdown)} sonra tekrar deneyin.</p>
 </div>
 ) : (
 <form onSubmit={handleVerify} className="space-y-3">
 <label htmlFor="meetup-pin" className="block text-sm text-text-secondary">Alıcının ekranındaki 6 haneli güvenlik PIN kodunu giriniz:</label>
 <div className="flex gap-2">
 <input id="meetup-pin" type="text" inputMode="numeric" value={pinCode} onChange={e => setPinCode(e.target.value.replace(/\D/g, '').substring(0, 6))} className="h-10 flex-1 rounded border border-border bg-background-primary px-4 text-center text-base font-medium tabular-nums focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder="000000" maxLength={6} disabled={isVerifying} />
 <Button type="submit" disabled={isVerifying || pinCode.length !== 6}>
 {isVerifying ? 'Doğrulanıyor...' : 'Kodu Onayla'}
 </Button>
 </div>
 {verifyError && <p className="text-sm text-status-error-text">{verifyError}</p>}
 </form>
 )}
 </div>
 ))}

 {order.status === 'HANDOVER_CONFIRMED' && (
 <div className={`${PANEL} space-y-3`}>
 <span className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
 <span className="h-1.5 w-1.5 rounded-full bg-status-success" aria-hidden />
 Ürün Teslimatı Doğrulandı
 </span>
 <p className="text-sm text-text-secondary">Teslimat onaylandı. Siparişi tamamlayarak Escrow bakiyesini satıcıya aktarabilirsiniz.</p>
 <ConfirmCheckbox checked={confirmCheckbox} onChange={setConfirmCheckbox} label="Ürünün elden teslim edildiğini ve siparişin tamamlandığını onaylıyorum." />
 <Button className="w-full" onClick={handleConfirmCompletion} disabled={isConfirming || !confirmCheckbox}>
 {isConfirming ? 'Tamamlanıyor...' : 'Siparişi Tamamla'}
 </Button>
 {confirmError && <p className="text-sm text-status-error-text">{confirmError}</p>}
 </div>
 )}

 {order.status === 'COMPLETED' && (
 <div className={`${PANEL} flex items-start gap-3`}>
 <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-status-success" strokeWidth={1.5} aria-hidden />
 <div>
 <span className="block text-sm font-medium text-text-primary">İşlem Başarıyla Tamamlandı</span>
 <p className="mt-0.5 text-sm text-text-secondary">Elden güvenli teslimat onaylandı ve ödeme satıcının cüzdanına aktarıldı.</p>
 {order.completedAt && (
 <p className="mt-2 text-sm tabular-nums text-text-tertiary">
 {order.completedByUserName ? `Onaylayan: ${order.completedByUserName}` : 'Sistem tarafından onaylandı'}
 {` — ${formatDateTime(order.completedAt)}`}
 </p>
 )}
 </div>
 </div>
 )}
 </div>
 </section>
 );
};

export default MeetupHandoverSection;
