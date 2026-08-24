import React from 'react';
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
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {t('offer_analytics', 'Teklif Analitiği')}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('offer_analytics_desc', 'Gelen pazarlık teklifleri ve kabul performansı')}
          </p>
        </div>
        <Link
          to={ROUTES.OFFERS}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
        >
          <span>{t('manage_offers', 'Teklifleri Yönet')}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Received */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('total_received', 'Toplam Teklif')}</span>
          </div>
          <div className="text-xl font-black text-slate-900">
            {offerStats.totalOffersReceived || 0}
          </div>
        </div>

        {/* Pending */}
        <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('pending_offers', 'Bekleyen')}</span>
          </div>
          <div className="text-xl font-black text-amber-900">
            {offerStats.pendingOffers || 0}
          </div>
        </div>

        {/* Accepted */}
        <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('accepted_offers', 'Kabul Edilen')}</span>
          </div>
          <div className="text-xl font-black text-emerald-900">
            {offerStats.acceptedOffers || 0}
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800 mb-1">
            <span>{t('acceptance_rate', 'Kabul Oranı')}</span>
          </div>
          <div className="text-xl font-black text-indigo-900">
            %{offerStats.acceptanceRate || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferAnalyticsCard;
