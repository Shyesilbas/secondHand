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
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white/70 backdrop-blur-xl border-b border-slate-200/40 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <nav className="flex items-center text-xs text-slate-500 font-medium tracking-tight">
            <Link to={ROUTES.LISTINGS} className="hover:text-slate-900 transition-all duration-300 ease-in-out">Listings</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-400" />
            <span className="text-slate-900 font-semibold truncate max-w-[240px] tracking-tight">{listing.title}</span>
          </nav>

          <div className="flex items-center gap-1">
            {canAddToCart && (
              <button
                onClick={() => addToCart(listing.id)}
                disabled={isAddingToCart}
                className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 rounded-xl transition-all duration-300 ease-in-out"
                title="Add to Cart"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            )}
            {canMakeOffer && (
              <button
                onClick={() => setIsOfferModalOpen(true)}
                className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 rounded-xl transition-all duration-300 ease-in-out"
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
                className="hover:bg-slate-100/50 rounded-xl p-2.5 border-0 text-slate-500 hover:text-red-600 transition-all duration-300 ease-in-out"
              />
            )}
            <button className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 rounded-xl transition-all duration-300 ease-in-out">
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

            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm relative group min-h-[500px] flex items-center justify-center p-12">
              {listing.imageUrl ? (
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="max-w-full max-h-[600px] w-auto h-auto object-contain transition-transform duration-500 ease-in-out group-hover:scale-[1.01]"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/30 ${listing.imageUrl ? 'hidden' : 'flex'}`}>
                  <p className="text-sm font-medium text-slate-400 tracking-tight">No image available</p>
              </div>
            </div>

            <div className="lg:hidden bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
               <h1 className="text-2xl font-bold text-slate-900 mb-3 leading-tight tracking-tight">{listing.title}</h1>
               <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-medium tracking-tight">
                 <span>{listing.district}, {listing.city}</span>
                 <span>•</span>
                 <span>{formatDateTime(listing.createdAt)}</span>
               </div>
               {hasStockInfo && (
                 <div className="mb-4">
                   <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold border tracking-tight ${isLowStock ? 'bg-amber-50/80 text-amber-700 border-amber-200/60' : 'bg-slate-50/80 text-slate-600 border-slate-200/60'}`}>
                     Stock: {Number(listing.quantity)}
                   </span>
                 </div>
               )}
               <div className="flex items-baseline gap-4 flex-wrap mb-3">
                 <p className="text-3xl font-bold text-slate-900 tracking-tighter">{formatCurrency(displayPrice, listing.currency)}</p>
                 {hasCampaign && (
                   <p className="text-lg font-medium text-slate-400 line-through tracking-tight">{formatCurrency(listing.price, listing.currency)}</p>
                 )}
               </div>
               {hasCampaign && (
                 <div className="inline-flex items-center rounded-lg bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60 tracking-tight">
                   {listing.campaignName || 'Special Offer'}
                 </div>
               )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="flex items-center border-b border-slate-200/60 px-6 bg-slate-50/30">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative py-4 px-5 text-sm font-semibold transition-all duration-300 ease-in-out tracking-tight
                      ${activeTab === tab.id 
                        ? 'text-slate-900' 
                        : 'text-slate-500 hover:text-slate-700'
                      }
                    `}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900" />
                    )}
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
                    <ListingReviewsSection listingId={listing.id} listing={listing} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 lg:sticky lg:top-20">
                <div className="mb-6 hidden lg:block">
                   <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-4 tracking-tight">{listing.title}</h1>
                   <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-medium tracking-tight">
                      <span>{listing.district}, {listing.city}</span>
                      <span>•</span>
                      <span>{formatDateTime(listing.createdAt)}</span>
                   </div>
                   {hasStockInfo && (
                     <div className="mb-4">
                       <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold border tracking-tight ${isLowStock ? 'bg-amber-50/80 text-amber-700 border-amber-200/60' : 'bg-slate-50/80 text-slate-600 border-slate-200/60'}`}>
                         Stock: {Number(listing.quantity)}
                       </span>
                     </div>
                   )}
                   <div className="mb-2">
                     <p className="text-3xl font-bold text-slate-900 tracking-tighter">
                        {formatCurrency(displayPrice, listing.currency)}
                     </p>
                   </div>
                   {hasCampaign && (
                     <div className="mt-3 flex items-center gap-3">
                       <p className="text-lg font-medium text-slate-400 line-through tracking-tight">{formatCurrency(listing.price, listing.currency)}</p>
                       <span className="inline-flex items-center rounded-lg bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60 tracking-tight">
                         {listing.campaignName || 'Special Offer'}
                       </span>
                     </div>
                   )}
                </div>

                <div className="border-t border-b border-slate-200/60 py-6 mb-6">
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Seller</h3>
                    <div className="flex items-center justify-between mb-5">
                       <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center text-base font-bold text-white shadow-sm">
                            {listing.sellerName?.[0]?.toUpperCase() || 'U'}
                         </div>
                         <div>
                            <Link
                              to={ROUTES.USER_PROFILE(listing.sellerId)}
                              className="font-bold text-base text-slate-900 hover:text-slate-700 block transition-all duration-300 ease-in-out tracking-tight"
                            >
                               {listing.sellerName} {listing.sellerSurname}
                            </Link>
                            {listing.sellerAccountCreationDate && (
                              <div className="text-xs text-slate-500 mt-1 font-medium tracking-tight">
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
                      <div className="space-y-3">
                        <ContactSellerButton
                            listing={listing}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl tracking-tight"
                        >
                            Contact Seller
                        </ContactSellerButton>
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
                    ) : (
                      <ShowcaseButton listingId={listing.id} onSuccess={fetchListing} />
                    )}
                  </div>
                </div>

                <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-200/40">
                  <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Safety Guidelines
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-600 leading-relaxed tracking-tight">
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>Meet in public, well-lit locations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>Inspect items thoroughly before purchase</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></span>
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
