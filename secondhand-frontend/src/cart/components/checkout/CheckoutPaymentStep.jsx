import { useTranslation } from "react-i18next";
import { useState, memo } from 'react';
import { Wallet, AlertCircle, Loader2, ArrowLeft, ArrowRight, Plus, Lock, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaymentAgreementsSection from '../../../payments/components/PaymentAgreementsSection.jsx';
import { formatCurrency } from '../../../common/formatters.js';
import { CART_PAYMENT_TYPES } from '../../cartConstants.js';
import { ewalletService } from '../../../ewallet/services/ewalletService.js';
import { ROUTES } from '../../../common/constants/routes.js';
import Button from '../../../common/components/ui/Button.jsx';

const CheckoutPaymentStep = ({
  selectedPaymentType,
  setSelectedPaymentType,
  eWallet,
  calculateTotal,
  currency,
  onNext,
  onBack,
  acceptedAgreements,
  onAgreementToggle,
  onRequiredAgreementsChange,
  areAllAgreementsAccepted
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const totalAmount = calculateTotal();
  const cur = currency || 'TRY';
  const [warningData, setWarningData] = useState(null);
  const [isCheckingWarning, setIsCheckingWarning] = useState(false);

  const walletBalance = Number(eWallet?.balance || 0);
  const hasEnoughBalance = !!eWallet && totalAmount <= walletBalance;
  const canProceed = hasEnoughBalance && areAllAgreementsAccepted();

  const handleNext = async () => {
    if (!canProceed) return;
    if (!warningData) {
      try {
        setIsCheckingWarning(true);
        const res = await ewalletService.checkSpendingWarning(totalAmount);
        if (res?.warningTriggered) {
          setWarningData(res);
          return;
        }
      } catch (e) {
        console.error('Failed to check spending warning', e);
      } finally {
        setIsCheckingWarning(false);
      }
    }
    onNext();
  };

  const isWalletSelected = selectedPaymentType === CART_PAYMENT_TYPES.EWALLET;

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="border-b border-border-light pb-4">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">
            {t("payment", "Ödeme Yöntemi")}
          </h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            {t("secure_escrow_payment_desc", "Ödemeniz güvenli havuz hesabında (Escrow) bloke edilir, onayınızdan sonra satıcıya aktarılır.")}
          </p>
        </div>
      </div>

      {/* Payment Selection Card */}
      <div>
        <label className={`group relative flex flex-col sm:flex-row cursor-pointer items-start justify-between gap-4 rounded border p-4 transition-all duration-150 ${
          isWalletSelected
            ? 'border-primary bg-background-secondary/60 ring-1 ring-primary'
            : 'border-border bg-background-primary hover:border-border-focus'
        }`}>
          <input
            type="radio"
            name="payment"
            value={CART_PAYMENT_TYPES.EWALLET}
            checked={isWalletSelected}
            onChange={event => setSelectedPaymentType(event.target.value)}
            className="sr-only"
          />

          {/* Left card content */}
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
              isWalletSelected ? 'border-primary' : 'border-border'
            }`}>
              {isWalletSelected && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-text-primary" strokeWidth={1.5} />
                <span className="text-xs font-semibold text-text-primary">
                  {t("wallet", "SecondHand Cüzdanım")}
                </span>
              </div>

              <div>
                <span className="text-2xs font-medium uppercase tracking-wider text-text-tertiary block">
                  Mevcut Bakiye
                </span>
                <span className="text-base font-semibold text-text-primary tabular-nums mt-0.5 block">
                  {eWallet ? formatCurrency(walletBalance, cur) : '0,00 ₺'}
                </span>
              </div>
            </div>
          </div>

          {/* Right badge & status */}
          <div className="flex flex-col sm:items-end justify-center self-stretch">
            <span className="text-2xs font-mono text-text-tertiary">
              •••• •••• •••• {eWallet?.id ? String(eWallet.id).padStart(4, '0').slice(-4) : '2026'}
            </span>
          </div>
        </label>
      </div>

      {/* Insufficient Funds Warning & Quick Link */}
      {!hasEnoughBalance && (
        <div className="rounded border border-border bg-background-primary p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-status-error-text mt-0.5" />
              <div>
                <strong className="font-semibold block text-status-error-text">Yetersiz Cüzdan Bakiyesi</strong>
                <span className="text-text-tertiary">{t("insufficient_wallet_balance_add_funds_to", "Bu siparişi tamamlamak için cüzdanınıza bakiye yüklemeniz gerekmektedir.")}</span>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(ROUTES.EWALLET || '/ewallet')}
              className="shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Bakiye Yükle</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Payment Agreements */}
      <div className="rounded border border-border bg-background-primary p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-text-primary" />
          <h4 className="text-xs font-semibold text-text-primary">
            Yasal Onaylar ve Sözleşmeler
          </h4>
        </div>
        <p className="text-xs text-text-tertiary">
          Siparişinizi tamamlayabilmek için lütfen aşağıdaki satış ve ön bilgilendirme koşullarını onaylayınız.
        </p>

        <PaymentAgreementsSection
          acceptedAgreements={acceptedAgreements}
          onToggle={onAgreementToggle}
          onRequiredAgreementsChange={onRequiredAgreementsChange}
        />
      </div>

      {/* Spending Limit Warning Prompt */}
      {warningData ? (
        <div className="rounded border border-border bg-background-secondary p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning-text" />
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-semibold text-text-primary">
                {t("spending_limit_warning", "Aylık Harcama Limiti Uyarısı")}
              </h3>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                {t("with_this_order_monthly_spending_reaches", "Bu sipariş ile birlikte aylık harcama limitiniz")} {' '}
                <strong className="font-semibold text-text-primary tabular-nums">{formatCurrency(warningData.projectedSpending, cur)}</strong> seviyesine ulaşacaktır.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setWarningData(null)}
                >
                  {t("cancel", "İptal Et")}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNext}
                >
                  {t("continue_anyway", "Yine de Devam Et")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Navigation */
        <div className="border-t border-border-light pt-4">
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <Button
              variant="secondary"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
              {t("back", "Adres Adımına Dön")}
            </Button>

            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed || isCheckingWarning}
            >
              {isCheckingWarning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Kontrol Ediliyor...</span>
                </>
              ) : (
                <>
                  <span>{t("continue", "Siparişi İncele")}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(CheckoutPaymentStep);