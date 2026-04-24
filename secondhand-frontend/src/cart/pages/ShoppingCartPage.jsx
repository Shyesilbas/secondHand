import React, {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AlertTriangle as ExclamationTriangleIcon, ArrowLeft as ArrowLeftIcon} from 'lucide-react';
import {useCart} from '../hooks/useCart.js';
import {formatCurrency} from '../../common/formatters.js';
import CartItemCard from '../components/CartItemCard.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import ClearCartModal from '../components/ClearCartModal.jsx';
import {useNotification} from '../../notification/NotificationContext.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { CART_MESSAGES } from '../cartConstants.js';

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
        <div className="min-h-screen bg-slate-50/50 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-50/60 via-violet-50/20 to-transparent pointer-events-none -z-10" />
            
            {/* Sticky header */}
            <div className="bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 sticky top-0 z-30 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300 -ml-2"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
                            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold tracking-wide">
                                {cartCount} {cartCount === 1 ? 'item' : 'items'}
                            </span>
                        </div>
                    </div>
                    {cartCount > 0 && (
                        <div className="flex flex-col items-end justify-center">
                            <div className="flex items-baseline gap-2">
                                <span className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums tracking-tight">{formatCurrency(discountedTotal, currency)}</span>
                            </div>
                            {campaignDiscount > 0 && (
                                <div className="flex items-center gap-1.5 -mt-0.5">
                                    <span className="text-[11px] text-slate-400 line-through tabular-nums">{formatCurrency(originalTotal, currency)}</span>
                                    <span className="text-[10px] font-bold text-emerald-500">-{formatCurrency(campaignDiscount, currency)}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

            {cartCount === 0 ? (
                <div className="py-24 sm:py-32 text-center rounded-[2rem] bg-white/80 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-violet-50/30 pointer-events-none" />
                    <div className="relative z-10">
                        <div className="w-28 h-28 bg-white rounded-3xl shadow-xl shadow-indigo-500/10 flex items-center justify-center mx-auto mb-8 border border-slate-100">
                            <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">{CART_MESSAGES.EMPTY_CART_TITLE}</p>
                        <p className="text-base text-slate-500 mb-10 max-w-sm mx-auto font-medium">
                            Browse listings and add items to get started.
                        </p>
                        <button
                            onClick={() => navigate(ROUTES.LISTINGS)}
                            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-base font-bold rounded-2xl hover:from-indigo-700 hover:to-violet-700 hover:-translate-y-0.5 active:translate-y-0 shadow-xl shadow-indigo-500/25 transition-all duration-300"
                        >
                            Browse Listings
                        </button>
                    </div>
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
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100/50 bg-slate-50/30 flex items-center justify-between">
                                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Your Items</h2>
                                <button
                                    onClick={() => setShowClearModal(true)}
                                    className="text-xs text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors font-bold"
                                >
                                    Clear all
                                </button>
                            </div>

                            <div className="divide-y divide-slate-100/60 bg-white/40">
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
                            onCheckout={() => navigate(ROUTES.CHECKOUT)}
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

