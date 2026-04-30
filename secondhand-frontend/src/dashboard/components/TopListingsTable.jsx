import { Package, Star, ShoppingBag, Heart } from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';
import { motion } from 'framer-motion';

const TopListingsTable = ({ listings, title = 'Top Listings' }) => {
  if (!listings || listings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-xl rounded-[24px] border border-white shadow-xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-gray-50 rounded-2xl mx-auto flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-500 text-sm font-medium">No listings available</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-xl rounded-[24px] border border-white shadow-xl p-6"
    >
      <h3 className="text-lg font-black text-gray-900 mb-6 tracking-tight">{title}</h3>
      <div className="space-y-3">
        {listings.map((listing, index) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            key={listing.listingId}
            className="group flex flex-col sm:flex-row items-center sm:justify-between p-4 rounded-[16px] bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 gap-4"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
              <div className="w-12 h-12 bg-indigo-50/50 rounded-[12px] border border-indigo-100/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Package className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{listing.title}</p>
                <p className="text-[11px] text-gray-500 font-bold tracking-wider mt-0.5 uppercase">{listing.listingNo}</p>
              </div>
            </div>

            <div className="flex items-center sm:gap-6 gap-3 w-full sm:w-auto justify-between sm:justify-end flex-shrink-0 bg-gray-50/50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
              <div className="flex items-center gap-2 text-gray-600 bg-white sm:bg-transparent px-2 py-1 sm:p-0 rounded-lg shadow-sm sm:shadow-none border sm:border-transparent border-gray-100">
                <ShoppingBag className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold">{listing.orderCount}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 bg-white sm:bg-transparent px-2 py-1 sm:p-0 rounded-lg shadow-sm sm:shadow-none border sm:border-transparent border-gray-100">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-bold">{listing.favoriteCount}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 bg-white sm:bg-transparent px-2 py-1 sm:p-0 rounded-lg shadow-sm sm:shadow-none border sm:border-transparent border-gray-100">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold">
                  {listing.averageRating ? listing.averageRating.toFixed(1) : 'N/A'}
                </span>
              </div>
              <div className="text-right ml-2">
                <p className="text-sm font-black text-emerald-600">
                  {formatCurrency(listing.revenue, 'TRY')}
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Revenue</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TopListingsTable;
