import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCart } from '../hooks/useCart.js';
import { useCheckout } from '../hooks/index.js';
import CheckoutProgressBar from '../components/checkout/CheckoutProgressBar.jsx';
import CheckoutStep from '../components/checkout/CheckoutStep.jsx';
import CheckoutOrderSummary from '../components/checkout/CheckoutOrderSummary.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import { couponService } from '../services/couponService.js';
import ActiveCouponsModal from '../components/checkout/ActiveCouponsModal.jsx';
import { offerService } from '../../offer/services/offerService.js';
import { listingService } from '../../listing/services/listingService.js';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems, cartCount, clearCart } = useCart();

    const offerId = useMemo(() => {
        return new URLSearchParams(location.search).get('offerId');
    }, [location.search]);

    const [offerContext, setOfferContext] = useState(null);
    const [isOfferLoading, setIsOfferLoading] = useState(false);

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
        setIsOfferLoading(true);
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
                setCouponError(e?.response?.data?.message || 'Offer could not be loaded');
            })
            .finally(() => setIsOfferLoading(false));
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
    const [currentStep, setCurrentStep] = useState(1);

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
            const message = e?.response?.data?.message || e?.response?.data?.error || 'Coupon could not be applied';
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

    const steps = [
        { id: 1, title: 'Review', description: 'Review your order' },
        { id: 2, title: 'Address & Note', description: 'Shipping and billing' },
        { id: 3, title: 'Payment Method', description: 'Choose payment option' },
        { id: 4, title: 'Verification', description: 'Confirm your purchase' }
    ];

    const handleStepChange = (step) => {
        setCurrentStep(step);
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigate('/cart');
        }
    };

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    if (!offerId && cartCount === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-medium text-gray-900 mb-4">Your cart is empty</h1>
                    <p className="text-gray-600 mb-8">Add some items to your cart to get started.</p>
                    <button
                        onClick={() => navigate('/listings')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Browse Listings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] tracking-tight">
            <div className="bg-white border-b border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/cart')}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tighter">Checkout</h1>
                            <p className="text-slate-500 mt-1 tracking-tight">Complete your purchase securely</p>
                        </div>
                    </div>
                </div>
            </div>

            <CheckoutProgressBar 
                currentStep={currentStep} 
                steps={steps}
                onStepChange={handleStepChange}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
