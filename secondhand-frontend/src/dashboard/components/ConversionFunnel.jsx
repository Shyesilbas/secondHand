import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';

const rate = (value) => `${Number(value || 0).toLocaleString('tr-TR', { maximumFractionDigits: 1 })}%`;

/** Views → favorites → offers → sales, with the step-to-step rate between each pair. */
const ConversionFunnel = ({ funnel }) => {
  const { t } = useTranslation();
  if (!funnel) return null;

  const steps = [
    { id: 'views', label: t('dash_funnel_views', 'Görüntülenme'), value: funnel.totalViews },
    { id: 'favorites', label: t('dash_funnel_favorites', 'Favori'), value: funnel.totalFavorites, rate: funnel.viewToFavoriteRate },
    { id: 'offers', label: t('dash_funnel_offers', 'Teklif'), value: funnel.totalOffers, rate: funnel.favoriteToOfferRate },
    { id: 'orders', label: t('dash_funnel_orders', 'Satış'), value: funnel.totalOrders },
  ];

  return (
    <div>
      <ol className="grid grid-cols-2 gap-y-4 sm:grid-cols-4">
        {steps.map((step, idx) => (
          <li key={step.id} className="flex items-start gap-2">
            {idx > 0 && <ChevronRight className="mt-1 hidden h-4 w-4 shrink-0 text-text-muted sm:block" strokeWidth={1.5} aria-hidden />}
            <div className="min-w-0">
              <p className="text-xs text-text-tertiary">{step.label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-text-primary">{Number(step.value || 0).toLocaleString('tr-TR')}</p>
              {step.rate != null && <p className="text-xs tabular-nums text-text-tertiary">{rate(step.rate)}</p>}
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 border-t border-border-light pt-3 text-sm text-text-secondary">
        {t('dash_overall_conversion', 'Görüntülenmeden satışa')}
        <span className="ml-2 font-semibold tabular-nums text-text-primary">{rate(funnel.overallConversionRate)}</span>
      </p>
    </div>
  );
};

export default ConversionFunnel;
