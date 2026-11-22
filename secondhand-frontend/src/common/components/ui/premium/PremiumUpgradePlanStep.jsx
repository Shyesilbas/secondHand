import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { AGREEMENT_TYPE_LABELS } from '../../../../agreements/agreements.js';
import { formatCurrency } from '../../../formatters.js';
import Card from '../Card.jsx';

const getAgreementLabel = (agreement, t) => {
  const type = agreement?.agreementType;
  if (type === 'DISTANCE_SELLING') return t('agreement_distance_selling', 'Mesafeli Satış Sözleşmesi');
  if (type === 'PAYMENT_TERMS') return t('agreement_payment_terms', 'Ödeme ve Üyelik Koşulları');
  if (type === 'TERMS_OF_SERVICE') return t('agreement_terms_of_service', 'Kullanıcı Sözleşmesi');
  if (type === 'KVKK') return t('agreement_kvkk', 'KVKK Aydınlatma Metni');
  if (type === 'PRIVACY_POLICY') return t('agreement_privacy_policy', 'Gizlilik Politikası');
  return (
    (t ? t(`agreement_${String(type).toLowerCase()}`, AGREEMENT_TYPE_LABELS[type]) : null) ||
    AGREEMENT_TYPE_LABELS[type] ||
    agreement?.title ||
    (t ? t('agreement_membership', 'Üyelik Sözleşmesi') : 'Üyelik Sözleşmesi')
  );
};

const PremiumUpgradePlanStep = ({
  premiumPrice,
  features,
  agreements,
  acceptedAgreements,
  onAgreementToggle,
  fallbackAccepted,
  onFallbackToggle
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 py-1">
      <Card surface="secondary" padding="compact" shadow={false} className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-text-primary">
            {t('premium_plan_title', 'PRO Üyelik Planı')}
          </span>
          <p className="mt-0.5 text-sm text-text-tertiary">
            {t('auto_renews_monthly', 'Aylık yenilenir, dilediğiniz an tek tıkla iptal edilebilir.')}
          </p>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold tabular-nums tracking-tight text-text-price">
            {premiumPrice != null ? formatCurrency(premiumPrice, 'TRY') : '—'}
          </span>
          <span className="text-sm font-normal text-text-tertiary">
            / {t('per_month', 'ay')}
          </span>
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="grid grid-cols-12 bg-background-secondary px-4 py-2.5 text-sm font-medium">
          <div className="col-span-5 text-text-secondary">{t('privileges', 'Ayrıcalık')}</div>
          <div className="col-span-3 text-text-muted">{t('standard', 'Standart')}</div>
          <div className="col-span-4 text-text-primary">{t('pro_membership', 'PRO Plan')}</div>
        </div>

        <div className="divide-y divide-border-light text-sm">
          {features.map((feature) => (
            <div
              key={feature.label}
              className="grid grid-cols-12 items-center px-4 py-3"
            >
              <div className="col-span-5 pr-2 font-medium text-text-primary">{feature.label}</div>
              <div className="col-span-3 tabular-nums text-text-muted">{feature.free}</div>
              <div className="col-span-4 flex items-center gap-1.5 font-medium tabular-nums text-text-primary">
                <Check className="h-3.5 w-3.5 shrink-0 text-status-success" strokeWidth={1.5} aria-hidden />
                <span>{feature.premium}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-2">
        {agreements && agreements.length > 0 ? (
          agreements.map((agreement) => {
            const isChecked = acceptedAgreements.has(agreement.agreementId);
            return (
              <label
                key={agreement.agreementId}
                className="flex cursor-pointer select-none items-start gap-2.5 text-sm text-text-secondary"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onAgreementToggle(agreement.agreementId)}
                  className="mt-1 h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-border text-primary accent-primary focus:ring-border-focus"
                />
                <span className="leading-snug">
                  <span className="font-medium text-text-primary">{getAgreementLabel(agreement, t)}</span>{' '}
                  {t('kosullarini_kabul_ediyorum', 'şartlarını okudum ve kabul ediyorum.')}
                </span>
              </label>
            );
          })
        ) : (
          <label className="flex cursor-pointer select-none items-start gap-2.5 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={fallbackAccepted}
              onChange={(e) => onFallbackToggle(e.target.checked)}
              className="mt-1 h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-border text-primary accent-primary focus:ring-border-focus"
            />
            <span className="leading-snug">
              <span className="font-medium text-text-primary">
                {t('distance_sales_pro_terms', 'Mesafeli Satış ve PRO Üyelik Koşulları')}
              </span>{' '}
              {t('kosullarini_kabul_ediyorum', 'metnini okudum, onaylıyorum.')}
            </span>
          </label>
        )}
      </div>

    </div>
  );
};

export default PremiumUpgradePlanStep;
