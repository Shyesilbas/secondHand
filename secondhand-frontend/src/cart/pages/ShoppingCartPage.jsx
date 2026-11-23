import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '@/common/hooks/usePlan';
import ActiveCouponsModal from '../components/checkout/ActiveCouponsModal.jsx';
import PremiumUpgradeModal from '@/common/components/ui/PremiumUpgradeModal.jsx';
import { getErrorMessage } from '../../common/utils/errorUtils.js';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '../hooks/useCart.js';
import CartItemCard from '../components/CartItemCard.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import ClearCartModal from '../components/ClearCartModal.jsx';
import EmptyCartView from '../components/EmptyCartView.jsx';
import CartBundlesSection from '../components/CartBundlesSection.jsx';
import { Alert, Button, Card, ErrorState } from '../../common/components/ui/index.js';
import { ROUTES } from '../../common/constants/routes.js';
import { CART_MESSAGES } from '../cartConstants.js';
import { couponService } from '../services/couponService.js';
import { getCheckoutCurrency, indexPricedLines } from '../utils/pricedLines.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useFavorites } from '../../favorites/hooks/useFavorites.js';
import { getListingFavoriteCount } from '../../favorites/favorites.js';
import Skeleton from '../../common/components/ui/Skeleton.jsx';

const checkReservationStatus = (reservedAt) => {
  if (!reservedAt) return { isExpired: false, timeRemaining: null };
  const reservedTime = new Date(reservedAt);
  const expirationTime = new Date(reservedTime.getTime() + 15 * 60 * 1000);
  const diff = expirationTime - new Date();
  if (diff <= 0) return { isExpired: true, timeRemaining: null };
  const minutes = Math.floor(diff / 60000);
  return {
    isExpired: false,
    timeRemaining: { minutes, seconds: Math.floor((diff % 60000) / 1000) }
  };
};

const ShoppingCartPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notification = useNotification();
  const { user, isAuthenticated } = useAuthState();
  const {
    cartItems,
    cartCount,
    isLoading,
    error: cartError,
    refetchItems,
    updateCartItem,
    removeFromCart,
    clearCart,
    isUpdatingCart,
    isRemovingFromCart,
    isClearingCart
  } = useCart();

  const {
    favorites = [],
    isLoading: favoritesLoading,
    error: favoritesError,
    fetchFavorites
  } = useFavorites(0, 8, {
    enabled: Boolean(isAuthenticated && !cartError && cartItems.length === 0)
  });

  const cartKey = useMemo(
    () => cartItems.map((i) => `${i?.listing?.id || i?.id}:${i.quantity}`).join('|'),
    [cartItems]
  );

  const { isPremium } = usePlan();
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  // keepPreviousData: keeps last backend prices visible while new pricing loads
  const {
    data: pricingData,
    isFetching: isPreviewLoading,
    isPlaceholderData: isRepricing,
    isError: pricingFailed,
    refetch: refetchPricing
  } = useQuery({
    queryKey: ['cartPricing', cartKey, appliedCouponCode],
    queryFn: async () => {
      const requested =
        appliedCouponCode != null && String(appliedCouponCode).trim() !== ''
          ? String(appliedCouponCode).trim().toUpperCase()
          : null;
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

      return {
        pricing: pricingRes?.data || pricingRes,
        couponSuccess,
        couponError: couponErr
      };
    },
    enabled: cartItems.length > 0,
    staleTime: 10 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData
  });

  const pricing = pricingData?.pricing || null;
  const pricedLines = useMemo(() => indexPricedLines(pricing), [pricing]);
  const bundleCampaigns = useMemo(() => pricing?.bundleCampaigns || [], [pricing?.bundleCampaigns]);
  const unlockedBundles = useMemo(() => bundleCampaigns.filter((b) => b.unlocked), [bundleCampaigns]);
  const pendingBundles = useMemo(() => bundleCampaigns.filter((b) => !b.unlocked), [bundleCampaigns]);
  const currency = getCheckoutCurrency(cartItems);

  useEffect(() => {
    if (pricingData && !isRepricing) {
      if (pricingData.couponSuccess) {
        const echoed =
          pricing?.couponCode != null && String(pricing.couponCode).trim() !== ''
            ? String(pricing.couponCode).trim().toUpperCase()
            : null;
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
        const message = getErrorMessage(e, CART_MESSAGES.COUPON_APPLY_FAILED);
        setCouponError(message);
        setAppliedCouponCode(null);
      }
    }
  }, [pricingData, pricing, appliedCouponCode, isRepricing]);

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

  const hasExpiredReservations = useMemo(
    () => cartItems.some((item) => checkReservationStatus(item.reservedAt).isExpired),
    [cartItems]
  );
  const hasExpiringReservations = useMemo(
    () =>
      cartItems.some((item) => {
        const { isExpired, timeRemaining } = checkReservationStatus(item.reservedAt);
        return !isExpired && timeRemaining && timeRemaining.minutes < 5;
      }),
    [cartItems]
  );

  const favoriteListings = useMemo(
    () =>
      favorites
        .map((fav) => {
          const listing = fav?.listing;
          if (!listing) return null;
          return {
            ...listing,
            favoriteStats: {
              ...listing.favoriteStats,
              favoriteCount: getListingFavoriteCount(listing),
              isFavorited: true,
              favorited: true
            }
          };
        })
        .filter(Boolean),
    [favorites]
  );

  const handleQuantityChange = (listingId, newQuantity) => {
    if (newQuantity < 1) return;
    const item = cartItems.find((ci) => ci?.listing?.id === listingId);
    const max = item?.listing?.quantity;
    if (max != null && Number.isFinite(Number(max)) && newQuantity > Number(max)) {
      updateCartItem(listingId, Number(max), '');
      notification?.showError(
        t('stock_limit_title', 'Stok sınırı'),
        t('stock_limit_desc', {
          defaultValue: 'En fazla {{count}} adet eklenebilir.',
          count: Number(max)
        })
      );
      return;
    }
    updateCartItem(listingId, newQuantity, '');
  };

  const handleRemoveItem = (listingId) => {
    removeFromCart(listingId);
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearModal(false);
  };

  if (isLoading) {
    return (
      <div className="bg-background-page">
        <PageContainer className="space-y-4 py-5" aria-busy="true">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-8">
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
    <div className="bg-background-page">
      <PageContainer className="py-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-baseline gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              {t('shopping_cart', 'Sepetim')}
            </h1>
            {cartCount > 0 && (
              <span className="text-sm tabular-nums text-text-tertiary">
                {cartCount} {cartCount === 1 ? t('item', 'ürün') : t('items', 'ürün')}
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              <span>{t('continue_shopping', 'Alışverişe devam et')}</span>
            </Button>
            {cartCount > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowClearModal(true)}
                disabled={isClearingCart}
              >
                {t('clear_all', 'Sepeti temizle')}
              </Button>
            )}
          </div>
        </div>

        {cartError ? (
          <ErrorState
            title={t('cart_load_failed', 'Sepet yüklenemedi')}
            description={getErrorMessage(
              cartError,
              t('error_state_desc', 'Bağlantını kontrol edip tekrar dene.')
            )}
            onRetry={refetchItems}
          />
        ) : cartCount === 0 ? (
          <EmptyCartView
            isAuthenticated={isAuthenticated}
            favoritesLoading={favoritesLoading}
            favoritesError={favoritesError}
            onRetryFavorites={fetchFavorites}
            favoriteListings={favoriteListings}
            userId={user?.id}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            <div className="space-y-4 lg:col-span-8">
              {(hasExpiredReservations || hasExpiringReservations) && (
                <Alert
                  type={hasExpiredReservations ? 'error' : 'warning'}
                  message={
                    hasExpiredReservations
                      ? `${t('reservations_expired_title', 'Bazı ürün rezervasyonlarının süresi doldu')}. ${t(
                          'reservations_expired_desc',
                          'Stok durumunu güncellemek veya alışverişi tamamlamak için ödeme adımına geçin.'
                        )}`
                      : `${t('reservations_expiring_soon_title', 'Rezervasyon süresi yakında doluyor')}. ${t(
                          'reservations_expiring_soon_desc',
                          'Ürünlerinizi ayırmak için alışverişinizi birkaç dakika içinde tamamlayın.'
                        )}`
                  }
                />
              )}

              <CartBundlesSection
                unlockedBundles={unlockedBundles}
                pendingBundles={pendingBundles}
                currency={currency}
              />

              <Card padding="none" className="overflow-hidden">
                <ul role="list" aria-label={t('your_items', 'Ürünleriniz')} className="divide-y divide-border-light">
                  {cartItems.map((item) => (
                    <li key={item.id}>
                      <CartItemCard
                        item={item}
                        pricedLine={pricedLines.get(item.listing?.id)}
                        isRepricing={isRepricing}
                        onQuantityChange={handleQuantityChange}
                        onRemoveItem={handleRemoveItem}
                        isUpdating={isUpdatingCart}
                        isRemoving={isRemovingFromCart}
                      />
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <div className="space-y-3 lg:col-span-4">
              {pricingFailed && (
                <Alert
                  type="warning"
                  message={t('checkout_pricing_preview_failed', CART_MESSAGES.PRICING_PREVIEW_FAILED)}
                  action={
                    <Button variant="secondary" size="sm" onClick={() => refetchPricing()}>
                      {t('try_again', 'Tekrar dene')}
                    </Button>
                  }
                />
              )}
              <OrderSummary
                cartItems={cartItems}
                cartCount={cartCount}
                pricing={pricing}
                onCheckout={() =>
                  navigate(ROUTES.CHECKOUT, { state: { couponCode: appliedCouponCode } })
                }
                disabled={cartCount === 0 || hasExpiredReservations || !pricing || isRepricing}
                couponInput={couponInput}
                setCouponInput={setCouponInput}
                appliedCouponCode={appliedCouponCode}
                couponError={couponError}
                isPreviewLoading={isPreviewLoading}
                isRepricing={isRepricing}
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
          featureHint={t('priority_shipping', 'Öncelikli Kargo')}
        />
      </PageContainer>
    </div>
  );
};

export default ShoppingCartPage;
