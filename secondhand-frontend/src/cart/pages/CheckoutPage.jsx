import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ShoppingCart } from 'lucide-react';
import { useCart } from '../hooks/useCart.js';
import { useCheckout } from '../hooks/useCheckout.js';
import CheckoutProgressBar from '../components/checkout/CheckoutProgressBar.jsx';
import CheckoutStep from '../components/checkout/CheckoutStep.jsx';
import CheckoutOrderSummary from '../components/checkout/CheckoutOrderSummary.jsx';
import { couponService } from '../services/couponService.js';
import ActiveCouponsModal from '../components/checkout/ActiveCouponsModal.jsx';
import { offerService } from '../../offer/services/offerService.js';
import { listingService } from '../../listing/services/listingService.js';
import { ROUTES } from '../../common/constants/routes.js';
import { CART_CHECKOUT_DEFAULTS, CART_CHECKOUT_STEPS, CART_MESSAGES } from '../cartConstants.js';
import EWalletSpendingWarningModal from '../../ewallet/components/EWalletSpendingWarningModal.jsx';
import { formatCurrency } from '../../common/formatters.js';
const CheckoutPage = () => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    cartItems,
    cartCount,
    resetCartState
  } = useCart();
  const offerId = useMemo(() => new URLSearchParams(location.search).get('offerId'), [location.search]);
  const [offerContext, setOfferContext] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false);
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(false);
  const cartKey = useMemo(() => {
    const base = cartItems.map(i => `${i.id}:${i.quantity}`).join('|');
    return `${base}|offer:${offerId || ''}`;
  }, [cartItems, offerId]);
  useEffect(() => {
    if (!offerId) {
      setOfferContext(null);
      return;
    }
    offerService.getById(offerId).then(async offer => {
      const listing = offer?.listingId ? await listingService.getListingById(offer.listingId) : null;
      const safeListing = listing ? {
        ...listing,
        campaignId: null,
        campaignPrice: null,
        campaignName: null
      } : null;
      setOfferContext({
        offer,
        listing: safeListing
      });
    }).catch(e => {
      setOfferContext(null);
      setCouponError(e?.response?.data?.message || CART_MESSAGES.OFFER_LOAD_FAILED);
    });
  }, [offerId]);
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
  const refreshPreviewRef = useRef(null);
  const isRefreshingRef = useRef(false);
  const refreshPreview = useCallback(async code => {
    if (isRefreshingRef.current) {
      return;
    }
    isRefreshingRef.current = true;
    setIsPreviewLoading(true);
    const requested = code != null && String(code).trim() !== '' ? String(code).trim().toUpperCase() : null;
    try {
      const data = await couponService.preview(requested, offerId);
      setPricing(data);
      const echoed = data?.couponCode != null && String(data.couponCode).trim() !== '' ? String(data.couponCode).trim().toUpperCase() : null;
      if (!requested) {
        setAppliedCouponCode(null);
        setCouponError(null);
      } else if (echoed && echoed === requested) {
        setAppliedCouponCode(echoed);
        setCouponError(null);
      } else {
        setAppliedCouponCode(null);
        setCouponError(CART_MESSAGES.COUPON_APPLY_FAILED);
      }
    } catch (e) {
      const message = e?.response?.data?.message || e?.response?.data?.error || CART_MESSAGES.COUPON_APPLY_FAILED;
      setCouponError(message);
      setAppliedCouponCode(null);
      try {
        const data = await couponService.preview(null, offerId);
        setPricing(data);
      } catch {
        /* ignore nested preview failures */
      }
    } finally {
      setIsPreviewLoading(false);
      isRefreshingRef.current = false;
    }
  }, [offerId]);
  refreshPreviewRef.current = refreshPreview;
  useEffect(() => {
    if (refreshPreviewRef.current) {
      refreshPreviewRef.current(appliedCouponCode);
    }
  }, [cartKey, appliedCouponCode]);
  const onApplyCoupon = async () => {
    const next = couponInput?.trim() || '';
    if (!next) {
      setCouponError(null);
      await refreshPreview(null);
      return;
    }
    await refreshPreview(next.toUpperCase());
  };
  const onRemoveCoupon = async () => {
    setAppliedCouponCode(null);
    setCouponInput('');
    setCouponError(null);
    await refreshPreview(null);
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
    return <div className="flex min-h-screen items-center justify-center bg-[#faf9f7] px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-lg border border-[#f0efed] bg-white">
            <svg className="h-6 w-6 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary text-[#111]">{CART_MESSAGES.EMPTY_CART_TITLE}</h1>
          <p className="mt-2 text-sm text-[#999]">{CART_MESSAGES.EMPTY_CART_DESCRIPTION}</p>
          <button type="button" onClick={() => navigate(ROUTES.LISTINGS)} className="mt-8 rounded-lg border border-[#1466c6] bg-[#1466c6] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#0f529e]">{t("browse_listings")}</button>
        </div>
      </div>;
  }

  /* ── Main checkout ──────────────────────────────────────── */

  return <div className="min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#f0efed] bg-white/80 backdrop-blur-md">
        <PageContainer className="py-3">
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
      <div className="bg-white/90 border-b border-[#f0efed] lg:hidden px-4 py-3 backdrop-blur-md">
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

      <ActiveCouponsModal isOpen={isCouponsModalOpen} onClose={() => setIsCouponsModalOpen(false)} onApply={async code => {
      const c = typeof code === 'string' ? code.trim() : '';
      setCouponInput(c);
      setIsCouponsModalOpen(false);
      await refreshPreview(c ? c.toUpperCase() : null);
    }} />

      <EWalletSpendingWarningModal isOpen={checkout.showEWalletWarning} onClose={() => checkout.setShowEWalletWarning(false)} onConfirm={checkout.confirmEWalletWarningAndCheckout} projectedSpent={calculateTotal()} warningLimit={checkout.eWallet?.spendingWarningLimit || 0} currency={displayCartItems[0]?.listing?.currency || 'TRY'} />
    </div>;
};
export default CheckoutPage;