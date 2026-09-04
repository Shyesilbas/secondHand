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

  useEffect(() => {
    // Initiate Redis stock reservation and synchronize exact remaining TTL
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
      logger.warn("Could not initiate stock reservation in Redis:", err);
    });

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
  const { data: pricingQueryData } = useQuery({
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50/60 px-4 antialiased">
        <div className="w-full max-w-md text-center bg-white p-10 rounded-3xl border border-slate-200/80 shadow-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 text-slate-400">
            <ShoppingCart className="h-8 w-8" strokeWidth={1.75} />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {CART_MESSAGES.EMPTY_CART_TITLE}
          </h1>
          <p className="mt-2 text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            {CART_MESSAGES.EMPTY_CART_DESCRIPTION}
          </p>
          <button 
            type="button" 
            onClick={() => navigate(ROUTES.LISTINGS)} 
            className="mt-8 inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-slate-900 py-4 text-xs font-black uppercase tracking-wider text-white hover:bg-slate-800 shadow-md shadow-slate-900/10 active:scale-[0.98] transition-all"
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
      {/* ── Sticky Top Header ───────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md shadow-xs">
        <PageContainer className="py-3 sm:py-3.5">
          <div className="flex items-center justify-between gap-4">
            {/* Back Button */}
            <div className="flex items-center gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => navigate(ROUTES.SHOPPING_CART)} 
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs" 
                aria-label={t("back_to_cart", "Sepete Dön")}
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
              </button>

              <div className="hidden lg:flex items-center gap-2 border-l border-slate-200 pl-3">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
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
      <div className="bg-amber-50/80 border-b border-amber-200/70 px-4 py-2 text-xs backdrop-blur-xs">
        <PageContainer>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-amber-950 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
              </span>
              <span className="text-xs font-semibold">
                {t('cart_items_reserved_for_you', 'Sepetinizdeki ürünler adınıza geçici olarak rezerve edildi.')}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-bold text-amber-900 bg-white/90 px-3 py-1 rounded-xl border border-amber-200 shadow-xs">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-[10px] uppercase tracking-wider text-amber-700">Kalan:</span>
              <span className="font-mono text-xs">{formatTimer(timeLeft)}</span>
            </div>
          </div>
        </PageContainer>
      </div>

      {/* ── Mobile Collapsible Concise Order Summary Bar ─────────── */}
      <div className="bg-white border-b border-slate-200 lg:hidden px-4 py-3 shadow-xs">
        <button 
          type="button" 
          onClick={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)} 
          className="flex w-full items-center justify-between text-xs font-bold select-none"
        >
          <span className="flex items-center gap-2 text-slate-900">
            <ShoppingCart className="h-4 w-4 text-slate-900" />
            <span>{isOrderSummaryExpanded ? t("hide_order_summary", "Sipariş Özetini Gizle") : t("show_order_summary", "Sipariş Özetini Göster")}</span>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isOrderSummaryExpanded ? 'rotate-180' : ''}`} />
          </span>
          <span className="font-black text-slate-900 text-sm">
            {formatCurrency(calculateTotal(), displayCartItems[0]?.listing?.currency || 'TRY')}
          </span>
        </button>

        {isOrderSummaryExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 overflow-hidden animate-in fade-in duration-200">
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
            <CheckoutStep 
              step={currentStep} 
              cartItems={displayCartItems} 
              calculateTotal={calculateTotal} 
              addresses={checkout.addresses} 
              selectedShippingAddressId={checkout.selectedShippingAddressId} 
              setSelectedShippingAddressId={checkout.setSelectedShippingAddressId} 
              selectedBillingAddressId={checkout.selectedBillingAddressId} 
              setSelectedBillingAddressId={checkout.setSelectedBillingAddressId} 
              selectedPaymentType={checkout.selectedPaymentType} 
              setSelectedPaymentType={checkout.setSelectedPaymentType} 
              eWallet={checkout.eWallet} 
              paymentVerificationCode={checkout.paymentVerificationCode} 
              setPaymentVerificationCode={checkout.setPaymentVerificationCode} 
              paymentVerificationExpiresAtMs={checkout.paymentVerificationExpiresAtMs} 
              notes={checkout.notes} 
              setNotes={checkout.setNotes} 
              orderName={checkout.orderName} 
              setOrderName={checkout.setOrderName} 
              deliveryMethod={checkout.deliveryMethod} 
              setDeliveryMethod={checkout.setDeliveryMethod} 
              meetupLocation={checkout.meetupLocation} 
              setMeetupLocation={checkout.setMeetupLocation} 
              emails={checkout.emails} 
              fetchEmails={checkout.fetchEmails} 
              onBack={handleBack} 
              onNext={handleNext} 
              onCheckout={checkout.handleCheckout} 
              proceedDisabled={checkout.proceedDisabled} 
              isCheckingOut={checkout.isCheckingOut} 
              sendVerificationCode={checkout.sendVerificationCode} 
              acceptedAgreements={checkout.acceptedAgreements} 
              onAgreementToggle={checkout.onAgreementToggle} 
              onRequiredAgreementsChange={checkout.onRequiredAgreementsChange} 
              areAllAgreementsAccepted={checkout.areAllAgreementsAccepted} 
            />
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