import { BarChart2, Check, Crown, Lock, Package, ShieldCheck, Truck, Wallet, X, Zap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { membershipService } from '../../services/membershipService';
import { useNotification } from '../../../notification/NotificationContext.jsx';
import PaymentAgreementsSection from '../../../payments/components/PaymentAgreementsSection.jsx';
import { useAgreementsState } from '../../../payments/hooks/useListingPaymentFlow.js';
import OtpDigitInputGroup from '../../../payments/components/verification/OtpDigitInputGroup.jsx';
import OtpSuggestionBanner from '../../../payments/components/verification/OtpSuggestionBanner.jsx';
import { useOtpValidityCountdown } from '../../../payments/hooks/useOtpValidityCountdown.js';
import { OTP_CODE_LENGTH } from '../../constants/otp.js';
import { orderService } from '../../../order/services/orderService.js';
import { useEmails } from '../../../payments/hooks/useEmails.js';
import { EMAIL_TYPES } from '../../../emails/emails.js';
import { sanitizeOtpInput, findLatestOtpWithEmail } from '../../../payments/utils/otp.js';
import { OTP_CODE_VALIDITY_SECONDS } from '../../../payments/paymentSchema.js';
import { useEWallet } from '../../../ewallet/hooks/useEWallet.js';

const PREMIUM_PRICE = 100;

const FEATURES = [
  { icon: Zap, label: 'Aura AI', free: 'Günlük 4 mesaj', premium: 'Günlük 10 mesaj' },
  { icon: Package, label: 'AI İlan Oluşturma', free: 'Aylık 1 hak', premium: 'Aylık 4 hak' },
  { icon: Crown, label: 'Showcase Slot', free: '1 slot', premium: '3 slot' },
  { icon: BarChart2, label: 'Gelişmiş Analitik', free: 'Temel görünüm', premium: 'Tam erişim' },
  { icon: Truck, label: 'Hızlı Teslimat', free: '3 iş günü', premium: '1 iş günü' },
];

const STEPS = [
  { id: 1, label: 'Plan', icon: Crown },
  { id: 2, label: 'Sözleşmeler', icon: ShieldCheck },
  { id: 3, label: 'Doğrulama', icon: Lock },
];

const PremiumUpgradeModal = ({ isOpen, onClose, featureHint }) => {
  const queryClient = useQueryClient();
  const { showSuccess } = useNotification();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [otpExpiresAtMs, setOtpExpiresAtMs] = useState(null);
  const [localEmails, setLocalEmails] = useState(null);

  const { emails, fetchEmails } = useEmails();
  const { eWallet, refreshWallet } = useEWallet();

  const {
    acceptedAgreements,
    onAgreementToggle,
    onRequiredAgreementsChange,
    areAllAgreementsAccepted,
    getAcceptedAgreementIds,
  } = useAgreementsState();

  const inboxMatch = useMemo(
    () => findLatestOtpWithEmail(localEmails || emails, { emailType: EMAIL_TYPES.PAYMENT_VERIFICATION, maxScan: 16 }),
    [emails, localEmails]
  );
  const suggestedFromInbox = inboxMatch?.code;
  const suggestedEmail = inboxMatch?.email;

  const { formatted: otpTtlFormatted, isExpired: otpTtlExpired, active: otpTtlActive } =
    useOtpValidityCountdown(step === 3 ? otpExpiresAtMs : null);

  useEffect(() => {
    if (isOpen) {
      refreshWallet();
      setStep(1);
      setError(null);
      setVerificationCode('');
      setOtpExpiresAtMs(null);
      setLocalEmails(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (step !== 3) {
      setVerificationCode('');
      setOtpExpiresAtMs(null);
      setError(null);
    }
  }, [step]);

  const canAfford = Number(eWallet?.balance || 0) >= PREMIUM_PRICE;

  const sendVerificationCode = async () => {
    setLoading(true);
    setError(null);
    try {
      await orderService.initiatePaymentVerification({
        transactionType: 'MEMBERSHIP_PAYMENT',
        amount: PREMIUM_PRICE,
      });
      const res = await fetchEmails();
      setLocalEmails(res);
      setOtpExpiresAtMs(Date.now() + OTP_CODE_VALIDITY_SECONDS * 1000);
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Doğrulama kodu gönderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    const code = sanitizeOtpInput(verificationCode, OTP_CODE_LENGTH);
    if (otpTtlExpired) { setError('Doğrulama kodunun süresi doldu. Geri dönüp yeni kod isteyin.'); return; }
    if (code.length !== OTP_CODE_LENGTH) { setError('6 haneli doğrulama kodunu girin.'); return; }

    setLoading(true);
    setError(null);
    try {
      await membershipService.upgradeToPremium({
        agreementsAccepted: areAllAgreementsAccepted(),
        acceptedAgreementIds: getAcceptedAgreementIds(),
        verificationCode: code,
      });
      queryClient.invalidateQueries({ queryKey: ['membership'] });
      showSuccess('Premium Üyelik', 'Premium planına başarıyla geçiş yaptınız!');
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = useCallback(() => {
    if (step === 2) { sendVerificationCode(); return; }
    if (step < 3) { setError(null); setStep(s => s + 1); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleBack = useCallback(() => {
    if (step > 1) { setError(null); setStep(s => s - 1); } else onClose?.();
  }, [step, onClose]);

  const otpFilled = sanitizeOtpInput(verificationCode, OTP_CODE_LENGTH).length === OTP_CODE_LENGTH;

  const canGoNext = useCallback(() => {
    if (step === 1) return canAfford;
    if (step === 2) return areAllAgreementsAccepted();
    return false;
  }, [step, canAfford, areAllAgreementsAccepted]);

  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="w-full max-w-md bg-card-bg rounded-2xl border border-border-light shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border-light shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary-light">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-text-primary">Premium Üyelik</h2>
                <p className="text-xs text-text-muted">{featureHint ?? 'Tüm özelliklere erişin'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:bg-background-secondary transition cursor-pointer"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-between mt-4 relative">
            <div className="absolute left-0 right-0 top-4 h-px bg-border-light z-0" />
            <div
              className="absolute left-0 top-4 h-px bg-primary z-0 transition-all duration-500"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            />
            {/* eslint-disable-next-line no-unused-vars */}
            {STEPS.map(({ id, label, icon: StepIcon }) => {
              const done = step > id;
              const active = step === id;
              return (
                <div key={id} className="flex flex-col items-center gap-1.5 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    done ? 'bg-primary text-white' :
                    active ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' :
                    'bg-card-bg border-2 border-border-light text-text-muted'
                  }`}>
                    {done ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-[10px] font-semibold ${active ? 'text-primary' : done ? 'text-text-secondary' : 'text-text-muted'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Step 1: Features + Wallet */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Wallet info */}
              <div className="rounded-xl border border-border-light p-4 flex items-center justify-between bg-background-secondary">
                <div className="flex items-center gap-2.5">
                  <Wallet className="h-4 w-4 text-text-muted" />
                  <div>
                    <p className="text-xs font-semibold text-text-primary">E-Cüzdanım</p>
                    <p className="text-[11px] text-text-muted">Bakiye: {Number(eWallet?.balance || 0).toFixed(2)}₺</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-text-primary">₺100</p>
                  <p className="text-[10px] text-text-muted">/ay</p>
                </div>
              </div>

              {!canAfford && (
                <p className="text-xs text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-3 py-2">
                  Yetersiz bakiye. Lütfen cüzdanınızı yükleyin.
                </p>
              )}

              {/* Feature list */}
              <div className="rounded-xl border border-border-light overflow-hidden">
                <div className="bg-background-secondary px-4 py-2.5 border-b border-border-light">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Plan Karşılaştırması</p>
                </div>
                {FEATURES.map((feature) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={feature.label} className="flex items-center justify-between px-4 py-3 border-b border-border-light last:border-0">
                      <div className="flex items-center gap-2.5">
                        <IconComponent className="h-3.5 w-3.5 text-text-muted shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-text-primary">{feature.label}</p>
                          <p className="text-[10px] text-text-muted line-through">{feature.free}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-primary shrink-0" />
                        <span className="text-xs font-bold text-primary">{feature.premium}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Agreements */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-background-secondary border border-border-light">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <p className="text-xs text-text-secondary">
                  Ödeme işleminden önce aşağıdaki sözleşmeleri onaylayın.
                </p>
              </div>
              <div className="rounded-xl border border-border-light bg-background-primary p-4">
                <PaymentAgreementsSection
                  acceptedAgreements={acceptedAgreements}
                  onToggle={onAgreementToggle}
                  onRequiredAgreementsChange={onRequiredAgreementsChange}
                />
              </div>
            </div>
          )}

          {/* Step 3: OTP Verification */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25">
                  <Lock className="w-5 h-5 text-white" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-text-primary">E-posta Doğrulaması</h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    E-postanıza gönderilen{' '}
                    <span className="font-semibold text-text-secondary">{OTP_CODE_LENGTH} haneli</span>{' '}
                    kodu girerek ödemeyi tamamlayın.
                  </p>
                  {otpTtlActive && (
                    <p className={`text-[10px] font-semibold mt-1.5 tabular-nums ${otpTtlExpired ? 'text-amber-600' : 'text-text-muted'}`}>
                      {otpTtlExpired ? 'Kod süresi doldu — geri dönüp yeni kod isteyin.' : `Geçerlilik: ${otpTtlFormatted}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Wallet summary */}
              <div className="rounded-xl border border-border-light p-4 flex items-center justify-between bg-background-secondary">
                <div>
                  <p className="text-xs font-semibold text-text-primary">Premium Üyelik</p>
                  <p className="text-[10px] text-text-muted">E-Cüzdan bakiyesi: {Number(eWallet?.balance || 0).toFixed(2)}₺</p>
                </div>
                <span className="text-lg font-bold text-primary tabular-nums">₺100</span>
              </div>

              {suggestedFromInbox && (
                <OtpSuggestionBanner 
                  suggestedCode={suggestedFromInbox} 
                  sourceEmail={suggestedEmail}
                  onApply={setVerificationCode} 
                />
              )}

              <div className="rounded-xl border border-border-light bg-background-primary p-4">
                <OtpDigitInputGroup
                  value={verificationCode}
                  onChange={setVerificationCode}
                  dataSlotPrefix="premium-otp"
                  disabled={loading || otpTtlExpired}
                />
              </div>

              {error && (
                <p className="text-xs text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </div>
          )}

          {/* Error (steps 1 & 2) */}
          {step !== 3 && error && (
            <p className="mt-3 text-xs text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-light bg-background-secondary shrink-0 flex gap-2">
          <button
            onClick={handleBack}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-text-muted hover:text-text-secondary hover:bg-background-primary transition border border-border-light cursor-pointer"
          >
            {step > 1 ? '← Geri' : 'Vazgeç'}
          </button>

          {step < 3 && (
            <button
              onClick={handleNext}
              disabled={loading || !canGoNext()}
              className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-hover transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Gönderiliyor…
                </>
              ) : step === 2 ? (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  Kodu Gönder &amp; Devam Et
                </>
              ) : (
                <>
                  Devam Et →
                </>
              )}
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleUpgrade}
              disabled={loading || !otpFilled || otpTtlExpired}
              className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-hover transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  İşleniyor…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Ödemeyi Tamamla
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default PremiumUpgradeModal;
