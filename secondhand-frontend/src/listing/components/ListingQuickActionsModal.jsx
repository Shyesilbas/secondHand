import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle,
  ChevronRight,
  Copy,
  CreditCard,
  Megaphone,
  Minus,
  Package,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Trash2,
  Zap
} from 'lucide-react';
import { Button, Modal } from '../../common/components/ui/index.js';
import { PriceInput } from '../../common/components/ui/PriceInput.jsx';
import { listingService } from '../services/listingService.js';
import { LISTING_STATUS, NON_PURCHASABLE_TYPES } from '../types/index.js';
import { formatCurrency } from '../../common/formatters.js';
import { optimizeCloudinaryUrl } from '../../common/utils/imageOptimizer.js';

const MIN_QUANTITY = 1; // Backend UpdateQuantityRequest enforces @Min(1).
const DISCOUNT_STEPS = [5, 10, 15];

const STATUS_META = {
  [LISTING_STATUS.ACTIVE]: { key: 'status_active', fallback: 'Yayında', dot: 'bg-status-success' },
  [LISTING_STATUS.INACTIVE]: { key: 'status_inactive', fallback: 'Pasif', dot: 'bg-text-muted' },
  [LISTING_STATUS.SOLD]: { key: 'status_sold', fallback: 'Satıldı', dot: 'bg-text-tertiary' },
  [LISTING_STATUS.DRAFT]: { key: 'status_draft', fallback: 'Ödeme bekliyor', dot: 'bg-status-warning' }
};

const toQuantity = value => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
};

