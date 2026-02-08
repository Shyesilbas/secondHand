import React, { useCallback, useEffect, useRef, useState } from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {useListingData} from '../hooks/useListingData.js';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import ListingCardActions from '../components/ListingCardActions.jsx';
import { listingTypeRegistry } from '../config/listingConfig.js';
import {ROUTES} from '../../common/constants/routes.js';
import {trackView} from '../services/listingAddonService.js';
import {getOrCreateSessionId} from '../../common/utils/sessionId.js';
import {AlertTriangle, ArrowLeft, ChevronRight, HandCoins, Share2, ShoppingBag, Sparkles} from 'lucide-react';
import {useCart} from '../../cart/hooks/useCart.js';
import MakeOfferModal from '../../offer/components/MakeOfferModal.jsx';
import CompareButton from '../../comparison/components/CompareButton.jsx';
import ListingHero from '../components/ListingHero.jsx';
import ListingTrustPanel from '../components/ListingTrustPanel.jsx';
import ListingAnalyticsPanel from '../components/ListingAnalyticsPanel.jsx';
import ListingSocialPanel from '../components/ListingSocialPanel.jsx';

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthState();
  const { listing, isLoading, error, refetch: fetchListing } = useListingData(id);
  const { addToCart, isAddingToCart } = useCart({ loadCartItems: false });
  const [activeTab, setActiveTab] = useState('about');
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const viewTrackedRef = useRef(false);

  const isOwner = isAuthenticated && user?.id === listing?.sellerId;

  const handleListingChanged = useCallback(() => {
    fetchListing?.();
  }, [fetchListing]);

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
            <button
              onClick={() => navigate(ROUTES.AURA_CHAT, { state: { listing } })}
              className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 rounded-xl transition-all duration-300 ease-in-out"
              title="Ask Aura"
            >
              <Sparkles className="w-4 h-4" />
            </button>
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
               <ListingCardActions
                 listing={listing}
                 onChanged={fetchListing}
               />
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
            <ListingHero
              listing={listing}
              variant="main"
              displayPrice={displayPrice}
              hasCampaign={hasCampaign}
              hasStockInfo={hasStockInfo}
              isLowStock={isLowStock}
            />

            <ListingSocialPanel
              listing={listing}
              isOwner={isOwner}
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              DetailsComponent={DetailsComponent}
              hasReviews={hasReviews}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 lg:sticky lg:top-20">
                <ListingHero
                  listing={listing}
                  variant="sidebar"
                  displayPrice={displayPrice}
                  hasCampaign={hasCampaign}
                  hasStockInfo={hasStockInfo}
                  isLowStock={isLowStock}
                />

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
    </div>
  );
};

export default ListingDetailPage;
