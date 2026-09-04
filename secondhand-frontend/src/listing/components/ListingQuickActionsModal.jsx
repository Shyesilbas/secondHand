import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  Pencil, 
  Trash2, 
  Megaphone, 
  Zap, 
  Power, 
  PowerOff, 
  CheckCircle, 
  Copy, 
  CreditCard, 
  Check, 
  Loader2, 
  Package, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';
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

    if (!Number.isFinite(num) || (field === 'quantity' && num < 1) || (field === 'price' && num < 0)) return;

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

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-slate-900 truncate">
                {t('quick_actions', 'Hızlı İlan Yönetimi')}
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-sm">
                {listing.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            aria-label={t('close', 'Kapat')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Quick Price & Stock Adjustments */}
          {canEdit && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  {t('quick_price_stock', 'Hızlı Fiyat & Stok Güncelleme')}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {t('current', 'Mevcut')}: {formatCurrency(listing.price, listing.currency)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Price Quick Input */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    {t('price', 'Fiyat')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <PriceInput 
                        value={priceVal} 
                        onChange={n => setPriceVal(p => n != null ? n : p)} 
                        onKeyDown={e => e.key === 'Enter' && saveField('price', priceVal)}
                        className="w-full py-2 pl-3 pr-10 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-extrabold text-slate-400 pointer-events-none">
                        {listing.currency || 'TRY'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => saveField('price', priceVal)}
                      disabled={savingPrice || Number(priceVal) === Number(listing.price)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-bold transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
                      title={t('save_price', 'Fiyatı Kaydet')}
                    >
                      {savingPrice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Fast discount tags */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{t('quick_discount', 'Hızlı İndirim')}:</span>
                    <button
                      type="button"
                      onClick={() => applyPriceDiscount(5)}
                      className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 transition-colors cursor-pointer"
                    >
                      -%5
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPriceDiscount(10)}
                      className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 transition-colors cursor-pointer"
                    >
                      -%10
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPriceDiscount(15)}
                      className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 transition-colors cursor-pointer"
                    >
                      -%15
                    </button>
                  </div>
                </div>

                {/* Stock Quick Input */}
                {showQty && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">
                      {t('stock_quantity', 'Stok Miktarı')}
                    </span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        min={1} 
                        value={qty} 
                        onChange={e => setQty(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && saveField('quantity', qty)} 
                        className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900/10 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                      />
                      <button
                        type="button"
                        onClick={() => saveField('quantity', qty)}
                        disabled={savingQty || String(qty) === String(listing.quantity)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-bold transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
                        title={t('save_quantity', 'Stoku Kaydet')}
                      >
                        {savingQty ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {Number(qty) === 0 ? t('out_of_stock_warning', '0 adet ilanı tükendi gösterir.') : t('stock_helper', 'Alıcılar için anlık rezerve edilir.')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 2: Promotional & Growth Actions */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              {t('promotions_growth', 'Öne Çıkarma & Satış Artırma')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {listing.status === LISTING_STATUS.ACTIVE && !listingInShowcase && (
                <button
                  onClick={actions.handleOpenShowcase}
                  className="flex items-center gap-3 p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-900 transition-all text-left cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Zap className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block">{t('add_to_showcase', 'Vitrine Ekle')}</span>
                    <span className="text-[11px] text-indigo-700/80 font-medium">{t('showcase_desc', 'Anasayfada en üstte sergile')}</span>
                  </div>
                </button>
              )}

              <button
                onClick={actions.handleOpenCampaign}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-900 transition-all text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Megaphone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-xs font-extrabold block">{t('create_campaign', 'Kampanya Oluştur')}</span>
                  <span className="text-[11px] text-purple-700/80 font-medium">{t('campaign_desc', 'İndirim & aciliyet tanımla')}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Status & Lifecycle Operations */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-slate-500" />
              {t('listing_status_ops', 'İlan Durum İşlemleri')}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {canEdit && (
                <button
                  onClick={actions.handleEdit}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer shadow-2xs hover:border-slate-300"
                >
                  <Pencil className="w-4 h-4 text-slate-600" />
                  <span>{t('edit_full', 'Tam Düzenle')}</span>
                </button>
              )}

              {listing.status === LISTING_STATUS.DRAFT && (
                <button
                  onClick={actions.handlePayListingFee}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>{t('pay_fee', 'Ücret Öde')}</span>
                </button>
              )}

              {listing.status === LISTING_STATUS.ACTIVE && (
                <button
                  onClick={actions.handleDeactivate}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-200 text-slate-700 hover:text-amber-800 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                >
                  <PowerOff className="w-4 h-4 text-amber-600" />
                  <span>{t('deactivate', 'Pasife Al')}</span>
                </button>
              )}

              {listing.status === LISTING_STATUS.INACTIVE && (
                <button
                  onClick={actions.handleReactivate}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                >
                  <Power className="w-4 h-4 text-emerald-600" />
                  <span>{t('reactivate', 'Yayına Al')}</span>
                </button>
              )}

              {listing.status !== LISTING_STATUS.SOLD && (
                <button
                  onClick={actions.handleMarkAsSold}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 hover:text-emerald-800 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{t('mark_as_sold', 'Satıldı Yap')}</span>
                </button>
              )}

              {listing.status === LISTING_STATUS.SOLD && (
                <button
                  onClick={actions.handleRelist}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                >
                  <Copy className="w-4 h-4 text-indigo-600" />
                  <span>{t('relist', 'Tekrar Yayınla')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 4: Danger Zone */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              {t('listing_no', 'İlan No')}: <strong className="text-slate-600">{listing.listingNo}</strong>
            </span>
            <button
              onClick={actions.handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('delete_listing', 'İlanı Sil')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
