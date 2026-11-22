import { useTranslation } from 'react-i18next';
import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import PaymentAgreementsSection from '../../../payments/components/PaymentAgreementsSection.jsx';
import { formatCurrency } from '../../../common/formatters.js';
import { ewalletService } from '../../../ewallet/services/ewalletService.js';
import { ROUTES } from '../../../common/constants/routes.js';
import Button from '../../../common/components/ui/Button.jsx';
import CheckoutStepFooter from './CheckoutStepFooter.jsx';
import logger from '../../../common/utils/logger.js';

// One review tile (delivery or payment): label row with an optional action, then the details.
const ReviewTile = ({ title, action, children }) => (
  <div className="flex flex-col rounded bg-background-secondary p-4">
    <div className="flex min-h-6 items-center justify-between gap-3">
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      {action}
    </div>
    <div className="mt-3 space-y-0.5 text-sm text-text-primary">{children}</div>
  </div>
);

const TILE_LINK = 'shrink-0 rounded text-sm font-medium text-text-link transition-colors duration-150 hover:text-text-linkHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus';

// Payment and review in one step: the wallet is the only method, so the buyer checks the delivery,
// sees the wallet balance, accepts the agreements and asks for the verification code here.
const CheckoutPaymentStep = ({
  eWallet,
  calculateTotal,
  currency,
  addresses,
  selectedShippingAddressId,
  deliveryMethod,
  meetupLocation,
  orderName,
  notes,
  onEditDelivery,
  onNext,
  onBack,
  sendVerificationCode,
  acceptedAgreements,
  onAgreementToggle,
  onRequiredAgreementsChange,
  areAllAgreementsAccepted
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const totalAmount = calculateTotal();
  const cur = currency || 'TRY';
  const [spendingWarning, setSpendingWarning] = useState(null);
  const [warningAcknowledged, setWarningAcknowledged] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  const walletBalance = Number(eWallet?.balance || 0);
  // totalAmount is null until the backend pricing preview loads; never pay or warn on a guessed amount.
  const isPriced = totalAmount != null;
  const hasEnoughBalance = isPriced && !!eWallet && totalAmount <= walletBalance;
  const agreementsAccepted = areAllAgreementsAccepted();
  const canProceed = hasEnoughBalance && agreementsAccepted;
  const isMeetup = deliveryMethod === 'SAFE_MEETUP';
  const shippingAddress = addresses?.find(a => String(a.id) === String(selectedShippingAddressId));

  const requestCode = async () => {
    const sent = await sendVerificationCode();
    if (sent) onNext();
  };

  const handleConfirm = async () => {
    if (!canProceed || isWorking) return;
    setIsWorking(true);
    try {
      if (!warningAcknowledged) {
        try {
          const res = await ewalletService.checkSpendingWarning(totalAmount);
          if (res?.warningTriggered) {
            setSpendingWarning(res);
            return;
          }
        } catch (e) {
          logger.warn('Spending warning check failed', e);
        }
      }
      await requestCode();
    } finally {
      setIsWorking(false);
    }
  };

  const handleContinueAnyway = async () => {
    setWarningAcknowledged(true);
    setSpendingWarning(null);
    setIsWorking(true);
    try {
      await requestCode();
    } finally {
      setIsWorking(false);
    }
  };

  let hint = null;
  if (!hasEnoughBalance) hint = t('checkout_hint_balance', 'Devam etmek için cüzdanına bakiye yüklemelisin.');
  else if (!agreementsAccepted) hint = t('checkout_hint_agreements', 'Devam etmek için sözleşmeleri onaylamalısın.');

  const editButton = (
    <button type="button" onClick={onEditDelivery} className={TILE_LINK}>
      {t('change', 'Değiştir')}
    </button>
  );

  return (
    <div>
      <div className="px-5 pt-6 sm:px-6">
        <h2 className="text-lg font-semibold text-text-primary">{t('checkout_payment_title', 'Ödeme ve onay')}</h2>
        <p className="mt-1 text-sm text-text-secondary">
          {t('checkout_payment_desc', 'Ödemen güvence hesabında tutulur, ürünü teslim aldığını onaylayınca satıcıya aktarılır.')}
        </p>
      </div>

      <div className="space-y-8 px-5 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ReviewTile
            title={isMeetup ? t('checkout_meetup', 'Elden güvenli buluşma') : t('checkout_cargo_address', 'Kargo adresi')}
            action={editButton}
          >
            {isMeetup ? (
              <p className="font-medium">{meetupLocation}</p>
            ) : shippingAddress ? (
              <>
                <p className="font-medium">{shippingAddress.title || t('address', 'Adres')}</p>
                <p className="text-text-secondary">{shippingAddress.addressLine}</p>
                <p className="text-text-secondary">
                  {[shippingAddress.city, shippingAddress.state].filter(Boolean).join(' / ')}
                </p>
              </>
            ) : (
              <p className="text-text-tertiary">{t('no_shipping_address_chosen', 'Adres seçilmedi.')}</p>
            )}
            {(orderName || notes) && (
              <p className="pt-2 text-text-tertiary">{[orderName, notes].filter(Boolean).join(' · ')}</p>
            )}
          </ReviewTile>

          <ReviewTile
            title={t('checkout_pay_with_wallet', 'Cüzdan ile ödeme')}
            action={!hasEnoughBalance && (
              <button type="button" onClick={() => navigate(ROUTES.EWALLET)} className={TILE_LINK}>
                {t('top_up_balance', 'Bakiye yükle')}
              </button>
            )}
          >
            <p className="flex items-baseline justify-between gap-3">
              <span className="text-text-secondary">{t('checkout_wallet_balance', 'Bakiye')}</span>
              <span className="font-semibold tabular-nums text-text-primary">{formatCurrency(walletBalance, cur)}</span>
            </p>
            {isPriced && hasEnoughBalance && (
              <p className="flex items-baseline justify-between gap-3">
                <span className="text-text-secondary">{t('checkout_balance_after', 'Ödeme sonrası')}</span>
                <span className="tabular-nums text-text-secondary">{formatCurrency(walletBalance - totalAmount, cur)}</span>
              </p>
            )}
            {isPriced && !hasEnoughBalance && (
              <p className="flex items-center gap-1.5 pt-1 text-status-error-text" role="alert">
                <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                <span>
                  {t('checkout_insufficient_balance', {
                    defaultValue: 'Bakiye yetersiz, {{amount}} eksik.',
                    amount: formatCurrency(Math.max(totalAmount - walletBalance, 0), cur)
                  })}
                </span>
              </p>
            )}
          </ReviewTile>
        </div>

        <section>
          <h3 className="text-sm font-semibold text-text-primary">{t('checkout_agreements', 'Sözleşmeler')}</h3>
          <p className="mb-3 mt-0.5 text-sm text-text-secondary">{t('checkout_agreements_desc', 'Siparişi tamamlamak için sözleşmeleri onaylaman gerekiyor.')}</p>
          <PaymentAgreementsSection
            acceptedAgreements={acceptedAgreements}
            onToggle={onAgreementToggle}
            onRequiredAgreementsChange={onRequiredAgreementsChange}
          />
        </section>

        {spendingWarning && (
          <div className="flex items-start gap-3 rounded border border-status-warning-border bg-status-warning-bg p-4" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning-text" strokeWidth={1.5} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary">{t('spending_limit_warning', 'Aylık harcama limiti uyarısı')}</p>
              <p className="mt-0.5 text-sm text-text-secondary">
                {t('checkout_spending_warning_body', {
                  defaultValue: 'Bu siparişle bu ayki harcaman {{amount}} olacak.',
                  amount: formatCurrency(spendingWarning.projectedSpending, cur)
                })}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSpendingWarning(null)}>{t('cancel', 'Vazgeç')}</Button>
                <Button size="sm" onClick={handleContinueAnyway} disabled={isWorking}>{t('continue_anyway', 'Yine de devam et')}</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <CheckoutStepFooter onBack={onBack} backDisabled={isWorking} hint={hint}>
        {!spendingWarning && (
          <Button onClick={handleConfirm} disabled={!canProceed || isWorking}>
            {isWorking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden strokeWidth={1.5} />
                <span>{t('sending_code', 'Kod gönderiliyor…')}</span>
              </>
            ) : (
              <>
                <span>{isPriced
                  ? t('checkout_confirm_send_code', { defaultValue: '{{amount}} öde, kodu gönder', amount: formatCurrency(totalAmount, cur) })
                  : t('checkout_price_loading', 'Fiyat hesaplanıyor')}</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </>
            )}
          </Button>
        )}
      </CheckoutStepFooter>
    </div>
  );
};

export default memo(CheckoutPaymentStep);
