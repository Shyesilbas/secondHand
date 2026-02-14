import ComplaintButton from '../../complaint/components/ComplaintButton.jsx';
import ListingReviewsSection from '../../reviews/components/ListingReviewsSection.jsx';
import { Flag } from 'lucide-react';

const ListingSocialPanel = ({ listing, isOwner, tabs, activeTab, onTabChange, DetailsComponent, hasReviews }) => {
  if (!listing) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      {!isOwner && (
        <div className="p-6 border-b border-slate-200/60 bg-white">
          <ComplaintButton
            targetUserId={listing.sellerId}
            targetUserName={`${listing.sellerName} ${listing.sellerSurname}`}
            listingId={listing.id}
            listingTitle={listing.title}
            className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200/60 text-slate-700 hover:bg-slate-50 hover:border-slate-300/60 rounded-xl text-sm font-semibold transition-all duration-300 ease-in-out tracking-tight"
          >
            <Flag className="w-4 h-4" />
            Report
          </ComplaintButton>
        </div>
      )}

      <div className="flex items-center border-b border-slate-200/60 px-6 bg-slate-50/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative py-4 px-5 text-sm font-semibold transition-all duration-300 ease-in-out tracking-tight
              ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}
            `}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900" />}
          </button>
        ))}
      </div>

      <div className="p-8">
        {activeTab === 'about' && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">Description</h2>
            <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-4 prose-headings:font-bold prose-headings:text-slate-900 tracking-tight">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 tracking-tight">{listing.description}</p>
            </div>
          </div>
        )}

        {activeTab === 'details' && DetailsComponent && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">Specifications</h2>
            <DetailsComponent listing={listing} />
          </div>
        )}

        {activeTab === 'reviews' && hasReviews && (
          <div>
            <ListingReviewsSection listing={listing} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingSocialPanel;

