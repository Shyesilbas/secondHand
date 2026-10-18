import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2, Megaphone, Zap, Power, PowerOff, CheckCircle, Copy, CreditCard } from 'lucide-react';
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
      showError?.(t('error', 'Hata'), field === 'quantity' ? t('invalid_quantity', 'Stok en az 1 olmalı.') : t('invalid_price', 'Geçerli bir fiyat girin.'));
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
      showSuccess?.(t('success', 'Başarılı'), field === 'quantity' ? t('stock_updated', 'Stok güncellendi') : t('price_updated', 'Fiyat güncellendi'));
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

  const tile = 'flex flex-col items-center justify-center gap-2 rounded border border-border p-3 text-sm text-text-secondary transition-colors hover:border-card-border-hover hover:text-text-primary';
  const row = 'flex w-full items-center gap-3 rounded border border-border p-3 text-left transition-colors hover:border-card-border-hover';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('quick_actions', 'Hızlı İlan Yönetimi')}
      description={listing.title}
      size="lg"
      footer={
        <>
          <span className="mr-auto self-center text-xs tabular-nums text-text-tertiary">
            {t('listing_no', 'İlan No')}: {listing.listingNo}
          </span>
          <Button variant="ghost" onClick={actions.handleDelete} className="text-status-error-text hover:text-status-error-text">
            <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            {t('delete_listing', 'İlanı Sil')}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {canEdit && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-text-primary">{t('quick_price_stock', 'Hızlı Fiyat & Stok Güncelleme')}</h3>
              <span className="text-xs tabular-nums text-text-tertiary">
                {t('current', 'Mevcut')}: {formatCurrency(listing.price, listing.currency)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="quick-price" className="block text-sm text-text-secondary">{t('price', 'Fiyat')} ({listing.currency || 'TRY'})</label>
                <div className="flex items-center gap-2">
                  <PriceInput
                    id="quick-price"
                    value={priceVal}
                    onChange={n => setPriceVal(p => n != null ? n : p)}
                    onKeyDown={e => e.key === 'Enter' && saveField('price', priceVal)}
                    className="h-10 w-full rounded border border-border bg-background-primary px-3 text-sm tabular-nums text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus"
                  />
                  <Button size="md" onClick={() => saveField('price', priceVal)} disabled={savingPrice || Number(priceVal) === Number(listing.price)}>
                    {savingPrice ? 'Saving...' : t('save', 'Kaydet')}
                  </Button>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-text-tertiary">{t('quick_discount', 'Hızlı İndirim')}:</span>
                  {[5, 10, 15].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => applyPriceDiscount(pct)}
                      className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-9 px-3"
                    >
                      -%{pct}
                    </button>
                  ))}
                </div>
              </div>

              {showQty && (
                <div className="space-y-2">
                  <label htmlFor="quick-qty" className="block text-sm text-text-secondary">{t('stock_quantity', 'Stok Miktarı')}</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="quick-qty"
                      type="number"
                      min={1}
                      value={qty}
                      onChange={e => setQty(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveField('quantity', qty)}
                      className="h-10 w-full rounded border border-border bg-background-primary px-3 text-sm tabular-nums text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus"
                    />
                    <Button size="md" onClick={() => saveField('quantity', qty)} disabled={savingQty || String(qty) === String(listing.quantity)}>
                      {savingQty ? 'Saving...' : t('save', 'Kaydet')}
                    </Button>
                  </div>
                  <p className="text-xs text-text-tertiary">
                    {Number(qty) === 0 ? t('out_of_stock_warning', '0 adet ilanı tükendi gösterir.') : t('stock_helper', 'Alıcılar için anlık rezerve edilir.')}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h3 className="text-sm font-medium text-text-primary">{t('promotions_growth', 'Öne Çıkarma & Satış Artırma')}</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {listing.status === LISTING_STATUS.ACTIVE && !listingInShowcase && (
              <button type="button" onClick={actions.handleOpenShowcase} className={row}>
                <Zap className="h-5 w-5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                <span>
                  <span className="block text-sm font-medium text-text-primary">{t('add_to_showcase', 'Vitrine Ekle')}</span>
                  <span className="block text-xs text-text-secondary">{t('showcase_desc', 'Anasayfada en üstte sergile')}</span>
                </span>
              </button>
            )}
            <button type="button" onClick={actions.handleOpenCampaign} className={row}>
              <Megaphone className="h-5 w-5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
              <span>
                <span className="block text-sm font-medium text-text-primary">{t('create_campaign', 'Kampanya Oluştur')}</span>
                <span className="block text-xs text-text-secondary">{t('campaign_desc', 'İndirim & aciliyet tanımla')}</span>
              </span>
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-medium text-text-primary">{t('listing_status_ops', 'İlan Durum İşlemleri')}</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {canEdit && (
              <button type="button" onClick={actions.handleEdit} className={tile}>
                <Pencil className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                {t('edit_full', 'Tam Düzenle')}
              </button>
            )}
            {listing.status === LISTING_STATUS.DRAFT && (
              <button type="button" onClick={actions.handlePayListingFee} className={tile}>
                <CreditCard className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                {t('pay_fee', 'Ücret Öde')}
              </button>
            )}
            {listing.status === LISTING_STATUS.ACTIVE && (
              <button type="button" onClick={actions.handleDeactivate} className={tile}>
                <PowerOff className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                {t('deactivate', 'Pasife Al')}
              </button>
            )}
            {listing.status === LISTING_STATUS.INACTIVE && (
              <button type="button" onClick={actions.handleReactivate} className={tile}>
                <Power className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                {t('reactivate', 'Yayına Al')}
              </button>
            )}
            {listing.status !== LISTING_STATUS.SOLD && (
              <button type="button" onClick={actions.handleMarkAsSold} className={tile}>
                <CheckCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                {t('mark_as_sold', 'Satıldı Yap')}
              </button>
            )}
            {listing.status === LISTING_STATUS.SOLD && (
              <button type="button" onClick={actions.handleRelist} className={tile}>
                <Copy className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                {t('relist', 'Tekrar Yayınla')}
              </button>
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
};
