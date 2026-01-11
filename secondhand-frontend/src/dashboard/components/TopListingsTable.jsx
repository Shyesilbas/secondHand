import React from 'react';
import { Package, Star, ShoppingBag, Heart } from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';

const TopListingsTable = ({ listings, title = 'Top Listings' }) => {
  if (!listings || listings.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200/60 p-6">
        <h3 className="text-xs font-semibold text-gray-900 mb-4 tracking-tight">{title}</h3>
        <p className="text-gray-500 text-xs font-medium text-center py-8">No listings available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200/60 p-5">
      <h3 className="text-xs font-semibold text-gray-900 mb-5 tracking-tight">{title}</h3>
      <div className="space-y-2">
        {listings.map((listing, index) => (
          <div key={listing.listingId} className="flex items-center justify-between p-3 rounded-lg border border-gray-200/60 hover:border-gray-300/60 hover:bg-gray-50/50 transition-all">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gray-50 rounded-md border border-gray-200/60 flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate tracking-tight">{listing.title}</p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">{listing.listingNo}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-900 tracking-tight">
                  {formatCurrency(listing.revenue, 'TRY')}
                </p>
                <p className="text-[10px] text-gray-500 font-medium">Revenue</p>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <ShoppingBag className="w-3 h-3" />
                <span className="text-xs font-medium">{listing.orderCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Heart className="w-3 h-3" />
                <span className="text-xs font-medium">{listing.favoriteCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs font-medium">
                  {listing.averageRating ? listing.averageRating.toFixed(1) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopListingsTable;

