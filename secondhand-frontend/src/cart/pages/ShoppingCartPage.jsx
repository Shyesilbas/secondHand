import React, {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AlertTriangle as ExclamationTriangleIcon, ArrowLeft as ArrowLeftIcon} from 'lucide-react';
import {useCart} from '../hooks/useCart.js';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
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
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-center h-64">
                        <LoadingIndicator />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10">
                    <div className="flex items-center space-x-4 mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tighter">Shopping Cart</h1>
                            <p className="text-slate-500 mt-2 tracking-tight">
                                <span>{cartCount} {cartCount === 1 ? 'item' : 'items'} • </span>
                                <span className="font-semibold font-mono text-slate-900 tracking-tight">{formatCurrency(discountedTotal, currency)}</span>
                                {campaignDiscount > 0 && (
                                    <>
                                        <span className="ml-2 text-sm text-slate-400 line-through font-mono tracking-tight">{formatCurrency(originalTotal, currency)}</span>
                                        <span className="ml-2 text-xs font-semibold text-emerald-600 tracking-tight">Save {formatCurrency(campaignDiscount, currency)}</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

            {cartCount === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-16">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Your cart is empty</h2>
                        <p className="text-slate-500 mb-8 max-w-md tracking-tight">
                            Discover amazing products and add them to your cart to get started.
                        </p>
                        <button
                            onClick={() => navigate('/listings')}
                            className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-2xl hover:bg-slate-800 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Browse Listings
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {(hasExpiredReservations || hasExpiringReservations) && (
                        <div className="lg:col-span-2">
                            <div className={`mb-4 p-4 rounded-2xl border ${
                                hasExpiredReservations 
                                    ? 'bg-red-50 border-red-200' 
                                    : 'bg-amber-50 border-amber-200'
                            }`}>
                                <div className="flex items-start gap-3">
                                    <ExclamationTriangleIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                                        hasExpiredReservations ? 'text-red-600' : 'text-amber-600'
                                    }`} />
                                    <div className="flex-1">
                                        <p className={`text-sm font-semibold ${
                                            hasExpiredReservations ? 'text-red-900' : 'text-amber-900'
                                        }`}>
                                            {hasExpiredReservations 
                                                ? 'Some items in your cart have expired reservations'
                                                : 'Some items in your cart are about to expire'
                                            }
                                        </p>
                                        <p className={`text-xs mt-1 ${
                                            hasExpiredReservations ? 'text-red-700' : 'text-amber-700'
                                        }`}>
                                            {hasExpiredReservations
                                                ? 'Please update your cart quantities or proceed to checkout immediately.'
                                                : 'Complete your purchase within the next few minutes to secure these items.'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                            <div className="px-8 py-5 border-b border-slate-100/50">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Items in your cart</h2>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-slate-500 tracking-tight">{cartCount} items</span>
                                        <button
                                            onClick={() => setShowClearModal(true)}
                                            className="text-sm text-slate-500 hover:text-red-600 transition-colors font-medium tracking-tight"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="divide-y divide-slate-100/50">
                                {cartItems.map((item, index) => (
                                    <div key={item.id} className="relative group hover:bg-slate-50/50 transition-colors duration-200">
                                        <CartItemCard
                                            item={item}
                                            onQuantityChange={handleQuantityChange}
                                            onRemoveItem={handleRemoveItem}
                                            isUpdating={isUpdatingCart}
                                            isRemoving={isRemovingFromCart}
                                            index={index}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
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


            {/* Clear Cart Modal */}
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