import { useTranslation } from 'react-i18next';
import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Loader2, Truck, Users, Wallet } from 'lucide-react';
import PaymentAgreementsSection from '../../../payments/components/PaymentAgreementsSection.jsx';
import { formatCurrency } from '../../../common/formatters.js';
import { ewalletService } from '../../../ewallet/services/ewalletService.js';
import { ROUTES } from '../../../common/constants/routes.js';
import Button from '../../../common/components/ui/Button.jsx';
import CheckoutStepFooter from './CheckoutStepFooter.jsx';
import logger from '../../../common/utils/logger.js';

const SummaryRow = ({ icon: Icon, title, children, action }) => (
  <div className="flex items-start gap-3 px-5 py-4 sm:px-6">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-text-tertiary">{title}</p>
      <div className="mt-0.5 text-sm text-text-primary">{children}</div>
    </div>
    {action}
  </div>
);

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
  const hasEnoughBalance = !!eWallet && totalAmount <= walletBalance;
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
    <Button variant="ghost" size="sm" onClick={onEditDelivery} className="shrink-0">
      {t('change', 'Değiştir')}
    </Button>
  );

  return (
    <div>
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <h2 className="text-base font-semibold text-text-primary">{t('checkout_payment_title', 'Ödeme ve onay')}</h2>
        <p className="mt-1 text-sm text-text-secondary">
          {t('checkout_payment_desc', 'Ödemen güvence hesabında tutulur, ürünü teslim aldığını onaylayınca satıcıya aktarılır.')}
        </p>
      </div>

      <div className="mt-4 divide-y divide-border-light border-t border-border-light">
        <SummaryRow
          icon={isMeetup ? Users : Truck}
          title={isMeetup ? t('checkout_meetup', 'Elden güvenli buluşma') : t('checkout_cargo_address', 'Kargo adresi')}
          action={editButton}
        >
          {isMeetup ? (
            <p>{meetupLocation}</p>
          ) : shippingAddress ? (
            <>
              <p className="font-medium">{shippingAddress.title || t('address', 'Adres')}</p>
              <p className="text-text-secondary">
                {[shippingAddress.addressLine, [shippingAddress.city, shippingAddress.state].filter(Boolean).join(' / ')].filter(Boolean).join(', ')}
              </p>
            </>
          ) : (
            <p className="text-text-tertiary">{t('no_shipping_address_chosen', 'Adres seçilmedi.')}</p>
          )}
          {(orderName || notes) && (
            <p className="mt-1 text-xs text-text-tertiary">
              {[orderName, notes].filter(Boolean).join(' · ')}
            </p>
          )}
        </SummaryRow>

        <SummaryRow
          icon={Wallet}
          title={t('checkout_pay_with_wallet', 'Cüzdan ile ödeme')}
          action={!hasEnoughBalance && (
            <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.EWALLET)} className="shrink-0">
              {t('top_up_balance', 'Bakiye yükle')}
            </Button>
          )}
        >
          <p className="tabular-nums">
            {t('checkout_wallet_balance', 'Bakiye')}: <span className="font-medium">{formatCurrency(walletBalance, cur)}</span>
          </p>
          {!hasEnoughBalance && (
            <p className="mt-0.5 text-sm text-status-error-text">
              {t('checkout_insufficient_balance', {
                defaultValue: 'Bakiye yetersiz, {{amount}} eksik.',
                amount: formatCurrency(Math.max(totalAmount - walletBalance, 0), cur)
              })}
            </p>
          )}
        </SummaryRow>

        <div className="px-5 py-4 sm:px-6">
          <p className="mb-2 text-xs font-medium text-text-tertiary">{t('checkout_agreements', 'Sözleşmeler')}</p>
          <PaymentAgreementsSection
            acceptedAgreements={acceptedAgreements}
            onToggle={onAgreementToggle}
            onRequiredAgreementsChange={onRequiredAgreementsChange}
          />
        </div>

        {spendingWarning && (
          <div className="flex items-start gap-3 px-5 py-4 sm:px-6" role="alert">
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
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                <span>{t('sending_code', 'Kod gönderiliyor…')}</span>
              </>
            ) : (
              <>
                <span>{t('checkout_confirm_send_code', { defaultValue: '{{amount}} öde, kodu gönder', amount: formatCurrency(totalAmount, cur) })}</span>
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
