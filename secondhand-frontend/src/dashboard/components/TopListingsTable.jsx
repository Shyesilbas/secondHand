import { useTranslation } from "react-i18next";
import { Heart, Package, ShoppingBag, Star } from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';
import { motion } from 'framer-motion';

const TopListingsTable = ({
  listings,
  title = 'Top Listings'
}) => {
  const { t } = useTranslation();

  if (!listings || listings.length === 0) {
    return (
      <div className="bg-background-primary rounded border border-border p-8 text-center">
        <Package className="mx-auto mb-3 block h-5 w-5 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
        <h3 className="text-sm font-medium text-text-primary mb-1">{title}</h3>
        <p className="text-text-muted text-xs font-medium">{t("no_listings_data_for_this_period")}</p>
      </div>
    );
  }

  return (
    <div className="bg-background-primary rounded border border-border p-5">
      <h3 className="text-sm font-medium text-text-primary mb-4">{title}</h3>
      <div className="space-y-2">
        {listings.map((listing, index) => (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            key={listing.listingId}
            className="group flex items-center gap-3 p-3 rounded hover:bg-background-secondary/80 transition-colors duration-200"
          >
            <span className="text-xs font-semibold text-text-muted w-5 text-center">{index + 1}</span>

            {listing.mainImageUrl ? (
              <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-border-light">
                <img src={listing.mainImageUrl} alt={listing.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <Package className="h-5 w-5 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{listing.title}</p>
              <p className="text-xs text-text-muted font-medium">{listing.listingNo}</p>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-1 text-text-tertiary" title={t("orders")}>
                <ShoppingBag className="w-3 h-3 text-text-secondary" />
                <span className="text-xs font-semibold tabular-nums">{listing.orderCount}</span>
              </div>
              <div className="flex items-center gap-1 text-text-tertiary" title={t("favorites")}>
                <Heart className="w-3 h-3 text-text-muted" />
                <span className="text-xs font-semibold tabular-nums">{listing.favoriteCount}</span>
              </div>
              <div className="flex items-center gap-1 text-text-tertiary" title={t("rating")}>
                <Star className={`w-3 h-3 ${listing.averageRating > 0 ? 'text-status-warning fill-status-warning' : 'text-text-muted'}`} />
                <span className="text-xs font-semibold tabular-nums">
                  {listing.averageRating > 0 ? listing.averageRating.toFixed(1) : '—'}
                </span>
              </div>
              <div className="text-right min-w-20">
                <p className="text-xs font-semibold text-status-success-text tabular-nums">
                  {formatCurrency(listing.revenue, 'TRY')}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TopListingsTable;