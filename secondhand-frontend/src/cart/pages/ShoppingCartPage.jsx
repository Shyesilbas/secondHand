import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '@/common/hooks/usePlan';
import ActiveCouponsModal from '../components/checkout/ActiveCouponsModal.jsx';
import PremiumUpgradeModal from '@/common/components/ui/PremiumUpgradeModal.jsx';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useCart } from '../hooks/useCart.js';
import CartItemCard from '../components/CartItemCard.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import ClearCartModal from '../components/ClearCartModal.jsx';
import EmptyCartView from '../components/EmptyCartView.jsx';
import CartBundlesSection from '../components/CartBundlesSection.jsx';
import { Alert, Badge, Button, Card, PageHeader } from '../../common/components/ui/index.js';
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
    updateCartItem,
    removeFromCart,
    clearCart,
    isUpdatingCart,
    isRemovingFromCart,
    isClearingCart
  } = useCart();

  const { favorites = [], isLoading: favoritesLoading } = useFavorites(0, 8, {
    enabled: Boolean(isAuthenticated && cartItems.length === 0)
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
        const message = e?.response?.data?.message || e?.response?.data?.error || CART_MESSAGES.COUPON_APPLY_FAILED;
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
      notification?.showError('Stock limit', `Only ${Number(max)} available.`);
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
      <div className="min-h-screen bg-background-secondary">
        <PageContainer className="space-y-4 py-8" aria-busy="true">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
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
    <div className="min-h-screen bg-background-secondary">
      <PageContainer className="py-6 sm:py-8">
        <PageHeader
          back={
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition hover:text-text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t('continue_shopping', 'Alışverişe Devam Et')}</span>
            </button>
          }
          title={t('shopping_cart', 'Alışveriş Sepeti')}
          badge={
            cartCount > 0 ? (
              <Badge variant="neutral" className="tabular-nums">
                {cartCount} {cartCount === 1 ? t('item', 'ürün') : t('items', 'ürün')}
              </Badge>
            ) : undefined
          }
          actions={
            cartCount > 0 ? (
              <button
                type="button"
                onClick={() => setShowClearModal(true)}
                className="text-sm font-medium text-text-secondary transition hover:text-status-error"
              >
                {t('clear_all', 'Sepeti Temizle')}
              </button>
            ) : undefined
          }
          className="mb-6"
        />

        {cartCount === 0 ? (
          <EmptyCartView
            isAuthenticated={isAuthenticated}
            favoritesLoading={favoritesLoading}
            favoriteListings={favoriteListings}
            userId={user?.id}
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
            <div className="space-y-4 lg:col-span-8">
              {(hasExpiredReservations || hasExpiringReservations) && (
                <Card
                  padding="compact"
                  role="alert"
                  className="flex items-start gap-3 text-sm text-text-secondary"
                >
                  <AlertTriangle
                    className={`mt-0.5 h-4 w-4 shrink-0 ${hasExpiredReservations ? 'text-status-error' : 'text-status-warning'
                      }`}
                  />
                  <div>
                    <p className="font-semibold text-text-primary">
                      {hasExpiredReservations
                        ? t('reservations_expired_title', 'Bazı ürün rezervasyonlarının süresi doldu')
                        : t('reservations_expiring_soon_title', 'Rezervasyon süresi yakında doluyor')}
                    </p>
                    <p className="mt-0.5 text-text-secondary">
                      {hasExpiredReservations
                        ? t(
                          'reservations_expired_desc',
                          'Stok durumunu güncellemek veya alışverişi tamamlamak için hemen ödeme adımına geçin.'
                        )
                        : t(
                          'reservations_expiring_soon_desc',
                          'Ürünlerinizi ayırmak ve kaçırmamak için alışverişinizi birkaç dakika içinde tamamlayın.'
                        )}
                    </p>
                  </div>
                </Card>
              )}

              <CartBundlesSection
                unlockedBundles={unlockedBundles}
                pendingBundles={pendingBundles}
                currency={currency}
              />

              <Card padding="none" className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-border-light bg-background-primary px-5 py-3.5">
                  <h2 className="text-sm font-semibold text-text-primary">
                    {t('your_items', 'Ürünleriniz')} ({cartCount})
                  </h2>
                  <span className="text-sm text-text-muted">Güvenli rezervasyon</span>
                </div>
                <div className="divide-y divide-border-light">
                  {cartItems.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      pricedLine={pricedLines.get(item.listing?.id)}
                      isRepricing={isRepricing}
                      onQuantityChange={handleQuantityChange}
                      onRemoveItem={handleRemoveItem}
                      isUpdating={isUpdatingCart}
                      isRemoving={isRemovingFromCart}
                    />
                  ))}
                </div>
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
