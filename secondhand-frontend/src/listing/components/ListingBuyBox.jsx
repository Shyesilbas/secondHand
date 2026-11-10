import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronRight, MapPin, Share2, ShieldCheck } from 'lucide-react';
import Button from '../../common/components/ui/Button.jsx';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import AddToListButton from '../../favoritelist/components/AddToListButton.jsx';
import CompareButton from '../../comparison/components/CompareButton.jsx';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import ListingCardActions from './ListingCardActions.jsx';
import SafeMeetupModal from './SafeMeetupModal.jsx';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';

const ICON_BUTTON =
  'flex h-10 w-10 items-center justify-center rounded border border-border bg-background-primary text-text-secondary transition-colors duration-150 hover:bg-background-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus';

const OwnerStat = ({ label, value }) => (
  <div className="px-3 py-2 text-center">
    <p className="text-lg font-semibold tabular-nums text-text-primary">{value}</p>
    <p className="text-xs text-text-tertiary">{label}</p>
  </div>
);

// Right-hand purchase panel: identity, price, stock and the single primary action of the page.
// Owners see listing stats and management actions in the same place instead of buy actions.
const ListingBuyBox = ({
  listing,
  typeLabel,
  locationLabel,
  price,
  isOwner,
  canPurchase,
  stock,
  socialProof,
  favoriteCount,
  cartReservations,
  cart,
  onMakeOffer,
  onShare,
  copiedLink,
  onChanged
}) => {
  const { t } = useTranslation();
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const viewCount = listing.viewCount ?? listing.viewStats?.totalViews ?? 0;

  return (
    <section className="rounded border border-border bg-background-primary p-5" aria-label={t('listing_summary', 'İlan özeti')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 pt-2 text-sm text-text-tertiary">
          <span>{typeLabel}</span>
          {listing.listingNo && (
            <>
              <span aria-hidden>·</span>
              <span className="tabular-nums text-text-muted">#{listing.listingNo}</span>
            </>
          )}
          {price.hasCampaign && (
            <span className="rounded-full border border-status-error-border bg-status-error-bg px-2 py-0.5 text-xs font-medium tabular-nums text-status-error-text">
              {listing.campaignName || t('discount', 'İndirim')}
              {price.discount ? ` −%${price.discount}` : ''}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {!isOwner && (
            <FavoriteButton listingId={listing.id} listing={listing} size="md" showCount={false} className={ICON_BUTTON} />
          )}
          {!isOwner && (
            <AddToListButton listingId={listing.id} listingTitle={listing.title} size="lg" className={ICON_BUTTON} />
          )}
          {!isOwner && <CompareButton listing={listing} variant="square" />}
          <button
            type="button"
            onClick={onShare}
            className={ICON_BUTTON}
            aria-label={copiedLink ? t('link_copied', 'Bağlantı kopyalandı') : t('share', 'Paylaş')}
            title={copiedLink ? t('link_copied', 'Bağlantı kopyalandı') : t('share', 'Paylaş')}
          >
            {copiedLink ? (
              <Check className="h-4 w-4 text-status-success" strokeWidth={1.5} aria-hidden />
            ) : (
              <Share2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            )}
          </button>
        </div>
      </div>

      <h1 className="mt-3 text-xl font-semibold leading-snug text-text-primary">{listing.title}</h1>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-tertiary">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-4 w-4 text-text-muted" strokeWidth={1.5} aria-hidden />
          {locationLabel}
        </span>
        <span aria-hidden>·</span>
        <span className="tabular-nums">{formatDateTime(listing.createdAt)}</span>
      </p>

      <div className="mt-5 border-t border-border-light pt-5">
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-2xl font-semibold tabular-nums text-text-price">
            {formatCurrency(price.display, listing.currency)}
          </span>
          {price.hasCampaign && (
            <span className="text-sm tabular-nums text-text-muted line-through">
              {formatCurrency(listing.price, listing.currency)}
            </span>
          )}
        </p>

        {(stock || socialProof.length > 0) && (
          <ul className="mt-3 space-y-1 text-sm text-text-secondary">
            {stock && (
              <li className="flex items-center gap-2 tabular-nums">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${stock.dot}`} aria-hidden />
                {stock.label}
              </li>
            )}
            {socialProof.map(line => (
              <li key={line} className="flex items-center gap-2 tabular-nums">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-text-muted" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isOwner ? (
        <div className="mt-5 space-y-3">
          <div className="grid grid-cols-3 divide-x divide-border-light rounded border border-border-light">
            <OwnerStat label={t('views', 'Görüntülenme')} value={viewCount} />
            <OwnerStat label={t('favorites', 'Favori')} value={favoriteCount} />
            <OwnerStat label={t('in_carts', 'Sepette')} value={cartReservations} />
          </div>
          <ListingCardActions listing={listing} onChanged={onChanged} variant="button" />
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {canPurchase ? (
            <>
              <Button className="w-full" onClick={cart.onClick} disabled={cart.isAdding}>
                {cart.isInCart && !cart.isAdding && <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />}
                <span>
                  {cart.isAdding
                    ? t('adding_to_cart', 'Ekleniyor...')
                    : cart.isInCart
                      ? t('go_to_cart', 'Sepette, sepete git')
                      : t('add_to_cart', 'Sepete ekle')}
                </span>
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={onMakeOffer}>
                  {t('make_an_offer', 'Teklif ver')}
                </Button>
                <ContactSellerButton listing={listing} variant="secondary" label={t('send_message', 'Mesaj gönder')} />
              </div>
            </>
          ) : (
            <ContactSellerButton listing={listing} variant="primary" className="w-full" />
          )}
        </div>
      )}

      {canPurchase && (
        <div className="mt-5 flex items-start gap-2.5 border-t border-border-light pt-4 text-sm text-text-secondary">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-status-success" strokeWidth={1.5} aria-hidden />
          <p className="min-w-0">
            {t('escrow_short_note', 'Ödemen, ürünü teslim alıp onaylayana kadar güvencede tutulur.')}{' '}
            <button
              type="button"
              onClick={() => setIsSafetyOpen(true)}
              className="inline-flex items-center font-medium text-text-primary hover:underline"
            >
              {t('how_it_works', 'Nasıl çalışır')}
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </button>
          </p>
        </div>
      )}

      <SafeMeetupModal isOpen={isSafetyOpen} onClose={() => setIsSafetyOpen(false)} />
    </section>
  );
};

export default ListingBuyBox;
