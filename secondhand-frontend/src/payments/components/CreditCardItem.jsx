import React from 'react';
import PropTypes from 'prop-types';

const CreditCardItem = ({ card, onDelete, isDeleting }) => {

    return (
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 text-white relative overflow-hidden">
            <div className="relative">
                <div className="flex items-center justify-between mb-8">
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
                        {card.number || card.cardNumber || 'N/A'}
                    </p>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs opacity-80 uppercase tracking-wide">Limit</p>
                        <p className="text-sm font-medium">
                            {card.limit}
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
