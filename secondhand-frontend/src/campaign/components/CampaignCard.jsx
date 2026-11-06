import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Package, Pencil, Trash2 } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { optimizeCloudinaryUrl } from '../../common/utils/imageOptimizer.js';
import { PREFILTER_CATEGORY_COPY } from '../../listing/config/prefilterCopy.js';
import { getCampaignScope, getCampaignStatus } from '../campaignPresentation.js';

const MAX_LISTED = 3;

const DetailRow = ({ label, children }) => (
  <div className="grid grid-cols-3 gap-3 py-2.5 text-sm">
    <dt className="text-text-tertiary">{label}</dt>
    <dd className="col-span-2 min-w-0 text-text-primary">{children}</dd>
  </div>
);

/** Picked listings by title with a thumbnail; the rest as "+N more". Unknown ids show as a count. */
const ListingScope = ({ ids, listingsById }) => {
  const { t } = useTranslation();
  const known = ids.map(id => listingsById.get(id)).filter(Boolean);
  const shown = known.slice(0, MAX_LISTED);
  const rest = ids.length - shown.length;

  return (
    <div>
      <p>{t('campaign_scope_listings', { defaultValue: 'Seçili {{count}} ilan', count: ids.length })}</p>
      {shown.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {shown.map(listing => (
            <li key={listing.id}>
              <Link to={ROUTES.LISTING_DETAIL(listing.id)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary">
                {listing.imageUrl ? (
                  <img src={optimizeCloudinaryUrl(listing.imageUrl, { width: 48, height: 48, crop: 'fill' })} alt="" className="h-6 w-6 shrink-0 rounded-sm object-cover" />
                ) : (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-background-tertiary">
                    <Package className="h-3 w-3 text-text-muted" strokeWidth={1.5} aria-hidden />
                  </span>
                )}
                <span className="truncate">{listing.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {rest > 0 && shown.length > 0 && (
        <p className="mt-1.5 text-xs text-text-tertiary">{t('campaign_scope_more', { defaultValue: '+{{count}} ilan daha', count: rest })}</p>
      )}
    </div>
  );
};

/**
 * One campaign: status, name and discount on top, then what it applies to, the condition and the dates.
 */
const CampaignCard = ({ campaign, listingsById, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const status = getCampaignStatus(campaign);
  const scope = getCampaignScope(campaign);
  const discount = campaign.discountKind === 'PERCENT'
    ? `%${Number(campaign.value)}`
    : formatCurrency(campaign.value, 'TRY');

  let scopeContent;
  if (scope.kind === 'LISTING') {
    scopeContent = <ListingScope ids={campaign.eligibleListingIds} listingsById={listingsById} />;
  } else if (scope.kind === 'TYPE') {
    const labels = campaign.eligibleTypes.map(type => PREFILTER_CATEGORY_COPY[type]?.label || type);
    scopeContent = t('campaign_scope_types', { defaultValue: '{{types}} kategorisindeki ilanların', types: labels.join(', ') });
  } else {
    scopeContent = t('campaign_scope_all', 'Tüm ilanların');
  }

  return (
    <article className="flex flex-col rounded border border-border bg-background-primary">
      <header className="flex items-start justify-between gap-3 border-b border-border-light p-5">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs text-text-secondary">
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden />
            {t(`campaign_status_${status.key.toLowerCase()}`, status.label)}
            <span className="text-text-muted">·</span>
            {campaign.minQuantity > 1 ? t('campaign_kind_bundle', 'Paket') : t('campaign_kind_standard', 'Standart')}
          </p>
          <h2 className="mt-1 truncate text-base font-semibold text-text-primary">{campaign.name}</h2>
          <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-text-primary">
            {t('campaign_discount', { defaultValue: '{{value}} indirim', value: discount })}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onEdit(campaign)}
            aria-label={t('campaign_edit', 'Düzenle')}
            className="rounded p-2 text-text-tertiary transition-colors duration-150 hover:bg-background-secondary hover:text-text-primary"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onDelete(campaign)}
            aria-label={t('campaign_delete', 'Sil')}
            className="rounded p-2 text-text-tertiary transition-colors duration-150 hover:bg-background-secondary hover:text-status-error-text"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </button>
        </div>
      </header>

      <dl className="divide-y divide-border-light px-5">
        <DetailRow label={t('campaign_applies_to', 'Geçerli olduğu')}>{scopeContent}</DetailRow>
        <DetailRow label={t('campaign_condition', 'Koşul')}>
          {campaign.minQuantity > 1
            ? t('campaign_condition_min', { defaultValue: 'Sepette bu satıcıdan en az {{count}} ürün', count: campaign.minQuantity })
            : t('campaign_condition_none', 'Koşul yok')}
        </DetailRow>
        <DetailRow label={t('campaign_dates', 'Tarih')}>
          <span className="tabular-nums">
            {campaign.startsAt ? formatDateTime(campaign.startsAt) : t('campaign_starts_now', 'Hemen')}
            {' – '}
            {campaign.endsAt ? formatDateTime(campaign.endsAt) : t('campaign_no_end', 'Bitiş yok')}
          </span>
        </DetailRow>
      </dl>
    </article>
  );
};

export default CampaignCard;
