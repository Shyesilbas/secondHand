import React, {useMemo, useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {AlertTriangle as ExclamationTriangleIcon, ArrowLeft as ArrowLeftIcon, Heart, ShoppingBag, Sparkles} from 'lucide-react';
import {useCart} from '../hooks/useCart.js';
import {formatCurrency} from '../../common/formatters.js';
import CartItemCard from '../components/CartItemCard.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import ClearCartModal from '../components/ClearCartModal.jsx';
import ListingCard from '../../listing/components/ListingCard.jsx';
import {useNotification} from '../../notification/NotificationContext.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { CART_MESSAGES } from '../cartConstants.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useFavorites } from '../../favorites/hooks/useFavorites.js';

const ShoppingCartPage = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { user, isAuthenticated } = useAuthState();
    const { favorites = [], isLoading: favoritesLoading } = useFavorites(0, 8);
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

    const favoriteListings = useMemo(
        () =>
            favorites
                .map((fav) => {
                    const listing = fav?.listing;
                    if (!listing) return null;
                    const favoriteCount = listing?.favoriteCount ?? listing?.favoriteStats?.favoriteCount ?? 0;
                    return {
                        ...listing,
                        favoriteStats: {
                            ...listing.favoriteStats,
                            favoriteCount,
                            isFavorited: true,
                            favorited: true,
                        },
                    };
                })
                .filter(Boolean),
        [favorites]
    );

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
                            {cartCount > 0 ? (
                                <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold tracking-wide">
                                    {cartCount} {cartCount === 1 ? 'item' : 'items'}
                                </span>
                            ) : (
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Empty</span>
                            )}
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
                <div className="mt-6 sm:mt-8 space-y-10 pb-12">
                    <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100/80 to-violet-100/40 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                        <div className="relative px-6 sm:px-12 py-14 sm:py-16 text-center">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 mb-6">
                                <ShoppingBag className="w-8 h-8" strokeWidth={1.75} />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                                {CART_MESSAGES.EMPTY_CART_TITLE}
                            </h2>
                            <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
                                {CART_MESSAGES.EMPTY_CART_DESCRIPTION}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                                <button
                                    type="button"
                                    onClick={() => navigate(ROUTES.LISTINGS)}
                                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[200px] px-8 py-3.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-colors"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Browse listings
                                </button>
                                {isAuthenticated ? (
                                    <Link
                                        to={ROUTES.FAVORITES}
                                        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[200px] px-8 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                                    >
                                        <Heart className="w-4 h-4 text-rose-500" />
                                        View favorites
                                    </Link>
                                ) : (
                                    <Link
                                        to={ROUTES.LOGIN}
                                        className="inline-flex items-center justify-center w-full sm:w-auto min-w-[200px] px-8 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        {CART_MESSAGES.EMPTY_CART_SIGN_IN}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {isAuthenticated ? (
                        <section className="rounded-[2rem] border border-slate-200/90 bg-slate-50/40 p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Heart className="w-5 h-5 text-rose-500 fill-rose-500/30" />
                                        {CART_MESSAGES.EMPTY_CART_FAVORITES_TITLE}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">{CART_MESSAGES.EMPTY_CART_FAVORITES_SUB}</p>
                                </div>
                                <Link
                                    to={ROUTES.FAVORITES}
                                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
                                >
                                    {CART_MESSAGES.EMPTY_CART_SEE_ALL_FAVORITES} →
                                </Link>
                            </div>
                            {favoritesLoading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="rounded-2xl border border-slate-100 bg-white overflow-hidden animate-pulse min-w-0">
                                            <div className="aspect-[4/3] bg-slate-200/80" />
                                            <div className="p-3 space-y-2">
                                                <div className="h-3 bg-slate-100 rounded w-2/3" />
                                                <div className="h-4 bg-slate-100 rounded w-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : favoriteListings.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {favoriteListings.map((listing, index) => (
                                        <div key={listing.id} className="min-w-0 max-w-full">
                                            <ListingCard
                                                listing={listing}
                                                isOwner={user?.id === listing.sellerId}
                                                currentUserId={user?.id}
                                                priorityImage={index < 4}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-8 rounded-xl bg-white/80 border border-dashed border-slate-200">
                                    No saved favorites yet — tap the heart on a listing to save it for later.
                                </p>
                            )}
                        </section>
                    ) : (
                        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <p className="text-sm text-slate-600">{CART_MESSAGES.EMPTY_CART_GUEST_FAVORITES}</p>
                            <Link
                                to={ROUTES.LOGIN}
                                className="inline-flex justify-center sm:justify-end px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors shrink-0"
                            >
                                {CART_MESSAGES.EMPTY_CART_SIGN_IN}
                            </Link>
                        </div>
                    )}
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

