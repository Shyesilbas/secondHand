import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {ArrowLeft as ArrowLeftIcon} from 'lucide-react';
import {useCart} from '../hooks/useCart.js';
import {useCheckout} from '../hooks/useCheckout.js';
import CheckoutProgressBar from '../components/checkout/CheckoutProgressBar.jsx';
import CheckoutStep from '../components/checkout/CheckoutStep.jsx';
import CheckoutOrderSummary from '../components/checkout/CheckoutOrderSummary.jsx';
import {couponService} from '../services/couponService.js';
import ActiveCouponsModal from '../components/checkout/ActiveCouponsModal.jsx';
import {offerService} from '../../offer/services/offerService.js';
import {listingService} from '../../listing/services/listingService.js';
import { ROUTES } from '../../common/constants/routes.js';
import { CART_CHECKOUT_DEFAULTS, CART_CHECKOUT_STEPS, CART_MESSAGES } from '../cartConstants.js';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems, cartCount, clearCart } = useCart();

    const offerId = useMemo(() => {
        return new URLSearchParams(location.search).get('offerId');
    }, [location.search]);

    const [offerContext, setOfferContext] = useState(null);

    const [couponInput, setCouponInput] = useState('');
    const [appliedCouponCode, setAppliedCouponCode] = useState(null);
    const [couponError, setCouponError] = useState(null);
    const [pricing, setPricing] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false);

    const cartKey = useMemo(() => {
        const base = cartItems.map((i) => `${i.id}:${i.quantity}`).join('|');
        return `${base}|offer:${offerId || ''}`;
    }, [cartItems, offerId]);

    useEffect(() => {
        if (!offerId) {
            setOfferContext(null);
            return;
        }
        offerService
            .getById(offerId)
            .then(async (offer) => {
                const listing = offer?.listingId ? await listingService.getListingById(offer.listingId) : null;
                const safeListing = listing
                    ? { ...listing, campaignId: null, campaignPrice: null, campaignName: null }
                    : null;
                setOfferContext({
                    offer,
                    listing: safeListing,
                });
            })
            .catch((e) => {
                setOfferContext(null);
                setCouponError(e?.response?.data?.message || CART_MESSAGES.OFFER_LOAD_FAILED);
            });
    }, [offerId]);

    const displayCartItems = useMemo(() => {
        if (!offerContext?.offer || !offerContext?.listing) {
            return cartItems;
        }
        const listingId = offerContext.offer.listingId;
        const filtered = cartItems.filter((ci) => ci?.listing?.id !== listingId);
        return [
            ...filtered,
            {
                id: `offer-${offerContext.offer.id}`,
                quantity: offerContext.offer.quantity,
                listing: offerContext.listing,
                isOffer: true,
                offerTotalPrice: offerContext.offer.totalPrice,
            },
        ];
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
            return total + (price * item.quantity);
        }, 0);
    }, [pricing, displayCartItems]);
    
    const effectiveCartCount = offerId ? Math.max(cartCount, 1) : cartCount;
    const checkout = useCheckout(effectiveCartCount, calculateTotal, clearCart, appliedCouponCode, offerId);
    const [currentStep, setCurrentStep] = useState(CART_CHECKOUT_DEFAULTS.INITIAL_STEP);

    const refreshPreviewRef = useRef(null);
    const isRefreshingRef = useRef(false);

    const refreshPreview = useCallback(async (code) => {
        if (isRefreshingRef.current) {
            return;
        }
        isRefreshingRef.current = true;
        setIsPreviewLoading(true);
        try {
            const data = await couponService.preview(code, offerId);
            setPricing(data);
            setCouponError(null);
        } catch (e) {
            const message = e?.response?.data?.message || e?.response?.data?.error || CART_MESSAGES.COUPON_APPLY_FAILED;
            setCouponError(message);
            setAppliedCouponCode(null);
            const data = await couponService.preview(null, offerId);
            setPricing(data);
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
            setAppliedCouponCode(null);
            setCouponError(null);
            await refreshPreview(null);
            return;
        }
        const normalized = next.toUpperCase();
        setAppliedCouponCode(normalized);
        await refreshPreview(normalized);
    };

    const onRemoveCoupon = async () => {
        setAppliedCouponCode(null);
        setCouponInput('');
        setCouponError(null);
        await refreshPreview(null);
    };

    const steps = CART_CHECKOUT_STEPS;

    const handleStepChange = (step) => {
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

    if (!offerId && cartCount === 0) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex items-center justify-center relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-50/60 via-violet-50/20 to-transparent pointer-events-none -z-10" />
                <div className="text-center bg-white/80 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 rounded-[2rem] max-w-lg mx-auto">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-indigo-500/10 flex items-center justify-center mx-auto mb-8 border border-slate-100">
                        <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">{CART_MESSAGES.EMPTY_CART_TITLE}</h1>
                    <p className="text-slate-500 mb-8 font-medium">{CART_MESSAGES.EMPTY_CART_DESCRIPTION}</p>
                    <button
                        onClick={() => navigate(ROUTES.LISTINGS)}
                        className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-base font-bold rounded-2xl hover:from-indigo-700 hover:to-violet-700 hover:-translate-y-0.5 active:translate-y-0 shadow-xl shadow-indigo-500/25 transition-all duration-300"
                    >
                        Browse Listings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 relative tracking-tight">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-50/60 via-violet-50/20 to-transparent pointer-events-none -z-10" />
            
            <div className="bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(ROUTES.SHOPPING_CART)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300 -ml-2 shrink-0"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <CheckoutProgressBar 
                                currentStep={currentStep} 
                                steps={steps}
                                onStepChange={handleStepChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
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
                            cards={checkout.cards}
                            selectedCardNumber={checkout.selectedCardNumber}
                            setSelectedCardNumber={checkout.setSelectedCardNumber}
                            bankAccounts={checkout.bankAccounts}
                            selectedBankAccountIban={checkout.selectedBankAccountIban}
                            setSelectedBankAccountIban={checkout.setSelectedBankAccountIban}
                            eWallet={checkout.eWallet}
                            paymentVerificationCode={checkout.paymentVerificationCode}
                            setPaymentVerificationCode={checkout.setPaymentVerificationCode}
                            notes={checkout.notes}
                            setNotes={checkout.setNotes}
                            orderName={checkout.orderName}
                            setOrderName={checkout.setOrderName}
                            emails={checkout.emails}
                            isEmailsLoading={checkout.isEmailsLoading}
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

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <CheckoutOrderSummary
                            cartItems={displayCartItems}
                            calculateTotal={calculateTotal}
                            pricing={pricing}
                            couponInput={couponInput}
                            setCouponInput={setCouponInput}
                            appliedCouponCode={appliedCouponCode}
                            couponError={couponError}
                            isPreviewLoading={isPreviewLoading}
                            onApplyCoupon={onApplyCoupon}
                            onRemoveCoupon={onRemoveCoupon}
                            onOpenCouponsModal={() => setIsCouponsModalOpen(true)}
                        />
                    </div>
                </div>
            </div>

            <ActiveCouponsModal
                isOpen={isCouponsModalOpen}
                onClose={() => setIsCouponsModalOpen(false)}
                onApply={async (code) => {
                    setCouponInput(code);
                    setAppliedCouponCode(code);
                    await refreshPreview(code);
                    setIsCouponsModalOpen(false);
                }}
            />
        </div>
    );
};

export default CheckoutPage;
