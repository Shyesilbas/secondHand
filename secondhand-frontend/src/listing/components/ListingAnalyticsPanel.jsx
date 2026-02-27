import React, {useCallback, useState} from 'react';
import {BarChart3} from 'lucide-react';
import ListingInfoModal from './ListingInfoModal.jsx';

const ListingAnalyticsPanel = ({ listing, isOwner, displayPrice }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const openInfo = useCallback(() => setIsInfoOpen(true), []);
  const closeInfo = useCallback(() => setIsInfoOpen(false), []);

  if (!listing) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between py-3 border-t border-gray-50">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
          <div>
            <p className="text-[12px] font-medium text-gray-700">Analytics</p>
            <p className="text-[10px] text-gray-400">Price history & rates</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openInfo}
          className="px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-900 border border-gray-100 hover:border-gray-200 rounded-lg transition-colors"
        >
          View
        </button>
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

