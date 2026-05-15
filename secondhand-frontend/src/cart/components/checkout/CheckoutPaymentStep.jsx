import React, { useState } from 'react';
import { Banknote, CreditCard, Wallet, AlertCircle, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import PaymentAgreementsSection from '../../../payments/components/PaymentAgreementsSection.jsx';
import { formatCurrency } from '../../../common/formatters.js';
import { CART_PAYMENT_TYPES } from '../../cartConstants.js';
import { ewalletService } from '../../../ewallet/services/ewalletService.js';

const getCardSelectValue = (card) =>
  card?.id || card?.cardId || card?.number || card?.cardNumber || null;

/* ── Card brand detection (mirrors CreditCardVisual) ─────── */

const getCardBrand = (card) => {
  const raw = card.number || card.cardNumber || '';
  const first4 = raw.replace(/\s/g, '').slice(0, 4);
  if (first4.startsWith('4')) return 'VISA';
  if (/^5[1-5]/.test(first4) || /^2[2-7]/.test(first4)) return 'Mastercard';
  if (/^3[47]/.test(first4)) return 'AMEX';
  if (/^6/.test(first4)) return 'Discover';
  return 'CARD';
};

const formatMaskedNumber = (raw) => {
  if (!raw) return '•••• •••• •••• ••••';
  const cleaned = raw.replace(/\s/g, '');
  if (cleaned.length >= 16) {
    return `${cleaned.slice(0, 4)} •••• •••• ${cleaned.slice(-4)}`;
  }
  return `•••• •••• •••• ${cleaned.slice(-4)}`;
};

/* ── Mini credit card visual for checkout ────────────────── */

const CheckoutCardVisual = ({ card, isSelected, onSelect }) => {
  const brand = getCardBrand(card);
  const displayNumber = formatMaskedNumber(card.number || card.cardNumber || '');
  const expiry = `${String(card.expiryMonth || 'MM').padStart(2, '0')}/${card.expiryYear || 'YY'}`;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-black p-4 text-left text-white shadow-md transition-all duration-200 select-none ${
        isSelected
          ? 'ring-2 ring-[#1466c6] ring-offset-2'
          : 'opacity-75 hover:opacity-100 hover:shadow-lg'
      }`}
      style={{ minHeight: '120px' }}
    >
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/[0.06]" />
      <div className="pointer-events-none absolute -bottom-8 -left-4 h-28 w-28 rounded-full bg-white/[0.06]" />

      <div className="relative flex h-full flex-col justify-between gap-3">
        {/* Top row: chip + brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Chip */}
            <div className="flex h-5 w-7 items-center justify-center rounded border border-white/20 bg-white/10">
              <div className="grid h-3.5 w-4 grid-cols-2 gap-px rounded-sm border border-white/25 p-0.5">
                <div className="rounded-sm bg-white/40" />
                <div className="rounded-sm bg-white/40" />
                <div className="rounded-sm bg-white/40" />
                <div className="rounded-sm bg-white/40" />
              </div>
            </div>
            {card.cardLabel && (
              <span className="max-w-[100px] truncate text-[10px] font-medium tracking-wide text-white/60">
                {card.cardLabel}
              </span>
            )}
          </div>
          {/* Brand */}
          {brand === 'Mastercard' ? (
            <div className="flex items-center -space-x-1.5">
              <div className="h-4 w-4 rounded-full bg-red-500 opacity-90" />
              <div className="h-4 w-4 rounded-full bg-yellow-400 opacity-80" />
            </div>
          ) : (
            <span className="text-[11px] font-bold italic tracking-tight text-white/80">{brand}</span>
          )}
        </div>

        {/* Card number */}
        <p className="font-mono text-xs tracking-[0.18em] text-white/90">
          {displayNumber}
        </p>

        {/* Expiry */}
        <div>
          <p className="text-[8px] uppercase tracking-widest text-white/40">Expires</p>
          <p className="text-[11px] font-semibold text-white/90">{expiry}</p>
        </div>
      </div>
    </button>
  );
};

/* ── Mini bank account card for checkout ─────────────────── */

const CheckoutBankCard = ({ account, isSelected, onSelect }) => {
  const iban = account.IBAN || '';
  const holder = `${account.holderName || ''} ${account.holderSurname || ''}`.trim();
  const maskedIban = iban.length > 8
    ? `${iban.slice(0, 4)} •••• •••• ${iban.slice(-4)}`
    : iban;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
        isSelected
          ? 'border-[#1466c6] bg-[#fafcff] ring-2 ring-[#1466c6]/20'
          : 'border-[#e5e3df] bg-white opacity-75 hover:border-[#bcb6b0] hover:opacity-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          isSelected ? 'bg-[#1466c6]/10 text-[#1466c6]' : 'bg-[#f5f5f4] text-[#999]'
        }`}>
          <Banknote className="h-4 w-4" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#111]">{holder || 'Bank Account'}</p>
          <p className="mt-0.5 font-mono text-xs tracking-wider text-[#999]">{maskedIban}</p>
          {typeof account.balance !== 'undefined' && (
            <p className="mt-0.5 text-xs text-[#999]">Balance: {formatCurrency(account.balance)}</p>
          )}
        </div>
      </div>
    </button>
  );
};

