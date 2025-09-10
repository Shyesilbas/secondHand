import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCartIcon,
    TrashIcon,
    PlusIcon,
    MinusIcon,
    ArrowLeftIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../hooks/useCart.js';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import { formatCurrency } from '../../common/formatters.js';

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

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.listing.price) || 0;
            return total + (price * item.quantity);
        }, 0);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-10">
                <div className="flex items-center justify-center h-64">
                    <LoadingIndicator />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                        <p className="text-gray-600 mt-1">
                            {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
                        </p>
                    </div>
                </div>
                
                {cartCount > 0 && (
                    <button
                        onClick={() => setShowClearModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" />
                        <span>Clear Cart</span>
                    </button>
                )}
            </div>

            {/* Cart Content */}
            {cartCount === 0 ? (
                <EmptyState
                    title="Your cart is empty"
                    description="Add some items to your cart to get started."
                    primaryAction={{
                        label: "Browse Listings",
                        onClick: () => navigate('/listings'),
                        variant: "blue"
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                            </div>
                            
                            <div className="divide-y divide-gray-200">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="p-6">
                                        <div className="flex items-start space-x-4">
                                            {/* Listing Image */}
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={item.listing.images?.[0]?.url || '/placeholder-image.jpg'}
                                                    alt={item.listing.title}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                            </div>
                                            
                                            {/* Listing Details */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                                    {item.listing.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {item.listing.listingType} • {item.listing.city}
                                                </p>
                                                <p className="text-lg font-semibold text-gray-900 mt-2">
                                                    {formatCurrency(item.listing.price, item.listing.currency)}
                                                </p>
                                                
                                                {/* Quantity Controls */}
                                                <div className="flex items-center space-x-3 mt-3">
                                                    <span className="text-sm text-gray-600">Quantity:</span>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleQuantityChange(item.listing.id, item.quantity - 1)}
                                                            disabled={isUpdatingCart || item.quantity <= 1}
                                                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                                                        >
                                                            <MinusIcon className="w-4 h-4" />
                                                        </button>
                                                        <span className="w-8 text-center font-medium">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleQuantityChange(item.listing.id, item.quantity + 1)}
                                                            disabled={isUpdatingCart}
                                                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                                                        >
                                                            <PlusIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* Notes */}
                                                {item.notes && (
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        <span className="font-medium">Notes:</span> {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            {/* Actions */}
                                            <div className="flex flex-col space-y-2">
                                                <button
                                                    onClick={() => handleRemoveItem(item.listing.id)}
                                                    disabled={isRemovingFromCart}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Remove from cart"
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Items ({cartCount})</span>
                                    <span className="font-medium">{formatCurrency(calculateTotal())}</span>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total</span>
                                        <span>{formatCurrency(calculateTotal())}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                onClick={() => {
                                    // TODO: Implement checkout process
                                    alert('Checkout functionality will be implemented soon!');
                                }}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Clear Cart Modal */}
            {showClearModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <TrashIcon className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Clear Cart</h3>
                            </div>
                            
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to remove all items from your cart? This action cannot be undone.
                            </p>
                            
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowClearModal(false)}
                                    disabled={isClearingCart}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearCart}
                                    disabled={isClearingCart}
                                    className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    {isClearingCart ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Clearing...</span>
                                        </>
                                    ) : (
                                        <span>Clear Cart</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShoppingCartPage;
