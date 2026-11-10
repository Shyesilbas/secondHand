import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Clock, ShoppingCart } from 'lucide-react';
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
import { orderService } from '../../order/services/orderService.js';
import { formatCurrency } from '../../common/formatters.js';
import { getCheckoutCurrency, getCheckoutLinePricing } from '../utils/checkoutLinePricing.js';
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
      setReservationError(err?.response?.data?.message || t('checkout_reservation_failed', CART_MESSAGES.RESERVATION_FAILED));
    });
  }, [t]);

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
  // The preview drops a coupon that no longer applies; checkout rejects it, so say so before the buyer pays.
  const requestedCoupon = appliedCouponCode != null && String(appliedCouponCode).trim() !== '' ? String(appliedCouponCode).trim().toUpperCase() : null;
  const couponDropped = pricingQueryData?.success === true && requestedCoupon != null && !pricing?.couponCode;
  const couponError = pricingQueryData?.success === false
    ? pricingQueryData.error?.response?.data?.message || t('checkout_coupon_not_applied', CART_MESSAGES.COUPON_NOT_APPLIED)
    : couponDropped ? t('checkout_coupon_no_longer_applies', CART_MESSAGES.COUPON_NO_LONGER_APPLIES) : null;

  const calculateTotal = useCallback(() => {
    if (pricing?.total != null) {
      return parseFloat(pricing.total) || 0;
    }
    return displayCartItems.reduce((total, item) => total + getCheckoutLinePricing(item).lineTotal, 0);
  }, [pricing, displayCartItems]);

  const effectiveCartCount = offerId ? Math.max(cartCount, 1) : cartCount;
  const checkout = useCheckout(effectiveCartCount, calculateTotal, resetCartState, appliedCouponCode, offerId);
  const [currentStep, setCurrentStep] = useState(CART_CHECKOUT_DEFAULTS.INITIAL_STEP);

  const steps = CART_CHECKOUT_STEPS;

  const handleStepChange = step => {
    setCurrentStep(step);
  };
  const currency = getCheckoutCurrency(displayCartItems);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(ROUTES.SHOPPING_CART);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  /* ── Empty cart state ────────────────────────────────────── */

  if (!offerId && cartCount === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-secondary p-4 antialiased">
        <div className="w-full max-w-sm text-center bg-background-primary p-8 rounded-md border border-border shadow-sm space-y-4">
          <ShoppingCart className="mx-auto h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
          <div className="space-y-1">
            <h1 className="text-sm font-semibold text-text-primary">
              {t('empty_cart_title', CART_MESSAGES.EMPTY_CART_TITLE)}
            </h1>
            <p className="text-xs text-text-tertiary max-w-xs mx-auto">
              {t('empty_cart_description', CART_MESSAGES.EMPTY_CART_DESCRIPTION)}
            </p>
          </div>
          <Button 
            variant="primary"
            onClick={() => navigate(ROUTES.LISTINGS)} 
            className="w-full"
          >
            <span>{t("browse_listings", "İlanları Keşfet")}</span>
          </Button>
        </div>
      </div>
    );
  }

  /* ── Main checkout experience ────────────────────────────── */

  const reservationExpired = timeLeft <= 0;
  const summary = (
    <CheckoutOrderSummary cartItems={displayCartItems} calculateTotal={calculateTotal} pricing={pricing} />
  );

  return (
    <div className="min-h-screen bg-background-secondary text-text-primary antialiased">
      <header className="sticky top-0 z-30 border-b border-border bg-background-primary">
        <PageContainer className="py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.SHOPPING_CART)}
              aria-label={t('back_to_cart', 'Sepete dön')}
              className="shrink-0 !px-2"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              <span className="hidden sm:inline">{t('cart', 'Sepet')}</span>
            </Button>

            <div className="min-w-0 flex-1">
              <CheckoutProgressBar currentStep={currentStep} steps={steps} onStepChange={handleStepChange} />
            </div>

            <p
              className={`flex shrink-0 items-center gap-1.5 text-sm tabular-nums font-medium ${
                reservationExpired
                  ? 'text-status-error-text'
                  : timeLeft < 180
                  ? 'text-status-warning-text'
                  : 'text-text-secondary'
              }`}
              title={t('cart_items_reserved_for_you', 'Sepetindeki ürünler senin için geçici olarak ayrıldı.')}
            >
              <Clock
                className={`h-4 w-4 ${
                  reservationExpired
                    ? 'text-status-error-text'
                    : timeLeft < 180
                    ? 'text-status-warning-text'
                    : 'text-text-tertiary'
                }`}
                strokeWidth={1.5}
                aria-hidden
              />
              <span className="sr-only">{t('checkout_reservation', 'Ürünler ayrıldı, kalan süre')}</span>
              {formatTimer(timeLeft)}
            </p>
          </div>
        </PageContainer>
      </header>

      {/* Mobile: collapsible summary with the total always visible */}
      <div className="border-b border-border bg-background-primary px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)}
          aria-expanded={isOrderSummaryExpanded}
          className="flex w-full items-center justify-between text-sm"
        >
          <span className="flex items-center gap-1.5 text-text-secondary">
            {isOrderSummaryExpanded ? t('hide_order_summary', 'Özeti gizle') : t('show_order_summary', 'Özeti göster')}
            <ChevronDown className={`h-4 w-4 text-text-tertiary transition-transform duration-150 ${isOrderSummaryExpanded ? 'rotate-180' : ''}`} strokeWidth={1.5} aria-hidden />
          </span>
          <span className="font-semibold tabular-nums text-text-price">{formatCurrency(calculateTotal(), currency)}</span>
        </button>
        {isOrderSummaryExpanded && <div className="mt-3">{summary}</div>}
      </div>

      <PageContainer className="py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="lg:col-span-8">
            {reservationError ? (
              <Alert
                type="error"
                message={reservationError}
                action={
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.SHOPPING_CART)}>{t('back_to_cart', 'Sepete dön')}</Button>
                    <Button size="sm" onClick={reserveStock}>{t('try_again', 'Tekrar dene')}</Button>
                  </div>
                }
              />
            ) : (
              <div className="space-y-4">
                {pricingFailed && (
                  <Alert type="warning" message={t('checkout_pricing_preview_failed', CART_MESSAGES.PRICING_PREVIEW_FAILED)} action={<Button variant="secondary" size="sm" onClick={() => refetchPricing()}>{t('try_again', 'Tekrar dene')}</Button>} />
                )}
                {couponError && <Alert type="warning" message={couponError} />}
                <CheckoutStep
                  step={currentStep}
                  checkout={checkout}
                  cartItems={displayCartItems}
                  calculateTotal={calculateTotal}
                  onBack={handleBack}
                  onNext={handleNext}
                  onGoToStep={handleStepChange}
                />
              </div>
            )}
          </div>

          <div className="hidden lg:col-span-4 lg:block">{summary}</div>
        </div>
      </PageContainer>
    </div>
  );
};

export default CheckoutPage;