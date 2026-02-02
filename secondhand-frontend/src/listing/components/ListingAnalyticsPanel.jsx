import React, { useCallback, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import ListingInfoModal from './ListingInfoModal.jsx';

const ListingAnalyticsPanel = ({ listing, isOwner, displayPrice }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const openInfo = useCallback(() => setIsInfoOpen(true), []);
  const closeInfo = useCallback(() => setIsInfoOpen(false), []);

  if (!listing) return null;

  return (
    <div className="mt-6">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4.5 h-4.5 text-slate-700" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 tracking-tight">Analytics</div>
              <div className="text-xs text-slate-500">Price history and exchange rates</div>
            </div>
          </div>
          <button
            type="button"
            onClick={openInfo}
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors duration-300 mr-4"
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
        isOwner={isOwner}
        viewStats={listing.viewStats || null}
      />
    </div>
  );
};

export default ListingAnalyticsPanel;

