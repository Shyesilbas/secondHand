import { useTranslation } from "react-i18next";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  ShieldCheck, 
  Wallet, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  ArrowRight, 
  RefreshCw
} from 'lucide-react';
import { useEWallet } from '../../ewallet/hooks/useEWallet.js';
import { orderService } from '../../order/services/orderService.js';
import { useEmails } from '../../payments/hooks/useEmails.js';
import { showcaseService } from '../services/showcaseService.js';
import { OTP_CODE_LENGTH, sanitizeOtpInput } from '../../common/constants/otp.js';
import { findLatestOtpFromEmails } from '../../payments/utils/otp.js';
import { EMAIL_TYPES } from '../../emails/emails.js';
import OtpDigitInputGroup from '../../payments/components/verification/OtpDigitInputGroup.jsx';
import OtpSuggestionBanner from '../../payments/components/verification/OtpSuggestionBanner.jsx';
import { useOtpSuggestedToast } from '../../payments/hooks/useOtpSuggestedToast.js';
import { useOtpValidityCountdown } from '../../payments/hooks/useOtpValidityCountdown.js';
import { OTP_CODE_VALIDITY_SECONDS } from '../../payments/paymentSchema.js';

const ShowcasePayment = forwardRef(function ShowcasePayment({
  listingId,
  listingTitle,
  days,
  totalCost,
  showcasePricing,
  calculateSubtotal,
  calculateTax,
  onSuccess,
  onClose,
  acceptedAgreements,
  getAcceptedAgreementIds,
  onError,
  isExtension = false,
  showcaseId = null,
  isBulk = false,
  listingIds = [],
  embedded = false
}, ref) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const stepRef = useRef(step);
  const [paymentType] = useState('EWALLET');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [otpExpiresAtMs, setOtpExpiresAtMs] = useState(null);
  const [localEmails, setLocalEmails] = useState(null);

  useEffect(() => {
    if (step !== 3) {
      setVerificationCode('');
      setOtpExpiresAtMs(null);
      setError(null);
    }
  }, [step]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useImperativeHandle(ref, () => ({
    consumeModalBack() {
      if (stepRef.current > 1) {
        setStep(s => s - 1);
        setError(null);
        return true;
      }
      return false;
    }
  }));

  const { emails, fetchEmails } = useEmails();
  const { eWallet, refreshWallet } = useEWallet();

  const suggestedFromInbox = useMemo(() => findLatestOtpFromEmails(localEmails || emails, {
    emailType: EMAIL_TYPES.PAYMENT_VERIFICATION,
    maxScan: 16
  }), [emails, localEmails]);

  useOtpSuggestedToast({
    suggestedCode: suggestedFromInbox,
    enabled: step === 3
  });

  const otpTtlExpiresAt = step === 3 ? otpExpiresAtMs : null;
  const {
    formatted: otpTtlFormatted,
    isExpired: otpTtlExpired,
    active: otpTtlActive
  } = useOtpValidityCountdown(otpTtlExpiresAt);

  useEffect(() => {
    refreshWallet();
  }, []);

  const balance = Number(eWallet?.balance || 0);
  const cost = Number(totalCost || 0);
  const canContinuePayment = Boolean(paymentType && eWallet && balance >= cost);

  const handlePayment = async () => {
    const targetListingId = isBulk ? listingIds[0] || null : listingId;
    if (!targetListingId && !isBulk) {
      setError('İlan bilgisi bulunamadı. Lütfen tekrar deneyin.');
      return;
    }
    const code = sanitizeOtpInput(verificationCode, OTP_CODE_LENGTH);
    if (otpTtlExpired) {
      setError('Doğrulama kodunun süresi doldu. Lütfen geriye dönüp yeni kod isteyin.');
      return;
    }
    if (code.length !== OTP_CODE_LENGTH) {
      setError('E-postanıza gönderilen 6 haneli doğrulama kodunu girin.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const acceptedAgreementIds = getAcceptedAgreementIds ? getAcceptedAgreementIds() : [];
      if (isBulk) {
        await showcaseService.createBulkShowcase(listingIds, days, code, paymentType, acceptedAgreements?.size > 0, acceptedAgreementIds);
      } else if (isExtension && showcaseId) {
        const payload = {
          listingId,
          days,
          paymentType,
          providerName: paymentType || 'EWALLET',
          verificationCode: code,
          agreementsAccepted: acceptedAgreements?.size > 0,
          acceptedAgreementIds,
          idempotencyKey: `extend-${listingId}-${days}-${Date.now()}`
        };
        await showcaseService.extendShowcase(showcaseId, payload);
      } else {
        await showcaseService.createShowcase(listingId, days, paymentType, code, acceptedAgreements?.size > 0, acceptedAgreementIds);
      }
      try {
        window.dispatchEvent(new Event('showcases:refresh'));
      } catch {}
      onSuccess?.();
    } catch (err) {
      if (onError && onError(err)) return;
      setError(err?.response?.data?.message || err.message || 'Ödeme tamamlanamadı.');
    } finally {
      setLoading(false);
    }
  };

  const proceedToPayment = async () => {
    setLoading(true);
    setError(null);
    const startTime = Date.now() - 3000;
    try {
      await orderService.initiatePaymentVerification({
        transactionType: 'SHOWCASE_PAYMENT',
        listingId: isBulk ? null : listingId,
        isBulk,
        customTitle: isBulk ? listingTitle : null,
        days,
        amount: totalCost
      });
      const fetchedEmails = await fetchEmails(startTime);
      setLocalEmails(fetchedEmails);
      setOtpExpiresAtMs(Date.now() + OTP_CODE_VALIDITY_SECONDS * 1000);
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Doğrulama kodu gönderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const otpFilled = sanitizeOtpInput(verificationCode, OTP_CODE_LENGTH).length === OTP_CODE_LENGTH;

  const renderStepBody = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Ödeme Yöntemi
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Güvenli Ödeme
              </span>
            </div>

            {/* E-Wallet Status Card */}
            <div className={`p-4 rounded-2xl border transition-all duration-200 ${
              canContinuePayment 
                ? 'bg-emerald-50/40 border-emerald-200' 
                : 'bg-rose-50/50 border-rose-200'
            }`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md ${
                    canContinuePayment ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}>
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">E-Cüzdan Bakiyeniz</h4>
                    <p className="text-xs font-semibold text-slate-500 font-mono">
                      {balance.toFixed(2)}₺
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ödenecek</span>
                  <span className="text-base font-extrabold font-mono text-slate-900">
                    {cost.toFixed(2)}₺
                  </span>
                </div>
              </div>

              {!canContinuePayment ? (
                <div className="mt-3.5 p-2.5 rounded-xl bg-rose-100/70 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>E-Cüzdan bakiyeniz yetersiz. Lütfen bakiyenizi yükleyin.</span>
                </div>
              ) : (
                <div className="mt-3.5 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-700 font-medium">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ödeme sonrasında kalan bakiye:
                  </span>
                  <span className="font-mono font-bold">{(balance - cost).toFixed(2)}₺</span>
                </div>
              )}
            </div>

            {embedded && (
              <button
                type="button"
                className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-45 disabled:shadow-none flex items-center justify-center gap-2"
                onClick={() => setStep(2)}
                disabled={!canContinuePayment || loading}
              >
                Devam Et <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                İşlem Özeti & Onay
              </span>
              <span className="text-xs font-medium text-slate-400">Son Adım Öncesi</span>
            </div>

            <div className="rounded-2xl border border-border-light bg-slate-50 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500 font-medium">İlan:</span>
                <span className="font-bold text-slate-900 text-right truncate max-w-[240px]">
                  {listingTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Süre:</span>
                <span className="font-bold text-slate-900">{days} Gün</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Ödeme Yöntemi:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5" /> E-Cüzdan
                </span>
              </div>
            </div>

            {showcasePricing ? (
              <div className="rounded-2xl border border-border-light p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Ara Toplam ({days} Gün)</span>
                  <span className="font-mono font-semibold">{calculateSubtotal().toFixed(2)}₺</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>KDV (%{showcasePricing.taxPercentage})</span>
                  <span className="font-mono font-semibold">{calculateTax().toFixed(2)}₺</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm border-t border-border-light pt-2 text-slate-900">
                  <span>Toplam Fiyat</span>
                  <span className="font-mono text-primary">{cost.toFixed(2)}₺</span>
                </div>
              </div>
            ) : null}

            {error && (
              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-45 flex items-center justify-center gap-2"
              onClick={proceedToPayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Doğrulama Kodu Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Doğrulama Kodu Gönder & Devam Et
                </>
              )}
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center py-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-2 text-primary">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900">SMS / E-Posta Doğrulama Kodu</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                E-posta adresinize gönderilen 6 haneli doğrulama kodunu girin.
              </p>
              {otpTtlActive && (
                <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-mono font-bold text-primary">
                  Kalan Süre: {otpTtlFormatted}
                </span>
              )}
            </div>

            <OtpDigitInputGroup
              length={OTP_CODE_LENGTH}
              value={verificationCode}
              onChange={setVerificationCode}
              disabled={loading}
              error={error}
              label={t("verification_code")}
              onComplete={() => {}}
            />

            {suggestedFromInbox && (
              <div className="mt-3">
                <OtpSuggestionBanner 
                  suggestedCode={suggestedFromInbox} 
                  onApply={setVerificationCode} 
                />
              </div>
            )}
            
            {error && (
              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              className="w-full py-3.5 rounded-2xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-45 disabled:shadow-none flex items-center justify-center gap-2"
              onClick={handlePayment}
              disabled={loading || !otpFilled || otpTtlExpired}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> İşlem Gerçekleştiriliyor...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4.5 h-4.5" /> Vitrin Ödemesini Tamamla
                </>
              )}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (embedded) {
    return <div className="space-y-1">{renderStepBody()}</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              step >= s ? 'bg-primary' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      {renderStepBody()}
    </div>
  );
});

export default ShowcasePayment;