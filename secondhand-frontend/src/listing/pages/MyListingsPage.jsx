import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import { useListingEngine } from '../hooks/useListingEngine.js';
import ListingsModuleLayout from '../components/ListingsModuleLayout.jsx';
import { Plus, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const MyListingsPage = () => {
    const { getListingTypeLabel } = useEnums();
    const engine = useListingEngine({ initialListingType: null, mode: 'mine' });

    const lowStock = engine.alerts?.lowStock;

    const extraActions = (
      <Link
        to={ROUTES.CREATE_LISTING}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors text-sm font-semibold"
      >
        <Plus className="w-4 h-4" />
        New Listing
      </Link>
    );

    const topSlot = useMemo(() => {
      if (!lowStock || lowStock.count <= 0) return null;

      if (!lowStock.isOpen) {
        return (
          <button
            type="button"
            onClick={lowStock.open}
            className="w-full bg-white rounded-2xl border border-amber-200/60 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className="px-5 py-4 bg-gradient-to-r from-amber-50/80 to-orange-50/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100/80 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-semibold text-amber-900 tracking-tight">Low Stock</h3>
                  <p className="text-[11px] text-amber-800 tracking-tight">
                    {lowStock.count} listing{lowStock.count === 1 ? '' : 's'} have less than 10 items in stock.
                  </p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-amber-700" />
            </div>
          </button>
        );
      }

      return (
        <div className="bg-white rounded-2xl border border-amber-200/60 shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-amber-200/60 bg-gradient-to-r from-amber-50/80 to-orange-50/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100/80 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-amber-900 tracking-tight">Stock is running low</h3>
                <p className="text-[11px] text-amber-800 tracking-tight">
                  {lowStock.count} listing{lowStock.count === 1 ? '' : 's'} have less than 10 items in stock.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={lowStock.close}
              className="p-1.5 hover:bg-amber-100/60 rounded-lg transition-colors"
            >
              <ChevronUp className="w-4 h-4 text-amber-700" />
            </button>
          </div>
          <div className="px-5 py-4">
            <div className="space-y-2">
              {lowStock.listings.slice(0, 6).map((listing) => (
                <Link
                  key={listing.id}
                  to={`/listings/${listing.id}`}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-amber-50/50 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 tracking-tight">
                      {listing.title?.charAt(0)?.toUpperCase() || 'L'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate tracking-tight">{listing.title}</p>
                      <p className="text-[11px] text-slate-500 truncate tracking-tight">{listing.listingNo}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200/60 tracking-tight">
                    In stock: {Number(listing.quantity)}
                  </span>
                </Link>
              ))}
            </div>
            {lowStock.count > 6 ? (
              <p className="mt-3 text-[11px] text-amber-800 tracking-tight">
                And {lowStock.count - 6} more listing{lowStock.count - 6 === 1 ? '' : 's'} with low stock.
              </p>
            ) : null}
          </div>
        </div>
      );
    }, [lowStock]);

    return (
      <ListingsModuleLayout
        mode="mine"
        engine={engine}
        getListingTypeLabel={getListingTypeLabel}
        title="My Listings"
        extraActions={extraActions}
        topSlot={topSlot}
      />
    );
};

export default MyListingsPage;