import React from 'react';
import PropTypes from 'prop-types';

const CreditCardItem = ({ card, onDelete, isDeleting }) => {
    const getCardTypeIcon = (cardType) => {
        switch (cardType?.toLowerCase()) {
            case 'visa':
                return <span>Visa</span>;
            case 'mastercard':
                return <span>MasterCard</span>;
            case 'amex':
                return <span>AMEX</span>;
            default:
                return <span>Card</span>;
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 text-white relative overflow-hidden">
            <div className="relative">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-2">
                        {getCardTypeIcon(card.cardType)}
                        <span className="text-sm font-medium opacity-90">
                            {card.cardType || 'Credit Card'}
                        </span>
                    </div>
                    <button
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete credit card"
                    >
                        {isDeleting ? '...' : '🗑️'}
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-lg font-mono tracking-wider">
                        {card.number || card.cardNumber || '**** **** **** ****'}
                    </p>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs opacity-80 uppercase tracking-wide">Card Holder</p>
                        <p className="text-sm font-medium">
                            {card.cardHolder || 'Card Holder'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs opacity-80 uppercase tracking-wide">Expires</p>
                        <p className="text-sm font-medium">
                            {card.expiryMonth || 'MM'}/{card.expiryYear || 'YY'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

CreditCardItem.propTypes = {
    card: PropTypes.shape({
        cardType: PropTypes.string,
        number: PropTypes.string,
        cardNumber: PropTypes.string,
        cardHolder: PropTypes.string,
        expiryMonth: PropTypes.string,
        expiryYear: PropTypes.string,
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
    isDeleting: PropTypes.bool
};

CreditCardItem.defaultProps = {
    isDeleting: false
};

export default CreditCardItem;
