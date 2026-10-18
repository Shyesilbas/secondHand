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
      <div className="flex min-h-screen items-center justify-center bg-background-secondary/60 px-4 antialiased">
        <div className="w-full max-w-md text-center bg-white p-10 rounded-md border border-border/80">
          <ShoppingCart className="mx-auto mb-6 block h-5 w-5 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">
            {CART_MESSAGES.EMPTY_CART_TITLE}
          </h1>
          <p className="mt-2 text-xs text-text-tertiary font-medium leading-relaxed max-w-xs mx-auto">
            {CART_MESSAGES.EMPTY_CART_DESCRIPTION}
          </p>
          <button 
            type="button" 
            onClick={() => navigate(ROUTES.LISTINGS)} 
            className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4 mt-8 w-full"
          >
            <Sparkles className="h-4 w-4" />
            <span>{t("browse_listings", "İlanları Keşfet")}</span>
          </button>
        </div>
      </div>
    );
  }

  /* ── Main checkout experience ────────────────────────────── */

  return (
    <div className="min-h-screen bg-background-secondary text-text-primary antialiased selection:bg-primary selection:text-white">
      {/* ── Sticky Top Header ───────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background-primary">
        <PageContainer className="py-3 sm:py-3.5">
          <div className="flex items-center justify-between gap-4">
            {/* Back Button */}
            <div className="flex items-center gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => navigate(ROUTES.SHOPPING_CART)} 
                className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-10 px-4 w-10" 
                aria-label={t("back_to_cart", "Sepete Dön")}
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
              </button>

              <div className="hidden lg:flex items-center gap-2 border-l border-border pl-3">
                <ShieldCheck className="h-4 w-4 text-status-success-text" />
                <span className="text-xs font-semibold text-text-secondary">
                  Güvenli Ödeme
                </span>
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
          </div>
        </PageContainer>
      </header>

      {/* ── Live Stock Reservation Status Bar ────────────────────── */}
      <div className="bg-background-secondary border-b border-border/70 px-4 py-2 text-xs">
        <PageContainer>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-status-warning-text font-medium">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-status-warning opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-status-warning"></span>
              </span>
              <span className="text-xs font-semibold">
                {t('cart_items_reserved_for_you', 'Sepetinizdeki ürünler adınıza geçici olarak rezerve edildi.')}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-semibold text-status-warning-text bg-white/90 px-3 py-1 rounded border border-border">
              <Clock className="h-3.5 w-3.5 text-status-warning-text" />
              <span className="text-xs text-status-warning-text">Kalan:</span>
              <span className="font-mono text-xs">{formatTimer(timeLeft)}</span>
            </div>
          </div>
        </PageContainer>
      </div>

      {/* ── Mobile Collapsible Concise Order Summary Bar ─────────── */}
      <div className="bg-white border-b border-border lg:hidden px-4 py-3">
        <button 
          type="button" 
          onClick={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)} 
          className="flex w-full items-center justify-between text-xs font-semibold select-none"
        >
          <span className="flex items-center gap-2 text-text-primary">
            <ShoppingCart className="h-4 w-4 text-text-primary" />
            <span>{isOrderSummaryExpanded ? t("hide_order_summary", "Sipariş Özetini Gizle") : t("show_order_summary", "Sipariş Özetini Göster")}</span>
            <ChevronDown className={`h-4 w-4 text-text-tertiary transition-transform duration-200 ${isOrderSummaryExpanded ? 'rotate-180' : ''}`} />
          </span>
          <span className="font-semibold text-text-primary text-sm">
            {formatCurrency(calculateTotal(), displayCartItems[0]?.listing?.currency || 'TRY')}
          </span>
        </button>

        {isOrderSummaryExpanded && (
          <div className="mt-3 pt-3 border-t border-border-light overflow-hidden duration-200">
            <CheckoutOrderSummary 
              cartItems={displayCartItems} 
              calculateTotal={calculateTotal} 
              pricing={pricing} 
            />
          </div>
        )}
      </div>

      {/* ── Main Layout: Steps + Concise Order Summary ──────────── */}
      <PageContainer className="py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Main Checkout Step Flow */}
          <div className="lg:col-span-8">
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

          {/* Desktop Sticky Concise Order Summary Sidebar */}
          <div className="hidden lg:block lg:col-span-4">
            <CheckoutOrderSummary 
              cartItems={displayCartItems} 
              calculateTotal={calculateTotal} 
              pricing={pricing} 
            />
          </div>
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