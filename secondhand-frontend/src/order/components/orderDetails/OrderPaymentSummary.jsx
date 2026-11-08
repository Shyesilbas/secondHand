import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { Check, FileText } from 'lucide-react';
import { useRequiredAgreements } from '../../../agreements/hooks/useAgreements.js';
import { AGREEMENT_TYPE_LABELS } from '../../../agreements/agreements.js';
import AgreementModal from '../../../agreements/components/AgreementModal.jsx';

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
  const { requiredAgreements: agreements = [] } = useRequiredAgreements('ONLINE_PAYMENT');
  const [selectedAgreement, setSelectedAgreement] = useState(null);

  return (
    <>
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

        {!isSellerView && agreements.length > 0 && (
          <div className="mt-4 border-t border-border-light pt-4">
            <p className="mb-2 text-xs font-medium text-text-tertiary">
              {t("od_accepted_agreements", "Onaylanan sözleşmeler")}
            </p>
            <div className="space-y-2">
              {agreements.map((agreement) => {
                const agreementName = AGREEMENT_TYPE_LABELS[agreement.agreementType] || agreement.agreementType;
                return (
                  <div
                    key={agreement.agreementId}
                    className="flex items-start justify-between gap-3 rounded border border-border bg-background-secondary/70 px-3 py-2.5 text-xs"
                  >
                    <div className="flex min-w-0 items-start gap-2">
                      <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-primary text-white">
                        <Check className="h-3 w-3" strokeWidth={2} aria-hidden />
                      </span>
                      <div className="min-w-0 leading-relaxed text-text-secondary">
                        <button
                          type="button"
                          onClick={() => setSelectedAgreement(agreement)}
                          className="mr-1 cursor-pointer text-left font-medium text-text-primary underline hover:text-primary"
                        >
                          {agreementName}
                        </button>
                        <span>{t("od_agreement_accepted_suffix", "metnini okudum, onayladım.")}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAgreement(agreement)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-medium text-text-tertiary transition-colors hover:bg-background-primary hover:text-text-primary"
                    >
                      <FileText className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                      <span>{t("read", "Oku")}</span>
                    </button>
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
