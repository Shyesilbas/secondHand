import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from 'react';
import { Button, Modal } from '../../common/components/ui/index.js';
import { offerService } from '../services/offerService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { formatCurrency } from '../../common/formatters.js';
import { OFFER_DEFAULTS, OFFER_MESSAGES } from '../offerConstants.js';
import { getOfferErrorMessage } from '../utils/offerError.js';

/** İki ondalık; input ve API ile uyumlu */
const roundMoney = n => {
 if (!Number.isFinite(n)) return null;
 return Math.round(n * 100) / 100;
};
const formatForPriceInput = n => {
 const r = roundMoney(n);
 if (r == null) return '';
 return String(r);
};
const MakeOfferModal = ({
 isOpen,
 onClose,
 listing
}) => {
 const {
 t
 } = useTranslation();
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
 return [{
 key: 'pct5',
 discountPct: 5,
 title: '5% below list',
 hint: 'Balanced',
 amount: roundMoney(listTotal * 0.95)
 }, {
 key: 'pct10',
 discountPct: 10,
 title: '10% below list',
 hint: 'Firmer ask',
 amount: roundMoney(listTotal * 0.9)
 }].filter(r => r.amount != null && r.amount > 0);
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
 const handleTotalChange = e => {
 setSelectedPreset(null);
 setTotalPrice(e.target.value);
 };
 const handleQuantityChange = e => {
 setQuantity(e.target.value);
 setSelectedPreset(null);
 };
 const handleSubmit = async e => {
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
 totalPrice: t
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
 return <Modal isOpen={isOpen} onClose={onClose} title={t("make_offer")} size="md" footer={<>
 <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>{t("cancel")}</Button>
 <Button type="submit" form="make-offer-form" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : 'Send offer'}</Button>
 </>}>
 <p className="mb-4 line-clamp-2 text-sm text-text-secondary">{listingTitle}</p>
 <form id="make-offer-form" onSubmit={handleSubmit} noValidate className="space-y-5">
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 <div>
 <label htmlFor="offer-qty" className="mb-1 block text-sm font-medium text-text-primary">{t("quantity")}</label>
 <input id="offer-qty" type="number" min={1} value={quantity} onChange={handleQuantityChange} className="h-10 tabular-nums w-full rounded border border-border bg-background-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus" />
 </div>
 <div>
 <label htmlFor="offer-total" className="mb-1 block text-sm font-medium text-text-primary">{t("total_offer_price")}</label>
 <input id="offer-total" type="number" min={0} step="0.01" value={totalPrice} onChange={handleTotalChange} placeholder={t("enter_amount")} className="h-10 tabular-nums w-full rounded border border-border bg-background-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus" />
 </div>
 </div>

 {recommendedOffers.length > 0 ? <fieldset>
 <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
 <legend className="text-sm font-medium text-text-primary">{t("recommended_offer")}</legend>
 {listTotal != null ? <span className="text-xs tabular-nums text-text-tertiary">{t("list_total")} ({qtyNum}{t("unit")}){' '}{formatCurrency(listTotal, currency)}</span> : null}
 </div>
 <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
 {recommendedOffers.map(rec => {
 const active = selectedPreset === rec.key;
 const saveVsList = listTotal != null ? roundMoney(listTotal - rec.amount) : null;
 return <button key={rec.key} type="button" aria-pressed={active} onClick={() => applyPreset(rec.key, rec.amount)} className={`flex flex-col rounded border px-4 py-3 text-left transition-colors ${active ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-card-border-hover'}`}>
 <span className="text-xs text-text-secondary">{rec.title}</span>
 <span className="mt-1 text-lg font-semibold tabular-nums text-text-primary">{formatCurrency(rec.amount, currency)}</span>
 <span className="mt-1 text-xs text-text-tertiary">
 {rec.hint}
 {saveVsList != null && saveVsList > 0 ? <span className="tabular-nums"> · {t("save")}{formatCurrency(saveVsList, currency)}</span> : null}
 </span>
 </button>;
 })}
 </div>
 <p className="mt-2 text-xs text-text-tertiary">{t("each_option_fills_your_offer_with_a_tota")}</p>
 </fieldset> : listingUnitPrice == null ? <p className="text-sm text-status-warning-text">{t("list_price_unavailable_enter_your_total_")}</p> : null}

 <p className="border-t border-border-light pt-4 text-sm text-text-secondary">{t("offering_for")}<span className="font-medium tabular-nums text-text-primary">{qtyNum}</span>{t("item_s")}{previewTotal != null && <>
 {' '}{t("your_total")}<span className="font-medium tabular-nums text-text-primary">{formatCurrency(previewTotal, currency)}</span>
 </>}
 {listingUnitPrice != null && <>
 {' '}{t("unit_on_listing")}{' '}
 <span className="font-medium tabular-nums text-text-primary">{formatCurrency(listingUnitPrice, currency)}</span>
 </>}
 </p>

 {error ? <p role="alert" className="text-sm text-status-error-text">{error}</p> : null}
 </form>
 </Modal>;
};
export default MakeOfferModal;
