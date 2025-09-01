import React from 'react';
import { formatCurrency } from '../../../utils/formatters';

const CreditCardList = ({ creditCards = [], onAdd }) => {
    if (!creditCards.length) {
        return (
            <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">Henüz kayıtlı kredi kartınız bulunmuyor.</p>
                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                        Kredi Kartı Ekle
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {creditCards.map((card, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">
                                {card.number}
                            </p>
                            <p className="text-sm text-gray-600">
                                {card.expiryMonth}/{card.expiryYear}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(parseFloat(card.limit) - parseFloat(card.amount), 'TRY')}
                            </p>
                            <p className="text-xs text-gray-500">Kullanılabilir Limit</p>
                            <p className="text-xs text-gray-500">
                                Toplam: {formatCurrency(card.limit, 'TRY')} | Kullanılan: {formatCurrency(card.amount, 'TRY')}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CreditCardList;


