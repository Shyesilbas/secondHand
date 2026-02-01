import React, { useCallback, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import ListingInfoModal from './ListingInfoModal.jsx';
import ViewStatisticsCard from './ViewStatisticsCard.jsx';

const ListingAnalyticsPanel = ({ listing, isOwner, displayPrice }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const openInfo = useCallback(() => setIsInfoOpen(true), []);
  const closeInfo = useCallback(() => setIsInfoOpen(false), []);

  if (!listing) return null;

  return (
    <div className="mt-6">
      {isOwner && (
        <ViewStatisticsCard
          viewStats={listing.viewStats || { totalViews: 0, uniqueViews: 0, periodDays: 7, viewsByDate: {} }}
          periodDays={listing.viewStats?.periodDays || 7}
        />
      )}

      <div className="rounded-xl border border-slate-200/60 bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 tracking-tight">Analytics</div>
              <div className="text-xs text-slate-500 tracking-tight">Price history and exchange rates</div>
            </div>
          </div>
          <button
            type="button"
            onClick={openInfo}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold tracking-tight hover:bg-slate-800 transition-colors"
          >
            Open
          </button>
        </div>
      </div>

      <ListingInfoModal
        isOpen={isInfoOpen}
        onClose={closeInfo}
        listingId={listing.id}
        listingTitle={listing.title}
        price={displayPrice}
        currency={listing.currency}
      />
    </div>
  );
};

export default ListingAnalyticsPanel;

