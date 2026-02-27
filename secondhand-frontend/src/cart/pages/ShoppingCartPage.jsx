import React, {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AlertTriangle as ExclamationTriangleIcon, ArrowLeft as ArrowLeftIcon} from 'lucide-react';
import {useCart} from '../hooks/useCart.js';
import {formatCurrency} from '../../common/formatters.js';
import CartItemCard from '../components/CartItemCard.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import ClearCartModal from '../components/ClearCartModal.jsx';
import {useNotification} from '../../notification/NotificationContext.jsx';

const ShoppingCartPage = () => {
    const navigate = useNavigate();
    const notification = useNotification();
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

    const [showClearModal, setShowClearModal] = useState(false);

    const checkReservationStatus = (reservedAt) => {
        if (!reservedAt) return { isExpired: false, timeRemaining: null };
        const reservedTime = new Date(reservedAt);
        const expirationTime = new Date(reservedTime.getTime() + (15 * 60 * 1000));
        const now = new Date();
        const diff = expirationTime - now;
        
        if (diff <= 0) {
            return { isExpired: true, timeRemaining: null };
        }
        
        const minutes = Math.floor(diff / 60000);
        return { isExpired: false, timeRemaining: { minutes, seconds: Math.floor((diff % 60000) / 1000) } };
    };

    const hasExpiredReservations = useMemo(() => {
        return cartItems.some(item => checkReservationStatus(item.reservedAt).isExpired);
    }, [cartItems]);

    const hasExpiringReservations = useMemo(() => {
        return cartItems.some(item => {
            const { isExpired, timeRemaining } = checkReservationStatus(item.reservedAt);
            return !isExpired && timeRemaining && timeRemaining.minutes < 5;
        });
    }, [cartItems]);

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.listing.campaignPrice ?? item.listing.price) || 0;
            return total + (price * item.quantity);
        }, 0);
    };

    const calculateOriginalTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.listing.price) || 0;
            return total + (price * item.quantity);
        }, 0);
    };
    
    const currency = cartItems.length > 0 ? cartItems[0].listing.currency : 'TRY';
    const originalTotal = calculateOriginalTotal();
    const discountedTotal = calculateTotal();
    const campaignDiscount = Math.max(0, (originalTotal || 0) - (discountedTotal || 0));

    const handleQuantityChange = (listingId, newQuantity) => {
        if (newQuantity < 1) return;
        const item = cartItems.find((ci) => ci?.listing?.id === listingId);
        const max = item?.listing?.quantity;
        if (max != null && Number.isFinite(Number(max)) && newQuantity > Number(max)) {
            updateCartItem(listingId, Number(max), '');
            notification?.showError('Stock limit', `Available stock is ${Number(max)}.`);
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
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Sticky header */}
            <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md transition-colors -ml-1.5"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2">
                            <h1 className="text-[15px] font-semibold text-gray-900 tracking-[-0.01em]">Cart</h1>
                            <span className="text-[11px] text-gray-400 tabular-nums">
                                · {cartCount} {cartCount === 1 ? 'item' : 'items'}
                            </span>
                        </div>
                    </div>
                    {cartCount > 0 && (
                        <div className="flex items-baseline gap-2">
                            <span className="text-[15px] font-semibold text-gray-900 tabular-nums tracking-tight">{formatCurrency(discountedTotal, currency)}</span>
                            {campaignDiscount > 0 && (
                                <>
                                    <span className="text-[11px] text-gray-400 line-through tabular-nums">{formatCurrency(originalTotal, currency)}</span>
                                    <span className="text-[10px] font-medium text-emerald-600">-{formatCurrency(campaignDiscount, currency)}</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-6">

            {cartCount === 0 ? (
                <div className="py-20 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <p className="text-[13px] font-medium text-gray-900 mb-1">Your cart is empty</p>
                    <p className="text-[12px] text-gray-400 mb-5">
                        Browse listings and add items to get started.
                    </p>
                    <button
                        onClick={() => navigate('/listings')}
                        className="px-4 py-2 bg-gray-900 text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Browse Listings
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Reservation warnings */}
                    {(hasExpiredReservations || hasExpiringReservations) && (
                        <div className="lg:col-span-2">
                            <div className={`mb-4 px-4 py-3 rounded-lg border text-[12px] flex items-start gap-2.5 ${
                                hasExpiredReservations
                                    ? 'bg-red-50/80 border-red-100 text-red-700'
                                    : 'bg-amber-50/80 border-amber-100 text-amber-700'
                            }`}>
                                <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium">
                                        {hasExpiredReservations
                                            ? 'Some reservations have expired'
                                            : 'Reservations expiring soon'
                                        }
                                    </p>
                                    <p className="mt-0.5 opacity-80">
                                        {hasExpiredReservations
                                            ? 'Update quantities or proceed to checkout immediately.'
                                            : 'Complete your purchase in the next few minutes to secure these items.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cart items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                            <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
                                <h2 className="text-[13px] font-semibold text-gray-900">Items</h2>
                                <button
                                    onClick={() => setShowClearModal(true)}
                                    className="text-[11px] text-gray-400 hover:text-red-500 transition-colors font-medium"
                                >
                                    Clear all
                                </button>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {cartItems.map((item, index) => (
                                    <CartItemCard
                                        key={item.id}
                                        item={item}
                                        onQuantityChange={handleQuantityChange}
                                        onRemoveItem={handleRemoveItem}
                                        isUpdating={isUpdatingCart}
                                        isRemoving={isRemovingFromCart}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order summary */}
                    <div className="lg:col-span-1">
                        <OrderSummary
                            cartItems={cartItems}
                            cartCount={cartCount}
                            calculateTotal={calculateTotal}
                            onCheckout={() => navigate('/checkout')}
                            disabled={cartCount === 0}
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

            </div>
        </div>
    );
};

export default ShoppingCartPage;