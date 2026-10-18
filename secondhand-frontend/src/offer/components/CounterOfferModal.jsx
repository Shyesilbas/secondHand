import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from 'react';
import { Button, Modal } from '../../common/components/ui/index.js';
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

 return <Modal isOpen={isOpen} onClose={onClose} title={t("counter_offer")} size="md" footer={<>
 <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>{t("cancel")}</Button>
 <Button type="submit" form="counter-offer-form" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : 'Send counter offer'}</Button>
 </>}>
 <p className="mb-4 text-sm text-text-secondary">{listingTitle}</p>
 <form id="counter-offer-form" onSubmit={handleSubmit} noValidate className="space-y-4">
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 <div>
 <label htmlFor="counter-qty" className="mb-1 block text-sm font-medium text-text-primary">{t("quantity")}</label>
 <input id="counter-qty" type="number" min={1} value={quantity} onChange={e => setQuantity(e.target.value)} className="h-10 tabular-nums w-full rounded border border-border bg-background-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus" />
 </div>
 <div>
 <label htmlFor="counter-total" className="mb-1 block text-sm font-medium text-text-primary">{t("total_price")}</label>
 <input id="counter-total" type="number" min={0} step="0.01" value={totalPrice} onChange={e => setTotalPrice(e.target.value)} className="h-10 tabular-nums w-full rounded border border-border bg-background-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus" />
 </div>
 </div>
 <p className="text-sm text-text-secondary">{t("countering_for")}<span className="font-medium tabular-nums text-text-primary"> {Number(quantity) || 1} </span>{t("item_s")}{previewTotal != null && <>
 {' '}{t("total")}<span className="font-medium tabular-nums text-text-primary"> {formatCurrency(previewTotal, currency)}</span>
 </>}
 </p>
 {error && <p role="alert" className="text-sm text-status-error-text">{error}</p>}
 </form>
 </Modal>;
};

export default CounterOfferModal;
