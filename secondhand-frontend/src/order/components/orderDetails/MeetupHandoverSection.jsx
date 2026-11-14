import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, MapPin, Phone } from 'lucide-react';
import { formatDateTime } from '../../../common/formatters.js';
import { orderService } from '../../services/orderService.js';
import apiClient from '../../../common/services/api/interceptors.js';
import { API_ENDPOINTS } from '../../../common/constants/apiEndpoints.js';
import Button from '../../../common/components/ui/Button.jsx';
import { hasOrderAction } from '../../orderConstants.js';
import { ORDER_ACTIONS } from '../../constants/orderUiConstants.js';

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

    // QR expiry comes from the backend (`meetupCodeExpiresAt`); only the countdown runs here.
    const canShowCode = hasOrderAction(order, ORDER_ACTIONS.SHOW_MEETUP_CODE);
    const canVerify = hasOrderAction(order, ORDER_ACTIONS.VERIFY_MEETUP);
    const canConfirmHandover = hasOrderAction(order, ORDER_ACTIONS.CONFIRM_HANDOVER);
    const [qrCountdown, setQrCountdown] = useState(0);
    useEffect(() => {
        if (!canShowCode || !order.meetupCodeExpiresAt) {
            setQrCountdown(0);
            return undefined;
        }
        const expiresAt = new Date(order.meetupCodeExpiresAt).getTime();
        const remaining = () => Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
        setQrCountdown(remaining());
        const timer = setInterval(() => {
            const left = remaining();
            setQrCountdown(left);
            if (left === 0) clearInterval(timer);
        }, 1000);
        return () => clearInterval(timer);
    }, [canShowCode, order.meetupCodeExpiresAt]);

    // The QR endpoint needs auth headers, so it is fetched as a blob and shown through an object URL.
    const { data: qrBlob, isLoading: isQrLoading, refetch: refetchQr } = useQuery({
        queryKey: ['orders', 'meetupQr', order.orderNumber],
        queryFn: async () => (await apiClient.get(API_ENDPOINTS.ORDERS.GET_MEETUP_QR(order.orderNumber), { responseType: 'blob' })).data,
        enabled: canShowCode,
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
            setConfirmError(err?.response?.data?.message || t('error_refreshing_code', 'Kod yenilenirken hata oluştu.'));
        }
    };

    const handleVerify = async e => {
        e.preventDefault();
        if (!pinCode || pinCode.trim().length !== 6) {
            setVerifyError(t('enter_6_digit_code', 'Lütfen 6 haneli kodu eksiksiz girin.'));
            return;
        }
        setIsVerifying(true);
        setVerifyError('');
        try {
            const res = await orderService.verifyMeetupCode(order.orderNumber, pinCode.trim());
            if (res.error) {
                setVerifyError(res.message || t('code_verification_failed', 'Kod doğrulama başarısız.'));
            } else {
                setPinCode('');
                onActionSuccess();
            }
        } catch (err) {
            setVerifyError(err?.response?.data?.message || t('verification_error_occurred', 'Doğrulama hatası oluştu.'));
        } finally {
            setIsVerifying(false);
        }
    };

    const handleConfirmCompletion = async () => {
        if (!confirmCheckbox) {
            setConfirmError(t('please_check_confirmation_box', 'Lütfen onay kutusunu işaretleyin.'));
            return;
        }
        setIsConfirming(true);
        setConfirmError('');
        try {
            const res = await orderService.confirmHandoverCompletion(order.orderNumber, true);
            if (res.error) {
                setConfirmError(res.message || t('operation_failed', 'İşlem tamamlanamadı.'));
            } else {
                onActionSuccess();
            }
        } catch (err) {
            setConfirmError(err?.response?.data?.message || t('error_completing_operation', 'İşlem tamamlanırken hata oluştu.'));
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
                <h3 className="text-base font-semibold text-text-primary">{t("elden_g_venli_teslimat_detaylar", "Elden Güvenli Buluşma")}</h3>
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
                        <span>{isSeller ? `${t('buyer', 'Alıcı')}: ${order.buyerName} ${order.buyerSurname}` : `${t('seller', 'Satıcı')}: ${order.sellerFullName || t('seller', 'Satıcı')}`}</span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                            <Phone className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                            {(isSeller ? order.buyerPhone : order.sellerPhone) || t('no_phone', 'Telefon Yok')}
                        </span>
                    </p>
                </div>

                {!isSeller && canShowCode && (
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
                                    {t("time_remaining_label", "Kalan Süre")}: <span className="font-medium tabular-nums text-text-primary">{formatTime(qrCountdown)}</span>
                                </p>

                                {canConfirmHandover && <div className="mt-6 w-full space-y-3 border-t border-border-light pt-5 text-left">
                                    <span className="block text-sm font-medium text-text-primary">{t("alternative_delivery_confirmation", "Alternatif Teslimat Onayı")}</span>
                                    <p className="text-sm text-text-secondary">
                                        {t("alternative_delivery_desc", "Satıcı kodu sisteme giremezse, ürünü teslim aldıktan sonra doğrudan buradan onaylayabilirsiniz.")}
                                    </p>
                                    <ConfirmCheckbox checked={confirmCheckbox} onChange={setConfirmCheckbox} label={t("received_item_confirm_label", "Ürünü elden eksiksiz teslim aldım ve işlemi tamamlamak istiyorum.")} />
                                    <Button className="w-full" onClick={handleConfirmCompletion} disabled={isConfirming || !confirmCheckbox}>
                                        {isConfirming ? t("completing_transaction", "İşlem Tamamlanıyor...") : t("received_and_confirm", "Teslim Aldım & Onayla")}
                                    </Button>
                                    {confirmError && <p className="text-sm text-status-error-text">{confirmError}</p>}
                                </div>}
                            </>
                        ) : (
                            <div className="py-6">
                                <p className="mb-3 text-sm text-text-secondary">{t("code_expired_message", "Kodun geçerlilik süresi doldu.")}</p>
                                <Button onClick={handleRegenerateCode}>{t("kodu_yenile", "Kodu Yenile")}</Button>
                            </div>
                        )}
                    </div>
                )}

                {isSeller && canVerify && (
                    <div className={PANEL}>
                        <span className="mb-4 block text-sm font-medium text-text-primary">{t("buyer_code_entry_title", "Alıcı Doğrulama Kodu Girişi")}</span>
                        {order.verificationLockedUntil && lockCountdown > 0 ? (
                            <div className="rounded border border-border py-4 text-center" role="status">
                                <p className="text-sm font-medium text-status-error-text">{t("verification_temporarily_locked", "Doğrulama geçici olarak kilitlendi")}</p>
                                <p className="mt-1 text-sm tabular-nums text-text-secondary">{t("please_retry_after", { defaultValue: "Lütfen {{time}} sonra tekrar deneyin.", time: formatTime(lockCountdown) })}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleVerify} className="space-y-3">
                                <label htmlFor="meetup-pin" className="block text-sm text-text-secondary">{t("enter_6_digit_buyer_pin", "Alıcının ekranındaki 6 haneli güvenlik PIN kodunu giriniz:")}</label>
                                <div className="flex gap-2">
                                    <input id="meetup-pin" type="text" inputMode="numeric" value={pinCode} onChange={e => setPinCode(e.target.value.replace(/\D/g, '').substring(0, 6))} className="h-10 flex-1 rounded border border-border bg-background-primary px-4 text-center text-base font-medium tabular-nums focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder="000000" maxLength={6} disabled={isVerifying} />
                                    <Button type="submit" disabled={isVerifying || pinCode.length !== 6}>
                                        {isVerifying ? t("verifying", "Doğrulanıyor...") : t("confirm_code", "Kodu Onayla")}
                                    </Button>
                                </div>
                                {verifyError && <p className="text-sm text-status-error-text">{verifyError}</p>}
                            </form>
                        )}
                    </div>
                )}

                {canConfirmHandover && order.status === 'HANDOVER_CONFIRMED' && (
                    <div className={`${PANEL} space-y-3`}>
                        <span className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-status-success" aria-hidden />
                            {t("delivery_verified_title", "Ürün Teslimatı Doğrulandı")}
                        </span>
                        <p className="text-sm text-text-secondary">{t("delivery_verified_desc", "Teslimat onaylandı. Siparişi tamamlayarak Escrow bakiyesini satıcıya aktarabilirsiniz.")}</p>
                        <ConfirmCheckbox checked={confirmCheckbox} onChange={setConfirmCheckbox} label={t("confirm_item_handed_over", "Ürünün elden teslim edildiğini ve siparişin tamamlandığını onaylıyorum.")} />
                        <Button className="w-full" onClick={handleConfirmCompletion} disabled={isConfirming || !confirmCheckbox}>
                            {isConfirming ? t("completing", "Tamamlanıyor...") : t("complete_order", "Siparişi Tamamla")}
                        </Button>
                        {confirmError && <p className="text-sm text-status-error-text">{confirmError}</p>}
                    </div>
                )}

                {order.status === 'COMPLETED' && (
                    <div className={`${PANEL} flex items-start gap-3`}>
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-status-success" strokeWidth={1.5} aria-hidden />
                        <div>
                            <span className="block text-sm font-medium text-text-primary">{t("transaction_completed_successfully", "İşlem Başarıyla Tamamlandı")}</span>
                            <p className="mt-0.5 text-sm text-text-secondary">{t("meetup_completed_escrow_released", "Elden güvenli teslimat onaylandı ve ödeme satıcının cüzdanına aktarıldı.")}</p>
                            {order.completedAt && (
                                <p className="mt-2 text-sm tabular-nums text-text-tertiary">
                                    {order.completedByUserName ? t("approved_by_user", { defaultValue: "Onaylayan: {{user}}", user: order.completedByUserName }) : t("approved_by_system", "Sistem tarafından onaylandı")}
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
