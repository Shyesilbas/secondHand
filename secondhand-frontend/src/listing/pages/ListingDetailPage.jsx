import React, {useEffect, useRef, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {useAuth} from '../../auth/AuthContext.jsx';
import {useListingData} from '../hooks/useListingData.js';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import ListingCardActions from '../components/ListingCardActions.jsx';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import ComplaintButton from '../../complaint/components/ComplaintButton.jsx';
import ListingReviewsSection from '../../reviews/components/ListingReviewsSection.jsx';
import ShowcaseButton from '../../showcase/components/ShowcaseButton.jsx';
import ViewStatisticsCard from '../components/ViewStatisticsCard.jsx';
import {listingTypeRegistry} from '../components/typeRegistry.js';
import {ROUTES} from '../../common/constants/routes.js';
import {formatCurrency, formatDateTime} from '../../common/formatters.js';
import {trackView} from '../services/viewTrackingService.js';
import {getOrCreateSessionId} from '../../common/utils/sessionId.js';
import {AlertTriangle, ArrowLeft, ChevronRight, Flag, HandCoins, Share2, ShieldCheck, ShoppingBag} from 'lucide-react';
import {useCart} from '../../cart/hooks/useCart.js';
import MakeOfferModal from '../../offer/components/MakeOfferModal.jsx';
import CompareButton from '../../comparison/components/CompareButton.jsx';
import {FollowButton} from '../../follow/index.js';

const ListingDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { listing, isLoading, error, refetch: fetchListing } = useListingData(id);
  const { addToCart, isAddingToCart } = useCart({ loadCartItems: false });
  const [activeTab, setActiveTab] = useState('about');
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const viewTrackedRef = useRef(false);

  // Calculate isOwner after listing is loaded
  const isOwner = isAuthenticated && user?.id === listing?.sellerId;

  // Track view when listing is loaded (but not if user is the owner)
  useEffect(() => {
    if (listing && !viewTrackedRef.current && !isOwner) {
      viewTrackedRef.current = true;
      const sessionId = getOrCreateSessionId();
      const userAgent = navigator.userAgent;
      trackView(listing.id, sessionId, userAgent);
    }
  }, [listing, isOwner]);

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

  const DetailsComponent = listingTypeRegistry[listing.type]?.detailsComponent;
  const hasReviews = !['VEHICLE', 'REAL_ESTATE'].includes(listing.type);
  const canAddToCart = !isOwner && !['REAL_ESTATE', 'VEHICLE'].includes(listing.type) && listing.status === 'ACTIVE';
  const canMakeOffer = !isOwner && !['REAL_ESTATE', 'VEHICLE'].includes(listing.type) && listing.status === 'ACTIVE';
  const hasCampaign = listing.campaignId && listing.campaignPrice != null && parseFloat(listing.campaignPrice) < parseFloat(listing.price);
  const displayPrice = hasCampaign ? listing.campaignPrice : listing.price;
  const isLowStock = listing.quantity != null && Number(listing.quantity) > 0 && Number(listing.quantity) < 10;
  const hasStockInfo = listing.quantity != null && Number.isFinite(Number(listing.quantity));


  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'details', label: 'Details' },
    ...(hasReviews ? [{ id: 'reviews', label: 'Reviews' }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <nav className="flex items-center text-xs text-gray-500 font-medium">
            <Link to={ROUTES.LISTINGS} className="hover:text-gray-900 transition-colors duration-200">Listings</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-gray-400" />
            <span className="text-gray-900 font-semibold truncate max-w-[240px]">{listing.title}</span>
          </nav>

          <div className="flex items-center gap-1">
            {canAddToCart && (
              <button
                onClick={() => addToCart(listing.id)}
                disabled={isAddingToCart}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-all duration-200"
                title="Add to Cart"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            )}
            {canMakeOffer && (
              <button
                onClick={() => setIsOfferModalOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-all duration-200"
                title="Make Offer"
              >
                <HandCoins className="w-4 h-4" />
              </button>
            )}
            {!isOwner && (
              <CompareButton
                listing={listing}
                size="md"
              />
            )}
            {!isOwner && (
              <FavoriteButton
                listingId={listing.id}
                listing={listing}
                size="md"
                showCount={false}
                className="hover:bg-gray-100/80 rounded-lg p-2 border-0 text-gray-500 hover:text-red-600 transition-all duration-200"
              />
            )}
            <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-all duration-200">
              <Share2 className="w-4 h-4" />
            </button>
            {isOwner && (
               <ListingCardActions listing={listing} onChanged={fetchListing} />
            )}
          </div>
        </div>
      </div>

      <MakeOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        listing={listing}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-12 gap-6">

          <div className="lg:col-span-8 space-y-5">

            {isOwner && (
              <ViewStatisticsCard
                viewStats={listing.viewStats || { totalViews: 0, uniqueViews: 0, periodDays: 7, viewsByDate: {} }}
                periodDays={listing.viewStats?.periodDays || 7}
              />
            )}

            <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200/60 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] relative group h-[280px] flex items-center justify-center">
              {listing.imageUrl ? (
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/30 ${listing.imageUrl ? 'hidden' : 'flex'}`}>
                  <p className="text-sm font-medium text-gray-400">No image available</p>
              </div>
            </div>

            <div className="lg:hidden bg-white p-5 rounded-xl border border-gray-200/60 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
               <h1 className="text-xl font-semibold text-gray-900 mb-2 leading-tight tracking-tight">{listing.title}</h1>
               <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 font-medium">
                 <span>{listing.district}, {listing.city}</span>
                 <span>•</span>
                 <span>{formatDateTime(listing.createdAt)}</span>
               </div>
               {hasStockInfo && (
                 <div className="mb-3">
                   <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border ${isLowStock ? 'bg-amber-50/80 text-amber-700 border-amber-200/60' : 'bg-gray-50/80 text-gray-600 border-gray-200/60'}`}>
                     Stock: {Number(listing.quantity)}
                   </span>
                 </div>
               )}
               <div className="flex items-baseline gap-3 flex-wrap mb-2">
                 <p className="text-2xl font-semibold text-gray-900 tracking-tight">{formatCurrency(displayPrice, listing.currency)}</p>
                 {hasCampaign && (
                   <p className="text-base font-medium text-gray-400 line-through">{formatCurrency(listing.price, listing.currency)}</p>
                 )}
               </div>
               {hasCampaign && (
                 <div className="inline-flex items-center rounded-md bg-emerald-50/80 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/60">
                   {listing.campaignName || 'Special Offer'}
                 </div>
               )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200/60 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="flex items-center border-b border-gray-200/60 px-5 bg-gray-50/30">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative py-3 px-4 text-sm font-medium transition-all duration-200
                      ${activeTab === tab.id 
                        ? 'text-gray-900' 
                        : 'text-gray-500 hover:text-gray-700'
                      }
                    `}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'about' && (
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 mb-4 tracking-tight">Description</h2>
                    <div className="prose prose-slate max-w-none prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-3 prose-headings:font-semibold prose-headings:text-gray-900">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">{listing.description}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'details' && DetailsComponent && (
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 mb-4 tracking-tight">Specifications</h2>
                    <DetailsComponent listing={listing} />
                  </div>
                )}

                {activeTab === 'reviews' && hasReviews && (
                  <div>
                    <ListingReviewsSection listingId={listing.id} listing={listing} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-5">
             <div className="bg-white rounded-xl border border-gray-200/60 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] p-5 lg:sticky lg:top-16">
                <div className="mb-5 hidden lg:block">
                   <h1 className="text-xl font-semibold text-gray-900 leading-tight mb-3 tracking-tight">{listing.title}</h1>
                   <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 font-medium">
                      <span>{listing.district}, {listing.city}</span>
                      <span>•</span>
                      <span>{formatDateTime(listing.createdAt)}</span>
                   </div>
                   {hasStockInfo && (
                     <div className="mb-3">
                       <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border ${isLowStock ? 'bg-amber-50/80 text-amber-700 border-amber-200/60' : 'bg-gray-50/80 text-gray-600 border-gray-200/60'}`}>
                         Stock: {Number(listing.quantity)}
                       </span>
                     </div>
                   )}
                   <div className="mb-1">
                     <p className="text-2xl font-semibold text-gray-900 tracking-tight">
                        {formatCurrency(displayPrice, listing.currency)}
                     </p>
                   </div>
                   {hasCampaign && (
                     <div className="mt-2 flex items-center gap-3">
                       <p className="text-sm font-medium text-gray-400 line-through">{formatCurrency(listing.price, listing.currency)}</p>
                       <span className="inline-flex items-center rounded-md bg-emerald-50/80 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/60">
                         {listing.campaignName || 'Special Offer'}
                       </span>
                     </div>
                   )}
                </div>

                <div className="border-t border-b border-gray-200/60 py-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center text-sm font-semibold text-white shadow-sm">
                          {listing.sellerName?.[0]?.toUpperCase() || 'U'}
                       </div>
                       <div>
                          <Link
                            to={ROUTES.USER_PROFILE(listing.sellerId)}
                            className="font-semibold text-sm text-gray-900 hover:text-gray-700 block transition-colors duration-200"
                          >
                             {listing.sellerName} {listing.sellerSurname}
                          </Link>
                          {listing.sellerAccountCreationDate && (
                            <div className="text-xs text-gray-500 mt-0.5 font-medium">
                              Member since {new Date(listing.sellerAccountCreationDate).getFullYear()}
                            </div>
                          )}
                       </div>
                     </div>
                     {!isOwner && (
                       <FollowButton userId={listing.sellerId} size="sm" showDropdown={true} />
                     )}
                  </div>

                  {!isOwner ? (
                    <div className="space-y-2">
                      <ContactSellerButton
                          listing={listing}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow"
                      >
                          Contact Seller
                      </ContactSellerButton>
                      <ComplaintButton
                          targetUserId={listing.sellerId}
                          targetUserName={`${listing.sellerName} ${listing.sellerSurname}`}
                          listingId={listing.id}
                          listingTitle={listing.title}
                          className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200/60 text-gray-700 hover:bg-gray-100 hover:border-gray-300/60 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                          <Flag className="w-4 h-4" />
                          Report
                      </ComplaintButton>
                    </div>
                  ) : (
                    <ShowcaseButton listingId={listing.id} onSuccess={fetchListing} />
                  )}
                </div>

                <div className="bg-gray-50/80 rounded-lg p-3.5 border border-gray-200/40">
                  <h3 className="text-xs font-semibold text-gray-900 mb-2.5 flex items-center gap-2 uppercase tracking-wide">
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-600" />
                    Safety Guidelines
                  </h3>
                  <ul className="space-y-1.5 text-xs text-gray-600 leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>Meet in public, well-lit locations</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>Inspect items thoroughly before purchase</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>Avoid advance payments or wire transfers</span>
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
