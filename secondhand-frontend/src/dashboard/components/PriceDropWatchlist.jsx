import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/common/constants/routes';
import { formatCurrency } from '@/common/formatters';
import { optimizeCloudinaryUrl } from '@/common/utils/imageOptimizer.js';
import { useTranslation } from 'react-i18next';

const PriceDropWatchlist = ({ priceDrops = [] }) => {
  const { t } = useTranslation();

  if (!priceDrops || priceDrops.length === 0) return null;

  return (
    <div className="bg-background-primary rounded border border-border p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 shrink-0 text-text-primary" strokeWidth={1.5} aria-hidden />
          <div>
            <h3 className="text-sm font-semibold text-text-primary tracking-tight">
              {t('watchlist_deals', 'Favorilerinizdeki Fırsatlar')}
            </h3>
            <p className="text-xs text-text-tertiary font-medium">
              {t('watchlist_deals_desc', 'Takip ettiğiniz ürünlerdeki fırsat ve indirimler')}
            </p>
          </div>
        </div>

        <Link
          to={ROUTES.FAVORITES}
          className="text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors"
        >
          <span>{t('all_favorites', 'Tüm Favoriler')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {priceDrops.map((item, idx) => (
          <motion.div
            key={item.listingId || idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.06 }}
            className="p-3.5 rounded bg-background-secondary/70 hover:bg-background-secondary border border-border transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative mb-2.5">
                <img
                  src={optimizeCloudinaryUrl(item.imageUrl, { width: 300, height: 200, crop: 'fill' })}
                  alt={item.title}
                  className="w-full h-28 rounded object-cover border border-border"
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-sm bg-background-primary/95 text-text-primary border border-border text-xs font-medium">
                  {item.campaignName || 'Fırsat'}
                </span>
              </div>

              <h4 className="text-xs font-semibold text-text-primary line-clamp-1 mb-1">
                {item.title}
              </h4>
            </div>

            <div className="mt-2 pt-2 border-t border-border-light flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-text-primary tabular-nums">
                  {formatCurrency(item.currentPrice, 'TRY')}
                </span>
              </div>

              <Link
                to={ROUTES.LISTING_DETAIL(item.listingId)}
                className="inline-flex items-center justify-center rounded text-xs font-medium transition-colors bg-primary text-white hover:bg-primary-hover h-7 px-2.5"
              >
                {t('view_deal', 'İncele')}
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PriceDropWatchlist;
