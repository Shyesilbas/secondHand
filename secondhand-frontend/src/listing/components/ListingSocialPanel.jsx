import ComplaintButton from '../../complaint/components/ComplaintButton.jsx';
import ListingReviewsSection from '../../reviews/components/ListingReviewsSection.jsx';
import {Flag} from 'lucide-react';

const ListingSocialPanel = ({ listing, isOwner, tabs, activeTab, onTabChange, DetailsComponent, hasReviews }) => {
  if (!listing) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center border-b border-gray-50 px-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative py-3 px-3 text-[13px] font-medium transition-colors duration-150
              ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}
            `}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900 rounded-full" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        {activeTab === 'about' && (
          <div>
            <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Description</h2>
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-gray-600">{listing.description}</p>
          </div>
        )}

        {activeTab === 'details' && DetailsComponent && (
          <div>
            <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Specifications</h2>
            <DetailsComponent listing={listing} />
          </div>
        )}

        {activeTab === 'reviews' && hasReviews && (
          <div>
            <ListingReviewsSection listing={listing} />
          </div>
        )}
      </div>

      {/* Report */}
      {!isOwner && (
        <div className="px-5 pb-4 pt-0">
          <ComplaintButton
            targetUserId={listing.sellerId}
            targetUserName={`${listing.sellerName} ${listing.sellerSurname}`}
            listingId={listing.id}
            listingTitle={listing.title}
            className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Flag className="w-3 h-3" />
            Report this listing
          </ComplaintButton>
        </div>
      )}
    </div>
  );
};

export default ListingSocialPanel;

