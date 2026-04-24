import React, {useCallback, useState} from 'react';
import {BarChart3, ChevronRight} from 'lucide-react';
import ListingInfoModal from './ListingInfoModal.jsx';

const ListingAnalyticsPanel = ({ listing, isOwner, displayPrice }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const openInfo = useCallback(() => setIsInfoOpen(true), []);
  const closeInfo = useCallback(() => setIsInfoOpen(false), []);

  if (!listing) return null;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={openInfo}
        className="w-full flex items-center justify-between py-3 border-t border-gray-100 group cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
          <div>
            <p className="text-[12px] font-medium text-gray-700">Analytics</p>
            <p className="text-[10px] text-gray-400">Price history & rates</p>
          </div>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </button>

      <ListingInfoModal
        isOpen={isInfoOpen}
        onClose={closeInfo}
        listing={listing}
        displayPrice={displayPrice}
        isOwner={isOwner}
      />
    </div>
  );
};

export default ListingAnalyticsPanel;
