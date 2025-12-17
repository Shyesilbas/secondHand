import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useListingData } from '../hooks/useListingData.js';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import ListingCardActions from '../components/ListingCardActions.jsx';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import ComplaintButton from '../../complaint/components/ComplaintButton.jsx';
import ListingReviewsSection from '../../reviews/components/ListingReviewsSection.jsx';
import ShowcaseButton from '../../showcase/components/ShowcaseButton.jsx';
import { listingTypeRegistry } from '../components/typeRegistry.js';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { 
  Share2, 
  ShieldCheck, 
  Flag, 
  ArrowLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

const ListingDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { listing, isLoading, error, refetch: fetchListing } = useListingData(id);
  const [activeTab, setActiveTab] = useState('about');

  if (isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Unavailable</h3>
        <p className="text-gray-500 mb-6">{error || "This listing could not be found."}</p>
        <Link 
          to={ROUTES.LISTINGS}
          className="inline-flex items-center text-sm font-medium text-gray-900 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Listings
        </Link>
      </div>
    </div>
  );

  if (!listing) return null;

  const isOwner = isAuthenticated && user?.id === listing?.sellerId;
  const DetailsComponent = listingTypeRegistry[listing.type]?.detailsComponent;
  const hasReviews = !['VEHICLE', 'REAL_ESTATE'].includes(listing.type);

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'details', label: 'Details' },
    ...(hasReviews ? [{ id: 'reviews', label: 'Reviews' }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <nav className="flex items-center text-sm text-gray-500">
            <Link to={ROUTES.LISTINGS} className="hover:text-gray-900 transition-colors">Listings</Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{listing.title}</span>
          </nav>
          
          <div className="flex items-center gap-3">
            {!isOwner && (
              <FavoriteButton 
                listingId={listing.id} 
                listing={listing} 
                size="md" 
                showCount={false}
                className="hover:bg-gray-100 rounded-full p-2 border-0 text-gray-400 hover:text-red-500 transition-colors"
              />
            )}
            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            {isOwner && (
               <ListingCardActions listing={listing} onChanged={fetchListing} />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Image Gallery - Smaller Height */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative group h-[400px]">
              {listing.imageUrl ? (
                <img 
                  src={listing.imageUrl} 
                  alt={listing.title}
                  className="w-full h-full object-contain bg-gray-50"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 ${listing.imageUrl ? 'hidden' : 'flex'}`}>
                  <p className="font-medium">No photos</p>
              </div>
            </div>

            {/* Title & Price (Mobile Only) */}
            <div className="lg:hidden bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
               <h1 className="text-xl font-bold text-gray-900 mb-2">{listing.title}</h1>
               <p className="text-2xl font-bold text-gray-900">{formatCurrency(listing.price, listing.currency)}</p>
            </div>

            {/* Tabs & Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
              {/* Tab Headers */}
              <div className="flex items-center border-b border-gray-100 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative py-4 px-4 text-sm font-medium transition-colors
                      ${activeTab === tab.id 
                        ? 'text-gray-900' 
                        : 'text-gray-500 hover:text-gray-700'
                      }
                    `}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Panels */}
              <div className="p-6 sm:p-8">
                {activeTab === 'about' && (
                  <div className="animate-fade-in">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">About this item</h2>
                    <div className="prose prose-slate max-w-none prose-p:text-gray-600 prose-headings:font-bold">
                      <p className="whitespace-pre-wrap leading-relaxed">{listing.description}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'details' && DetailsComponent && (
                  <div className="animate-fade-in">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Technical Details</h2>
                    <DetailsComponent listing={listing} />
                  </div>
                )}

                {activeTab === 'reviews' && hasReviews && (
                  <div className="animate-fade-in">
                    <ListingReviewsSection listingId={listing.id} listing={listing} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
             {/* Sticky Info Card */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:sticky lg:top-24">
                <div className="mb-6 hidden lg:block">
                   <h1 className="text-xl font-bold text-gray-900 leading-snug mb-2">{listing.title}</h1>
                   <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                      <span>{listing.district}, {listing.city}</span>
                      <span>•</span>
                      <span>{formatDateTime(listing.createdAt)}</span>
                   </div>
                   <p className="text-3xl font-bold text-gray-900 tracking-tight">
                      {formatCurrency(listing.price, listing.currency)}
                   </p>
                </div>

                {/* Seller Info */}
                <div className="border-t border-b border-gray-100 py-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                        {listing.sellerName?.[0]?.toUpperCase() || 'U'}
                     </div>
                     <div>
                        <Link 
                          to={ROUTES.USER_PROFILE(listing.sellerId)}
                          className="font-semibold text-sm text-gray-900 hover:underline block"
                        >
                           {listing.sellerName} {listing.sellerSurname}
                        </Link>
                        <div className="text-xs text-gray-500">Joined 2024</div>
                     </div>
                  </div>
                  
                  {!isOwner ? (
                    <div className="space-y-3">
                      <ContactSellerButton 
                          listing={listing} 
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-medium transition-colors" 
                      >
                          Contact Seller
                      </ContactSellerButton>
                      <ComplaintButton
                          targetUserId={listing.sellerId}
                          targetUserName={`${listing.sellerName} ${listing.sellerSurname}`}
                          listingId={listing.id}
                          listingTitle={listing.title}
                          className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                      >
                          <Flag className="w-4 h-4" />
                          Report
                      </ComplaintButton>
                    </div>
                  ) : (
                    <ShowcaseButton listingId={listing.id} onSuccess={fetchListing} />
                  )}
                </div>

                {/* Safety */}
                <div className="bg-blue-50/50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Safety tips
                  </h3>
                  <ul className="space-y-1.5 text-xs text-blue-800/70">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                      Meet in public places
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                      Check before paying
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                      Don't pay in advance
                    </li>
                  </ul>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
