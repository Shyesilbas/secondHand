import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCart } from '../hooks/useCart.js';
import { useCheckout } from '../hooks/index.js';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import { formatCurrency } from '../../common/formatters.js';
import CartItemCard from '../components/CartItemCard.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import CheckoutModal from '../components/checkout/CheckoutModal.jsx';
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

        const checkout = useCheckout(cartCount, calculateTotal, clearCart);

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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Modern Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:shadow-sm"
                            >
                                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-sm text-gray-600">
                                        {cartCount} {cartCount === 1 ? 'item' : 'items'}
                                    </span>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    <span className="text-sm text-gray-600">
                                        {formatCurrency(calculateTotal(), 'USD')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {cartCount > 0 && (
                            <button
                                onClick={() => setShowClearModal(true)}
                                className="flex items-center space-x-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200 hover:shadow-sm"
                            >
                                <TrashIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">Clear Cart</span>
                            </button>
                        )}
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column: Cart Items with controls */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            {/* Modern Header */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-bold">{cartCount}</span>
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">Your Items</h2>
                                            <p className="text-sm text-gray-600">Review and modify your selection</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-600">{cartCount} items</span>
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
                                            Subtotal: <span className="font-semibold text-gray-900">{formatCurrency(calculateTotal(), 'USD')}</span>
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
                            onCheckout={checkout.openCheckoutModal}
                            disabled={cartCount === 0}
                        />
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {checkout.showCheckoutModal && (
                <CheckoutModal
                    isOpen={checkout.showCheckoutModal}
                    onClose={checkout.closeCheckoutModal}
                    step={checkout.step}
                    setStep={checkout.setStep}
                    cartItems={cartItems}
                    cartCount={cartCount}
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
                    sendVerificationCode={checkout.sendVerificationCode}
                    emails={checkout.emails}
                    isEmailsLoading={checkout.isEmailsLoading}
                    fetchEmails={checkout.fetchEmails}
                    onCheckout={checkout.handleCheckout}
                    proceedDisabled={checkout.proceedDisabled}
                    isCheckingOut={checkout.isCheckingOut}
                    showEWalletWarning={checkout.showEWalletWarning}
                    onConfirmEWalletWarning={checkout.confirmEWalletWarningAndCheckout}
                />
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