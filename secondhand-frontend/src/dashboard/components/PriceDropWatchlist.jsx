import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, ArrowRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/common/constants/routes';
import { formatCurrency } from '@/common/formatters';
import { optimizeCloudinaryUrl } from '@/common/utils/imageOptimizer.js';
import { useTranslation } from 'react-i18next';

const PriceDropWatchlist = ({ priceDrops = [] }) => {
  const { t } = useTranslation();

  if (!priceDrops || priceDrops.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-200">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              {t('watchlist_deals', 'Favorilerinizdeki Fırsatlar')}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t('watchlist_deals_desc', 'Takip ettiğiniz ürünlerdeki fırsat ve indirimler')}
            </p>
          </div>
        </div>

        <Link
          to={ROUTES.FAVORITES}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
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
            className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative mb-2.5">
                <img
                  src={optimizeCloudinaryUrl(item.imageUrl, { width: 300, height: 200, crop: 'fill' })}
                  alt={item.title}
                  className="w-full h-28 rounded-xl object-cover border border-slate-200/80"
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black uppercase shadow-xs">
                  {item.campaignName || 'Fırsat'}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                {item.title}
              </h4>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-slate-900">
                  {formatCurrency(item.currentPrice, 'TRY')}
                </span>
              </div>

              <Link
                to={ROUTES.LISTING_DETAIL(item.listingId)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-lg transition-colors"
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
