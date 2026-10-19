import { motion } from 'framer-motion';
import { Eye, Heart, Tag, ShoppingBag, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ConversionFunnel = ({ funnel }) => {
  const { t } = useTranslation();

  if (!funnel) return null;

  const steps = [
    {
      id: 'views',
      label: t('funnel_views', 'Görüntülenme'),
      value: funnel.totalViews || 0,
      icon: Eye,
      color: 'bg-background-tertiary text-text-primary border-border',
      pillBg: 'bg-background-secondary text-text-primary',
      conversion: funnel.viewToFavoriteRate ? `${funnel.viewToFavoriteRate}%` : '0%',
      conversionLabel: t('to_fav', 'Favoriye')
    },
    {
      id: 'favorites',
      label: t('funnel_favorites', 'Favoriye Ekleme'),
      value: funnel.totalFavorites || 0,
      icon: Heart,
      color: 'bg-background-tertiary text-status-error-text border-border',
      pillBg: 'bg-background-secondary text-status-error-text',
      conversion: funnel.favoriteToOfferRate ? `${funnel.favoriteToOfferRate}%` : '0%',
      conversionLabel: t('to_offer', 'Teklife')
    },
    {
      id: 'offers',
      label: t('funnel_offers', 'Gelen Teklifler'),
      value: funnel.totalOffers || 0,
      icon: Tag,
      color: 'bg-background-tertiary text-status-warning-text border-border',
      pillBg: 'bg-background-secondary text-status-warning-text',
      conversion: funnel.overallConversionRate ? `${funnel.overallConversionRate}%` : '0%',
      conversionLabel: t('to_sale', 'Satışa')
    },
    {
      id: 'orders',
      label: t('funnel_orders', 'Tamamlanan Satış'),
      value: funnel.totalOrders || 0,
      icon: ShoppingBag,
      color: 'bg-background-tertiary text-status-success-text border-border',
      pillBg: 'bg-background-secondary text-status-success-text',
      conversion: null
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            {t('sales_funnel', 'Satış Hunisi & Dönüşüm Analizi')}
          </h3>
          <p className="text-xs text-text-tertiary mt-0.5">
            {t('funnel_desc', 'Ziyaretçilerin satın alma adımlarındaki ilerleme ve kayıp oranları')}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-background-secondary text-status-success-text rounded text-xs font-semibold border border-border">
          <span>{t('overall_rate', 'Genel Dönüşüm:')}</span>
          <span>%{funnel.overallConversionRate || 0}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
              className="relative p-4 rounded bg-background-primary border border-border flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded flex items-center justify-center border ${step.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-xs font-semibold text-text-muted">
                    #{idx + 1}
                  </span>
                </div>

                <div className="text-2xl font-semibold text-text-primary tracking-tight tabular-nums">
                  {step.value.toLocaleString()}
                </div>
                <div className="text-xs font-semibold text-text-secondary mt-0.5">
                  {step.label}
                </div>
              </div>

              {step.conversion && (
                <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between text-xs">
                  <span className="text-xs text-text-muted font-medium">{step.conversionLabel}</span>
                  <div className="flex items-center gap-1 font-semibold text-text-secondary">
                    <span>{step.conversion}</span>
                    <ArrowRight className="w-3 h-3 text-text-muted" />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversionFunnel;
