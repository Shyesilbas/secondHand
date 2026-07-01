import { useTranslation } from "react-i18next";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
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
  /** When true, parent modal owns outer footer; no duplicate progress/footer; indigo primary CTAs */
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

  // Parent modal footer Back delegates here when embedded.
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
  const {
    emails,
    fetchEmails
  } = useEmails();
  const {
    eWallet,
    refreshWallet
  } = useEWallet();
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
  const btnPrimaryClass = embedded ? 'w-full py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary shadow-lg shadow-indigo-500/20 disabled:opacity-45 disabled:shadow-none transition-colors' : 'w-full py-2.5 rounded-xl text-sm font-bold text-white bg-status-success-bg hover:bg-status-success-bg disabled:opacity-45 transition-colors';
  const headingClass = embedded ? 'text-base font-bold text-text-primary' : 'text-lg font-semibold text-text-primary';
  const mutedClass = embedded ? 'text-sm text-slate-500' : 'text-sm text-text-secondary';
  const innerBack = useCallback(() => {
    if (loading) return;
    if (step > 1) {
      setStep(s => s - 1);
      setError(null);
      return;
    }
    onClose?.();
  }, [loading, onClose, step]);
  const handlePayment = async () => {
    const targetListingId = isBulk ? listingIds[0] || null : listingId;
    if (!targetListingId && !isBulk) {
      setError('Listing Information not found. Please Try Again');
      return;
    }
    const code = sanitizeOtpInput(verificationCode, OTP_CODE_LENGTH);
    if (otpTtlExpired) {
      setError('Verification code expired. Go back and request a new code.');
      return;
    }
    if (code.length !== OTP_CODE_LENGTH) {
      setError('Enter the 6-digit verification code sent to your email.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const acceptedAgreementIds = getAcceptedAgreementIds ? getAcceptedAgreementIds() : [];
      if (isBulk) {
        await showcaseService.createBulkShowcase(listingIds, days, code, paymentType, acceptedAgreements.size > 0, acceptedAgreementIds);
      } else if (isExtension && showcaseId) {
        const payload = {
          listingId,
          days,
          paymentType,
          verificationCode: code,
          agreementsAccepted: acceptedAgreements.size > 0,
          acceptedAgreementIds,
          idempotencyKey: `extend-${listingId}-${days}-${Date.now()}`
        };
        await showcaseService.extendShowcase(showcaseId, payload);
      } else {
        await showcaseService.createShowcase(listingId, days, paymentType, code, acceptedAgreements.size > 0, acceptedAgreementIds);
      }
      try {
        window.dispatchEvent(new Event('showcases:refresh'));
      } catch {}
      onSuccess?.();
    } catch (err) {
      if (onError && onError(err)) return;
      setError(err?.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };
  const proceedToPayment = async () => {
    setLoading(true);
    setError(null);
    const startTime = Date.now() - 3000; // 3 seconds buffer for clock skew
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
      setError(err?.response?.data?.message || err?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };
  const otpFilled = sanitizeOtpInput(verificationCode, OTP_CODE_LENGTH).length === OTP_CODE_LENGTH;
  const canContinuePayment = Boolean(paymentType && eWallet && Number(eWallet.balance || 0) >= Number(totalCost || 0));
  const renderStepBody = () => {
    switch (step) {
      case 1:
        return <div className={embedded ? 'space-y-4' : 'space-y-3'}>
            <div>
              <h3 className={`text-sm font-medium text-text-primary ${headingClass} ${embedded ? 'mb-1' : 'mb-4 '}`}>{t("payment_method")}</h3>
              {embedded ? <p className={mutedClass}>{t("showcase_payments_currently_use_wallet_b")}</p> : null}
            </div>
            <div className="rounded-2xl border border-border-light bg-background-primary p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{t("wallet")}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{t("balance")}{Number(eWallet?.balance || 0).toFixed(2)}₺</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{t("total")}</p>
                  <p className="text-sm font-bold text-text-primary">{Number(totalCost || 0).toFixed(2)}₺</p>
                </div>
              </div>
              {!canContinuePayment ? <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{t("insufficient_wallet_balance")}</p> : null}
            </div>
            {embedded ? <button type="button" className={btnPrimaryClass} onClick={() => setStep(2)} disabled={!canContinuePayment || loading}>{t("continue")}</button> : null}
          </div>;
      case 2:
        return <div className={embedded ? 'space-y-4' : 'space-y-3'}>
            <div>
              <h3 className={`text-sm font-medium text-text-primary ${headingClass} ${embedded ? 'mb-1' : 'mb-4 '}`}>{t("summary")}</h3>
              {embedded ? <p className={mutedClass}>{t("confirm_the_total_then_send_the_verifica")}</p> : null}
            </div>
            <div className={`${embedded ? 'rounded-2xl border border-border-light bg-slate-50/80 p-4 space-y-2' : 'space-y-2 mb-4'}`}>
              <div className="flex justify-between gap-3 text-sm">
                <span className={`${embedded ? 'text-slate-500' : 'font-medium'} shrink-0`}>{t("listing")}</span>
                <span className={`text-right ${embedded ? 'font-semibold text-text-primary' : ''}`}>{listingTitle}</span>
              </div>
              <div className={`flex justify-between ${embedded ? 'text-sm text-slate-600' : ''}`}>
                <span className={embedded ? 'text-slate-500' : 'font-medium'}>{t("duration")}</span>
                <span>{days}{t("days")}</span>
              </div>
              <div className={`flex justify-between ${embedded ? 'text-sm text-slate-600' : ''}`}>
                <span className={embedded ? 'text-slate-500' : 'font-medium'}>{t("payment_method")}</span>
                <span>{t("ewallet")}</span>
              </div>
            </div>
            {showcasePricing ? <div className={`${embedded ? 'rounded-2xl border border-border-light p-4 space-y-2' : 'p-3 bg-secondary-light rounded-lg space-y-2'}`}>
                <div className={`flex justify-between ${embedded ? 'text-sm text-slate-600' : 'text-sm'}`}>
                  <span>{t("subtotal")} ({days} {t("days")})</span>
                  <span className="font-mono tabular-nums">{calculateSubtotal().toFixed(2)}₺</span>
                </div>
                <div className={`flex justify-between ${embedded ? 'text-sm text-slate-600' : 'text-sm'}`}>
                  <span>{t("tax")} ({showcasePricing.taxPercentage}%)</span>
                  <span className="font-mono tabular-nums">{calculateTax().toFixed(2)}₺</span>
                </div>
                <div className={`flex justify-between font-bold border-t pt-2 ${embedded ? 'text-sm text-text-primary' : 'text-lg'}`}>
                  <span>{t("total")}</span>
                  <span className={`tabular-nums ${embedded ? 'text-primary' : 'text-status-success'}`}>{totalCost.toFixed(2)}₺</span>
                </div>
              </div> : <div className={`flex justify-between ${embedded ? 'rounded-2xl border border-border-light p-4' : 'p-3 bg-secondary-light rounded'}`}>
                <span className="font-bold text-lg">{t("total")}</span>
                <span className={`text-xl font-bold ${embedded ? 'text-primary' : 'text-status-success'} tabular-nums`}>{totalCost}₺</span>
              </div>}
            {error ? <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800">
                {error}
              </div> : null}
            <button type="button" className={btnPrimaryClass} onClick={proceedToPayment} disabled={loading}>
              {loading ? 'Sending code…' : 'Send code & continue'}
            </button>
          </div>;
      case 3:
        return <div className="space-y-4">
            <OtpDigitInputGroup length={OTP_CODE_LENGTH} value={verificationCode} onChange={setVerificationCode} disabled={loading} error={error} label={t("verification_code")} onComplete={() => {}} />

            {suggestedFromInbox && (
              <div className="mt-4">
                <OtpSuggestionBanner 
                  suggestedCode={suggestedFromInbox} 
                  onApply={setVerificationCode} 
                />
              </div>
            )}
            
            {error ? <div className={`rounded-xl border border-border-light p-4 ${embedded ? 'bg-background-secondary' : 'bg-background-primary'}`}>
                {error}
              </div> : null}

            <button type="button" className={`${btnPrimaryClass} inline-flex items-center justify-center gap-2`} onClick={handlePayment} disabled={loading || !otpFilled || otpTtlExpired}>
              {loading ? <>
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t("processing")}</> : <>
                  {embedded ? <ShieldCheck className="w-4 h-4" /> : null}{t("finish_payment")}</>}
            </button>
          </div>;
      default:
        return null;
    }
  };
  if (embedded) {
    return <div className="space-y-1">{renderStepBody()}</div>;
  }
  return <div>
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? 'bg-status-success-bg' : 'bg-secondary-light'}`} />)}
      </div>
      {renderStepBody()}
      {step !== 3 ? <div className="flex items-center justify-between mt-6">
          <button type="button" className="px-4 py-2 border rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-45" onClick={() => innerBack()} disabled={loading}>
            {step > 1 ? 'Back' : 'Cancel'}
          </button>
          {step === 1 ? <button type="button" className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-status-success-bg hover:bg-status-success-bg disabled:opacity-45" onClick={() => setStep(2)} disabled={!canContinuePayment || loading}>{t("continue")}</button> : null}
        </div> : null}
    </div>;
});
export default ShowcasePayment;