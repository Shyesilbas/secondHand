import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { Check, FileText, ShieldCheck } from 'lucide-react';
import { useRequiredAgreements } from '../../../agreements/hooks/useAgreements.js';
import { agreementLabel } from '../../../agreements/agreements.js';
import AgreementModal from '../../../agreements/components/AgreementModal.jsx';
import Button from '../../../common/components/ui/Button.jsx';
import { ORDER_STATUSES } from '../../constants/orderUiConstants.js';
import { getPaymentProviderLabel, getPaymentStatusLabel } from '../../utils/statusPresentation.js';

const Row = ({ label, children }) => (
  <div className="flex items-baseline justify-between gap-4">
    <dt className="text-text-secondary">{label}</dt>
    <dd className="text-right font-medium tabular-nums text-text-primary">{children}</dd>
  </div>
);

export const OrderPaymentSummary = React.memo(({
  CardComponent: Card,
  isSellerView,
  selectedOrder,
  enums,
  formatCurrency,
  getPaymentStatusIndicatorClass,
  getPaymentStatusTextClass
}) => {
  const { t } = useTranslation();
  const { currency, subtotal, couponDiscount, paymentProviderName, paymentStatus } = selectedOrder;
  // Seller view: backend sellerTotal (escrow share, cancelled/refunded lines excluded); buyer view: order total.
  const shippingFee = Number(selectedOrder.shippingFee) || 0;
  const sellerCommission = Number(selectedOrder.sellerCommission) || 0;
  const sellerGross = Number(selectedOrder.sellerGross) || 0;
  const sellerShippingDeduction = Number(selectedOrder.sellerShippingDeduction) || 0;
  const hasSellerDeductions = sellerCommission > 0 || sellerShippingDeduction > 0;
  const commissionRate = sellerGross > 0 ? Math.round((sellerCommission / sellerGross) * 1000) / 10 : null;
  // Buyer total adds the cargo fee, which is paid to the platform and is not part of totalAmount.
  const total = isSellerView
    ? selectedOrder.sellerTotal
    : (selectedOrder.totalAmount != null ? Number(selectedOrder.totalAmount) + shippingFee : null);
  const { requiredAgreements: agreements = [] } = useRequiredAgreements('ONLINE_PAYMENT');
  const [selectedAgreement, setSelectedAgreement] = useState(null);

  const orderStatus = String(selectedOrder?.status || '').toUpperCase();
  const showEscrowNotice = Boolean(
    selectedOrder?.status &&
    ![
      ORDER_STATUSES.CANCELLED,
      ORDER_STATUSES.REFUNDED,
      ORDER_STATUSES.COMPLETED
    ].includes(orderStatus)
  );

  const paymentMethodLabel = getPaymentProviderLabel(t, paymentProviderName);
  const paymentStatusLabel = getPaymentStatusLabel(t, enums, paymentStatus);

  return (
    <>
      <Card>
        <h3 className="mb-4 text-base font-semibold text-text-primary">{t('payment_summary', 'Ödeme özeti')}</h3>

        <dl className="space-y-3 text-sm">
          {!isSellerView && subtotal != null ? (
            <Row label={t('subtotal', 'Ara toplam')}>{formatCurrency(subtotal, currency)}</Row>
          ) : null}

          {!isSellerView && couponDiscount > 0 ? (
            <Row label={t('od_coupon_discount', 'Kupon indirimi')}>-{formatCurrency(couponDiscount, currency)}</Row>
          ) : null}

          {!isSellerView && shippingFee > 0 ? (
            <Row label={t('shipping_fee', 'Kargo ücreti')}>
              {formatCurrency(shippingFee, currency)}
              {selectedOrder.shippingFeeRefunded ? ` (${t('refunded', 'İade edildi')})` : ''}
            </Row>
          ) : null}

          {isSellerView && hasSellerDeductions ? (
            <>
              <Row label={t('od_sale_amount', 'Satış tutarı')}>{formatCurrency(sellerGross, currency)}</Row>
              {sellerCommission > 0 ? (
                <Row label={commissionRate != null
                  ? t('od_commission_rate', 'Komisyon (%{{rate}})', { rate: commissionRate })
                  : t('od_commission', 'Komisyon')}>
                  -{formatCurrency(sellerCommission, currency)}
                </Row>
              ) : null}
              {sellerShippingDeduction > 0 ? (
                <Row label={t('od_shipping_deduction', 'Kargo kesintisi (ücretsiz kargo)')}>
                  -{formatCurrency(sellerShippingDeduction, currency)}
                </Row>
              ) : null}
            </>
          ) : null}

          {paymentProviderName ? (
            <Row label={t('payment_method', 'Ödeme yöntemi')}>{paymentMethodLabel}</Row>
          ) : null}

          {paymentStatus ? (
            <Row label={t('payment_status', 'Ödeme durumu')}>
              <span className="inline-flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${getPaymentStatusIndicatorClass(paymentStatus)}`} aria-hidden />
                <span className={getPaymentStatusTextClass(paymentStatus)}>
                  {paymentStatusLabel}
                </span>
              </span>
            </Row>
          ) : null}
        </dl>

        <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-border-light pt-4">
          <span className="text-sm font-semibold text-text-primary">{isSellerView && hasSellerDeductions ? t('od_net_payout', 'Size aktarılan') : t('od_total', 'Toplam')}</span>
          <span className="text-xl font-semibold tabular-nums tracking-tight text-text-price">
            {total != null ? formatCurrency(total, currency) : '—'}
          </span>
        </div>

        {showEscrowNotice && (
          <div className="mt-4 flex items-start gap-2.5 rounded bg-background-secondary px-3 py-2.5 text-sm text-text-secondary">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
            <span>{t('od_escrow_note', 'Ödeme, teslimat onaylanana kadar escrow havuzunda tutulur.')}</span>
          </div>
        )}

        {!isSellerView && agreements.length > 0 && (
          <div className="mt-4 border-t border-border-light pt-4">
            <p className="mb-2.5 text-sm font-medium text-text-secondary">
              {t('od_accepted_agreements', 'Onaylanan sözleşmeler')}
            </p>
            <div className="space-y-2">
              {agreements.map((agreement) => {
                const agreementName = agreementLabel(t, agreement.agreementType);
                return (
                  <div
                    key={agreement.agreementId}
                    className="flex items-start justify-between gap-3 rounded bg-background-secondary px-3 py-2.5 text-sm"
                  >
                    <div className="flex min-w-0 items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                      <div className="min-w-0 text-text-secondary">
                        <button
                          type="button"
                          onClick={() => setSelectedAgreement(agreement)}
                          className="mr-1 rounded-sm text-left font-medium text-text-link underline underline-offset-2 transition-colors duration-150 hover:text-text-linkHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                        >
                          {agreementName}
                        </button>
                        <span>{t('od_agreement_accepted_suffix', 'metnini okudum, onayladım.')}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAgreement(agreement)}
                      aria-label={`${t('read', 'Oku')}: ${agreementName}`}
                      className="shrink-0"
                    >
                      <FileText className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                      <span>{t('read', 'Oku')}</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <AgreementModal
        agreement={selectedAgreement}
        open={Boolean(selectedAgreement)}
        onClose={() => setSelectedAgreement(null)}
        isAccepted
      />
    </>
  );
});

OrderPaymentSummary.displayName = 'OrderPaymentSummary';
