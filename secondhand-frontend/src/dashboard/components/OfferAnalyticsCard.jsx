import { Tag, CheckCircle2, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/common/constants/routes';
import { useTranslation } from 'react-i18next';

const OfferAnalyticsCard = ({ offerStats }) => {
  const { t } = useTranslation();

  if (!offerStats) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            {t('offer_analytics', 'Teklif Analitiği')}
          </h3>
          <p className="text-xs text-text-tertiary mt-0.5">
            {t('offer_analytics_desc', 'Gelen pazarlık teklifleri ve kabul performansı')}
          </p>
        </div>
        <Link
          to={ROUTES.OFFERS}
          className="inline-flex items-center gap-1 text-xs font-semibold text-text-primary hover:text-text-primary bg-background-secondary hover:bg-background-tertiary px-3 py-1.5 rounded transition-colors"
        >
          <span>{t('manage_offers', 'Teklifleri Yönet')}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Received */}
        <div className="p-3.5 bg-background-secondary rounded-md border border-border/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-tertiary mb-1">
            <Tag className="w-3.5 h-3.5 text-text-muted" />
            <span>{t('total_received', 'Toplam Teklif')}</span>
          </div>
          <div className="text-xl font-semibold text-text-primary">
            {offerStats.totalOffersReceived || 0}
          </div>
        </div>

        {/* Pending */}
        <div className="p-3.5 bg-background-secondary/70 rounded-md border border-border/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-status-warning-text mb-1">
            <Clock className="w-3.5 h-3.5 text-status-warning-text" />
            <span>{t('pending_offers', 'Bekleyen')}</span>
          </div>
          <div className="text-xl font-semibold text-status-warning-text">
            {offerStats.pendingOffers || 0}
          </div>
        </div>

        {/* Accepted */}
        <div className="p-3.5 bg-background-secondary/70 rounded-md border border-border/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-status-success-text mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-status-success-text" />
            <span>{t('accepted_offers', 'Kabul Edilen')}</span>
          </div>
          <div className="text-xl font-semibold text-status-success-text">
            {offerStats.acceptedOffers || 0}
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="p-3.5 bg-background-secondary/70 rounded-md border border-border/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary mb-1">
            <span>{t('acceptance_rate', 'Kabul Oranı')}</span>
          </div>
          <div className="text-xl font-semibold text-text-primary">
            %{offerStats.acceptanceRate || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferAnalyticsCard;