const CheckoutPaymentStep = ({
  selectedPaymentType,
  setSelectedPaymentType,
  cards,
  selectedCardNumber,
  setSelectedCardNumber,
  bankAccounts,
  selectedBankAccountIban,
  setSelectedBankAccountIban,
  eWallet,
  calculateTotal,
  currency,
  onNext,
  onBack,
  sendVerificationCode,
  acceptedAgreements,
  onAgreementToggle,
  onRequiredAgreementsChange,
  areAllAgreementsAccepted,
}) => {
  const totalAmount = calculateTotal();
  const cur = currency || 'TRY';

  const [warningData, setWarningData] = useState(null);
  const [isCheckingWarning, setIsCheckingWarning] = useState(false);

  const canProceed = () => isPaymentMethodValid() && areAllAgreementsAccepted();

  const paymentMethods = [
    {
      id: CART_PAYMENT_TYPES.CREDIT_CARD,
      name: 'Credit / Debit Card',
      icon: CreditCard,
      sub: 'Pay with your saved card',
    },
    {
      id: CART_PAYMENT_TYPES.TRANSFER,
      name: 'Bank Transfer',
      icon: Banknote,
      sub: 'Pay from your bank account',
    },
    {
      id: CART_PAYMENT_TYPES.EWALLET,
      name: 'Wallet',
      icon: Wallet,
      sub: eWallet ? `Balance: ${formatCurrency(eWallet?.balance || 0, cur)}` : 'No wallet available',
    },
  ];

  const isPaymentMethodValid = () => {
    if (selectedPaymentType === CART_PAYMENT_TYPES.CREDIT_CARD) {
      return selectedCardNumber && cards?.length > 0;
    }
    if (selectedPaymentType === CART_PAYMENT_TYPES.TRANSFER) {
      return selectedBankAccountIban && bankAccounts?.length > 0;
    }
    if (selectedPaymentType === CART_PAYMENT_TYPES.EWALLET) {
      return eWallet && calculateTotal() <= eWallet.balance;
    }
    return false;
  };

  const handleNext = async () => {
    if (selectedPaymentType === CART_PAYMENT_TYPES.EWALLET) {
      if (calculateTotal() > eWallet.balance) return;

      if (!warningData) {
        try {
          setIsCheckingWarning(true);
          const res = await ewalletService.checkSpendingWarning(totalAmount);
          if (res && res.warningTriggered) {
            setWarningData(res);
            return;
          }
        } catch (e) {
          console.error('Failed to check spending warning', e);
        } finally {
          setIsCheckingWarning(false);
        }
      }
    }
    await sendVerificationCode();
    onNext();
  };

  const handleCancelWarning = () => {
    setWarningData(null);
  };

  const isEWalletDisabled = !eWallet || totalAmount > (eWallet?.balance || 0);

  /* ── Detail sub-panel (appears under selected method) ──── */

  const renderDetail = () => {
    if (selectedPaymentType === CART_PAYMENT_TYPES.CREDIT_CARD) {
      if (!cards || cards.length === 0) {
        return (
          <div className="mt-3 pl-9">
            <p className="text-xs text-[#999]">No saved cards. Add one from Payment Methods.</p>
          </div>
        );
      }
      return (
        <div className="mt-3 pl-9">
          <label className="mb-2 block text-xs font-medium text-[#555]">Select card</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {cards.map((card, index) => (
              <CheckoutCardVisual
                key={getCardSelectValue(card) || `card-${index}`}
                card={card}
                isSelected={selectedCardNumber === getCardSelectValue(card)}
                onSelect={() => setSelectedCardNumber(getCardSelectValue(card))}
              />
            ))}
          </div>
        </div>
      );
    }

    if (selectedPaymentType === CART_PAYMENT_TYPES.TRANSFER) {
      if (!bankAccounts || bankAccounts.length === 0) {
        return (
          <div className="mt-3 pl-9">
            <p className="text-xs text-[#999]">No bank accounts found.</p>
          </div>
        );
      }
      return (
        <div className="mt-3 pl-9">
          <label className="mb-2 block text-xs font-medium text-[#555]">Select account</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {bankAccounts.map((account, index) => (
              <CheckoutBankCard
                key={account.id || `account-${index}`}
                account={account}
                isSelected={selectedBankAccountIban === (account.IBAN || '')}
                onSelect={() => setSelectedBankAccountIban(account.IBAN || '')}
              />
            ))}
          </div>
        </div>
      );
    }

    if (selectedPaymentType === CART_PAYMENT_TYPES.EWALLET) {
      return (
        <div className="mt-3 space-y-2 pl-9 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-[#555]">Available</span>
            <span className="font-medium tabular-nums text-[#111]">
              {formatCurrency(eWallet?.balance || 0, cur)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#555]">Order total</span>
            <span className="font-medium tabular-nums text-[#111]">{formatCurrency(totalAmount, cur)}</span>
          </div>
          {totalAmount > (eWallet?.balance || 0) && (
            <div className="mt-2 rounded-lg border border-[#f5d5d5] bg-[#fdf7f7] px-3 py-2.5 text-xs text-[#a4262c]">
              Insufficient balance. Add funds or choose another method.
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-5 sm:p-7">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-[#111]">Payment</h2>
        <div className="text-sm font-semibold tabular-nums text-[#1466c6]">
          {formatCurrency(totalAmount, cur)}
        </div>
      </div>

      {/* Payment method list — vertical radio */}
      <div className="mb-5 space-y-2">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedPaymentType === method.id;
          const isDisabled = method.id === CART_PAYMENT_TYPES.EWALLET && isEWalletDisabled;

          return (
            <div key={method.id}>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all duration-150 ${
                  isDisabled
                    ? 'cursor-not-allowed border-[#e5e3df] bg-[#fafaf9] opacity-45'
                    : isSelected
                      ? 'border-l-[3px] border-l-[#1466c6] border-t-[#e5e3df] border-r-[#e5e3df] border-b-[#e5e3df] bg-[#fafcff]'
                      : 'border-[#e5e3df] bg-white hover:border-[#bcb6b0]'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={isSelected}
                  onChange={(e) => {
                    setSelectedPaymentType(e.target.value);
                    setWarningData(null);
                  }}
                  disabled={isDisabled}
                  className="sr-only"
                />

                {/* Radio indicator */}
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    isSelected ? 'border-[#1466c6]' : 'border-[#ccc]'
                  }`}
                >
                  {isSelected && <span className="h-2 w-2 rounded-full bg-[#1466c6]" />}
                </span>

                <Icon className={`h-5 w-5 shrink-0 ${isSelected ? 'text-[#1466c6]' : 'text-[#999]'}`} strokeWidth={1.5} />

                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-medium ${isSelected ? 'text-[#111]' : 'text-[#555]'}`}>
                    {method.name}
                  </div>
                  <div className="text-xs text-[#999]">{method.sub}</div>
                </div>
              </label>

              {/* Detail sub-section (card/account/wallet selector) */}
              {isSelected && renderDetail()}
            </div>
          );
        })}
      </div>

      {/* Agreements */}
      <div className="mb-5 rounded-lg border border-[#e5e3df] bg-[#fafaf9] p-4">
        <PaymentAgreementsSection
          acceptedAgreements={acceptedAgreements}
          onToggle={onAgreementToggle}
          onRequiredAgreementsChange={onRequiredAgreementsChange}
        />
      </div>

      {/* Spending warning */}
      {warningData ? (
        <div className="mt-4 rounded-lg border border-[#f0dbb8] bg-[#fffdf7] p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#ca5010]" />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[#111]">Spending limit warning</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#555]">
                With this order, monthly spending reaches{' '}
                <strong>{formatCurrency(warningData.projectedSpending, cur)}</strong> (
                {warningData.usagePercentage.toFixed(1)}% of your{' '}
                {formatCurrency(warningData.warningLimit, cur)} threshold).
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCancelWarning}
                  className="rounded-lg border border-[#e5e3df] bg-white px-3 py-1.5 text-xs font-medium text-[#111] transition hover:bg-[#fafaf9]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-lg border border-[#1466c6] bg-[#1466c6] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#0f529e]"
                >
                  Continue anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Navigation — desktop */}
          <div className="hidden items-center justify-between border-t border-[#f0efed] pt-5 sm:flex">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-medium text-[#555] transition-colors hover:text-[#111]"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              Back
            </button>
            <div className="flex items-center gap-3">
              {!canProceed() && (
                <p className="max-w-[220px] text-right text-xs text-[#999]">
                  {!isPaymentMethodValid() ? 'Select a payment method' : 'Accept agreements to continue'}
                </p>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed() || isCheckingWarning}
                className="inline-flex min-w-[200px] items-center justify-center gap-2 rounded-lg border border-[#1466c6] bg-[#1466c6] px-6 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-[#0f529e] disabled:cursor-not-allowed disabled:border-[#e8e6e4] disabled:bg-[#e8e6e4] disabled:text-[#9c9894] active:scale-[0.99]"
              >
                {isCheckingWarning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking…
                  </>
                ) : (
                  <>
                    Send verification code
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Navigation — mobile */}
          <div className="sticky bottom-0 -mx-5 mt-4 grid grid-cols-2 gap-2 border-t border-[#f0efed] bg-white px-5 py-4 sm:hidden">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-[#e5e3df] bg-white py-3 text-sm font-medium text-[#111] transition-all hover:bg-[#fafaf9]"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed() || isCheckingWarning}
              className="flex items-center justify-center gap-2 rounded-lg border border-[#1466c6] bg-[#1466c6] py-3 text-sm font-medium text-white transition-all hover:bg-[#0f529e] disabled:border-[#e8e6e4] disabled:bg-[#e8e6e4] disabled:text-[#9c9894]"
            >
              {isCheckingWarning ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send code'}
            </button>
          </div>
          {!canProceed() && (
            <p className="mt-2 text-center text-xs text-[#999] sm:hidden">
              {!isPaymentMethodValid() ? 'Select a payment method' : 'Accept agreements to continue'}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default CheckoutPaymentStep;
