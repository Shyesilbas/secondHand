import React from 'react';
import { Package, Star, ShoppingBag, Heart } from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';

const TopListingsTable = ({ listings, title = 'Top Listings' }) => {
  if (!listings || listings.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-500 text-sm text-center py-8">No listings available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Listing</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Revenue</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Orders</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Favorites</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Rating</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing, index) => (
              <tr key={listing.listingId} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <Package className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{listing.title}</p>
                      <p className="text-[10px] text-gray-500">{listing.listingNo}</p>
                    </div>
                  </div>
                </td>
                <td className="text-right py-2 px-3">
                  <span className="text-xs font-semibold text-gray-900">
                    {formatCurrency(listing.revenue, 'TRY')}
                  </span>
                </td>
                <td className="text-right py-2 px-3">
                  <div className="flex items-center justify-end gap-1">
                    <ShoppingBag className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-700">{listing.orderCount}</span>
                  </div>
                </td>
                <td className="text-right py-2 px-3">
                  <div className="flex items-center justify-end gap-1">
                    <Heart className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-700">{listing.favoriteCount}</span>
                  </div>
                </td>
                <td className="text-right py-2 px-3">
                  <div className="flex items-center justify-end gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-gray-700">
                      {listing.averageRating ? listing.averageRating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopListingsTable;

