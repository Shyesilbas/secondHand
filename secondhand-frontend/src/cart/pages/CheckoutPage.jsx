import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ChevronDown 
} from 'lucide-react';
import { useCart } from '../hooks/useCart.js';
import { useCheckout } from '../hooks/useCheckout.js';
import CheckoutProgressBar from '../components/checkout/CheckoutProgressBar.jsx';
import CheckoutStep from '../components/checkout/CheckoutStep.jsx';
import CheckoutOrderSummary from '../components/checkout/CheckoutOrderSummary.jsx';
import { couponService } from '../services/couponService.js';
import { offerService } from '../../offer/services/offerService.js';
import { listingService } from '../../listing/services/listingService.js';
import { ROUTES } from '../../common/constants/routes.js';
import { CART_CHECKOUT_DEFAULTS, CART_CHECKOUT_STEPS, CART_MESSAGES } from '../cartConstants.js';
import EWalletSpendingWarningModal from '../../ewallet/components/EWalletSpendingWarningModal.jsx';
import { orderService } from '../../order/services/orderService.js';
import { formatCurrency } from '../../common/formatters.js';
import logger from '../../common/utils/logger.js';
import Alert from '../../common/components/ui/Alert.jsx';
import Button from '../../common/components/ui/Button.jsx';

const CheckoutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    cartItems,
    cartCount,
    resetCartState
  } = useCart();
  const offerId = useMemo(() => new URLSearchParams(location.search).get('offerId'), [location.search]);
  
  // Accept coupon code forwarded from ShoppingCartPage
  const initialCoupon = location.state?.couponCode || null;
  const [appliedCouponCode] = useState(initialCoupon);
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(false);

  const [timeLeft, setTimeLeft] = useState(() => {
    try {
      const savedExpiry = sessionStorage.getItem('checkout_reservation_expiry');
      if (savedExpiry) {
        const remaining = Math.max(0, Math.floor((parseInt(savedExpiry, 10) - Date.now()) / 1000));
        if (remaining > 0) return remaining;
      }
    } catch (err) {
      logger.debug('SessionStorage read skipped', err);
    }
    return 900;
  });

  // The reservation gates checkout: if the backend refuses it (e.g. stock ran out) the user must not continue.
  const [reservationError, setReservationError] = useState(null);
  const reserveStock = useCallback(() => {
    setReservationError(null);
    orderService.initiateCheckoutReservation().then(res => {
      const remaining = res?.data?.remainingTtlSeconds ?? res?.remainingTtlSeconds;
      if (typeof remaining === 'number' && remaining > 0) {
        setTimeLeft(remaining);
        try {
          sessionStorage.setItem('checkout_reservation_expiry', String(Date.now() + remaining * 1000));
        } catch (err) {
          logger.debug('SessionStorage write skipped', err);
        }
      }
    }).catch(err => {
      logger.warn('Could not initiate stock reservation:', err);
      setReservationError(err?.response?.data?.message || CART_MESSAGES.RESERVATION_FAILED);
    });
  }, []);

  useEffect(() => {
    reserveStock();
  }, [reserveStock]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          try {
            sessionStorage.removeItem('checkout_reservation_expiry');
          } catch (err) {
            logger.debug('SessionStorage remove skipped', err);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const cartKey = useMemo(() => {
    const base = cartItems.map(i => `${i.id}:${i.quantity}`).join('|');
    return `${base}|offer:${offerId || ''}`;
  }, [cartItems, offerId]);

  // Fetch offer context using useQuery
  const { data: offerContextQuery } = useQuery({
    queryKey: ['offerContext', offerId],
    queryFn: async () => {
      const offer = await offerService.getById(offerId);
      const listing = offer?.listingId ? await listingService.getListingById(offer.listingId) : null;
      const safeListing = listing ? {
        ...listing,
        campaignId: null,
        campaignPrice: null,
        campaignName: null
      } : null;
      return { offer, listing: safeListing };
    },
    enabled: !!offerId,
    staleTime: 5 * 60 * 1000,
  });

  const offerContext = offerContextQuery || null;

  const displayCartItems = useMemo(() => {
    if (!offerContext?.offer || !offerContext?.listing) {
      return cartItems;
    }
    const listingId = offerContext.offer.listingId;
    const filtered = cartItems.filter(ci => ci?.listing?.id !== listingId);
    return [...filtered, {
      id: `offer-${offerContext.offer.id}`,
      quantity: offerContext.offer.quantity,
      listing: offerContext.listing,
      isOffer: true,
      offerTotalPrice: offerContext.offer.totalPrice
    }];
  }, [cartItems, offerContext]);

  // Fetch pricing preview using useQuery
  const { data: pricingQueryData, isError: pricingFailed, refetch: refetchPricing } = useQuery({
    queryKey: ['checkoutPreview', cartKey, appliedCouponCode, offerId],
    queryFn: async () => {
      const requested = appliedCouponCode != null && String(appliedCouponCode).trim() !== '' ? String(appliedCouponCode).trim().toUpperCase() : null;
      try {
        const data = await couponService.preview(requested, offerId);
        return { data, success: true };
      } catch (e) {
        if (requested) {
          const fallbackData = await couponService.preview(null, offerId);
          return { data: fallbackData, success: false, error: e };
        }
        throw e;
      }
    },
    retry: false,
    staleTime: 10 * 1000,
  });

  const pricing = pricingQueryData?.data || null;
  const couponError = pricingQueryData?.success === false
    ? pricingQueryData.error?.response?.data?.message || CART_MESSAGES.COUPON_NOT_APPLIED
    : null;

  const calculateTotal = useCallback(() => {
    if (pricing?.total != null) {
      return parseFloat(pricing.total) || 0;
    }
    return displayCartItems.reduce((total, item) => {
      if (item.isOffer && item.offerTotalPrice != null) {
        return total + (parseFloat(item.offerTotalPrice) || 0);
      }
      const price = parseFloat(item.listing.campaignPrice ?? item.listing.price) || 0;
      return total + price * item.quantity;
    }, 0);
  }, [pricing, displayCartItems]);

  const effectiveCartCount = offerId ? Math.max(cartCount, 1) : cartCount;
  const checkout = useCheckout(effectiveCartCount, calculateTotal, resetCartState, appliedCouponCode, offerId);
  const [currentStep, setCurrentStep] = useState(CART_CHECKOUT_DEFAULTS.INITIAL_STEP);

  const steps = CART_CHECKOUT_STEPS;

  const handleStepChange = step => {
    setCurrentStep(step);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(ROUTES.SHOPPING_CART);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  /* ── Empty cart state ────────────────────────────────────── */

  if (!offerId && cartCount === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-secondary p-4 antialiased">
        <div className="w-full max-w-sm text-center bg-background-primary p-8 rounded border border-border space-y-4">
          <ShoppingCart className="mx-auto h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
          <div className="space-y-1">
            <h1 className="text-sm font-semibold text-text-primary">
              {CART_MESSAGES.EMPTY_CART_TITLE}
            </h1>
            <p className="text-xs text-text-tertiary max-w-xs mx-auto">
              {CART_MESSAGES.EMPTY_CART_DESCRIPTION}
            </p>
          </div>
          <Button 
            variant="primary"
            onClick={() => navigate(ROUTES.LISTINGS)} 
            className="w-full"
          >
            <Sparkles className="h-4 w-4" />
            <span>{t("browse_listings", "İlanları Keşfet")}</span>
          </Button>
        </div>
      </div>
    );
  }

  /* ── Main checkout experience ────────────────────────────── */

  return (
    <div className="min-h-screen bg-background-secondary text-text-primary antialiased">
      {/* ── Sticky Top Header ───────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border bg-background-primary">
        <PageContainer className="py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Back Button & Trust/Timer badges */}
            <div className="flex items-center gap-3 shrink-0">
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => navigate(ROUTES.SHOPPING_CART)} 
                aria-label={t("back_to_cart", "Sepete Dön")}
                className="w-8 h-8 !p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div className="hidden lg:flex items-center gap-3 border-l border-border pl-3">
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <ShieldCheck className="h-4 w-4 text-text-primary" />
                  <span className="font-medium">Güvenli Ödeme</span>
                </div>

                <span className="text-border">·</span>

                {/* Stock reservation countdown */}
                <div className="flex items-center gap-1.5 text-2xs text-text-secondary" title={t('cart_items_reserved_for_you', 'Sepetinizdeki ürünler adınıza geçici olarak rezerve edildi.')}>
                  <Clock className="h-3.5 w-3.5 text-text-tertiary" />
                  <span className="text-text-tertiary">Rezervasyon:</span>
                  <span className="font-mono tabular-nums font-semibold text-text-primary">{formatTimer(timeLeft)}</span>
                </div>
              </div>
            </div>

            {/* Stepper Pipeline */}
            <div className="min-w-0 flex-1 max-w-2xl">
              <CheckoutProgressBar 
                currentStep={currentStep} 
                steps={steps} 
                onStepChange={handleStepChange} 
              />
            </div>

            {/* Mobile Timer Badge */}
            <div className="flex lg:hidden items-center gap-1 text-2xs text-text-secondary shrink-0">
              <Clock className="h-3 w-3 text-text-tertiary" />
              <span className="font-mono tabular-nums font-semibold text-text-primary">{formatTimer(timeLeft)}</span>
            </div>
          </div>
        </PageContainer>
      </header>

      {/* ── Mobile Collapsible Concise Order Summary Bar ─────────── */}
      {currentStep !== 3 && (
        <div className="bg-background-primary border-b border-border lg:hidden px-4 py-2.5">
          <button 
            type="button" 
            onClick={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)} 
            className="flex w-full items-center justify-between text-xs font-medium select-none"
          >
            <span className="flex items-center gap-2 text-text-primary">
              <ShoppingCart className="h-3.5 w-3.5 text-text-primary" />
              <span>{isOrderSummaryExpanded ? t("hide_order_summary", "Sipariş Özetini Gizle") : t("show_order_summary", "Sipariş Özetini Göster")}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-text-tertiary transition-transform duration-200 ${isOrderSummaryExpanded ? 'rotate-180' : ''}`} />
            </span>
            <span className="font-semibold text-text-primary tabular-nums">
              {formatCurrency(calculateTotal(), displayCartItems[0]?.listing?.currency || 'TRY')}
            </span>
          </button>

          {isOrderSummaryExpanded && (
            <div className="mt-3 pt-3 border-t border-border-light">
              <CheckoutOrderSummary 
                cartItems={displayCartItems} 
                calculateTotal={calculateTotal} 
                pricing={pricing} 
              />
            </div>
          )}
        </div>
      )}

      {/* ── Main Layout: Steps + Concise Order Summary ──────────── */}
      <PageContainer className="py-6 sm:py-8">
        <div className={`grid grid-cols-1 gap-6 sm:gap-8 ${currentStep === 3 ? 'max-w-4xl mx-auto' : 'lg:grid-cols-12 lg:items-start'}`}>
          {/* Main Checkout Step Flow */}
          <div className={currentStep === 3 ? 'w-full' : 'lg:col-span-8'}>
            {reservationError ? (
              <Alert
                type="error"
                message={reservationError}
                action={
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.SHOPPING_CART)}>{t("back_to_cart", "Sepete Dön")}</Button>
                    <Button size="sm" onClick={reserveStock}>{t("try_again")}</Button>
                  </div>
                }
              />
            ) : (
              <div className="space-y-4">
                {pricingFailed && (
                  <Alert type="warning" message={CART_MESSAGES.PRICING_PREVIEW_FAILED} action={<Button variant="secondary" size="sm" onClick={() => refetchPricing()}>{t("try_again")}</Button>} />
                )}
                {couponError && <Alert type="warning" message={couponError} />}
                <CheckoutStep
                  step={currentStep}
                  checkout={checkout}
                  cartItems={displayCartItems}
                  calculateTotal={calculateTotal}
                  onBack={handleBack}
                  onNext={handleNext}
                />
              </div>
            )}
          </div>

          {/* Desktop Sticky Concise Order Summary Sidebar (Hidden on Step 3) */}
          {currentStep !== 3 && (
            <div className="hidden lg:block lg:col-span-4">
              <CheckoutOrderSummary 
                cartItems={displayCartItems} 
                calculateTotal={calculateTotal} 
                pricing={pricing} 
              />
            </div>
          )}
        </div>
      </PageContainer>

      {/* ── Modals ──────────────────────────────────────────────── */}
      <EWalletSpendingWarningModal 
        isOpen={checkout.showEWalletWarning} 
        onClose={() => checkout.setShowEWalletWarning(false)} 
        onConfirm={checkout.confirmEWalletWarningAndCheckout} 
        projectedSpent={calculateTotal()} 
        warningLimit={checkout.eWallet?.spendingWarningLimit || 0} 
        currency={displayCartItems[0]?.listing?.currency || 'TRY'} 
      />
    </div>
  );
};

export default CheckoutPage;