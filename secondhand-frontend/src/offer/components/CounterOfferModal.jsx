import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { offerService } from '../services/offerService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { formatCurrency } from '../../common/formatters.js';
import { OFFER_DEFAULTS, OFFER_MESSAGES } from '../offerConstants.js';
import { getOfferErrorMessage } from '../utils/offerError.js';

const CounterOfferModal = ({
  isOpen,
  onClose,
  offer,
  onSuccess
}) => {
  const {
    t
  } = useTranslation();
  const notification = useNotification();
  const [quantity, setQuantity] = useState(OFFER_DEFAULTS.MIN_QUANTITY);
  const [totalPrice, setTotalPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setQuantity(Number(offer?.quantity) || OFFER_DEFAULTS.MIN_QUANTITY);
    setTotalPrice(offer?.totalPrice != null ? String(offer.totalPrice) : '');
    setError(null);
  }, [isOpen, offer]);

  const currency = offer?.currency || offer?.listingCurrency || OFFER_DEFAULTS.FALLBACK_CURRENCY;
  const listingTitle = offer?.listingTitle || OFFER_DEFAULTS.FALLBACK_LISTING_TITLE;

  const previewTotal = useMemo(() => {
    const n = Number(totalPrice);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  }, [totalPrice]);

  if (!isOpen) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    const q = Number(quantity);
    const t = Number(totalPrice);

    if (!offer?.id) {
      setError(OFFER_MESSAGES.OFFER_NOT_FOUND);
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
      await offerService.counter(offer.id, {
        quantity: q,
        totalPrice: t
      });
      notification?.showSuccess(OFFER_MESSAGES.SUCCESS_TITLE, OFFER_MESSAGES.COUNTER_SENT);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      const msg = getOfferErrorMessage(err, OFFER_MESSAGES.COUNTER_FAILED);
      setError(msg);
      notification?.showError(OFFER_MESSAGES.ERROR_TITLE, msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modal = <div className="fixed inset-0 z-[120] bg-black/50 flex items-center justify-center px-4" onMouseDown={e => {
    if (e.target === e.currentTarget) onClose?.();
  }}>
      <div className="w-full max-w-lg bg-card-bg rounded-xl shadow-md border border-border-light overflow-hidden">
        <div className="px-6 py-4 border-b border-border-light bg-background-secondary flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-text-primary">{t("counter_offer")}</div>
            <div className="text-sm text-text-muted">{listingTitle}</div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-background-tertiary text-text-secondary transition-colors" aria-label={t("close")}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">{t("quantity")}</label>
              <input type="number" min={1} value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border border-border-light bg-background-secondary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">{t("total_price")}</label>
              <input type="number" min={0} step="0.01" value={totalPrice} onChange={e => setTotalPrice(e.target.value)} className="w-full border border-border-light bg-background-secondary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
          </div>

          <div className="rounded-lg border border-border-light bg-background-secondary px-4 py-3">
            <div className="text-xs text-text-secondary">{t("countering_for")}<span className="font-semibold text-text-primary"> {Number(quantity) || 1} </span>{t("item_s")}{previewTotal != null && <>
                  {' '}{t("total")}<span className="font-semibold text-text-primary"> {formatCurrency(previewTotal, currency)}</span>
                </>}
            </div>
          </div>

          {error && <div className="text-sm text-status-error font-semibold">{error}</div>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border-light text-text-secondary font-semibold hover:bg-background-secondary transition-colors" disabled={isSubmitting}>{t("cancel")}</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition-colors disabled:opacity-60" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send Counter'}
            </button>
          </div>
        </form>
      </div>
    </div>;

  return ReactDOM.createPortal(modal, document.body);
};

export default CounterOfferModal;