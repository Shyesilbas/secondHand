import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { offerService } from '../services/offerService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { formatCurrency } from '../../common/formatters.js';

const MakeOfferModal = ({ isOpen, onClose, listing }) => {
  const notification = useNotification();
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setQuantity(1);
    setTotalPrice('');
    setError(null);
  }, [isOpen]);

  const listingTitle = listing?.title || 'Listing';
  const currency = listing?.currency || 'TRY';

  const previewTotal = useMemo(() => {
    const n = Number(totalPrice);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  }, [totalPrice]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    const q = Number(quantity);
    const t = Number(totalPrice);

    if (!listing?.id) {
      setError('Listing not found');
      return;
    }
    if (!Number.isFinite(q) || q < 1) {
      setError('Quantity must be at least 1');
      return;
    }
    if (!Number.isFinite(t) || t <= 0) {
      setError('Total price must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await offerService.create({
        listingId: listing.id,
        quantity: q,
        totalPrice: t,
      });
      notification?.showSuccess('Successful', 'Offer sent');
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send offer';
      setError(msg);
      notification?.showError('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-[120] bg-black/40 flex items-center justify-center px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">Make Offer</div>
            <div className="text-sm text-gray-600">{listingTitle}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-700"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Total Offer Price</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="text-xs text-gray-600">
              You’re offering for <span className="font-semibold text-gray-900">{Number(quantity) || 1}</span> item(s).
              {previewTotal != null && (
                <>
                  {' '}Total offer: <span className="font-semibold text-gray-900">{formatCurrency(previewTotal, currency)}</span>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 font-semibold">{error}</div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending…' : 'Send Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default MakeOfferModal;

