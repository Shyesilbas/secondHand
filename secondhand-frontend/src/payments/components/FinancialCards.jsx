import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../common/formatters.js';

const BaseCard = ({ variant, title, subtitle, onDelete, isDeleting, children }) => {
  const containerClassName = variant === 'creditCard'
    ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white'
    : 'bg-white text-text-primary border border-sidebar-border';

  const deleteButtonClassName = variant === 'creditCard'
    ? 'text-white/70 hover:text-white hover:bg-white/10'
    : 'text-red-500 hover:text-red-700 hover:bg-red-50';

  return (
    <div className={`rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden ${containerClassName}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            {title ? (
              <h3 className={`text-lg font-semibold ${variant === 'creditCard' ? 'text-white' : 'text-text-primary'}`}>
                {title}
              </h3>
            ) : null}
            {subtitle ? (
              <p className={`text-sm ${variant === 'creditCard' ? 'text-white/70' : 'text-text-muted'}`}>
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${deleteButtonClassName}`}
            title={variant === 'creditCard' ? 'Delete credit card' : 'Delete bank account'}
          >
            {isDeleting ? '...' : '🗑️'}
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

BaseCard.propTypes = {
  variant: PropTypes.oneOf(['creditCard', 'bankAccount']).isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onDelete: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

BaseCard.defaultProps = {
  title: null,
  subtitle: null,
  isDeleting: false,
};

const CreditCardContent = ({ card }) => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-lg font-mono tracking-wider">
          {card.number || card.cardNumber || `**** **** **** ${card.last4 || 'XXXX'}`}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide opacity-80">Limit</p>
          <p className="text-sm font-medium">{formatCurrency(card.limit)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide opacity-80">Expires</p>
          <p className="text-sm font-medium">{`${card.expiryMonth || 'MM'}/${card.expiryYear || 'YY'}`}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide opacity-80">Total Spent</p>
          <p className="font-medium">{formatCurrency(card.totalSpent || card.amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide opacity-80">Limit Left</p>
          <p className="font-medium">{formatCurrency(card.limitLeft)}</p>
        </div>
      </div>
    </div>
  );
};

CreditCardContent.propTypes = {
  card: PropTypes.shape({
    number: PropTypes.string,
    cardNumber: PropTypes.string,
    last4: PropTypes.string,
    limit: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    expiryMonth: PropTypes.string,
    expiryYear: PropTypes.string,
    totalSpent: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    limitLeft: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
};

const BankAccountContent = ({ account }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-text-secondary">IBAN</span>
        <span className="text-sm font-mono text-text-primary">{account.IBAN}</span>
      </div>

      {typeof account.balance !== 'undefined' ? (
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary">Balance</span>
          <span className="text-sm font-mono text-text-primary">{formatCurrency(account.balance)}</span>
        </div>
      ) : null}

      <div className="flex justify-between items-center">
        <span className="text-sm text-text-secondary">Account Holder</span>
        <span className="text-sm font-mono text-text-primary">{`${account.holderName} ${account.holderSurname}`}</span>
      </div>
    </div>
  );
};

BankAccountContent.propTypes = {
  account: PropTypes.shape({
    bankName: PropTypes.string,
    accountType: PropTypes.string,
    IBAN: PropTypes.string,
    balance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    holderName: PropTypes.string,
    holderSurname: PropTypes.string,
  }).isRequired,
};

const FinancialCards = ({ card, account, onDelete, isDeleting }) => {
  if (card) {
    return (
      <BaseCard
        variant="creditCard"
        title={null}
        subtitle={null}
        onDelete={onDelete}
        isDeleting={isDeleting}
      >
        <CreditCardContent card={card} />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      variant="bankAccount"
      title={account?.bankName || 'Bank Account'}
      subtitle={account?.accountType || 'Checking Account'}
      onDelete={onDelete}
      isDeleting={isDeleting}
    >
      <BankAccountContent account={account} />
    </BaseCard>
  );
};

FinancialCards.propTypes = {
  card: PropTypes.object,
  account: PropTypes.object,
  onDelete: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool,
};

FinancialCards.defaultProps = {
  card: null,
  account: null,
  isDeleting: false,
};

export default FinancialCards;

