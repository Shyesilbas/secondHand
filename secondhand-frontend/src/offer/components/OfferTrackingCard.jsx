import { useTranslation } from 'react-i18next';
import { CheckCircle2, ImageOff, ShoppingCart, XCircle } from 'lucide-react';
import { useRestrictionFlags } from '../../complaint/hooks/useComplaints.js';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { OFFER_DEFAULTS, OFFER_STATUSES, OFFER_TABS } from '../offerConstants.js';
import { OFFER_STATUS_PRESENTATION, offerCounterpart } from '../utils/offerPresentation.js';
import Badge from '../../common/components/ui/Badge.jsx';
import Button from '../../common/components/ui/Button.jsx';

const HOUR_MS = 3600000;
const DAY_MS = 24 * HOUR_MS;

const timeLeft = (t, iso) => {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / HOUR_MS);
  if (hours < 48) return t('offer_hours_left', { count: Math.max(1, hours) });
  return t('offer_days_left', { count: Math.ceil(diff / DAY_MS) });
};

/** One offer row: photo, listing and counterpart, status, total and the action this side can take. */
const OfferTrackingCard = ({
  offer: o,
  activeTab,
  currency,
  busy = false,
  onAccept,
  onReject,
  onCounter,
  onCheckout,
  onOpenListing
}) => {
  const { t } = useTranslation();
  const { canMakeOffers, canCheckout: canCheckoutNow } = useRestrictionFlags();
  const isMade = activeTab === OFFER_TABS.MADE;
  const isPending = o.status === OFFER_STATUSES.PENDING;
  const canActAsSeller = !isMade && isPending;
  const canCheckout = isMade && o.status === OFFER_STATUSES.ACCEPTED;
  const presentation = OFFER_STATUS_PRESENTATION[o.status] || OFFER_STATUS_PRESENTATION[OFFER_STATUSES.PENDING];
  const remaining = isPending || canCheckout ? timeLeft(t, o.expiresAt) : null;
  const title = o.listingTitle || OFFER_DEFAULTS.FALLBACK_LISTING_TITLE;
  const meta = [
    `${t(isMade ? 'seller' : 'buyer')}: ${offerCounterpart(o, activeTab) || '—'}`,
    o.createdAt ? formatDateTime(o.createdAt) : null,
  ].filter(Boolean).join(' · ');

  let hint = null;
  if (isMade && isPending) hint = t('offer_waiting_seller', 'Satıcının yanıtı bekleniyor');
  else if (canActAsSeller) hint = t('offer_waiting_you', 'Yanıtını bekliyor');
  else if (canCheckout) hint = t('offer_ready_to_checkout', 'Kabul edildi, ödemeye geçebilirsin');

  return (
    <li className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <button
          type="button"
          onClick={() => o.listingId && onOpenListing?.(o.listingId)}
          disabled={!o.listingId}
          aria-label={title}
          className="h-16 w-16 shrink-0 overflow-hidden rounded bg-secondary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:cursor-default"
        >
          {o.listingImageUrl ? (
            <img src={o.listingImageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-text-muted">
              <ImageOff className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          {o.listingId ? (
            <button
              type="button"
              onClick={() => onOpenListing(o.listingId)}
              className="block max-w-full truncate rounded text-left text-sm font-medium text-text-primary transition-colors duration-150 hover:text-text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              {title}
            </button>
          ) : (
            <p className="truncate text-sm font-medium text-text-primary">{title}</p>
          )}
          <p className="mt-0.5 truncate text-sm text-text-tertiary tabular-nums">{meta}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <Badge variant={presentation.variant} size="sm">{t(presentation.labelKey)}</Badge>
            {hint && <span className="text-sm text-text-secondary">{hint}</span>}
            {remaining && <span className="text-sm font-medium text-status-warning-text tabular-nums">· {remaining}</span>}
          </div>
        </div>

        <div className="shrink-0 text-right lg:hidden">
          <p className="text-base font-semibold tabular-nums text-text-price">{formatCurrency(o.totalPrice, currency)}</p>
          <p className="text-sm tabular-nums text-text-tertiary">{o.quantity} × {formatCurrency(o.listingUnitPrice, currency)}</p>
        </div>
      </div>

      <div className="hidden w-40 shrink-0 text-right lg:block">
        <p className="text-base font-semibold tabular-nums text-text-price">{formatCurrency(o.totalPrice, currency)}</p>
        <p className="text-sm tabular-nums text-text-tertiary">{o.quantity} × {formatCurrency(o.listingUnitPrice, currency)}</p>
      </div>

      {(canActAsSeller || canCheckout) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
          {canCheckout && (
            <Button size="sm" onClick={() => onCheckout(o.id)} disabled={!canCheckoutNow}>
              <ShoppingCart className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              {t('checkout')}
            </Button>
          )}
          {canActAsSeller && (
            <>
              <Button size="sm" onClick={() => onAccept(o.id)} disabled={busy}>
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                {t('accept')}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onCounter(o)} disabled={busy || !canMakeOffers}>
                {t('counter')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onReject(o.id)} disabled={busy}>
                <XCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                {t('reject')}
              </Button>
            </>
          )}
        </div>
      )}
    </li>
  );
};

export default OfferTrackingCard;