const ActionRow = ({ icon: Icon, title, description, onClick, danger = false }) => (
  <li>
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded px-3 py-3 text-left transition-colors duration-150 hover:bg-background-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
    >
      <Icon
        className={`h-5 w-5 shrink-0 ${danger ? 'text-status-error-text' : 'text-text-secondary'}`}
        strokeWidth={1.5}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-medium ${danger ? 'text-status-error-text' : 'text-text-primary'}`}>{title}</span>
        {description && <span className="block text-sm text-text-tertiary">{description}</span>}
      </span>
      {!danger && <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />}
    </button>
  </li>
);

const ActionGroup = ({ title, children }) => (
  <section className="space-y-1">
    <h3 className="px-3 text-sm font-medium text-text-tertiary">{title}</h3>
    <ul>{children}</ul>
  </section>
);

// Owner listing management: one form for price + stock with a single save, then grouped actions.
// Irreversible actions sit in their own group at the bottom and keep the confirmation step.
export const ListingQuickActionsModal = ({
  isOpen,
  onClose,
  listing,
  actions,
  listingInShowcase = false,
  onChanged,
  showSuccess,
  showError
}) => {
  const { t } = useTranslation();

  const initialPrice = Number(listing?.price) || 0;
  const initialQty = Number(listing?.quantity ?? MIN_QUANTITY);
  const [baseline, setBaseline] = useState({ price: initialPrice, qty: initialQty });
  const [priceVal, setPriceVal] = useState(initialPrice);
  const [qtyText, setQtyText] = useState(String(initialQty));
  const [isSaving, setIsSaving] = useState(false);

  // Reset the form only when a different listing is shown; a refetch of the same
  // listing after saving must not wipe values the owner has not saved yet.
  useEffect(() => {
    const price = Number(listing?.price) || 0;
    const qty = Number(listing?.quantity ?? MIN_QUANTITY);
    setBaseline({ price, qty });
    setPriceVal(price);
    setQtyText(String(qty));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing?.id]);

  if (!isOpen || !listing) return null;

  const status = listing.status;
  const statusMeta = STATUS_META[status] ?? { key: '', fallback: status, dot: 'bg-text-muted' };
  const isSold = status === LISTING_STATUS.SOLD;
  const isActive = status === LISTING_STATUS.ACTIVE;
  const canEditFields = !isSold;
  const showQty = !NON_PURCHASABLE_TYPES.includes(listing.type);
  const currency = listing.currency || 'TRY';

  const qty = toQuantity(qtyText);
  const priceValid = Number.isFinite(priceVal) && priceVal > 0;
  const qtyValid = qty != null && qty >= MIN_QUANTITY;
  const priceDirty = canEditFields && priceVal !== baseline.price;
  const qtyDirty = canEditFields && showQty && qty !== baseline.qty;
  const isDirty = priceDirty || qtyDirty;
  const canSave = isDirty && !isSaving && (!priceDirty || priceValid) && (!qtyDirty || qtyValid);

  const priceChangePct = priceDirty && priceValid && baseline.price > 0
    ? Math.round(((priceVal - baseline.price) / baseline.price) * 100)
    : null;

  const discountedPrice = pct => Math.round(baseline.price * (1 - pct / 100));

  const changeQty = delta => {
    const next = Math.max(MIN_QUANTITY, (qty ?? baseline.qty) + delta);
    setQtyText(String(next));
  };

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    const saved = { ...baseline };
    const failed = [];
    try {
      if (priceDirty) {
        try {
          await listingService.updatePrice(listing.id, priceVal);
          saved.price = priceVal;
        } catch (e) {
          failed.push(e?.response?.data?.message || t('price_update_failed', 'Fiyat güncellenemedi.'));
        }
      }
      if (qtyDirty) {
        try {
          await listingService.updateQuantity(listing.id, qty);
          saved.qty = qty;
        } catch (e) {
          failed.push(e?.response?.data?.message || t('stock_update_failed', 'Stok güncellenemedi.'));
        }
      }
      setBaseline(saved);
      if (saved.price !== baseline.price || saved.qty !== baseline.qty) onChanged?.(listing.id);
      if (failed.length) {
        showError?.(t('update_failed', 'Güncelleme başarısız'), failed.join(' '));
      } else {
        showSuccess?.(t('changes_saved', 'Değişiklikler kaydedildi'), t('listing_updated_desc', 'İlan bilgileri güncellendi.'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPriceVal(baseline.price);
    setQtyText(String(baseline.qty));
  };

  const imageUrl = listing.imageUrl || listing.imageUrls?.[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('manage_listing', 'İlanı yönet')}
      size="md"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <p className="min-w-0 truncate text-sm text-text-tertiary" aria-live="polite">
            {isDirty ? t('unsaved_changes', 'Kaydedilmemiş değişiklik var') : ''}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {isDirty ? (
              <Button variant="secondary" onClick={handleReset} disabled={isSaving}>
                {t('discard', 'Vazgeç')}
              </Button>
            ) : (
              <Button variant="secondary" onClick={onClose}>
                {t('close', 'Kapat')}
              </Button>
            )}
            {canEditFields && (
              <Button onClick={handleSave} disabled={!canSave}>
                {isSaving ? t('saving', 'Kaydediliyor...') : t('save_changes', 'Değişiklikleri kaydet')}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-border-light bg-background-tertiary">
            {imageUrl ? (
              <img src={optimizeCloudinaryUrl(imageUrl, { width: 120 })} alt="" className="h-full w-full object-cover" />
            ) : (
              <Package className="h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">{listing.title}</p>
            <p className="mt-0.5 flex items-center gap-2 text-sm text-text-secondary">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusMeta.dot}`} aria-hidden />
              <span>{statusMeta.key ? t(statusMeta.key, statusMeta.fallback) : statusMeta.fallback}</span>
              {listing.listingNo && (
                <>
                  <span className="text-text-muted" aria-hidden>·</span>
                  <span className="tabular-nums text-text-tertiary">#{listing.listingNo}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {canEditFields && (
          <section className="space-y-4 border-t border-border-light pt-5">
            <h3 className="text-sm font-medium text-text-tertiary">{t('price_and_stock', 'Fiyat ve stok')}</h3>
            <div className={`grid grid-cols-1 gap-5 ${showQty ? 'sm:grid-cols-2' : ''}`}>
              <div className="space-y-2">
                <label htmlFor="quick-price" className="block text-sm font-medium text-text-primary">
                  {t('price', 'Fiyat')} <span className="font-normal text-text-tertiary">({currency})</span>
                </label>
                <PriceInput
                  id="quick-price"
                  value={priceVal}
                  onChange={n => setPriceVal(n ?? 0)}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  aria-invalid={priceDirty && !priceValid}
                  className="h-11 border-border bg-background-primary tabular-nums text-text-primary sm:h-10"
                />
                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t('quick_discount', 'Hızlı indirim')}>
                  {DISCOUNT_STEPS.map(pct => {
                    const target = discountedPrice(pct);
                    const selected = priceVal === target;
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setPriceVal(selected ? baseline.price : target)}
                        aria-pressed={selected}
                        className={`h-8 rounded-sm border px-2.5 text-xs font-medium tabular-nums transition-colors duration-150 ${
                          selected
                            ? 'border-primary bg-primary text-white'
                            : 'border-border bg-background-primary text-text-secondary hover:bg-background-secondary hover:text-text-primary'
                        }`}
                      >
                        −%{pct}
                      </button>
                    );
                  })}
                </div>
                {priceDirty && priceValid ? (
                  <p className="text-sm tabular-nums text-text-secondary">
                    <span className="text-text-muted line-through">{formatCurrency(baseline.price, currency)}</span>
                    {' → '}
                    <span className="font-medium text-text-primary">{formatCurrency(priceVal, currency)}</span>
                    {priceChangePct ? (
                      <span className={priceChangePct < 0 ? 'text-status-success-text' : 'text-text-tertiary'}>
                        {' '}({priceChangePct > 0 ? '+' : '−'}%{Math.abs(priceChangePct)})
                      </span>
                    ) : null}
                  </p>
                ) : priceDirty ? (
                  <p className="text-sm text-status-error-text">{t('invalid_price', 'Geçerli bir fiyat girin.')}</p>
                ) : null}
              </div>

              {showQty && (
                <div className="space-y-2">
                  <label htmlFor="quick-qty" className="block text-sm font-medium text-text-primary">
                    {t('stock_quantity', 'Stok adedi')}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeQty(-1)}
                      disabled={qty != null && qty <= MIN_QUANTITY}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-border bg-background-primary text-text-primary transition-colors hover:bg-background-secondary disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
                      aria-label={t('decrease_stock', 'Stoğu azalt')}
                    >
                      <Minus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                    </button>
                    <input
                      id="quick-qty"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={qtyText}
                      onChange={e => setQtyText(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={e => e.key === 'Enter' && handleSave()}
                      aria-invalid={qtyDirty && !qtyValid}
                      className="h-11 w-full min-w-0 rounded border border-border bg-background-primary px-3 text-center text-sm tabular-nums text-text-primary focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus sm:h-10"
                    />
                    <button
                      type="button"
                      onClick={() => changeQty(1)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-border bg-background-primary text-text-primary transition-colors hover:bg-background-secondary sm:h-10 sm:w-10"
                      aria-label={t('increase_stock', 'Stoğu artır')}
                    >
                      <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                    </button>
                  </div>
                  <p className={`text-sm ${qtyDirty && !qtyValid ? 'text-status-error-text' : 'text-text-tertiary'}`}>
                    {t('stock_min_hint', { defaultValue: 'En az {{min}} adet olmalı.', min: MIN_QUANTITY })}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="space-y-4 border-t border-border-light pt-5">
          {!isSold && (
            <ActionGroup title={t('promote', 'Öne çıkar')}>
              {isActive && !listingInShowcase && (
                <ActionRow
                  icon={Zap}
                  title={t('add_to_showcase', 'Vitrine ekle')}
                  description={t('showcase_desc', 'Anasayfa vitrininde göster')}
                  onClick={actions.handleOpenShowcase}
                />
              )}
              <ActionRow
                icon={Megaphone}
                title={t('create_campaign', 'Kampanya oluştur')}
                description={t('campaign_desc', 'Süreli indirim tanımla')}
                onClick={actions.handleOpenCampaign}
              />
            </ActionGroup>
          )}

          <ActionGroup title={t('listing', 'İlan')}>
            {canEditFields && (
              <ActionRow
                icon={Pencil}
                title={t('edit_full', 'Tüm alanları düzenle')}
                description={t('edit_full_desc', 'Fotoğraf, açıklama ve özellikler')}
                onClick={actions.handleEdit}
              />
            )}
            {status === LISTING_STATUS.DRAFT && (
              <ActionRow
                icon={CreditCard}
                title={t('pay_fee', 'İlan ücretini öde')}
                description={t('pay_fee_desc', 'Ödeme sonrası ilan yayına alınır')}
                onClick={actions.handlePayListingFee}
              />
            )}
            {isActive && (
              <ActionRow
                icon={PowerOff}
                title={t('deactivate', 'Pasife al')}
                description={t('deactivate_desc', 'İlan aramalarda görünmez, sonra tekrar yayına alabilirsin')}
                onClick={actions.handleDeactivate}
              />
            )}
            {status === LISTING_STATUS.INACTIVE && (
              <ActionRow
                icon={Power}
                title={t('reactivate', 'Yayına al')}
                description={t('reactivate_desc', 'İlan tekrar aramalarda görünür')}
                onClick={actions.handleReactivate}
              />
            )}
            {isSold && (
              <ActionRow
                icon={Copy}
                title={t('relist', 'Tekrar yayınla')}
                description={t('relist_desc', 'Bu ilanın bir kopyasını oluşturur')}
                onClick={actions.handleRelist}
              />
            )}
          </ActionGroup>

          <ActionGroup title={t('irreversible_actions', 'Geri alınamaz')}>
            {!isSold && (
              <ActionRow
                icon={CheckCircle}
                title={t('mark_as_sold', 'Satıldı olarak işaretle')}
                description={t('mark_as_sold_desc', 'İlan satıştan kalkar')}
                onClick={actions.handleMarkAsSold}
                danger
              />
            )}
            <ActionRow
              icon={Trash2}
              title={t('delete_listing', 'İlanı sil')}
              description={t('delete_listing_desc', 'İlan kalıcı olarak kaldırılır')}
              onClick={actions.handleDelete}
              danger
            />
          </ActionGroup>
        </div>
      </div>
    </Modal>
  );
};
