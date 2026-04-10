import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { offerService } from '../services/offerService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { formatCurrency } from '../../common/formatters.js';
import { OFFER_DEFAULTS, OFFER_MESSAGES } from '../offerConstants.js';
import { getOfferErrorMessage } from '../utils/offerError.js';

/** İki ondalık; input ve API ile uyumlu */
const roundMoney = (n) => {
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
};

const formatForPriceInput = (n) => {
  const r = roundMoney(n);
  if (r == null) return '';
  return String(r);
};

const MakeOfferModal = ({ isOpen, onClose, listing }) => {
  const notification = useNotification();
  const [quantity, setQuantity] = useState(OFFER_DEFAULTS.MIN_QUANTITY);
  const [totalPrice, setTotalPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setQuantity(OFFER_DEFAULTS.MIN_QUANTITY);
    setTotalPrice('');
    setError(null);
    setSelectedPreset(null);
  }, [isOpen]);

  const listingTitle = listing?.title || OFFER_DEFAULTS.FALLBACK_LISTING_TITLE;
  const currency = listing?.currency || OFFER_DEFAULTS.FALLBACK_CURRENCY;
  const listingUnitPrice = listing?.price != null ? Number(listing.price) : null;

  const qtyNum = useMemo(() => {
    const q = Number(quantity);
    return Number.isFinite(q) && q >= OFFER_DEFAULTS.MIN_QUANTITY ? q : OFFER_DEFAULTS.MIN_QUANTITY;
  }, [quantity]);

  const listTotal = useMemo(() => {
    if (listingUnitPrice == null || !Number.isFinite(listingUnitPrice) || listingUnitPrice <= 0) return null;
    return roundMoney(listingUnitPrice * qtyNum);
  }, [listingUnitPrice, qtyNum]);

  const recommendedOffers = useMemo(() => {
    if (listTotal == null || listTotal <= 0) return [];
    return [
      {
        key: 'pct5',
        discountPct: 5,
        title: '5% below list',
        hint: 'Balanced',
        amount: roundMoney(listTotal * 0.95),
      },
      {
        key: 'pct10',
        discountPct: 10,
        title: '10% below list',
        hint: 'Firmer ask',
        amount: roundMoney(listTotal * 0.9),
      },
    ].filter((r) => r.amount != null && r.amount > 0);
  }, [listTotal]);

  const previewTotal = useMemo(() => {
    const n = Number(totalPrice);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  }, [totalPrice]);

  const applyPreset = (presetKey, amount) => {
    setSelectedPreset(presetKey);
    setTotalPrice(formatForPriceInput(amount));
    setError(null);
  };

  const handleTotalChange = (e) => {
    setSelectedPreset(null);
    setTotalPrice(e.target.value);
  };

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
    setSelectedPreset(null);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    const q = Number(quantity);
    const t = Number(totalPrice);

    if (!listing?.id) {
      setError(OFFER_MESSAGES.LISTING_NOT_FOUND);
      return;
    }
    if (!Number.isFinite(q) || q < OFFER_DEFAULTS.MIN_QUANTITY) {
      setError(OFFER_MESSAGES.INVALID_QUANTITY);
      return;
    }
    if (!Number.isFinite(t) || t <= OFFER_DEFAULTS.MIN_TOTAL_PRICE_EXCLUSIVE) {
      setError(OFFER_MESSAGES.INVALID_TOTAL_PRICE);
      return;
    }

    setIsSubmitting(true);
    try {
      await offerService.create({
        listingId: listing.id,
        quantity: q,
        totalPrice: t,
      });
      notification?.showSuccess(OFFER_MESSAGES.SUCCESS_TITLE, OFFER_MESSAGES.OFFER_SENT);
      onClose?.();
    } catch (err) {
      const msg = getOfferErrorMessage(err, OFFER_MESSAGES.SEND_FAILED);
      setError(msg);
      notification?.showError(OFFER_MESSAGES.ERROR_TITLE, msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/15 ring-1 ring-slate-950/5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="make-offer-title"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
          <div className="min-w-0 border-l-[3px] border-teal-700 pl-3">
            <h2 id="make-offer-title" className="text-lg font-semibold tracking-tight text-slate-900">
              Make offer
            </h2>
            <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{listingTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="offer-qty" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Quantity
              </label>
              <input
                id="offer-qty"
                type="number"
                min={1}
                value={quantity}
                onChange={handleQuantityChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              />
            </div>
            <div>
              <label htmlFor="offer-total" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total offer price
              </label>
              <input
                id="offer-total"
                type="number"
                min={0}
                step="0.01"
                value={totalPrice}
                onChange={handleTotalChange}
                placeholder="Enter amount"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              />
            </div>
          </div>

          {recommendedOffers.length > 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recommended offer</span>
                {listTotal != null ? (
                  <span className="text-xs text-slate-500">
                    List total ({qtyNum} × unit):{' '}
                    <span className="font-semibold text-slate-800">{formatCurrency(listTotal, currency)}</span>
                  </span>
                ) : null}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {recommendedOffers.map((rec) => {
                  const active = selectedPreset === rec.key;
                  const saveVsList = listTotal != null ? roundMoney(listTotal - rec.amount) : null;
                  return (
                    <button
                      key={rec.key}
                      type="button"
                      onClick={() => applyPreset(rec.key, rec.amount)}
                      className={`flex flex-col rounded-xl border px-4 py-3 text-left transition ${
                        active
                          ? 'border-teal-600 bg-teal-50/90 ring-1 ring-teal-600/25'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{rec.title}</span>
                      <span className="mt-1 font-mono text-lg font-bold tabular-nums text-slate-900">
                        {formatCurrency(rec.amount, currency)}
                      </span>
                      <span className="mt-1 text-xs text-slate-500">
                        {rec.hint}
                        {saveVsList != null && saveVsList > 0 ? (
                          <span className="text-teal-800"> · Save {formatCurrency(saveVsList, currency)}</span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                Each option fills your offer with a total 5% or 10% below the list total for this quantity. You can still
                edit the field.
              </p>
            </div>
          ) : listingUnitPrice == null ? (
            <p className="rounded-xl border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-xs text-amber-900">
              List price unavailable — enter your total offer manually.
            </p>
          ) : null}

          <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-950/5">
            <p className="text-xs leading-relaxed text-slate-600">
              Offering for <span className="font-semibold text-slate-900">{qtyNum}</span> item(s).
              {previewTotal != null && (
                <>
                  {' '}
                  Your total: <span className="font-semibold text-slate-900">{formatCurrency(previewTotal, currency)}</span>
                </>
              )}
              {listingUnitPrice != null && (
                <>
                  {' '}
                  · Unit on listing:{' '}
                  <span className="font-semibold text-slate-900">{formatCurrency(listingUnitPrice, currency)}</span>
                </>
              )}
            </p>
          </div>

          {error ? <div className="text-sm font-medium text-red-700">{error}</div> : null}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending…' : 'Send offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default MakeOfferModal;
