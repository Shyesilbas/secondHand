import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCart } from '../hooks/useCart.js';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import { formatCurrency } from '../../common/formatters.js';
import CartItemCard from '../components/CartItemCard.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import ClearCartModal from '../components/ClearCartModal.jsx';

const ShoppingCartPage = () => {
    const navigate = useNavigate();
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

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.listing.price) || 0;
            return total + (price * item.quantity);
        }, 0);
    };
    
    const currency = cartItems.length > 0 ? cartItems[0].listing.currency : 'TRY';

    const handleQuantityChange = (listingId, newQuantity) => {
        if (newQuantity < 1) return;
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
            <div className="min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center h-64">
                        <LoadingIndicator />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Clean Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-medium text-gray-900">Shopping Cart</h1>
                            <p className="text-gray-600 mt-1">
                                {cartCount} {cartCount === 1 ? 'item' : 'items'} • {formatCurrency(calculateTotal(), currency)}
                            </p>
                        </div>
                    </div>
                </div>

            {/* Cart Content */}
            {cartCount === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                    <EmptyState
                        title="Your cart is empty"
                        description="Add some items to your cart to get started."
                        primaryAction={{
                            label: "Browse Listings",
                            onClick: () => navigate('/listings')
                        }}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            {/* Clean Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-medium text-gray-900">Items in your cart</h2>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-500">{cartCount} items</span>
                                        <button
                                            onClick={() => setShowClearModal(true)}
                                            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Items List */}
                            <div className="divide-y divide-gray-100">
                                {cartItems.map((item, index) => (
                                    <div key={item.id} className="relative group">
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
                            
                            {/* Modern Footer */}
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium">{cartCount}</span> items
                                        </div>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                        <div className="text-sm text-gray-600">
                                            Subtotal: <span className="font-semibold text-gray-900">{formatCurrency(calculateTotal(), currency)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span>Secure checkout</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Order Summary */}
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