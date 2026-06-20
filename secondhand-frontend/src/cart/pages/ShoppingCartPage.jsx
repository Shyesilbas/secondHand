import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Check, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart.js';
import { formatCurrency } from '../../common/formatters.js';
import CartItemCard from '../components/CartItemCard.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import ClearCartModal from '../components/ClearCartModal.jsx';
import ListingCard from '../../listing/components/ListingCard.jsx';
import { SkeletonGrid, EmptyState } from '../../common/components/ui/index.js';
import { ROUTES } from '../../common/constants/routes.js';
import { CART_MESSAGES } from '../cartConstants.js';
import { couponService } from '../services/couponService.js';
import { campaignService } from '../../listing/services/campaignService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useFavorites } from '../../favorites/hooks/useFavorites.js';
import { CART_UI, cartBtnPrimary, cartBtnSecondary, cartPageCanvas, cartPageHeader, cartSurfacePanel, CART_SHAPE } from '../uiPalette.js';
const ShoppingCartPage = () => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const notification = useNotification();
  const {
    user,
    isAuthenticated
  } = useAuthState();
  const {
    favorites = [],
    isLoading: favoritesLoading
  } = useFavorites(0, 8);
  const {
    cartItems,
    cartCount,
    isLoading,
    updateCartItem,
    removeFromCart,
    clearCart,
    isUpdatingCart,
    isRemovingFromCart,
    isClearingCart
  } = useCart();
  const [pricing, setPricing] = useState(null);
  const [_, setIsPricingLoading] = useState(false);
  const [sellerCampaigns, setSellerCampaigns] = useState([]);
  const [showClearModal, setShowClearModal] = useState(false);
  const checkReservationStatus = reservedAt => {
    if (!reservedAt) return {
      isExpired: false,
      timeRemaining: null
    };
    const reservedTime = new Date(reservedAt);
    const expirationTime = new Date(reservedTime.getTime() + 15 * 60 * 1000);
    const now = new Date();
    const diff = expirationTime - now;
    if (diff <= 0) {
      return {
        isExpired: true,
        timeRemaining: null
      };
    }
    const minutes = Math.floor(diff / 60000);
    return {
      isExpired: false,
      timeRemaining: {
        minutes,
        seconds: Math.floor(diff % 60000 / 1000)
      }
    };
  };
  const hasExpiredReservations = useMemo(() => cartItems.some(item => checkReservationStatus(item.reservedAt).isExpired), [cartItems]);
  const hasExpiringReservations = useMemo(() => cartItems.some(item => {
    const {
      isExpired,
      timeRemaining
    } = checkReservationStatus(item.reservedAt);
    return !isExpired && timeRemaining && timeRemaining.minutes < 5;
  }), [cartItems]);
  useEffect(() => {
    if (cartItems.length > 0) {
      setIsPricingLoading(true);
      const sellerIds = [...new Set(cartItems.map(item => item.listing.sellerId))];
      Promise.all([couponService.preview(null), campaignService.listBySellers(sellerIds)]).then(([pricingRes, campaignsRes]) => {
        setPricing(pricingRes?.data || pricingRes);
        setSellerCampaigns(Array.isArray(campaignsRes?.data) ? campaignsRes.data : Array.isArray(campaignsRes) ? campaignsRes : []);
      }).catch(() => {
        setPricing(null);
        setSellerCampaigns([]);
      }).finally(() => setIsPricingLoading(false));
    } else {
      setPricing(null);
      setSellerCampaigns([]);
    }
  }, [cartItems]);
  const bundleInfo = useMemo(() => {
    if (!sellerCampaigns.length || !cartItems.length) return {
      suggestions: [],
      applied: []
    };
    const suggestions = [];
    const applied = [];
    const quantitiesBySeller = {};
    cartItems.forEach(item => {
      const sId = item.listing.sellerId;
      quantitiesBySeller[sId] = (quantitiesBySeller[sId] || 0) + item.quantity;
    });
    sellerCampaigns.forEach(c => {
      if (c.minQuantity > 1) {
        const currentQty = quantitiesBySeller[c.sellerId] || 0;
        if (currentQty > 0) {
          if (currentQty < c.minQuantity) {
            suggestions.push({
              sellerId: c.sellerId,
              sellerName: c.sellerName || 'Seller',
              remaining: c.minQuantity - currentQty,
              discountValue: c.value,
              discountKind: c.discountKind,
              minQuantity: c.minQuantity
            });
          } else {
            applied.push({
              sellerId: c.sellerId,
              sellerName: c.sellerName || 'Seller',
              discountValue: c.value,
              discountKind: c.discountKind,
              quantity: currentQty
            });
          }
        }
      }
    });
    return {
      suggestions,
      applied
    };
  }, [sellerCampaigns, cartItems]);
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.listing.campaignPrice ?? item.listing.price) || 0;
      return total + price * item.quantity;
    }, 0);
  };
  const calculateOriginalTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.listing.price) || 0;
      return total + price * item.quantity;
    }, 0);
  };
  const currency = cartItems.length > 0 ? cartItems[0].listing.currency : 'TRY';
  const originalTotal = pricing?.originalSubtotal != null ? parseFloat(pricing.originalSubtotal) : calculateOriginalTotal();
  const discountedTotal = pricing?.total != null ? parseFloat(pricing.total) : calculateTotal();
  const campaignDiscount = pricing?.campaignDiscount != null ? parseFloat(pricing.campaignDiscount) : Math.max(0, (originalTotal || 0) - (discountedTotal || 0));
  const favoriteListings = useMemo(() => favorites.map(fav => {
    const listing = fav?.listing;
    if (!listing) return null;
    const favoriteCount = listing?.favoriteCount ?? listing?.favoriteStats?.favoriteCount ?? 0;
    return {
      ...listing,
      favoriteStats: {
        ...listing.favoriteStats,
        favoriteCount,
        isFavorited: true,
        favorited: true
      }
    };
  }).filter(Boolean), [favorites]);
  const handleQuantityChange = (listingId, newQuantity) => {
    if (newQuantity < 1) return;
    const item = cartItems.find(ci => ci?.listing?.id === listingId);
    const max = item?.listing?.quantity;
    if (max != null && Number.isFinite(Number(max)) && newQuantity > Number(max)) {
      updateCartItem(listingId, Number(max), '');
      notification?.showError('Stock limit', `Only ${Number(max)} available.`);
      return;
    }
    updateCartItem(listingId, newQuantity, '');
  };
  const handleRemoveItem = listingId => {
    removeFromCart(listingId);
  };
  const handleClearCart = () => {
    clearCart();
    setShowClearModal(false);
  };
  if (isLoading) {
    return <div className={`flex min-h-screen items-center justify-center ${cartPageCanvas}`}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1466c6] border-t-transparent" aria-hidden />
      </div>;
  }
  return <div className={`min-h-screen ${cartPageCanvas}`}>
      <header className={cartPageHeader}>
        <PageContainer className="flex h-14 items-center justify-between py-0">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button type="button" onClick={() => navigate(-1)} className="-ml-2 rounded-xl p-2 text-text-secondary transition hover:bg-black/[0.04] hover:text-[#1a1918]" aria-label={t("back")}>
              <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <h1 className="text-2xl font-semibold text-text-primary truncate text-[#1a1918]">{t("shopping_cart")}</h1>
            {cartCount > 0 ? <span className="shrink-0 rounded-full border bg-background-primary px-2.5 py-0.5 text-xs font-medium tabular-nums text-text-secondary" style={{
            borderColor: CART_UI.border
          }}>
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span> : <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{t("empty")}</span>}
          </div>
          {cartCount > 0 && <div className="text-right">
              <p className="text-sm font-semibold tabular-nums text-[#1a1918] sm:text-base">
                {formatCurrency(discountedTotal, currency)}
              </p>
              {campaignDiscount > 0 && <p className="text-xs tabular-nums text-text-secondary">
                  <span className="line-through">{formatCurrency(originalTotal, currency)}</span>
                  <span className="ml-1.5 text-[#107c10]">
                    −{formatCurrency(campaignDiscount, currency)}
                  </span>
                </p>}
            </div>}
        </PageContainer>
      </header>

      <PageContainer className="py-6 sm:py-8">
        {cartCount === 0 ? <div className="space-y-8 pb-12">
            <div className={cartSurfacePanel} style={{
          borderColor: CART_UI.border
        }}>
              <EmptyState
                icon={ShoppingBag}
                title={CART_MESSAGES.EMPTY_CART_TITLE}
                description={CART_MESSAGES.EMPTY_CART_DESCRIPTION}
              >
                <div className="mt-8 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
                  <button type="button" onClick={() => navigate(ROUTES.LISTINGS)} className={`${cartBtnPrimary} px-6`}>{t("browse_listings")}</button>
                  {isAuthenticated ? <Link to={ROUTES.FAVORITES} className={`${cartBtnSecondary} px-6 py-2.5 text-center`}>
                      <span className="inline-flex items-center justify-center gap-2">
                        <Heart className="h-4 w-4 text-text-secondary" strokeWidth={1.75} />{t("favorites")}</span>
                    </Link> : <Link to={ROUTES.LOGIN} className={`${cartBtnSecondary} px-6 py-2.5 text-center`}>
                      {CART_MESSAGES.EMPTY_CART_SIGN_IN}
                    </Link>}
                </div>
              </EmptyState>
            </div>

            {isAuthenticated ? <section className={`${cartSurfacePanel} p-5 sm:p-6`} style={{
          borderColor: CART_UI.border
        }}>
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-text-primary text-[#1a1918]">
                      {CART_MESSAGES.EMPTY_CART_FAVORITES_TITLE}
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      {CART_MESSAGES.EMPTY_CART_FAVORITES_SUB}
                    </p>
                  </div>
                  <Link to={ROUTES.FAVORITES} className="text-sm font-medium text-[#1466c6] hover:underline">
                    {CART_MESSAGES.EMPTY_CART_SEE_ALL_FAVORITES}
                  </Link>
                </div>
                {favoritesLoading ? <SkeletonGrid count={4} columns="grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4" /> : favoriteListings.length > 0 ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
                    {favoriteListings.map((listing, index) => <div key={listing.id} className="min-w-0 max-w-full">
                        <ListingCard listing={listing} isOwner={user?.id === listing.sellerId} currentUserId={user?.id} priorityImage={index < 4} />
                      </div>)}
                  </div> : <p className="rounded-xl border border-dashed border-[#e0deda] py-8 text-center text-sm text-text-secondary">{t("no_favorites_yet_tap_the_heart_on_a_list")}</p>}
              </section> : <div className={`${cartSurfacePanel} flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between`} style={{
          borderColor: CART_UI.border
        }}>
                <p className="text-sm text-text-secondary">{CART_MESSAGES.EMPTY_CART_GUEST_FAVORITES}</p>
                <Link to={ROUTES.LOGIN} className={`${cartBtnPrimary} shrink-0 px-5 py-2.5 text-center`}>
                  {CART_MESSAGES.EMPTY_CART_SIGN_IN}
                </Link>
              </div>}
          </div> : <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            <div className="space-y-4 lg:col-span-8">
              {(hasExpiredReservations || hasExpiringReservations) && <div className={`flex gap-2.5 rounded-xl border-l-4 px-3 py-2.5 text-sm ${hasExpiredReservations ? 'border-[#d13438] bg-[#fdf3f2] text-text-secondary' : 'border-[#ca5010] bg-[#fff9f5] text-text-secondary'}`}>
                  <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${hasExpiredReservations ? 'text-[#d13438]' : 'text-[#ca5010]'}`} />
                  <div>
                    <p className="font-medium text-[#1a1918]">
                      {hasExpiredReservations ? 'Some reservations have expired' : 'Reservations expiring soon'}
                    </p>
                    <p className="mt-0.5 text-text-secondary">
                      {hasExpiredReservations ? 'Update quantities or proceed to checkout now.' : 'Complete your purchase within the next few minutes to hold these items.'}
                    </p>
                  </div>
                </div>}

              {/* Applied Bundles (Success) */}
              {bundleInfo.applied.length > 0 && <div className="mb-6 space-y-3">
                  {bundleInfo.applied.map((a, idx) => <div key={idx} className="flex items-center gap-4 p-4 bg-status-success-bg border border-status-success-border rounded-2xl animate-in slide-in-from-top-4 duration-500">
                      <div className="w-10 h-10 bg-status-success-bg text-white rounded-xl flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-status-success-text">{t("bundle_unlocked")}</p>
                        <p className="text-xs text-status-success-text mt-0.5">{t("you_ve_earned_a")}<b>{a.discountValue}{a.discountKind === 'PERCENT' ? '%' : ''}{t("discount")}</b>{t("from")}<button onClick={() => navigate(ROUTES.USER_PROFILE(a.sellerId))} className="font-bold underline hover:text-status-success-text transition-colors">{a.sellerName}</button>{t("for_buying")}{a.quantity}{t("items")}</p>
                      </div>
                    </div>)}
                </div>}

              {/* Bundle Suggestions (Potential) */}
              {bundleInfo.suggestions.length > 0 && <div className="mb-8 space-y-4">
                  {bundleInfo.suggestions.map((s, idx) => {
              const currentQty = s.minQuantity - s.remaining;
              const progress = currentQty / s.minQuantity * 100;
              return <div key={idx} className="group relative overflow-hidden bg-background-primary border-2 border-primary rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
                        <div className="absolute top-0 left-0 w-1 bg-primary h-full" />
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-50 text-primary">
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </span>
                              <h4 className="text-sm font-bold text-[#1a1918]">{t("exclusive_bundle_from")}<button onClick={() => navigate(ROUTES.USER_PROFILE(s.sellerId))} className="underline hover:text-primary transition-colors">{s.sellerName}</button>
                              </h4>
                            </div>
                            
                            <p className="text-xs text-text-secondary mb-4">{t("add")}<span className="font-bold text-primary">{s.remaining}{t("more_item")}{s.remaining > 1 ? 's' : ''}</span>{t("to_unlock_a")}<span className="px-1.5 py-0.5 rounded bg-status-success-bg text-status-success-text font-bold">{s.discountValue}{s.discountKind === 'PERCENT' ? '%' : ''}{t("discount")}</span>{t("on_your_entire_bundle")}</p>
                            
                            <div className="relative w-full h-2 bg-[#f0efed] rounded-full overflow-hidden">
                              <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out" style={{
                        width: `${progress}%`
                      }} />
                            </div>
                            <div className="flex justify-between mt-2 text-caption font-bold uppercase tracking-wider text-text-muted">
                              <span>{currentQty}{t("items_in_cart")}</span>
                              <span>{t("target")}{s.minQuantity}{t("items")}</span>
                            </div>
                          </div>
                          
                          <button onClick={() => navigate(ROUTES.USER_PROFILE(s.sellerId))} className="shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-[#1a1918] text-white text-xs font-bold rounded-2xl hover:bg-black transition-all shadow-lg shadow-black/5">
                            <ShoppingBag className="w-4 h-4" />{t("complete_bundle")}</button>
                        </div>
                      </div>;
            })}
                </div>}

              <div className={cartSurfacePanel} style={{
            borderColor: CART_UI.border
          }}>
                <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5" style={{
              borderColor: CART_UI.border,
              backgroundColor: CART_UI.surface
            }}>
                  <h2 className="text-lg font-semibold text-text-primary text-[#1a1918]">{t("your_items")}</h2>
                  <button type="button" onClick={() => setShowClearModal(true)} className="text-xs font-medium text-text-secondary underline-offset-2 hover:text-[#1466c6] hover:underline">{t("clear_all")}</button>
                </div>
                <div className="divide-y divide-[#e0deda]">
                  {cartItems.map(item => <CartItemCard key={item.id} item={item} onQuantityChange={handleQuantityChange} onRemoveItem={handleRemoveItem} isUpdating={isUpdatingCart} isRemoving={isRemovingFromCart} />)}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <OrderSummary cartItems={cartItems} cartCount={cartCount} calculateTotal={calculateTotal} pricing={pricing} onCheckout={() => navigate(ROUTES.CHECKOUT)} disabled={cartCount === 0} />
            </div>
          </div>}

        <ClearCartModal isOpen={showClearModal} onClose={() => setShowClearModal(false)} onConfirm={handleClearCart} isClearing={isClearingCart} />
      </PageContainer>
    </div>;
};
export default ShoppingCartPage;