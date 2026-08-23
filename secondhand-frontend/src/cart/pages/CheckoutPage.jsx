import PageContainer from '@/common/components/layout/PageContainer';
import {useTranslation} from "react-i18next";
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useLocation, useNavigate} from 'react-router-dom';
import {ArrowLeft, ChevronDown, Crown, ShoppingCart, Clock, AlertCircle} from 'lucide-react';
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
import {orderService} from '../../order/services/orderService.js';
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
 const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

 useEffect(() => {
 // Initiate Redis stock reservation with 15-min TTL upon entering checkout
 orderService.initiateCheckoutReservation().catch(err => {
 console.warn("Could not initiate stock reservation in Redis:", err);
 });

 const timer = setInterval(() => {
 setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
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

 /* ── Main checkout ──────────────────────────────────────── */

 return <div className="min-h-screen bg-slate-50/70 text-slate-900 antialiased">
 {/* Header */}
 <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs">
 <PageContainer className="py-3.5">
 <div className="flex items-center gap-4">
 <button type="button" onClick={() => navigate(ROUTES.SHOPPING_CART)} className="-ml-2 shrink-0 p-2 text-slate-600 hover:text-slate-900 transition-colors" aria-label={t("back_to_cart")}>
 <ArrowLeft className="h-5 w-5" strokeWidth={2} />
 </button>
 <div className="min-w-0 flex-1">
 <CheckoutProgressBar currentStep={currentStep} steps={steps} onStepChange={handleStepChange} />
 </div>
 </div>
 </PageContainer>
 </header>

 {/* Stock Reservation Countdown Bar */}
 <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2.5">
 <PageContainer>
 <div className="flex items-center justify-between gap-3 text-xs">
 <div className="flex items-center gap-2 text-amber-900 font-medium">
 <Clock className="h-4 w-4 text-amber-600 animate-pulse shrink-0" />
 <span>
 {t('cart_items_reserved_for_you', 'Sepetinizdeki ürünler sizin için geçici olarak ayrıldı.')}
 </span>
 </div>
 <div className="flex items-center gap-1.5 font-bold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200">
 <span className="text-[11px] uppercase tracking-wider text-amber-800 font-sans font-semibold">Kalan Süre:</span>
 <span className="text-sm">{formatTimer(timeLeft)}</span>
 </div>
 </div>
 </PageContainer>
 </div>

 {/* Mobile Collapsible Order Summary */}
 <div className="bg-white border-b border-slate-200 lg:hidden px-4 py-3 shadow-xs">
 <button type="button" onClick={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)} className="flex w-full items-center justify-between text-xs font-bold">
 <span className="flex items-center gap-1.5 text-slate-900">
 <ShoppingCart className="h-4 w-4 text-slate-900" />
 {isOrderSummaryExpanded ? t("hide_order_summary") : t("show_order_summary")}
 <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isOrderSummaryExpanded ? 'rotate-180' : ''}`} />
 </span>
 <span className="font-extrabold text-slate-900">
 {formatCurrency(calculateTotal(), displayCartItems[0]?.listing?.currency || 'TRY')}
 </span>
 </button>
 {isOrderSummaryExpanded && <div className="mt-3 pt-3 border-t border-slate-100 overflow-hidden">
 <CheckoutOrderSummary cartItems={displayCartItems} calculateTotal={calculateTotal} pricing={pricing} couponInput={couponInput} setCouponInput={setCouponInput} appliedCouponCode={appliedCouponCode} couponError={couponError} isPreviewLoading={isPreviewLoading} onApplyCoupon={onApplyCoupon} onRemoveCoupon={onRemoveCoupon} onOpenCouponsModal={() => setIsCouponsModalOpen(true)} />
 </div>}
 </div>

 {/* Premium Shipping Perk Banner */}
 <PageContainer className="mt-4">
 <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${isPremium ? 'bg-amber-50/70 border-amber-200/80 shadow-xs' : 'bg-white border-slate-200/80 shadow-xs'}`}>
 <div className="flex items-center gap-3">
 <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isPremium ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600'}`}>
 <Crown className="h-5 w-5" />
 </div>
 <div>
 <p className="text-xs font-extrabold text-slate-900">
 {isPremium ? t("premium_shipping_advantage") : t("dont_wait_for_shipping")}
 </p>
 <p className="text-xs text-slate-500 font-medium">
 {isPremium 
 ? t("order_processed_with_priority") 
 : t('upgrade_to_premium_get_shipping_fast', "Premium'a geçerek siparişinizi en hızlı şekilde teslim alın!")}
 </p>
 </div>
 </div>
 {!isPremium && (
 <button 
 onClick={() => setIsPremiumModalOpen(true)}
 className="text-xs font-extrabold text-slate-900 hover:text-slate-900 uppercase tracking-wider cursor-pointer"
 >
 {t('explore_premium', "Premium'u Keşfet →")}
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