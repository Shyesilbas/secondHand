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
    <div className="bg-white rounded-md border border-border/90 p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 shrink-0 text-status-warning-text" strokeWidth={1.5} aria-hidden />
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
            className="p-3.5 rounded-md bg-background-secondary/70 hover:bg-background-secondary border border-border/80 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative mb-2.5">
                <img
                  src={optimizeCloudinaryUrl(item.imageUrl, { width: 300, height: 200, crop: 'fill' })}
                  alt={item.title}
                  className="w-full h-28 rounded object-cover border border-border/80"
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-status-warning text-white text-xs font-semibold">
                  {item.campaignName || 'Fırsat'}
                </span>
              </div>

              <h4 className="text-xs font-semibold text-text-primary line-clamp-1 mb-1">
                {item.title}
              </h4>
            </div>

            <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-text-primary">
                  {formatCurrency(item.currentPrice, 'TRY')}
                </span>
              </div>

              <Link
                to={ROUTES.LISTING_DETAIL(item.listingId)}
                className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-9 px-3"
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
