import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { usePlan } from '@/common/hooks/usePlan';
import ActiveCouponsModal from '../components/checkout/ActiveCouponsModal.jsx';
import PremiumUpgradeModal from '@/common/components/ui/PremiumUpgradeModal.jsx';
import { AlertTriangle, ArrowLeft, Check, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart.js';
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
import { getListingFavoriteCount } from '../../favorites/favorites.js';
import Button, { buttonClasses } from '../../common/components/ui/Button.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
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
 const sellerIds = useMemo(() => {
 return [...new Set(cartItems.map(item => item.listing.sellerId))];
 }, [cartItems]);

 const cartKey = useMemo(() => {
 return cartItems.map(i => `${i?.listing?.id || i?.id}:${i.quantity}`).join('|');
 }, [cartItems]);

  const { isPremium } = usePlan();
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  const { data: pricingData, isLoading: isPreviewLoading } = useQuery({
    queryKey: ['cartPricingAndCampaigns', cartKey, sellerIds, appliedCouponCode],
    queryFn: async () => {
      const requested = appliedCouponCode != null && String(appliedCouponCode).trim() !== '' ? String(appliedCouponCode).trim().toUpperCase() : null;
      let pricingRes;
      let couponSuccess = true;
      let couponErr = null;

      try {
        pricingRes = await couponService.preview(requested);
      } catch (e) {
        if (requested) {
          pricingRes = await couponService.preview(null);
          couponSuccess = false;
          couponErr = e;
        } else {
          throw e;
        }
      }

      const campaignsRes = await campaignService.listBySellers(sellerIds).catch(() => ({ data: [] }));

      return {
        pricing: pricingRes?.data || pricingRes,
        sellerCampaigns: Array.isArray(campaignsRes?.data) ? campaignsRes.data : Array.isArray(campaignsRes) ? campaignsRes : [],
        couponSuccess,
        couponError: couponErr
      };
    },
    enabled: cartItems.length > 0,
    staleTime: 10 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const pricing = pricingData?.pricing || null;
  const sellerCampaigns = useMemo(() => pricingData?.sellerCampaigns || [], [pricingData?.sellerCampaigns]);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    if (pricingData) {
      if (pricingData.couponSuccess) {
        const echoed = pricing?.couponCode != null && String(pricing.couponCode).trim() !== '' ? String(pricing.couponCode).trim().toUpperCase() : null;
        if (!appliedCouponCode) {
          setCouponError(null);
        } else if (echoed && echoed === appliedCouponCode) {
          setCouponError(null);
        } else {
          setAppliedCouponCode(null);
          setCouponError(CART_MESSAGES.COUPON_APPLY_FAILED);
        }
      } else {
        const e = pricingData.couponError;
        const message = e?.response?.data?.message || e?.response?.data?.error || CART_MESSAGES.COUPON_APPLY_FAILED;
        setCouponError(message);
        setAppliedCouponCode(null);
      }
    }
  }, [pricingData, pricing, appliedCouponCode]);

  const onApplyCoupon = () => {
    const next = couponInput?.trim() || '';
    if (!next) {
      setCouponError(null);
      setAppliedCouponCode(null);
      return;
    }
    setAppliedCouponCode(next.toUpperCase());
  };

  const onRemoveCoupon = () => {
    setAppliedCouponCode(null);
    setCouponInput('');
    setCouponError(null);
  };
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
 // Pricing and campaigns are now fetched and managed by TanStack useQuery above
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
 const favoriteListings = useMemo(() => favorites.map(fav => {
    const listing = fav?.listing;
    if (!listing) return null;
    const favoriteCount = getListingFavoriteCount(listing);
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
    return (
      <div className="min-h-screen bg-background-secondary">
        <PageContainer className="space-y-4 py-8" aria-busy="true">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-3">
              {['a', 'b', 'c'].map((k) => (
                <Skeleton key={k} className="h-32 w-full" />
              ))}
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      <PageContainer className="py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t("continue_shopping", "Alışverişe Devam Et")}</span>
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-text-primary">
                {t("shopping_cart", "Alışveriş Sepeti")}
              </h1>
              {cartCount > 0 && (
                <span className="rounded-sm border border-border-light bg-background-primary px-2.5 py-0.5 text-xs font-medium tabular-nums text-text-secondary">
                  {cartCount} {cartCount === 1 ? t("item", "ürün") : t("items", "ürün")}
                </span>
              )}
            </div>
          </div>

          {cartCount > 0 && (
            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="text-xs font-medium text-text-secondary hover:text-status-error transition self-start sm:self-auto"
            >
              {t("clear_all", "Sepeti Temizle")}
            </button>
          )}
        </div>

        {cartCount === 0 ? (
          <div className="space-y-8 pb-12">
            <div className="overflow-hidden rounded border border-border bg-background-primary p-6">
              <EmptyState
                icon={ShoppingBag}
                title={CART_MESSAGES.EMPTY_CART_TITLE}
                description={CART_MESSAGES.EMPTY_CART_DESCRIPTION}
              >
                <div className="mt-6 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
                  <Button onClick={() => navigate(ROUTES.LISTINGS)}>{t("browse_listings")}</Button>
                  {isAuthenticated ? (
                    <Link to={ROUTES.FAVORITES} className={buttonClasses('secondary')}>
                      <span className="inline-flex items-center justify-center gap-1.5">
                        <Heart className="h-4 w-4 text-text-secondary" strokeWidth={1.75} />
                        {t("favorites")}
                      </span>
                    </Link>
                  ) : (
                    <Link to={ROUTES.LOGIN} className={buttonClasses('secondary')}>
                      {CART_MESSAGES.EMPTY_CART_SIGN_IN}
                    </Link>
                  )}
                </div>
              </EmptyState>
            </div>

            {isAuthenticated ? (
              <section className="overflow-hidden rounded border border-border bg-background-primary p-5 sm:p-6">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-text-primary">
                      {CART_MESSAGES.EMPTY_CART_FAVORITES_TITLE}
                    </h2>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {CART_MESSAGES.EMPTY_CART_FAVORITES_SUB}
                    </p>
                  </div>
                  <Link to={ROUTES.FAVORITES} className="text-xs font-medium text-text-primary hover:underline">
                    {CART_MESSAGES.EMPTY_CART_SEE_ALL_FAVORITES} →
                  </Link>
                </div>
                {favoritesLoading ? (
                  <SkeletonGrid count={4} columns="grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4" />
                ) : favoriteListings.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
                    {favoriteListings.map((listing, index) => (
                      <div key={listing.id} className="min-w-0 max-w-full">
                        <ListingCard
                          listing={listing}
                          isOwner={user?.id === listing.sellerId}
                          currentUserId={user?.id}
                          priorityImage={index < 4}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded border border-dashed border-border-light py-8 text-center text-xs text-text-secondary">
                    {t("no_favorites_yet_tap_the_heart_on_a_list")}
                  </p>
                )}
              </section>
            ) : (
              <div className="overflow-hidden rounded border border-border bg-background-primary flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-text-secondary">{CART_MESSAGES.EMPTY_CART_GUEST_FAVORITES}</p>
                <Link to={ROUTES.LOGIN} className={`${buttonClasses()} shrink-0`}>
                  {CART_MESSAGES.EMPTY_CART_SIGN_IN}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
            {/* Left Column: Cart Items & Alerts */}
            <div className="space-y-4 lg:col-span-8">
              {/* Expired / Expiring Reservations */}
              {(hasExpiredReservations || hasExpiringReservations) && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded border border-border bg-background-primary p-3.5 text-xs text-text-secondary"
                >
                  <AlertTriangle
                    className={`h-4 w-4 shrink-0 mt-0.5 ${
                      hasExpiredReservations ? 'text-status-error' : 'text-status-warning'
                    }`}
                  />
                  <div>
                    <p className="font-semibold text-text-primary">
                      {hasExpiredReservations
                        ? 'Bazı ürün rezervasyonlarının süresi doldu'
                        : 'Rezervasyon süresi yakında doluyor'}
                    </p>
                    <p className="mt-0.5 text-text-secondary">
                      {hasExpiredReservations
                        ? 'Stok durumunu güncellemek veya alışverişi tamamlamak için hemen ödeme adımına geçin.'
                        : 'Ürünlerinizi ayırmak ve kaçırmamak için alışverişinizi birkaç dakika içinde tamamlayın.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Applied Bundles (Success) */}
              {bundleInfo.applied.length > 0 && (
                <div className="space-y-2.5">
                  {bundleInfo.applied.map((a, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded border border-border bg-background-primary p-3.5 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Check className="h-4 w-4 text-status-success shrink-0" strokeWidth={2} />
                        <div className="min-w-0">
                          <span className="font-semibold text-text-primary mr-1">
                            {a.sellerName} {t("bundle_unlocked", "Paket İndirimi")}:
                          </span>
                          <span className="text-text-secondary">
                            {a.quantity} ürün için %{a.discountValue} indirim uygulandı.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(ROUTES.USER_PROFILE(a.sellerId))}
                        className="text-xs font-medium text-text-secondary hover:text-text-primary hover:underline shrink-0"
                      >
                        {t("view_seller", "Satıcıyı Gör")}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Bundle Suggestions (Potential) */}
              {bundleInfo.suggestions.length > 0 && (
                <div className="space-y-3">
                  {bundleInfo.suggestions.map((s, idx) => {
                    const currentQty = s.minQuantity - s.remaining;
                    const progress = (currentQty / s.minQuantity) * 100;
                    return (
                      <div
                        key={idx}
                        className="rounded border border-border bg-background-primary p-4 sm:p-5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                                {t("exclusive_bundle_from", "Özel Satıcı Paketi:")}{' '}
                                <button
                                  type="button"
                                  onClick={() => navigate(ROUTES.USER_PROFILE(s.sellerId))}
                                  className="text-text-primary hover:underline font-semibold"
                                >
                                  {s.sellerName}
                                </button>
                              </span>
                            </div>

                            <p className="mt-1.5 text-xs text-text-secondary">
                              {t("add", "Ekle:")}{' '}
                              <strong className="text-text-primary">
                                {s.remaining} {t("more_item", "ürün daha")}
                              </strong>{' '}
                              → sepette{' '}
                              <span className="font-semibold text-status-success">
                                %{s.discountValue} indirim
                              </span>{' '}
                              kazanın.
                            </p>

                            <div className="mt-2.5 space-y-1">
                              <div className="h-1.5 w-full overflow-hidden rounded-sm bg-background-tertiary">
                                <div
                                  className="h-full bg-primary transition-all duration-300"
                                  style={{ width: `${Math.min(100, progress)}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-text-muted tabular-nums">
                                <span>{currentQty} {t("items_in_cart", "ürün sepette")}</span>
                                <span>Hedef: {s.minQuantity} {t("items", "ürün")}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => navigate(ROUTES.USER_PROFILE(s.sellerId))}
                            className="inline-flex items-center justify-center gap-1.5 rounded border border-border bg-background-primary px-3.5 py-2 text-xs font-semibold text-text-primary transition hover:bg-background-secondary shrink-0 self-start sm:self-center"
                          >
                            <ShoppingBag className="h-3.5 w-3.5 text-text-secondary" />
                            <span>{t("complete_bundle", "Paketi Tamamla")}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Items Card */}
              <div className="overflow-hidden rounded border border-border bg-background-primary">
                <div className="flex items-center justify-between border-b border-border-light px-5 py-3.5 bg-background-primary">
                  <h2 className="text-sm font-semibold text-text-primary">
                    {t("your_items", "Ürünleriniz")} ({cartCount})
                  </h2>
                  <span className="text-xs text-text-muted">
                    Güvenli rezervasyon
                  </span>
                </div>
                <div className="divide-y divide-border-light">
                  {cartItems.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemoveItem={handleRemoveItem}
                      isUpdating={isUpdatingCart}
                      isRemoving={isRemovingFromCart}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4">
              <OrderSummary
                cartItems={cartItems}
                cartCount={cartCount}
                calculateTotal={calculateTotal}
                pricing={pricing}
                onCheckout={() => navigate(ROUTES.CHECKOUT, { state: { couponCode: appliedCouponCode } })}
                disabled={cartCount === 0 || hasExpiredReservations}
                couponInput={couponInput}
                setCouponInput={setCouponInput}
                appliedCouponCode={appliedCouponCode}
                couponError={couponError}
                isPreviewLoading={isPreviewLoading}
                onApplyCoupon={onApplyCoupon}
                onRemoveCoupon={onRemoveCoupon}
                onOpenCouponsModal={() => setIsCouponsModalOpen(true)}
                isPremium={isPremium}
                onOpenPremiumModal={() => setIsPremiumModalOpen(true)}
              />
            </div>
          </div>
        )}

        <ClearCartModal
          isOpen={showClearModal}
          onClose={() => setShowClearModal(false)}
          onConfirm={handleClearCart}
          isClearing={isClearingCart}
        />
        <ActiveCouponsModal
          isOpen={isCouponsModalOpen}
          onClose={() => setIsCouponsModalOpen(false)}
          onApply={(code) => {
            const c = typeof code === 'string' ? code.trim() : '';
            setCouponInput(c);
            setIsCouponsModalOpen(false);
            setAppliedCouponCode(c ? c.toUpperCase() : null);
          }}
        />
        <PremiumUpgradeModal
          isOpen={isPremiumModalOpen}
          onClose={() => setIsPremiumModalOpen(false)}
          featureHint="Öncelikli Kargo"
        />
      </PageContainer>
    </div>
  );
};
export default ShoppingCartPage;