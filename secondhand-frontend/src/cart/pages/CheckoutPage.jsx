import PageContainer from '@/common/components/layout/PageContainer';
import {useTranslation} from "react-i18next";
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useLocation, useNavigate} from 'react-router-dom';
import {ArrowLeft, ChevronDown, Crown, ShoppingCart} from 'lucide-react';
import {useCart} from '../hooks/useCart.js';
import {useCheckout} from '../hooks/useCheckout.js';
import CheckoutProgressBar from '../components/checkout/CheckoutProgressBar.jsx';
import CheckoutStep from '../components/checkout/CheckoutStep.jsx';
import CheckoutOrderSummary from '../components/checkout/CheckoutOrderSummary.jsx';
import {couponService} from '../services/couponService.js';
import ActiveCouponsModal from '../components/checkout/ActiveCouponsModal.jsx';
import {offerService} from '../../offer/services/offerService.js';
import {listingService} from '../../listing/services/listingService.js';
import {ROUTES} from '../../common/constants/routes.js';
import {CART_CHECKOUT_DEFAULTS, CART_CHECKOUT_STEPS, CART_MESSAGES} from '../cartConstants.js';
import EWalletSpendingWarningModal from '../../ewallet/components/EWalletSpendingWarningModal.jsx';
import {formatCurrency} from '../../common/formatters.js';
import {usePlan} from '@/common/hooks/usePlan';
import PremiumUpgradeModal from '@/common/components/ui/PremiumUpgradeModal.jsx';

