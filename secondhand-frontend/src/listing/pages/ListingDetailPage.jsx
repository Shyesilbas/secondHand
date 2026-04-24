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
import {formatCurrency} from '../../common/formatters.js';

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
        <div className="w-8 h-8 rounded-full border-2 border-gray-900 border-t-transparent animate-spin" />
        <p className="text-[13px] text-gray-400 font-medium">Loading listing…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>
        <h3 className="text-[15px] font-semibold text-gray-800 mb-1">Listing Unavailable</h3>
        <p className="text-[13px] text-gray-400 mb-6">{error || "This listing could not be found."}</p>
        <Link
          to={ROUTES.LISTINGS}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-900 hover:text-gray-600 transition-colors"
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
    <div className="min-h-screen bg-slate-50 pb-20 lg:pb-8">

      {/* Sticky topbar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 h-13 flex items-center justify-between gap-4">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-[12px] min-w-0">
            <Link
              to={ROUTES.LISTINGS}
              className="text-gray-400 hover:text-gray-700 font-medium transition-colors shrink-0 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Listings
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
            <span className="text-gray-700 font-semibold truncate max-w-[220px]">{listing.title}</span>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => navigate(ROUTES.AURA_CHAT, { state: { listing } })}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-lg transition-colors hover:bg-gray-50"
              title="Ask Aura"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            {canAddToCart && (
              <button
                onClick={() => addToCart(listing.id)}
                disabled={isAddingToCart}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg transition-colors hover:bg-gray-50 hidden lg:flex"
                title="Add to Cart"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            )}
            {canMakeOffer && (
              <button
                onClick={() => setIsOfferModalOpen(true)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg transition-colors hover:bg-gray-50 hidden lg:flex"
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
                className="p-2 border-0 text-gray-400 hover:text-rose-500 rounded-lg transition-colors hover:bg-rose-50"
              />
            )}
            <button className="p-2 text-gray-400 hover:text-gray-700 rounded-lg transition-colors hover:bg-gray-50">
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
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:sticky lg:top-16">
              <ListingHero
                listing={listing}
                variant="sidebar"
                displayPrice={displayPrice}
                hasCampaign={hasCampaign}
                hasStockInfo={hasStockInfo}
                isLowStock={isLowStock}
              />

              {/* CTA — compact, no shouting */}
              {(canAddToCart || canMakeOffer) && (
                <div className="hidden lg:flex gap-2 mb-5">
                  {canAddToCart && (
                    <button
                      onClick={() => addToCart(listing.id)}
                      disabled={isAddingToCart}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-xl text-[13px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {isAddingToCart ? 'Adding…' : 'Add to Cart'}
                    </button>
                  )}
                  {canMakeOffer && (
                    <button
                      onClick={() => setIsOfferModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-[13px] font-medium hover:bg-gray-50 transition-colors"
                    >
                      <HandCoins className="w-3.5 h-3.5" />
                      Make Offer
                    </button>
                  )}
                </div>
              )}

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

      {/* Mobile sticky bottom bar */}
      {(canAddToCart || canMakeOffer) && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-semibold text-gray-900 tabular-nums tracking-tight">{formatCurrency(displayPrice, listing.currency)}</p>
              {hasCampaign && (
                <p className="text-[11px] text-gray-400 line-through tabular-nums">{formatCurrency(listing.price, listing.currency)}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {canMakeOffer && (
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-[13px] font-medium hover:bg-gray-50 transition-colors"
                >
                  Offer
                </button>
              )}
              {canAddToCart && (
                <button
                  onClick={() => addToCart(listing.id)}
                  disabled={isAddingToCart}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-[13px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {isAddingToCart ? 'Adding…' : 'Add to Cart'}
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
