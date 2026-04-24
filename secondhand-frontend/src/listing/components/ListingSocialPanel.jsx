import ComplaintButton from '../../complaint/components/ComplaintButton.jsx';
import ListingReviewsSection from '../../reviews/components/ListingReviewsSection.jsx';
import {Flag} from 'lucide-react';

const ListingSocialPanel = ({ listing, isOwner, tabs, activeTab, onTabChange, DetailsComponent, hasReviews }) => {
  if (!listing) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Pill tab bar */}
      <div className="flex items-center gap-0.5 px-4 pt-3 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative py-2 px-3.5 text-[13px] font-medium rounded-lg transition-colors duration-150
              ${activeTab === tab.id
                ? 'text-gray-900 bg-gray-100'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="border-t border-gray-50 mt-2.5" />

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
