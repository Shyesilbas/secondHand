import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../common/formatters.js';
import { ROUTES } from '../../../common/constants/routes.js';
import { CART_PAYMENT_TYPES } from '../../cartConstants.js';

const PaymentSelectionStep = ({ 
    selectedPaymentType, 
    setSelectedPaymentType,
    cards,
    selectedCardNumber,
    setSelectedCardNumber,
    bankAccounts,
    selectedBankAccountIban,
    setSelectedBankAccountIban,
    eWallet,
    calculateTotal
}) => {
    const navigate = useNavigate();
    const getCardSelectValue = (card) => (
        card?.id
        || card?.cardId
        || card?.number
        || card?.cardNumber
        || null
    );

    return (
        <div>
            <h4 className="text-md font-semibold mb-3">Payment</h4>
            
            {/* Payment Type Selection */}
            <div className="space-y-2">
                <label className="flex items-center space-x-2">
                    <input 
                        type="radio" 
                        name="paymentType" 
                        value={CART_PAYMENT_TYPES.CREDIT_CARD}
                        checked={selectedPaymentType === CART_PAYMENT_TYPES.CREDIT_CARD}
                        onChange={(e) => setSelectedPaymentType(e.target.value)} 
                    />
                    <span>Credit Card</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input 
                        type="radio" 
                        name="paymentType" 
                        value={CART_PAYMENT_TYPES.TRANSFER}
                        checked={selectedPaymentType === CART_PAYMENT_TYPES.TRANSFER}
                        onChange={(e) => setSelectedPaymentType(e.target.value)} 
                    />
                    <span>Bank Transfer</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input 
                        type="radio" 
                        name="paymentType" 
                        value={CART_PAYMENT_TYPES.EWALLET}
                        checked={selectedPaymentType === CART_PAYMENT_TYPES.EWALLET}
                        onChange={(e) => setSelectedPaymentType(e.target.value)} 
                    />
                    <span className="flex items-center">
                        <span className="mr-2">👛</span>
                        eWallet
                        {eWallet && (
                            <span className="ml-2 text-sm text-[#9c9894]">
                                ({formatCurrency(eWallet.balance || 0)} available)
                            </span>
                        )}
                    </span>
                </label>
            </div>

            {/* Credit Card Selection */}
            {selectedPaymentType === CART_PAYMENT_TYPES.CREDIT_CARD && (
                <div className="mt-3">
                    <div className="mb-2 text-sm text-[#5f5b57]">Select a credit card</div>
                    {(!Array.isArray(cards) || cards.length === 0) ? (
                        <div className="text-sm text-[#9c9894]">
                            No saved cards. Add one from Payment Methods.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {cards.map((c, idx) => {
                                const number = c.number || c.cardNumber || null;
                                const selectionValue = getCardSelectValue(c);
                                const last4 = number ? number.slice(-4) : (c.last4 || 'XXXX');
                                const label = `**** **** **** ${last4}`;
                                const expiry = `${c.expiryMonth || 'MM'}/${c.expiryYear || 'YY'}`;
                                const totalSpent = c.totalSpent || c.amount;
                                const limitLeft = c.limitLeft;
                                
                                return (
                                    <label 
                                        key={selectionValue || idx} 
                                        className={`p-4 rounded-xl border cursor-pointer ${
                                            selectedCardNumber === selectionValue 
                                                ? 'border-[#1466c6] bg-[#eef4fb]'
                                                : 'border-[#e0deda] bg-white hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-start">
                                            <input 
                                                type="radio" 
                                                className="mr-3 mt-1" 
                                                name="creditCard" 
                                                checked={selectedCardNumber === selectionValue} 
                                                onChange={() => setSelectedCardNumber(selectionValue)} 
                                            />
                                            <div>
                                                <div className="font-medium text-text-primary">{label}</div>
                                                <div className="text-xs text-[#5f5b57]">Expires: {expiry}</div>
                                                {c.limit && <div className="text-xs text-[#5f5b57]">Limit: {c.limit}</div>}
                                                {totalSpent && <div className="text-xs text-[#5f5b57]">Total Spent: {totalSpent}</div>}
                                                {typeof limitLeft !== 'undefined' && <div className="text-xs text-[#5f5b57]">Limit Left: {limitLeft}</div>}
                                            </div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Bank Transfer Selection */}
            {selectedPaymentType === CART_PAYMENT_TYPES.TRANSFER && (
                <div className="mt-3">
                    <div className="mb-2 text-sm text-[#5f5b57]">Select a bank account</div>
                    {(!Array.isArray(bankAccounts) || bankAccounts.length === 0) ? (
                        <div className="text-sm text-[#9c9894]">No bank account found.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {bankAccounts.map((b, idx) => {
                                const value = b.IBAN || '';
                                const pretty = `${b.holderName || ''} ${b.holderSurname || ''}`.trim();
                                
                                return (
                                    <label 
                                        key={value || idx} 
                                        className={`p-4 rounded-xl border cursor-pointer ${
                                            selectedBankAccountIban === value 
                                                ? 'border-[#1466c6] bg-[#eef4fb]'
                                                : 'border-[#e0deda] bg-white hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-start">
                                            <input 
                                                type="radio" 
                                                className="mr-3 mt-1" 
                                                name="bankAccount" 
                                                checked={selectedBankAccountIban === value} 
                                                onChange={() => setSelectedBankAccountIban(value)} 
                                            />
                                            <div>
                                                <div className="font-medium text-text-primary">
                                                    {pretty || 'Bank Account'}
                                                </div>
                                                <div className="text-xs text-[#5f5b57]">IBAN: {value}</div>
                                                {typeof b.balance !== 'undefined' && (
                                                    <div className="text-xs text-[#5f5b57]">Balance: {b.balance}</div>
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

            {/* eWallet Selection */}
            {selectedPaymentType === CART_PAYMENT_TYPES.EWALLET && (
                <div className="mt-3">
                    {!eWallet ? (
                        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                            <div className="text-sm text-yellow-800">
                                <div className="font-medium mb-1">No eWallet Found</div>
                                <div>You need to create an eWallet first. Go to Payment Methods to create one.</div>
                                <button 
                                    onClick={() => navigate(ROUTES.PAYMENT_METHODS)}
                                    className="mt-2 font-medium text-[#1466c6] underline hover:text-[#0f529e]"
                                >
                                    Go to Payment Methods
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 p-4">
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
    );
};

export default PaymentSelectionStep;
