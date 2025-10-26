import React, { useState, useEffect } from 'react';
import { usePaymentMethods } from '../../payments/hooks/usePaymentMethods.js';
import { useEWallet } from '../../ewallet/hooks/useEWallet.js';
import PaymentSelectionStep from '../../cart/components/checkout/PaymentSelectionStep.jsx';
import { orderService } from '../../order/services/orderService.js';
import { useEmails } from '../../payments/hooks/useEmails.js';
import { showcaseService } from '../services/showcaseService.js';

const ShowcasePayment = ({ 
  listingId, 
  listingTitle, 
  days, 
  totalCost, 
  showcasePricing,
  calculateSubtotal,
  calculateTax,
  onSuccess,
  onClose 
}) => {
  const [step, setStep] = useState(1);
  const [paymentType, setPaymentType] = useState('CREDIT_CARD');
  const [selectedCardNumber, setSelectedCardNumber] = useState(null);
  const [selectedBankAccountIban, setSelectedBankAccountIban] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  const { emails, isLoading: isEmailsLoading, fetchEmails } = useEmails();
  const { paymentMethods, isLoading: isPaymentLoading, refetch } = usePaymentMethods();
  const { eWallet, loading: isEWalletLoading, refreshWallet } = useEWallet();

  useEffect(() => {
    refetch();
    refreshWallet();
  }, []);

  useEffect(() => {
    if (paymentType === 'CREDIT_CARD' && paymentMethods.creditCards.length > 0) {
      setSelectedCardNumber(paymentMethods.creditCards[0].number || paymentMethods.creditCards[0].cardNumber);
    }
    if (paymentType === 'TRANSFER' && paymentMethods.bankAccounts.length > 0) {
      setSelectedBankAccountIban(paymentMethods.bankAccounts[0].IBAN);
    }
  }, [paymentType, paymentMethods]);

  const handlePayment = async () => {
    if (!listingId) {
      setError('Listing Information not found. Please Try Again');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await showcaseService.createShowcase(listingId, days, paymentType, verificationCode);
      setSuccess(true);
      try { window.dispatchEvent(new Event('showcases:refresh')); } catch {}
      onSuccess?.();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const proceedToPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      await orderService.initiatePaymentVerification({
        transactionType: 'SHOWCASE_PAYMENT',
        listingId,
        days,
        amount: totalCost
      });
      await fetchEmails();
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <PaymentSelectionStep
            selectedPaymentType={paymentType}
            setSelectedPaymentType={setPaymentType}
            cards={paymentMethods.creditCards}
            selectedCardNumber={selectedCardNumber}
            setSelectedCardNumber={setSelectedCardNumber}
            bankAccounts={paymentMethods.bankAccounts}
            selectedBankAccountIban={selectedBankAccountIban}
            setSelectedBankAccountIban={setSelectedBankAccountIban}
            eWallet={eWallet}
            calculateTotal={() => totalCost}
          />
        );
      case 2:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">Summary</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="font-medium">Listing:</span>
                <span>{listingTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Day:</span>
                <span>{days}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Payment Method:</span>
                <span>{paymentType === 'CREDIT_CARD' ? 'Credit Card' : paymentType === 'TRANSFER' ? 'Bank Wire' : 'eWallet'}</span>
              </div>
            </div>
            {showcasePricing ? (
              <div className="p-3 bg-gray-50 rounded mb-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({days} days):</span>
                  <span>{calculateSubtotal().toFixed(2)}₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax ({showcasePricing.taxPercentage}%):</span>
                  <span>{calculateTax().toFixed(2)}₺</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-emerald-600">{totalCost.toFixed(2)}₺</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between p-3 bg-gray-50 rounded mb-2">
                <span className="font-bold text-lg">Total:</span>
                <span className="text-xl font-bold text-emerald-600">{totalCost}₺</span>
              </div>
            )}
            {error && <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
            <button
              className="w-full py-2 mt-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
              onClick={proceedToPayment}
              disabled={loading}
            >
              {loading ? 'Sending Code…' : 'Proceed to Payment'}
            </button>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">Verification</h3>
            <div className="mb-3">
              <label className="block text-sm text-gray-700 mb-1">Verification Code</label>
              <input
                type="text"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                placeholder="Enter the code sent to your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="mb-4">
              <button
                className="w-full py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
                onClick={handlePayment}
                disabled={loading || !verificationCode}
              >
                {loading ? 'Processing…' : 'Finish Payment'}
              </button>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-gray-700">Emails</h5>
                <button className="text-emerald-600 text-sm underline" onClick={fetchEmails}>Refresh</button>
              </div>
              <div className="max-h-48 overflow-auto border rounded p-2 bg-gray-50">
                {isEmailsLoading ? (
                  <div className="text-sm text-gray-500">Loading emails…</div>
                ) : (emails && emails.length > 0 ? (
                  emails.map((e, idx) => (
                    <div key={idx} className="mb-2 p-2 bg-white rounded border">
                      <div className="text-xs text-gray-500">{e.sentAt || e.createdAt}</div>
                      <div className="text-sm font-medium">{e.subject || 'Verification Code'}</div>
                      <div className="text-sm whitespace-pre-wrap">{e.body || e.content}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No emails found.</div>
                ))}
              </div>
            </div>
            {success && <div className="mt-3 text-green-700 text-center font-semibold">Successfully added to showcase!</div>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-6">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`h-2 flex-1 rounded ${step >= s ? 'bg-emerald-600' : 'bg-gray-200'}`}
          />
        ))}
      </div>
      {renderStepContent()}
      <div className="flex items-center justify-between mt-6">
        <button
          className="px-4 py-2 border rounded"
          onClick={() => step > 1 ? setStep(step - 1) : onClose}
          disabled={loading}
        >
          {step > 1 ? 'Back' : 'Cancel'}
        </button>
        {step < 3 && (
          <button
            className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
            onClick={() => setStep(step + 1)}
            disabled={
              (step === 1 && (
                !paymentType ||
                (paymentType === 'CREDIT_CARD' && paymentMethods.creditCards.length > 0 && !selectedCardNumber) ||
                (paymentType === 'TRANSFER' && paymentMethods.bankAccounts.length > 0 && !selectedBankAccountIban) ||
                (paymentType === 'EWALLET' && !eWallet)
              )) ||
              loading
            }
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default ShowcasePayment;
