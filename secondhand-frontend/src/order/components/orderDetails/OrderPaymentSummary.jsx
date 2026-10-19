import { useTranslation } from "react-i18next";
import React from 'react';

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
  sellerTotalAmount,
  resolveEnumLabel,
  formatCurrency,
  getPaymentStatusIndicatorClass,
  getPaymentStatusTextClass
}) => {
  const { t } = useTranslation();
  const { currency, subtotal, couponDiscount, paymentProviderName, paymentStatus } = selectedOrder;
  const total = isSellerView ? sellerTotalAmount : selectedOrder.totalAmount;

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold text-text-primary">{t("payment_summary", "Ödeme özeti")}</h3>

      <dl className="space-y-3 text-sm">
        {!isSellerView && subtotal != null ? (
          <Row label={t("subtotal", "Ara toplam")}>{formatCurrency(subtotal, currency)}</Row>
        ) : null}

        {!isSellerView && couponDiscount > 0 ? (
          <Row label={t("od_coupon_discount", "Kupon indirimi")}>-{formatCurrency(couponDiscount, currency)}</Row>
        ) : null}

        {paymentProviderName ? (
          <Row label={t("payment_method", "Ödeme yöntemi")}>{paymentProviderName}</Row>
        ) : null}

        {paymentStatus ? (
          <Row label={t("payment_status", "Ödeme durumu")}>
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${getPaymentStatusIndicatorClass(paymentStatus)}`} aria-hidden />
              <span className={getPaymentStatusTextClass(paymentStatus)}>
                {resolveEnumLabel('paymentStatuses', paymentStatus) || paymentStatus}
              </span>
            </span>
          </Row>
        ) : null}
      </dl>

      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-border-light pt-4">
        <span className="text-sm font-medium text-text-primary">{t("od_total", "Toplam")}</span>
        <span className="text-xl font-semibold tabular-nums text-text-primary">{formatCurrency(total, currency)}</span>
      </div>

      <p className="mt-3 text-sm text-text-tertiary">{t("od_escrow_note", "Ödeme, teslimat onaylanana kadar escrow havuzunda tutulur.")}</p>
    </Card>
  );
});

OrderPaymentSummary.displayName = 'OrderPaymentSummary';
