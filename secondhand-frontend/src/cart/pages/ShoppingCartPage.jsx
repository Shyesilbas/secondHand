import React, { useMemo, useState } from 'react';
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
import useAddresses from '../../user/hooks/useAddresses.js';
import { creditCardService } from '../../payments/services/creditCardService.js';
import { orderService } from '../../order/services/orderService.js';
import { bankService } from '../../payments/services/bankService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useEWallet } from '../../ewallet/hooks/useEWallet.js';

const ShoppingCartPage = () => {
    const navigate = useNavigate();
    const { showError, showSuccess } = useNotification();
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
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [step, setStep] = useState(1); // 1: summary, 2: address, 3: payment
    const { addresses } = useAddresses();
    const [selectedShippingAddressId, setSelectedShippingAddressId] = useState(null);
    const [selectedBillingAddressId, setSelectedBillingAddressId] = useState(null);
    const [cards, setCards] = useState([]);
    const [selectedCardNumber, setSelectedCardNumber] = useState(null);
    const [selectedPaymentType, setSelectedPaymentType] = useState('CREDIT_CARD');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [selectedBankAccountIban, setSelectedBankAccountIban] = useState(null);

    const { eWallet, checkBalance } = useEWallet();

    React.useEffect(() => {
        // load credit cards
        creditCardService
            .getAll()
            .then((data) => {
                console.log('Credit cards data:', data);
                let normalized = [];
                if (Array.isArray(data)) {
                    normalized = data;
                } else if (data && Array.isArray(data.content)) {
                    normalized = data.content;
                } else if (data && (data.number || data.cardNumber)) {
                    normalized = [data];
                }
                console.log('Normalized cards:', normalized);
                setCards(normalized);
            })
            .catch((err) => {
                console.error('Error loading cards:', err);
                setCards([]);
            });
        // load bank accounts
        bankService
            .getBankAccount()
            .then((data) => {
                const normalized = Array.isArray(data) ? data : (data && Array.isArray(data.content) ? data.content : []);
                setBankAccounts(normalized);
            })
            .catch(() => setBankAccounts([]));
    }, []);

    React.useEffect(() => {
        if (selectedPaymentType === 'TRANSFER' && Array.isArray(bankAccounts) && bankAccounts.length > 0 && !selectedBankAccountIban) {
            setSelectedBankAccountIban(bankAccounts[0].IBAN || null);
        }
        if (selectedPaymentType === 'CREDIT_CARD' && Array.isArray(cards) && cards.length > 0 && !selectedCardNumber) {
            const number = cards[0].number || cards[0].cardNumber || null;
            setSelectedCardNumber(number);
        }
    }, [selectedPaymentType, bankAccounts, selectedBankAccountIban, cards, selectedCardNumber]);

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

    const proceedDisabled = useMemo(() => {
        if (cartCount === 0) return true;
        if (!selectedShippingAddressId) return true;
        if (selectedPaymentType === 'CREDIT_CARD' && (!Array.isArray(cards) || cards.length === 0)) return true;
        if (selectedPaymentType === 'CREDIT_CARD' && !selectedCardNumber) return true;
        if (selectedPaymentType === 'TRANSFER' && (!Array.isArray(bankAccounts) || bankAccounts.length === 0)) return true;
        if (selectedPaymentType === 'TRANSFER' && !selectedBankAccountIban) return true;
        if (selectedPaymentType === 'EWALLET' && !eWallet) return true;
        if (selectedPaymentType === 'EWALLET' && eWallet && eWallet.balance < calculateTotal()) return true;
        return false;
    }, [cartCount, selectedShippingAddressId, selectedPaymentType, cards, selectedCardNumber, bankAccounts, selectedBankAccountIban, eWallet]);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-10">
                <div className="flex items-center justify-center h-64">
                    <LoadingIndicator />
                </div>
            </div>
        );
    }

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        try {
            await orderService.checkout({
                shippingAddressId: selectedShippingAddressId,
                billingAddressId: selectedBillingAddressId,
                notes: '',
                paymentType: selectedPaymentType
            });
            clearCart();
            showSuccess('Order Placed Successfully', 'Your order has been placed and you will receive a confirmation email shortly.');
            navigate('/profile/orders');
        } catch (e) {
            // Extract error message from different possible response structures
            let errorMessage = 'Checkout failed';
            
            if (e?.response?.data?.message) {
                errorMessage = e.response.data.message;
            } else if (e?.response?.data?.error) {
                errorMessage = e.response.data.error;
            } else if (e?.response?.data) {
                errorMessage = typeof e.response.data === 'string' ? e.response.data : JSON.stringify(e.response.data);
            } else if (e?.message) {
                errorMessage = e.message;
            }
            
            showError('Checkout Failed', errorMessage);
        } finally {
            setIsCheckingOut(false);
        }
    };

    const renderStepControls = () => (
        <div className="flex items-center justify-between mt-6">
            <div className="flex space-x-2">
                {[1,2,3].map(s => (
                    <div key={s} className={`h-2 w-8 rounded ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                ))}
            </div>
            <div className="space-x-3">
                {step > 1 && (
                    <button
                        className="px-4 py-2 border rounded-lg"
                        onClick={() => setStep(step - 1)}
                    >Back</button>
                )}
                {step < 3 && (
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                        onClick={() => setStep(step + 1)}
                        disabled={(step === 1 && cartCount === 0) || (step === 2 && !selectedShippingAddressId)}
                    >Next</button>
                )}
            </div>
        </div>
    );

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
                                    <div key={item.id} className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-medium text-gray-900 truncate">{item.listing.title}</h3>
                                                <p className="text-sm text-gray-500 mt-1">{item.listing.type} • {item.listing.city}</p>
                                                <p className="text-lg font-semibold text-gray-900 mt-2">{formatCurrency(item.listing.price, item.listing.currency)}</p>
                                                <div className="flex items-center space-x-3 mt-3">
                                                    <span className="text-sm text-gray-600">Quantity:</span>
                                                    <div className="flex items-center space-x-2">
                                                        <button onClick={() => handleQuantityChange(item.listing.id, item.quantity - 1)} disabled={isUpdatingCart || item.quantity <= 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-50">
                                                            <MinusIcon className="w-4 h-4" />
                                                        </button>
                                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                        <button onClick={() => handleQuantityChange(item.listing.id, item.quantity + 1)} disabled={isUpdatingCart} className="p-1 hover:bg-gray-100 rounded disabled:opacity-50">
                                                            <PlusIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                {item.notes && (
                                                    <p className="text-sm text-gray-600 mt-2"><span className="font-medium">Notes:</span> {item.notes}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col space-y-2">
                                                <button onClick={() => handleRemoveItem(item.listing.id)} disabled={isRemovingFromCart} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50" title="Remove from cart">
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
                                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                                onClick={() => { setStep(1); setShowCheckoutModal(true); }}
                                disabled={cartCount === 0}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {showCheckoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Checkout</h3>
                            <button className="p-2 hover:bg-gray-100 rounded" onClick={() => setShowCheckoutModal(false)}>
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            {/* Step indicator */}
                            <div className="flex items-center space-x-2 mb-6">
                                {[1,2,3].map(s => (
                                    <div key={s} className={`h-2 flex-1 rounded ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                                ))}
                            </div>

                            {step === 1 && (
                                <div>
                                    <h4 className="text-md font-semibold mb-3">Order Summary</h4>
                                    <div className="divide-y divide-gray-200 border rounded">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="p-4 flex items-start justify-between">
                                                <div>
                                                    <div className="font-medium">{item.listing.title}</div>
                                                    <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                                                </div>
                                                <div className="font-semibold">{formatCurrency(parseFloat(item.listing.price) * item.quantity, item.listing.currency)}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-4 text-lg font-semibold">
                                        <span>Total</span>
                                        <span>{formatCurrency(calculateTotal())}</span>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div>
                                    <h4 className="text-md font-semibold mb-3">Select Addresses</h4>
                                    {/* Shipping address list styled like ProfilePage */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
                                        {addresses.length === 0 ? (
                                            <div className="text-sm text-gray-500">No addresses found. Please add one from your profile.</div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {addresses.map(addr => (
                                                    <label
                                                        key={addr.id}
                                                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                                            selectedShippingAddressId === addr.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:shadow-sm'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <div className="font-semibold text-text-primary flex items-center">
                                                                    <input
                                                                        type="radio"
                                                                        className="mr-2"
                                                                        name="shippingAddress"
                                                                        checked={selectedShippingAddressId === addr.id}
                                                                        onChange={() => setSelectedShippingAddressId(addr.id)}
                                                                    />
                                                                    {addr.addressType}
                                                                    {addr.mainAddress && (
                                                                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Main</span>
                                                                    )}
                                                                </div>
                                                                <div className="mt-2 text-sm text-text-secondary">
                                                                    {addr.addressLine}, {addr.city}, {addr.state}, {addr.postalCode}, {addr.country}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Billing address selection */}
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address (Optional)</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <label className={`p-4 rounded-lg border cursor-pointer ${selectedBillingAddressId == null ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:shadow-sm'}`}>
                                                <div className="flex items-center">
                                                    <input type="radio" className="mr-2" name="billingAddress" checked={selectedBillingAddressId == null} onChange={() => setSelectedBillingAddressId(null)} />
                                                    Use shipping address
                                                </div>
                                            </label>
                                            {addresses.map(addr => (
                                                <label
                                                    key={addr.id}
                                                    className={`p-4 rounded-lg border cursor-pointer ${selectedBillingAddressId === addr.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:shadow-sm'}`}
                                                >
                                                    <div className="flex items-center">
                                                        <input type="radio" className="mr-2" name="billingAddress" checked={selectedBillingAddressId === addr.id} onChange={() => setSelectedBillingAddressId(addr.id)} />
                                                        <span className="text-sm text-text-primary">{addr.addressLine}, {addr.city}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div>
                                    <h4 className="text-md font-semibold mb-3">Payment</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" name="paymentType" value="CREDIT_CARD" checked={selectedPaymentType === 'CREDIT_CARD'} onChange={(e) => setSelectedPaymentType(e.target.value)} />
                                            <span>Credit Card</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" name="paymentType" value="TRANSFER" checked={selectedPaymentType === 'TRANSFER'} onChange={(e) => setSelectedPaymentType(e.target.value)} />
                                            <span>Bank Transfer</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" name="paymentType" value="EWALLET" checked={selectedPaymentType === 'EWALLET'} onChange={(e) => setSelectedPaymentType(e.target.value)} />
                                            <span className="flex items-center">
                                                <span className="mr-2">👛</span>
                                                eWallet
                                                {eWallet && (
                                                    <span className="ml-2 text-sm text-gray-500">
                                                        ({formatCurrency(eWallet.balance || 0)} available)
                                                    </span>
                                                )}
                                            </span>
                                        </label>
                                    </div>
                                    {selectedPaymentType === 'CREDIT_CARD' && (
                                        <div className="mt-3">
                                            <div className="text-sm text-gray-600 mb-2">Select a credit card</div>
                                            {(!Array.isArray(cards) || cards.length === 0) ? (
                                                <div className="text-sm text-gray-500">No saved cards. Add one from Payment Methods.</div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {cards.map((c, idx) => {
                                                        console.log('Rendering card:', c);
                                                        const number = c.number || c.cardNumber || null;
                                                        const last4 = number ? number.slice(-4) : (c.last4 || 'XXXX');
                                                        const label = `**** **** **** ${last4}`;
                                                        const expiry = `${c.expiryMonth || 'MM'}/${c.expiryYear || 'YY'}`;
                                                        const totalSpent = c.totalSpent || c.amount;
                                                        const limitLeft = c.limitLeft;
                                                        return (
                                                            <label key={number || idx} className={`p-4 rounded-lg border cursor-pointer ${selectedCardNumber === number ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:shadow-sm'}`}>
                                                                <div className="flex items-start">
                                                                    <input type="radio" className="mr-3 mt-1" name="creditCard" checked={selectedCardNumber === number} onChange={() => setSelectedCardNumber(number)} />
                                                                    <div>
                                                                        <div className="font-medium text-text-primary">{label}</div>
                                                                        <div className="text-xs text-gray-600">Expires: {expiry}</div>
                                                                        {c.limit && <div className="text-xs text-gray-600">Limit: {c.limit}</div>}
                                                                        {totalSpent && <div className="text-xs text-gray-600">Total Spent: {totalSpent}</div>}
                                                                        {typeof limitLeft !== 'undefined' && <div className="text-xs text-gray-600">Limit Left: {limitLeft}</div>}
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {selectedPaymentType === 'TRANSFER' && (
                                        <div className="mt-3">
                                            <div className="text-sm text-gray-600 mb-2">Select a bank account</div>
                                            {(!Array.isArray(bankAccounts) || bankAccounts.length === 0) ? (
                                                <div className="text-sm text-gray-500">No bank account found.</div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {bankAccounts.map((b, idx) => {
                                                        const value = b.IBAN || '';
                                                        const pretty = `${b.holderName || ''} ${b.holderSurname || ''}`.trim();
                                                        return (
                                                            <label key={value || idx} className={`p-4 rounded-lg border cursor-pointer ${selectedBankAccountIban === value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:shadow-sm'}`}>
                                                                <div className="flex items-start">
                                                                    <input type="radio" className="mr-3 mt-1" name="bankAccount" checked={selectedBankAccountIban === value} onChange={() => setSelectedBankAccountIban(value)} />
                                                                    <div>
                                                                        <div className="font-medium text-text-primary">{pretty || 'Bank Account'}</div>
                                                                        <div className="text-xs text-gray-600">IBAN: {value}</div>
                                                                        {typeof b.balance !== 'undefined' && (
                                                                            <div className="text-xs text-gray-600">Balance: {b.balance}</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {selectedPaymentType === 'EWALLET' && (
                                        <div className="mt-3">
                                            {!eWallet ? (
                                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                    <div className="text-sm text-yellow-800">
                                                        <div className="font-medium mb-1">No eWallet Found</div>
                                                        <div>You need to create an eWallet first. Go to Payment Methods to create one.</div>
                                                        <button 
                                                            onClick={() => navigate('/payment-methods')}
                                                            className="mt-2 text-blue-600 hover:text-blue-800 underline"
                                                        >
                                                            Go to Payment Methods
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center">
                                                            <span className="text-2xl mr-2">👛</span>
                                                            <span className="font-medium text-purple-800">My eWallet</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm text-purple-600">Available Balance</div>
                                                            <div className="text-lg font-bold text-purple-800">
                                                                {formatCurrency(eWallet.balance || 0)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="text-sm text-purple-700">
                                                        <div className="flex justify-between">
                                                            <span>Order Total:</span>
                                                            <span className="font-medium">{formatCurrency(calculateTotal())}</span>
                                                        </div>
                                                        {eWallet.balance >= calculateTotal() ? (
                                                            <div className="mt-2 text-green-700 font-medium">
                                                                ✓ Sufficient balance available
                                                            </div>
                                                        ) : (
                                                            <div className="mt-2 text-red-700 font-medium">
                                                                ⚠ Insufficient balance. Please deposit {formatCurrency(calculateTotal() - eWallet.balance)} more.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t flex items-center justify-between">
                            <button className="px-4 py-2 border rounded" onClick={() => step > 1 ? setStep(step - 1) : setShowCheckoutModal(false)}>
                                {step > 1 ? 'Back' : 'Cancel'}
                            </button>
                            {step < 3 ? (
                                <button className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" onClick={() => setStep(step + 1)} disabled={(step === 1 && cartCount === 0) || (step === 2 && !selectedShippingAddressId)}>
                                    Next
                                </button>
                            ) : (
                                <button className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" onClick={handleCheckout} disabled={proceedDisabled || isCheckingOut}>
                                    {isCheckingOut ? 'Placing…' : 'Place Order'}
                                </button>
                            )}
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
