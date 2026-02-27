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

  useEffect(() => {
    if (listing && !viewTrackedRef.current && !isOwner) {
      viewTrackedRef.current = true;
      const sessionId = getOrCreateSessionId();
      const userAgent = navigator.userAgent;
      trackView(listing.id, sessionId, userAgent);
    }
  }, [listing, isOwner]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-5 h-5 text-gray-400" />
        </div>
        <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Unavailable</h3>
        <p className="text-[13px] text-gray-400 mb-5">{error || "This listing could not be found."}</p>
        <Link
          to={ROUTES.LISTINGS}
          className="inline-flex items-center text-[13px] font-medium text-gray-900 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
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
    <div className="min-h-screen bg-[#fafafa] pb-16">
      {/* Sticky header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <nav className="flex items-center text-[11px] text-gray-400 min-w-0">
            <Link to={ROUTES.LISTINGS} className="hover:text-gray-700 transition-colors shrink-0">Listings</Link>
            <ChevronRight className="w-3 h-3 mx-1.5 text-gray-300 shrink-0" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{listing.title}</span>
          </nav>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => navigate(ROUTES.AURA_CHAT, { state: { listing } })}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-md transition-colors"
              title="Ask Aura"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            {canAddToCart && (
              <button
                onClick={() => addToCart(listing.id)}
                disabled={isAddingToCart}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-md transition-colors"
                title="Add to Cart"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
              </button>
            )}
            {canMakeOffer && (
              <button
                onClick={() => setIsOfferModalOpen(true)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-md transition-colors"
                title="Make Offer"
              >
                <HandCoins className="w-3.5 h-3.5" />
              </button>
            )}
            {!isOwner && (
              <CompareButton listing={listing} size="md" />
            )}
            {!isOwner && (
              <FavoriteButton
                listingId={listing.id}
                listing={listing}
                size="md"
                showCount={false}
                className="p-2 border-0 text-gray-400 hover:text-red-500 rounded-md transition-colors"
              />
            )}
            <button className="p-2 text-gray-400 hover:text-gray-700 rounded-md transition-colors">
              <Share2 className="w-3.5 h-3.5" />
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

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-12 gap-5">

          <div className="lg:col-span-8 space-y-4">
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

          <div className="lg:col-span-4 space-y-4">
             <div className="bg-white rounded-lg border border-gray-100 p-5 lg:sticky lg:top-16">
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
