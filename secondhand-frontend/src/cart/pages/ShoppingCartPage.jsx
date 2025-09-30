import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCart } from '../hooks/useCart.js';
import { useCheckout } from '../hooks/index.js';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
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
                    {/* Left column: Cart Items with controls */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {cartItems.map((item) => (
                                    <CartItemCard
                                        key={item.id}
                                        item={item}
                                        onQuantityChange={handleQuantityChange}
                                        onRemoveItem={handleRemoveItem}
                                        isUpdating={isUpdatingCart}
                                        isRemoving={isRemovingFromCart}
                                    />
                                ))}
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
                onCheckout={checkout.handleCheckout}
                proceedDisabled={checkout.proceedDisabled}
                isCheckingOut={checkout.isCheckingOut}
                showEWalletWarning={checkout.showEWalletWarning}
                onConfirmEWalletWarning={checkout.confirmEWalletWarningAndCheckout}
            />

            {/* Clear Cart Modal */}
            <ClearCartModal
                isOpen={showClearModal}
                onClose={() => setShowClearModal(false)}
                onConfirm={handleClearCart}
                isClearing={isClearingCart}
            />

        </div>
    );
};

export default ShoppingCartPage;