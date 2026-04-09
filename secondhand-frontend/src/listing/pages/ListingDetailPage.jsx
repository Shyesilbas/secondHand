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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-[13px] text-slate-400 font-medium">Loading listing…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>
        <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Listing Unavailable</h3>
        <p className="text-[13px] text-slate-400 mb-6">{error || "This listing could not be found."}</p>
        <Link
          to={ROUTES.LISTINGS}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
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
    <div className="min-h-screen bg-slate-50 pb-16">

      {/* Sticky topbar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 h-13 flex items-center justify-between gap-4">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-[12px] min-w-0">
            <Link
              to={ROUTES.LISTINGS}
              className="text-slate-400 hover:text-slate-700 font-medium transition-colors shrink-0 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Listings
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            <span className="text-slate-700 font-semibold truncate max-w-[220px]">{listing.title}</span>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => navigate(ROUTES.AURA_CHAT, { state: { listing } })}
              className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors hover:bg-indigo-50"
              title="Ask Aura"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            {canAddToCart && (
              <button
                onClick={() => addToCart(listing.id)}
                disabled={isAddingToCart}
                className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors hover:bg-indigo-50"
                title="Add to Cart"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            )}
            {canMakeOffer && (
              <button
                onClick={() => setIsOfferModalOpen(true)}
                className="p-2 text-slate-400 hover:text-emerald-600 rounded-xl transition-colors hover:bg-emerald-50"
                title="Make Offer"
              >
                <HandCoins className="w-4 h-4" />
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
                className="p-2 border-0 text-slate-400 hover:text-rose-500 rounded-xl transition-colors hover:bg-rose-50"
              />
            )}
            <button className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-colors hover:bg-slate-100">
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

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7">
        <div className="grid lg:grid-cols-12 gap-6">

          {/* Left column */}
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

          {/* Right sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:sticky lg:top-16">
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