const CheckoutPage = () => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isPremium } = usePlan();
  const {
    cartItems,
    cartCount,
    resetCartState
  } = useCart();
  const offerId = useMemo(() => new URLSearchParams(location.search).get('offerId'), [location.search]);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(false);
  const cartKey = useMemo(() => {
    const base = cartItems.map(i => `${i.id}:${i.quantity}`).join('|');
    return `${base}|offer:${offerId || ''}`;
  }, [cartItems, offerId]);

  // Fetch offer context using useQuery
  const { data: offerContextQuery, error: offerError } = useQuery({
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

  useEffect(() => {
    if (offerError) {
      setCouponError(offerError?.response?.data?.message || CART_MESSAGES.OFFER_LOAD_FAILED);
    }
  }, [offerError]);
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
  const { data: pricingQueryData, isLoading: isPreviewLoading } = useQuery({
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



  useEffect(() => {
    if (pricingQueryData) {
      if (pricingQueryData.success) {
        const echoed = pricingQueryData.data?.couponCode != null && String(pricingQueryData.data.couponCode).trim() !== '' ? String(pricingQueryData.data.couponCode).trim().toUpperCase() : null;
        if (!appliedCouponCode) {
          setCouponError(null);
        } else if (echoed && echoed === appliedCouponCode) {
          setCouponError(null);
        } else {
          setAppliedCouponCode(null);
          setCouponError(CART_MESSAGES.COUPON_APPLY_FAILED);
        }
      } else {
        const e = pricingQueryData.error;
        const message = e?.response?.data?.message || e?.response?.data?.error || CART_MESSAGES.COUPON_APPLY_FAILED;
        setCouponError(message);
        setAppliedCouponCode(null);
      }
    }
  }, [pricingQueryData, appliedCouponCode]);

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

  /* ── Empty cart ──────────────────────────────────────────── */

  if (!offerId && cartCount === 0) {
    return <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-[#fbfaf8] via-[#f8f6f0] to-[#f3efe5] px-4">
        <div className="w-full max-w-md text-center bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-white/60 shadow-lg">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border-light bg-background-primary shadow-inner">
            <svg className="h-6 w-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">{CART_MESSAGES.EMPTY_CART_TITLE}</h1>
          <p className="mt-2 text-sm text-text-muted font-medium">{CART_MESSAGES.EMPTY_CART_DESCRIPTION}</p>
          <button type="button" onClick={() => navigate(ROUTES.LISTINGS)} className="mt-8 w-full rounded-xl bg-primary py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md hover:bg-primary-hover active:scale-95 transition-all">{t("browse_listings")}</button>
        </div>
      </div>;
  }

  /* ── Main checkout ──────────────────────────────────────── */

  return <div className="min-h-screen bg-gradient-to-tr from-[#fbfaf8] via-[#f8f6f0] to-[#f3efe5] text-text-primary antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border-light bg-background-primary/80 backdrop-blur-md shadow-sm">
        <PageContainer className="py-4">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate(ROUTES.SHOPPING_CART)} className="-ml-2 shrink-0 p-2 text-[#555] transition-colors hover:text-[#111]" aria-label={t("back_to_cart")}>
              <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <div className="min-w-0 flex-1">
              <CheckoutProgressBar currentStep={currentStep} steps={steps} onStepChange={handleStepChange} />
            </div>
          </div>
        </PageContainer>
      </header>

      {/* Mobile Collapsible Order Summary (Shopify-style accordion) */}
      <div className="bg-background-primary/90 border-b border-[#f0efed] lg:hidden px-4 py-3 backdrop-blur-md">
        <button type="button" onClick={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)} className="flex w-full items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 font-medium text-[#111]">
            <ShoppingCart className="h-4 w-4 text-[#1466c6]" />
            {isOrderSummaryExpanded ? 'Hide order summary' : 'Show order summary'}
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOrderSummaryExpanded ? 'rotate-180' : ''}`} />
          </span>
          <span className="font-semibold text-[#1466c6] tabular-nums">
            {formatCurrency(calculateTotal(), displayCartItems[0]?.listing?.currency || 'TRY')}
          </span>
        </button>
        {isOrderSummaryExpanded && <div className="mt-3 pt-3 border-t border-[#f0efed] overflow-hidden">
            <CheckoutOrderSummary cartItems={displayCartItems} calculateTotal={calculateTotal} pricing={pricing} couponInput={couponInput} setCouponInput={setCouponInput} appliedCouponCode={appliedCouponCode} couponError={couponError} isPreviewLoading={isPreviewLoading} onApplyCoupon={onApplyCoupon} onRemoveCoupon={onRemoveCoupon} onOpenCouponsModal={() => setIsCouponsModalOpen(true)} />
          </div>}
      </div>

      {/* Premium Shipping Perk Banner */}
      <PageContainer className="mt-4">
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 ${isPremium ? 'bg-accent-amber-50 border-accent-amber-100' : 'bg-background-primary border-border-light'}`}>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${isPremium ? 'bg-accent-amber-100 text-accent-amber-600' : 'bg-background-secondary text-text-muted'}`}>
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">
                {isPremium ? t('premium_shipping_advantage', 'Premium Kargo Avantajı') : t('dont_wait_for_shipping', 'Kargoda Beklemeyin!')}
              </p>
              <p className="text-xs text-text-secondary">
                {isPremium 
                  ? t('order_processed_with_priority', 'Siparişiniz öncelikli olarak işlenecek.') 
                  : t('upgrade_to_premium_get_shipping_fast', "Premium'a geçerek kargonuzu en kısa sürede alın!")}
              </p>
            </div>
          </div>
          {!isPremium && (
            <button 
              onClick={() => setIsPremiumModalOpen(true)}
              className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
            >
              {t('explore_premium', "Premium'u Keşfet")}
            </button>
          )}
        </div>
      </PageContainer>

      {/* Body */}
      <PageContainer className="py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="lg:col-span-8">
            <CheckoutStep step={currentStep} cartItems={displayCartItems} calculateTotal={calculateTotal} addresses={checkout.addresses} selectedShippingAddressId={checkout.selectedShippingAddressId} setSelectedShippingAddressId={checkout.setSelectedShippingAddressId} selectedBillingAddressId={checkout.selectedBillingAddressId} setSelectedBillingAddressId={checkout.setSelectedBillingAddressId} selectedPaymentType={checkout.selectedPaymentType} setSelectedPaymentType={checkout.setSelectedPaymentType} eWallet={checkout.eWallet} paymentVerificationCode={checkout.paymentVerificationCode} setPaymentVerificationCode={checkout.setPaymentVerificationCode} paymentVerificationExpiresAtMs={checkout.paymentVerificationExpiresAtMs} notes={checkout.notes} setNotes={checkout.setNotes} orderName={checkout.orderName} setOrderName={checkout.setOrderName} deliveryMethod={checkout.deliveryMethod} setDeliveryMethod={checkout.setDeliveryMethod} meetupLocation={checkout.meetupLocation} setMeetupLocation={checkout.setMeetupLocation} emails={checkout.emails} fetchEmails={checkout.fetchEmails} onBack={handleBack} onNext={handleNext} onCheckout={checkout.handleCheckout} proceedDisabled={checkout.proceedDisabled} isCheckingOut={checkout.isCheckingOut} sendVerificationCode={checkout.sendVerificationCode} acceptedAgreements={checkout.acceptedAgreements} onAgreementToggle={checkout.onAgreementToggle} onRequiredAgreementsChange={checkout.onRequiredAgreementsChange} areAllAgreementsAccepted={checkout.areAllAgreementsAccepted} />
          </div>

          {/* Desktop-only Order Summary sidebar */}
          <div className="hidden lg:block lg:col-span-4">
            <CheckoutOrderSummary cartItems={displayCartItems} calculateTotal={calculateTotal} pricing={pricing} couponInput={couponInput} setCouponInput={setCouponInput} appliedCouponCode={appliedCouponCode} couponError={couponError} isPreviewLoading={isPreviewLoading} onApplyCoupon={onApplyCoupon} onRemoveCoupon={onRemoveCoupon} onOpenCouponsModal={() => setIsCouponsModalOpen(true)} />
          </div>
        </div>
      </PageContainer>

      <ActiveCouponsModal isOpen={isCouponsModalOpen} onClose={() => setIsCouponsModalOpen(false)} onApply={code => {
      const c = typeof code === 'string' ? code.trim() : '';
      setCouponInput(c);
      setIsCouponsModalOpen(false);
      setAppliedCouponCode(c ? c.toUpperCase() : null);
    }} />

      <EWalletSpendingWarningModal isOpen={checkout.showEWalletWarning} onClose={() => checkout.setShowEWalletWarning(false)} onConfirm={checkout.confirmEWalletWarningAndCheckout} projectedSpent={calculateTotal()} warningLimit={checkout.eWallet?.spendingWarningLimit || 0} currency={displayCartItems[0]?.listing?.currency || 'TRY'} />
      <PremiumUpgradeModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} featureHint="Hızlı Kargo" />
    </div>;
};
export default CheckoutPage;