import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pencil,
  Trash2,
  Megaphone,
  Zap,
  Power,
  PowerOff,
  CheckCircle,
  Copy,
  CreditCard
} from 'lucide-react';
import { Button, Modal } from '../../common/components/ui/index.js';
import { PriceInput } from '../../common/components/ui/PriceInput.jsx';
import { listingService } from '../services/listingService.js';
import { LISTING_STATUS, NON_PURCHASABLE_TYPES } from '../types/index.js';
import { formatCurrency } from '../../common/formatters.js';

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

  const [qty, setQty] = useState(String(listing?.quantity ?? 1));
  const [priceVal, setPriceVal] = useState(listing?.price ?? 0);
  const [savingQty, setSavingQty] = useState(false);
  const [savingPrice, setSavingPrice] = useState(false);

  // Sync state when listing changes
  React.useEffect(() => {
    if (listing) {
      setQty(String(listing.quantity ?? 1));
      setPriceVal(listing.price ?? 0);
    }
  }, [listing]);

  if (!isOpen || !listing) return null;

  const showQty = !NON_PURCHASABLE_TYPES.includes(listing?.type);
  const isSold = listing.status === LISTING_STATUS.SOLD || listing.status === 'SOLD';
  const canEdit = !isSold;

  const saveField = async (field, value) => {
    const num = field === 'quantity'
      ? parseInt(value, 10)
      : typeof value === 'number'
      ? value
      : parseFloat(String(value).replace(',', '.'));

    if (!Number.isFinite(num) || (field === 'quantity' && num < 1) || (field === 'price' && num < 0)) {
      showError?.(
        t('error', 'Hata'),
        field === 'quantity'
          ? t('invalid_quantity', 'Stok en az 1 olmalı.')
          : t('invalid_price', 'Geçerli bir fiyat girin.')
      );
      return;
    }

    if (field === 'quantity') setSavingQty(true);
    else setSavingPrice(true);

    try {
      if (field === 'quantity') {
        await listingService.updateQuantity(listing.id, num);
      } else {
        await listingService.updatePrice(listing.id, num);
      }
      showSuccess?.(
        t('success', 'Başarılı'),
        field === 'quantity'
          ? t('stock_updated', 'Stok güncellendi')
          : t('price_updated', 'Fiyat güncellendi')
      );
      onChanged?.();
    } catch (e) {
      showError?.(t('error', 'Hata'), e?.response?.data?.message || t('update_failed', 'Güncelleme başarısız'));
    } finally {
      setSavingQty(false);
      setSavingPrice(false);
    }
  };

  const applyPriceDiscount = (percent) => {
    const currentPrice = Number(listing.price) || 0;
    const discounted = Math.round(currentPrice * (1 - percent / 100));
    setPriceVal(discounted);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case LISTING_STATUS.ACTIVE:
        return { label: t('status_active', 'Yayında'), dot: 'bg-status-success' };
      case LISTING_STATUS.INACTIVE:
        return { label: t('status_inactive', 'Pasif'), dot: 'bg-text-muted' };
      case LISTING_STATUS.SOLD:
        return { label: t('status_sold', 'Satıldı'), dot: 'bg-text-tertiary' };
      case LISTING_STATUS.DRAFT:
        return { label: t('status_draft', 'Taslak / Ödeme Bekliyor'), dot: 'bg-status-warning' };
      default:
        return { label: status, dot: 'bg-text-muted' };
    }
  };

  const statusInfo = getStatusLabel(listing.status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('quick_actions', 'Hızlı İlan Yönetimi')}
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-xs font-mono text-text-tertiary tabular-nums">
            #{listing.listingNo}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={actions.handleDelete}
              className="text-status-error hover:bg-status-error-bg hover:text-status-error text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              <span>{t('delete_listing', 'İlanı Sil')}</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              {t('close', 'Kapat')}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Listing Context Mini-Card */}
        <div className="flex items-center gap-3.5 rounded border border-border-light bg-background-secondary p-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-background-tertiary border border-border-light flex items-center justify-center">
            {listing.imageUrl ? (
              <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-text-muted font-medium">{t('no_image', 'Görsel yok')}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-medium text-text-primary">{listing.title}</h4>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                <span>{statusInfo.label}</span>
              </span>
              <span className="text-text-muted">·</span>
              <span className="font-semibold text-text-primary tabular-nums">
                {formatCurrency(listing.price, listing.currency)}
              </span>
              {showQty && (
                <>
                  <span className="text-text-muted">·</span>
                  <span className="text-text-secondary tabular-nums">
                    {listing.quantity ?? 1} {t('piece', 'adet')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 1. Quick Price & Stock Editing */}
        {canEdit && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">
                {t('quick_price_stock', 'Hızlı Fiyat & Stok Güncelleme')}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Price Field */}
              <div className="space-y-2">
                <label htmlFor="quick-price" className="block text-xs font-medium text-text-secondary">
                  {t('price', 'Fiyat')} ({listing.currency || 'TRY'})
                </label>
                <div className="flex items-center gap-2">
                  <PriceInput
                    id="quick-price"
                    value={priceVal}
                    onChange={(n) => setPriceVal((p) => (n != null ? n : p))}
                    onKeyDown={(e) => e.key === 'Enter' && saveField('price', priceVal)}
                    className="h-9 w-full rounded border border-border bg-background-primary px-3 text-sm tabular-nums text-text-primary focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus"
                  />
                  <Button
                    size="sm"
                    onClick={() => saveField('price', priceVal)}
                    disabled={savingPrice || Number(priceVal) === Number(listing.price)}
                  >
                    {savingPrice ? t('saving', 'Kaydediliyor...') : t('save', 'Kaydet')}
                  </Button>
                </div>
                {/* Compact Quick Discount Chips */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-xs text-text-muted">{t('quick_discount', 'İndirim')}:</span>
                  {[5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => applyPriceDiscount(pct)}
                      className="inline-flex items-center justify-center h-6 px-2 rounded-sm text-xs font-medium border border-border-light bg-background-tertiary hover:bg-background-secondary text-text-secondary transition-colors cursor-pointer"
                    >
                      -%{pct}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Field */}
              {showQty && (
                <div className="space-y-2">
                  <label htmlFor="quick-qty" className="block text-xs font-medium text-text-secondary">
                    {t('stock_quantity', 'Stok Adedi')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="quick-qty"
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveField('quantity', qty)}
                      className="h-9 w-full rounded border border-border bg-background-primary px-3 text-sm tabular-nums text-text-primary focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus"
                    />
                    <Button
                      size="sm"
                      onClick={() => saveField('quantity', qty)}
                      disabled={savingQty || String(qty) === String(listing.quantity)}
                    >
                      {savingQty ? t('saving', 'Kaydediliyor...') : t('save', 'Kaydet')}
                    </Button>
                  </div>
                  <p className="text-xs text-text-muted pt-0.5">
                    {Number(qty) === 0
                      ? t('out_of_stock_warning', '0 adet ilanı tükendi gösterir.')
                      : t('stock_helper', 'Alıcılar için anlık rezerve edilir.')}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 2. Promotions & Growth */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">
            {t('promotions_growth', 'Öne Çıkarma & Satış Artırma')}
          </h3>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {listing.status === LISTING_STATUS.ACTIVE && !listingInShowcase && (
              <button
                type="button"
                onClick={actions.handleOpenShowcase}
                className="flex items-center gap-3 rounded border border-border-light bg-background-primary p-3 text-left transition-colors hover:border-border hover:bg-background-secondary cursor-pointer"
              >
                <Zap className="h-5 w-5 shrink-0 text-text-primary" strokeWidth={1.5} aria-hidden />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-text-primary">
                    {t('add_to_showcase', 'Vitrine Ekle')}
                  </span>
                  <span className="block text-xs text-text-secondary">
                    {t('showcase_desc', 'Anasayfa vitrininde sergileyin')}
                  </span>
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={actions.handleOpenCampaign}
              className="flex items-center gap-3 rounded border border-border-light bg-background-primary p-3 text-left transition-colors hover:border-border hover:bg-background-secondary cursor-pointer"
            >
              <Megaphone className="h-5 w-5 shrink-0 text-text-primary" strokeWidth={1.5} aria-hidden />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-text-primary">
                  {t('create_campaign', 'Kampanya Oluştur')}
                </span>
                <span className="block text-xs text-text-secondary">
                  {t('campaign_desc', 'Süreli indirim ve aciliyet tanımlayın')}
                </span>
              </span>
            </button>
          </div>
        </section>

        {/* 3. Status Operations */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">
            {t('listing_status_ops', 'İlan Durum İşlemleri')}
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {canEdit && (
              <button
                type="button"
                onClick={actions.handleEdit}
                className="flex items-center justify-center gap-2 rounded border border-border-light bg-background-primary p-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-border hover:text-text-primary hover:bg-background-secondary cursor-pointer"
              >
                <Pencil className="h-4 w-4 shrink-0 text-text-primary" strokeWidth={1.5} aria-hidden />
                <span>{t('edit_full', 'Tam Düzenle')}</span>
              </button>
            )}
            {listing.status === LISTING_STATUS.DRAFT && (
              <button
                type="button"
                onClick={actions.handlePayListingFee}
                className="flex items-center justify-center gap-2 rounded border border-border-light bg-background-primary p-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-border hover:text-text-primary hover:bg-background-secondary cursor-pointer"
              >
                <CreditCard className="h-4 w-4 shrink-0 text-text-primary" strokeWidth={1.5} aria-hidden />
                <span>{t('pay_fee', 'Ücret Öde')}</span>
              </button>
            )}
            {listing.status === LISTING_STATUS.ACTIVE && (
              <button
                type="button"
                onClick={actions.handleDeactivate}
                className="flex items-center justify-center gap-2 rounded border border-border-light bg-background-primary p-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-border hover:text-text-primary hover:bg-background-secondary cursor-pointer"
              >
                <PowerOff className="h-4 w-4 shrink-0 text-text-primary" strokeWidth={1.5} aria-hidden />
                <span>{t('deactivate', 'Pasife Al')}</span>
              </button>
            )}
            {listing.status === LISTING_STATUS.INACTIVE && (
              <button
                type="button"
                onClick={actions.handleReactivate}
                className="flex items-center justify-center gap-2 rounded border border-border-light bg-background-primary p-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-border hover:text-text-primary hover:bg-background-secondary cursor-pointer"
              >
                <Power className="h-4 w-4 shrink-0 text-text-primary" strokeWidth={1.5} aria-hidden />
                <span>{t('reactivate', 'Yayına Al')}</span>
              </button>
            )}
            {listing.status !== LISTING_STATUS.SOLD && (
              <button
                type="button"
                onClick={actions.handleMarkAsSold}
                className="flex items-center justify-center gap-2 rounded border border-border-light bg-background-primary p-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-border hover:text-text-primary hover:bg-background-secondary cursor-pointer"
              >
                <CheckCircle className="h-4 w-4 shrink-0 text-text-primary" strokeWidth={1.5} aria-hidden />
                <span>{t('mark_as_sold', 'Satıldı Olarak İşaretle')}</span>
              </button>
            )}
            {listing.status === LISTING_STATUS.SOLD && (
              <button
                type="button"
                onClick={actions.handleRelist}
                className="flex items-center justify-center gap-2 rounded border border-border-light bg-background-primary p-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-border hover:text-text-primary hover:bg-background-secondary cursor-pointer"
              >
                <Copy className="h-4 w-4 shrink-0 text-text-primary" strokeWidth={1.5} aria-hidden />
                <span>{t('relist', 'Tekrar Yayınla')}</span>
              </button>
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
};
