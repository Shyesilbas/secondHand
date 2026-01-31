import React, { useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '../../common/formatters.js';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';

const formatPrice = (price, currency = 'TRY') =>
  formatCurrency(price, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const PaymentMethodsLoading = () => (
  <div className="flex items-center justify-center py-4">
    <LoadingIndicator size="h-6 w-6" />
    <span className="ml-2 text-text-secondary">Loading...</span>
  </div>
);

const EmptyPaymentMethod = ({ message, actionLabel, onAction }) => (
  <div className="text-center py-4 border border-dashed border-header-border rounded-lg">
    <p className="text-text-muted">{message}</p>
    <button
      onClick={onAction}
      className="mt-2 text-btn-primary hover:text-blue-700 text-sm"
    >
      {actionLabel}
    </button>
  </div>
);

const CreditCardPaymentMethods = ({ creditCards, onAdd }) => {
  if (!Array.isArray(creditCards) || creditCards.length === 0) {
    return (
      <EmptyPaymentMethod
        message="No saved credit cards yet."
        actionLabel="Add Credit Card"
        onAction={onAdd}
      />
    );
  }

  return (
    <div className="space-y-3">
      {creditCards.map((card, index) => {
        const limit = toNumber(card?.limit);
        const used = toNumber(card?.amount);
        const available = limit - used;
        return (
          <div key={index} className="border rounded-lg p-3 bg-app-bg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-primary">{card?.number}</p>
                <p className="text-sm text-text-secondary">
                  {card?.expiryMonth}/{card?.expiryYear}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary">
                  {formatCurrency(available, 'TRY')}
                </p>
                <p className="text-xs text-text-muted">Available Limit</p>
                <p className="text-xs text-text-muted">
                  Total: {formatCurrency(limit, 'TRY')} | Used: {formatCurrency(used, 'TRY')}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TransferPaymentMethods = ({ bankAccounts, onAdd }) => {
  if (!Array.isArray(bankAccounts) || bankAccounts.length === 0) {
    return (
      <EmptyPaymentMethod
        message="No saved bank accounts yet."
        actionLabel="Add Bank Account"
        onAction={onAdd}
      />
    );
  }

  return (
    <div className="space-y-3">
      {bankAccounts.map((account, index) => (
        <div key={index} className="border rounded-lg p-3 bg-app-bg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">
                {account?.holderName} {account?.holderSurname}
              </p>
              <p className="text-sm text-text-secondary">{account?.IBAN}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-text-primary">
                {formatCurrency(toNumber(account?.balance), 'TRY')}
              </p>
              <p className="text-xs text-text-muted">Balance</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const EWalletPaymentMethod = ({ eWallet, feeConfig }) => {
  if (!eWallet) {
    return (
      <div className="text-center py-4 border border-dashed border-header-border rounded-lg">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
        <p className="text-text-muted mb-2">eWallet not found</p>
        <p className="text-sm text-text-muted">You need to create an eWallet first to use this payment method.</p>
      </div>
    );
  }

  const balance = toNumber(eWallet?.balance);
  const totalFee = toNumber(feeConfig?.totalCreationFee);
  const hasSufficientBalance = balance >= totalFee;

  return (
    <div className="space-y-3">
      <div className={`border rounded-lg p-4 ${hasSufficientBalance ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${hasSufficientBalance ? 'bg-green-100' : 'bg-red-100'}`}>
              <svg className={`w-6 h-6 ${hasSufficientBalance ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">eWallet</p>
              <p className="text-sm text-gray-600">Digital Wallet</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              {formatPrice(balance, 'TRY')}
            </p>
            <p className={`text-sm ${hasSufficientBalance ? 'text-green-600' : 'text-red-600'}`}>
              {hasSufficientBalance ? 'Sufficient Balance' : 'Insufficient Balance'}
            </p>
          </div>
        </div>
        {!hasSufficientBalance && (
          <div className="mt-3 p-2 bg-red-100 rounded border border-red-200">
            <p className="text-sm text-red-800">
              You need {formatPrice(totalFee - balance, 'TRY')} more to complete this payment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const PaymentMethodDetails = ({
  paymentType,
  paymentMethods,
  isLoadingPaymentMethods,
  eWallet,
  feeConfig,
  onNavigateToPaymentMethods,
}) => {
  if (isLoadingPaymentMethods) {
    return <PaymentMethodsLoading />;
  }

  const creditCards = paymentMethods?.creditCards ?? [];
  const bankAccounts = paymentMethods?.bankAccounts ?? [];

  if (paymentType === 'CREDIT_CARD') {
    return <CreditCardPaymentMethods creditCards={creditCards} onAdd={() => onNavigateToPaymentMethods('CREDIT_CARD')} />;
  }
  if (paymentType === 'TRANSFER') {
    return <TransferPaymentMethods bankAccounts={bankAccounts} onAdd={() => onNavigateToPaymentMethods('TRANSFER')} />;
  }
  if (paymentType === 'EWALLET') {
    return <EWalletPaymentMethod eWallet={eWallet} feeConfig={feeConfig} />;
  }
  return null;
};

const canProceedWithPaymentMethod = ({ paymentType, paymentMethods, isLoadingPaymentMethods, eWallet, feeConfig }) => {
  if (isLoadingPaymentMethods) return false;

  const creditCards = paymentMethods?.creditCards ?? [];
  const bankAccounts = paymentMethods?.bankAccounts ?? [];

  if (paymentType === 'CREDIT_CARD') return creditCards.length > 0;
  if (paymentType === 'TRANSFER') return bankAccounts.length > 0;
  if (paymentType === 'EWALLET') return !!eWallet && toNumber(eWallet.balance) >= toNumber(feeConfig?.totalCreationFee);
  return false;
};

const typeBadgeStyles = {
  PAYMENT_VERIFICATION: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  WELCOME: 'bg-green-100 text-green-800 ring-green-200',
  PAYMENT_SUCCESS: 'bg-blue-100 text-blue-800 ring-blue-200',
};

const getTypeBadgeClass = (type) => typeBadgeStyles[type] || 'bg-gray-100 text-text-secondary ring-gray-200';

const extractVerificationCode = (email) => {
  if (email?.emailType !== 'PAYMENT_VERIFICATION') return null;
  const match = (email.content || '').match(/\b\d{6}\b/);
  return match ? match[0] : null;
};

const formatEmailDate = (date) => {
  try {
    return new Date(date).toLocaleString('en-US');
  } catch (e) {
    return String(date || '');
  }
};

const PaymentVerificationModal = ({
  isOpen,
  selectedListing,
  feeConfig,
  paymentType,
  paymentMethods,
  isLoadingPaymentMethods,
  eWallet,
  onStartVerification,
  onVerifyAndPay,
  onCancel,
  isProcessing,
  verificationCode,
  onChangeVerificationCode,
  codeExpiryTime,
  countdown,
  onResendCode,
  isResendingCode,
  emails,
  isEmailsLoading,
  onFetchEmails,
  onClearEmails,
  onNavigateToPaymentMethods,
}) => {
  const [step, setStep] = useState('REVIEW');
  const [showEmailHistory, setShowEmailHistory] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStep('REVIEW');
    setShowEmailHistory(false);
  }, [isOpen]);

  const verificationEmails = useMemo(() => {
    const list = Array.isArray(emails) ? emails : [];
    return list.filter((e) => e?.emailType === 'PAYMENT_VERIFICATION').slice(0, 3);
  }, [emails]);

  const canStartPayment = canProceedWithPaymentMethod({
    paymentType,
    paymentMethods,
    isLoadingPaymentMethods,
    eWallet,
    feeConfig,
  });

  const openEmailHistory = async () => {
    setShowEmailHistory(true);
    try {
      await onFetchEmails?.();
    } catch {}
  };

  const handleClose = () => {
    setShowEmailHistory(false);
    onClearEmails?.();
    onCancel?.();
  };

  const handleStart = async () => {
    const ok = await onStartVerification?.();
    if (!ok) return;
    setStep('VERIFY');
    try {
      await onFetchEmails?.();
    } catch {}
  };

  const handleVerify = async () => {
    const ok = await onVerifyAndPay?.();
    if (!ok) return;
    setShowEmailHistory(false);
    onClearEmails?.();
  };

  const handleResend = async () => {
    await onResendCode?.();
    try {
      await onFetchEmails?.();
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xl">
      <div className="w-full max-w-3xl mx-4 overflow-hidden rounded-[2.5rem] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.38)] animate-in fade-in zoom-in-95">
        <div className="px-6 py-5 border-b border-slate-100 bg-white/70">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
              {step === 'REVIEW' ? 'Payment Confirmation' : 'Verification'}
            </h3>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="mb-5 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-slate-50 to-slate-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-indigo-700/70">Listing</p>
                <p className="text-sm font-medium tracking-tight text-slate-900">{selectedListing?.title}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-indigo-700/70">Amount</p>
                <p className="font-mono text-sm font-semibold tracking-tight text-slate-900">
                  {feeConfig ? formatPrice(feeConfig.totalCreationFee) : ''}
                </p>
              </div>
            </div>
          </div>

          {step === 'REVIEW' ? (
            <div className="mb-6">
              <p className="mb-3 text-sm font-medium text-slate-700">Payment Method</p>
              <PaymentMethodDetails
                paymentType={paymentType}
                paymentMethods={paymentMethods}
                isLoadingPaymentMethods={isLoadingPaymentMethods}
                eWallet={eWallet}
                feeConfig={feeConfig}
                onNavigateToPaymentMethods={onNavigateToPaymentMethods}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Verification Code</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      onChangeVerificationCode?.(value);
                    }}
                    className="flex-1 rounded-2xl border border-slate-300 px-3 py-2 text-center font-mono text-lg tracking-[0.3em] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="6-digit code"
                    maxLength={6}
                  />
                  <button
                    onClick={handleResend}
                    disabled={isResendingCode}
                    className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {isResendingCode ? 'Sending...' : 'Resend Code'}
                  </button>
                </div>
                {codeExpiryTime && (
                  <div className="text-xs text-slate-500">
                    Expires in: {countdown || ''}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <button
                    onClick={openEmailHistory}
                    className="text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    {showEmailHistory ? 'Refresh emails' : 'Show emails'}
                  </button>
                  {isEmailsLoading ? (
                    <span className="text-xs text-slate-500">Loading...</span>
                  ) : null}
                </div>
              </div>

              {showEmailHistory ? (
                <div className="rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h4 className="text-sm font-semibold text-slate-900">Email History</h4>
                    <button
                      onClick={() => setShowEmailHistory(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="max-h-[40vh] overflow-y-auto p-4 space-y-4">
                    {verificationEmails.length === 0 ? (
                      <div className="rounded-xl border border-dashed p-4 text-sm text-slate-600 bg-slate-50">
                        No verification emails found yet.
                      </div>
                    ) : (
                      verificationEmails.map((email, index) => {
                        const code = extractVerificationCode(email);
                        return (
                          <div key={index} className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="px-4 py-3 border-b flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${getTypeBadgeClass(email.emailType)}`}>
                                    {email.emailType}
                                  </span>
                                  <span className="text-xs text-text-muted">
                                    {formatEmailDate(email.createdAt || email.sentAt)}
                                  </span>
                                </div>
                                <h5 className="mt-1 truncate text-sm font-semibold text-text-primary">{email.subject}</h5>
                              </div>
                              <div className="flex items-center gap-2">
                                {code ? (
                                  <button
                                    onClick={() => onChangeVerificationCode?.(code)}
                                    className="flex items-center gap-1 rounded-lg bg-yellow-50 px-2 py-1 text-xs font-mono text-yellow-800 ring-1 ring-yellow-200"
                                  >
                                    <span>Code:</span>
                                    <span>{code}</span>
                                  </button>
                                ) : null}
                                <button
                                  onClick={async () => {
                                    try { await navigator.clipboard.writeText(email.content || ''); } catch {}
                                  }}
                                  className="rounded-lg border px-2 py-1 text-xs text-text-secondary hover:bg-app-bg"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="rounded-lg bg-app-bg p-3 text-sm font-mono text-gray-800 border" style={{ whiteSpace: 'pre-wrap' }}>
                                {email.content}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <button onClick={handleClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-white">
            Cancel
          </button>
          {step === 'REVIEW' ? (
            <button
              onClick={handleStart}
              disabled={!canStartPayment || isProcessing}
              className="ml-auto rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold tracking-tight text-white shadow-md hover:bg-slate-800 disabled:opacity-60"
            >
              {isProcessing ? 'Processing...' : 'Start Payment'}
            </button>
          ) : (
            <button
              onClick={handleVerify}
              disabled={isProcessing || (verificationCode || '').length !== 6}
              className="ml-auto rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold tracking-tight text-white shadow-md hover:bg-emerald-700 disabled:opacity-60"
            >
              {isProcessing ? 'Verifying...' : 'Verify & Pay'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentVerificationModal;

