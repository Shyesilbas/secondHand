import { useTranslation } from "react-i18next";
import { Heart, Package, ShoppingBag, Star } from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';
import { motion } from 'framer-motion';
const TopListingsTable = ({
  listings,
  title = 'Top Listings'
}) => {
  const {
    t
  } = useTranslation();
  if (!listings || listings.length === 0) {
    return <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
        <div className="w-12 h-12 bg-slate-50 rounded-xl mx-auto flex items-center justify-center mb-3">
          <Package className="w-6 h-6 text-slate-300" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-slate-400 text-xs font-medium">{t("no_listings_data_for_this_period")}</p>
      </div>;
  }
  return <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {listings.map((listing, index) => <motion.div initial={{
        opacity: 0,
        x: -8
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: index * 0.04
      }} key={listing.listingId} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50/80 transition-colors duration-200">
            <span className="text-[10px] font-bold text-slate-400 w-5 text-center">{index + 1}</span>
            
            {listing.mainImageUrl ? <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                <img src={listing.mainImageUrl} alt={listing.title} className="w-full h-full object-cover" />
              </div> : <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-slate-300" />
              </div>}
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{listing.title}</p>
              <p className="text-[10px] text-slate-400 font-medium">{listing.listingNo}</p>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-1 text-slate-500" title={t("orders")}>
                <ShoppingBag className="w-3 h-3 text-emerald-500" />
                <span className="text-[11px] font-bold">{listing.orderCount}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500" title={t("favorites")}>
                <Heart className="w-3 h-3 text-pink-400" />
                <span className="text-[11px] font-bold">{listing.favoriteCount}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500" title={t("rating")}>
                <Star className={`w-3 h-3 ${listing.averageRating > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                <span className="text-[11px] font-bold">
                  {listing.averageRating > 0 ? listing.averageRating.toFixed(1) : '—'}
                </span>
              </div>
              <div className="text-right min-w-[80px]">
                <p className="text-xs font-extrabold text-emerald-600">
                  {formatCurrency(listing.revenue, 'TRY')}
                </p>
              </div>
            </div>
          </motion.div>)}
      </div>
    </div>;
};
export default TopListingsTable;