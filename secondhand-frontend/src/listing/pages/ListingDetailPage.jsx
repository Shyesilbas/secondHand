import React, {useEffect, useRef, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {useListingData} from '../hooks/useListingData.js';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import ListingCardActions from '../components/ListingCardActions.jsx';
import {listingTypeRegistry} from '../config/listingConfig.js';
import {LISTING_STATUS, NON_PURCHASABLE_TYPES} from '../types/index.js';
import {ROUTES} from '../../common/constants/routes.js';
import {trackView} from '../services/listingAddonService.js';
import {getOrCreateSessionId} from '../../common/utils/sessionId.js';
import {AlertTriangle, ArrowLeft, HandCoins, Share2, ShoppingBag, Sparkles, MessageSquare, Star, Eye, Calendar, MapPin, ChevronRight, CheckCircle, ShieldCheck, Tag} from 'lucide-react';
import {useCart} from '../../cart/hooks/useCart.js';
import MakeOfferModal from '../../offer/components/MakeOfferModal.jsx';
import CompareButton from '../../comparison/components/CompareButton.jsx';
import ListingTrustPanel from '../components/ListingTrustPanel.jsx';
import ListingAnalyticsPanel from '../components/ListingAnalyticsPanel.jsx';
import {formatCurrency, formatDateTime} from '../../common/formatters.js';
import AuraSummary from '../../common/components/AuraSummary.jsx';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import SimilarListings from '../components/SimilarListings.jsx';
import ListingReviewsSection from '../../reviews/components/ListingReviewsSection.jsx';
import {optimizeCloudinaryUrl} from '../../common/utils/imageOptimizer.js';
import {useActiveReservationCount} from '../../cart/hooks/useActiveReservationCount.js';
import SafeMeetupPanel from '../components/SafeMeetupPanel.jsx';

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthState();
  const { listing, isLoading, error, refetch: fetchListing } = useListingData(id);
  const { addToCart, isAddingToCart } = useCart({ loadCartItems: false });
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const viewTrackedRef = useRef(false);
  const { count: activeReservations } = useActiveReservationCount(listing?.id);

  const images = listing?.imageUrls?.length > 0 ? listing.imageUrls : (listing?.imageUrl ? [listing.imageUrl] : []);

  const isOwner = isAuthenticated && user?.id === listing?.sellerId;
  const hasCampaign = listing?.campaignId && listing?.campaignPrice != null && parseFloat(listing?.campaignPrice) < parseFloat(listing?.price);
  const displayPrice = hasCampaign ? listing?.campaignPrice : listing?.price;

  useEffect(() => {
    if (listing && !viewTrackedRef.current && !isOwner) {
      viewTrackedRef.current = true;
      const sessionId = getOrCreateSessionId();
      const userAgent = navigator.userAgent;
      trackView(listing.id, sessionId, userAgent);
    }
  }, [listing, isOwner]);

  useEffect(() => {
    if (listing) {
      document.title = `${listing.title} - ${formatCurrency(displayPrice, listing.currency)} | SecondHand`;
      const schemaId = 'listing-structured-data';
      let scriptEl = document.getElementById(schemaId);
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = schemaId;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": listing.title,
        "image": listing.imageUrl ? optimizeCloudinaryUrl(listing.imageUrl, {width: 1200}) : "",
        "description": listing.description || "",
        "offers": {
          "@type": "Offer",
          "price": displayPrice?.toString(),
          "priceCurrency": listing.currency || "TRY",
          "availability": listing.status === 'ACTIVE' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      });
      return () => document.getElementById(schemaId)?.remove();
    }
  }, [listing, displayPrice]);

  if (isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-[3px] border-slate-900 border-t-transparent animate-spin" />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-6 h-6 text-rose-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Listing Unavailable</h3>
        <p className="text-slate-500 mb-8">{error || "This listing could not be found."}</p>
        <Link to={ROUTES.LISTINGS} className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </Link>
      </div>
    </div>
  );

  if (!listing) return null;

  const DetailsComponent = listingTypeRegistry[listing.type]?.detailsComponent;
  const hasReviews = !NON_PURCHASABLE_TYPES.includes(listing.type);
  const canAddToCart = !isOwner && !NON_PURCHASABLE_TYPES.includes(listing.type) && listing.status === LISTING_STATUS.ACTIVE;
  const canMakeOffer = !isOwner && !NON_PURCHASABLE_TYPES.includes(listing.type) && listing.status === LISTING_STATUS.ACTIVE;
  const isLowStock = listing.quantity != null && Number(listing.quantity) > 0 && Number(listing.quantity) < 10;
  const hasStockInfo = listing.quantity != null && Number.isFinite(Number(listing.quantity));
  const categoryBadges = listingTypeRegistry[listing.type]?.compactBadges?.(listing) || [];

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-16 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100/50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to={ROUTES.LISTINGS} className="text-slate-500 hover:text-slate-900 font-medium transition-colors flex items-center gap-1.5 shrink-0">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Explore</span>
            </Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button onClick={() => navigate(ROUTES.AURA_CHAT, { state: { listing } })} className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl font-medium transition-colors group">
              <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-sm">Ask Aura</span>
            </button>
            {!isOwner && <CompareButton listing={listing} size="md" className="hidden sm:flex" />}
            {!isOwner && <FavoriteButton listingId={listing.id} listing={listing} size="md" showCount={false} className="p-2 border-0 text-slate-400 hover:text-rose-500 rounded-xl transition-colors hover:bg-rose-50" />}
            <button className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-colors hover:bg-slate-50">
              <Share2 className="w-4 h-4" />
            </button>
            {isOwner && <ListingCardActions listing={listing} onChanged={fetchListing} />}
          </div>
        </div>
      </div>

      <MakeOfferModal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} listing={listing} />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8 sm:space-y-10">
            
            {/* Title & Metadata */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-4">
                {listing.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-slate-600 font-medium">
                <div className="flex items-center gap-1.5 hover:underline cursor-pointer">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {listing.district}, {listing.city}
                </div>
                <span className="text-slate-300">·</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {formatDateTime(listing.createdAt)}
                </div>
                <span className="text-slate-300">·</span>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-slate-400" />
                  {listing.viewCount || 0} views
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="w-full aspect-[4/3] sm:aspect-video lg:max-h-[500px] bg-slate-50 rounded-2xl lg:rounded-3xl overflow-hidden relative group shadow-sm border border-slate-100">
              {images.length > 0 ? (
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full h-full">
                  {images.map((imgUrl, idx) => (
                    <div key={idx} className="shrink-0 w-full h-full snap-center relative">
                      <img
                        src={optimizeCloudinaryUrl(imgUrl, { width: 1200 })}
                        alt={`${listing.title} - Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {images.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                          {idx + 1} / {images.length}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <Tag className="w-8 h-8 opacity-40 text-slate-500" />
                  </div>
                  <p className="text-sm font-medium">No image available</p>
                </div>
              )}
              {hasCampaign && (
                <div className="absolute top-6 left-6 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-emerald-500/20 z-10">
                  {listing.campaignName || 'Sale'}
                </div>
              )}
            </div>
            
            {/* Highlights Bar */}
            {categoryBadges.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {categoryBadges.map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-100">
                    {badge.icon && <span className="text-lg">{badge.icon}</span>}
                    {badge.label}
                  </div>
                ))}
              </div>
            )}

            {listing?.id && (
              <div className="pt-2">
                 <AuraSummary type="listing" id={listing.id} />
              </div>
            )}

            <div className="w-full h-px bg-slate-100" />

            {/* Description Section */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">About this item</h2>
              <div className={`prose prose-slate prose-lg max-w-none prose-p:leading-relaxed prose-p:text-slate-600 whitespace-pre-wrap relative ${!isDescriptionExpanded ? 'max-h-[200px] overflow-hidden' : ''}`}>
                {listing.description}
                {!isDescriptionExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
              </div>
              <button 
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
              >
                {isDescriptionExpanded ? 'Show less' : 'Read more'}
              </button>
            </section>

            {DetailsComponent && (
              <>
                <div className="w-full h-px bg-slate-100" />
                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-8">Specifications</h2>
                  <div className="bg-slate-50/50 rounded-3xl p-6 sm:p-8">
                     <DetailsComponent listing={listing} />
                  </div>
                </section>
              </>
            )}

            <div className="w-full h-px bg-slate-100" />
            <div className="py-8">
              <SafeMeetupPanel />
            </div>

            {hasReviews && (
              <>
                <div className="w-full h-px bg-slate-100" />
                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-8 mt-8">Reviews</h2>
                  <ListingReviewsSection listing={listing} />
                </section>
              </>
            )}
            
          </div>

          {/* Right Column (Sticky Action Card) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24 space-y-8">
              
              {/* Premium Action Card */}
              <div className="bg-white rounded-[32px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8">
                
                {/* Price Display */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-3 flex-wrap mb-2">
                    <span className="text-[40px] font-extrabold text-slate-900 tabular-nums tracking-tight leading-none">
                      {formatCurrency(displayPrice, listing.currency)}
                    </span>
                    {hasCampaign && (
                      <span className="text-xl text-slate-400 line-through font-medium tabular-nums">
                        {formatCurrency(listing.price, listing.currency)}
                      </span>
                    )}
                  </div>
                  
                  {/* Stock & Reservation Status */}
                  {hasStockInfo && (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        isLowStock ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isLowStock && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                        {isLowStock ? `Only ${Number(listing.quantity)} left` : `${Number(listing.quantity)} in stock`}
                      </span>
                      {activeReservations > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold">
                          🔥 {activeReservations} people looking
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Primary Actions */}
                {(canAddToCart || canMakeOffer) && (
                  <div className="space-y-3 mb-8">
                    {canAddToCart && (
                      <button
                        onClick={() => addToCart(listing.id)}
                        disabled={isAddingToCart}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl text-base font-bold hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                      </button>
                    )}
                    {canMakeOffer && (
                      <button
                        onClick={() => setIsOfferModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-slate-200 text-slate-800 rounded-2xl text-base font-bold hover:border-slate-900 hover:bg-slate-50 transition-all active:scale-[0.98]"
                      >
                        <HandCoins className="w-5 h-5" />
                        Make an Offer
                      </button>
                    )}
                  </div>
                )}

                {/* Trust/Seller Component */}
                <ListingTrustPanel
                  listing={listing}
                  isOwner={isOwner}
                  onShowcaseSuccess={fetchListing}
                />

                <ListingAnalyticsPanel
                  listing={listing}
                  isOwner={isOwner}
                  displayPrice={displayPrice}
                />
                
              </div>

            </div>
          </div>

        </div>

        <div className="mt-20">
          <SimilarListings currentListing={listing} />
        </div>
      </main>

      {/* Mobile Sticky Bottom Bar */}
      {(canAddToCart || canMakeOffer || !isOwner) && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-4 py-3 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xl font-extrabold text-slate-900 tabular-nums tracking-tight leading-none mb-0.5">{formatCurrency(displayPrice, listing.currency)}</p>
              {hasCampaign && (
                <p className="text-xs text-slate-400 line-through font-medium tabular-nums">{formatCurrency(listing.price, listing.currency)}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!isOwner && (
                <ContactSellerButton
                  listing={listing}
                  className="p-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <MessageSquare className="w-5 h-5 shrink-0" />
                </ContactSellerButton>
              )}
              {canAddToCart && (
                <button
                  onClick={() => addToCart(listing.id)}
                  disabled={isAddingToCart}
                  className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Cart
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailPage;
