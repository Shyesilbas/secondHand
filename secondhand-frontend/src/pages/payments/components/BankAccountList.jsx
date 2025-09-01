import React from 'react';
import { formatCurrency } from '../../../utils/formatters';

const BankAccountList = ({ bankAccounts = [], onAdd }) => {
    if (!bankAccounts.length) {
        return (
            <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">Henüz kayıtlı banka hesabınız bulunmuyor.</p>
                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                        Banka Hesabı Ekle
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {bankAccounts.map((account, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">
                                {account.holderName} {account.holderSurname}
                            </p>
                            <p className="text-sm text-gray-600">
                                {account.IBAN}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(account.balance, 'TRY')}
                            </p>
                            <p className="text-xs text-gray-500">Bakiye</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BankAccountList;


