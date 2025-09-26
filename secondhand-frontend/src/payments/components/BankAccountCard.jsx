import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../common/formatters.js';

const BankAccountCard = ({ account, onDelete, isDeleting }) => {
    return (
        <div className="bg-white rounded-lg border border-sidebar-border shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">
                            {account.bankName || 'Bank Account'}
                        </h3>
                        <p className="text-sm text-text-muted">
                            {account.accountType || 'Checking Account'}
                        </p>
                    </div>
                    <button
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete bank account"
                    >
                        {isDeleting ? '...' : '🗑️'}
                    </button>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-text-secondary">Iban</span>
                        <span className="text-sm font-mono text-text-primary">
                            {account.IBAN}
                        </span>
                    </div>
                    {typeof account.balance !== 'undefined' && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-text-secondary">Balance</span>
                            <span className="text-sm font-mono text-text-primary">
                                {formatCurrency(account.balance)}
                            </span>
                        </div>
                    )}
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-text-secondary">Account Holder</span>
                        <span className="text-sm font-mono text-text-primary">
                       {account.holderName} {account.holderSurname}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

BankAccountCard.propTypes = {
    account: PropTypes.shape({
        bankName: PropTypes.string,
        accountType: PropTypes.string,
        accountNumber: PropTypes.string,
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
    isDeleting: PropTypes.bool
};

BankAccountCard.defaultProps = {
    isDeleting: false
};

export default BankAccountCard;
