import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect, memo } from 'react';
import { ChevronDown, Plus, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../common/constants/routes.js';
const CheckoutAddressStep = ({
  addresses,
  selectedShippingAddressId,
  setSelectedShippingAddressId,
  selectedBillingAddressId,
  setSelectedBillingAddressId,
  notes,
  setNotes,
  orderName,
  setOrderName,
  deliveryMethod,
  setDeliveryMethod,
  meetupLocation,
  setMeetupLocation,
  cartItems,
  onNext,
  onBack
}) => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const hasAddresses = Array.isArray(addresses) && addresses.length > 0;
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(() => !selectedBillingAddressId || selectedBillingAddressId === selectedShippingAddressId);
  const [customLocationActive, setCustomLocationActive] = useState(false);
  const handleShippingChange = id => {
    setSelectedShippingAddressId(Number(id));
    if (billingSameAsShipping || deliveryMethod === 'SAFE_MEETUP') {
      setSelectedBillingAddressId(Number(id));
    }
  };
  const handleBillingToggle = () => {
    const next = !billingSameAsShipping;
    setBillingSameAsShipping(next);
    if (next) {
      setSelectedBillingAddressId(selectedShippingAddressId);
    }
  };
  useEffect(() => {
    if (deliveryMethod === 'SAFE_MEETUP' && hasAddresses) {
      if (!selectedShippingAddressId) {
        const mainAddress = addresses.find(a => a.mainAddress);
        const defaultId = mainAddress ? mainAddress.id : addresses[0].id;
        setSelectedShippingAddressId(Number(defaultId));
        setSelectedBillingAddressId(Number(defaultId));
      } else if (selectedBillingAddressId !== selectedShippingAddressId) {
        setSelectedBillingAddressId(selectedShippingAddressId);
      }
    }
  }, [deliveryMethod, selectedShippingAddressId, selectedBillingAddressId, addresses, hasAddresses, setSelectedShippingAddressId, setSelectedBillingAddressId]);
  const canMeetup = Array.isArray(cartItems) && cartItems.length > 0 && cartItems.every(item => Boolean(item.listing?.allowMeetup));
  const sellerLocations = useMemo(() => {
    if (!Array.isArray(cartItems)) return [];
    const locations = cartItems.map(item => {
      const city = item.listing?.city;
      const district = item.listing?.district;
      if (city && district) return `${city} / ${district}`;
      if (city) return city;
      return null;
    }).filter(Boolean);
    return Array.from(new Set(locations));
  }, [cartItems]);
  const isStepValid = selectedShippingAddressId && selectedBillingAddressId && (deliveryMethod !== 'SAFE_MEETUP' || meetupLocation && meetupLocation.trim().length > 0);
  const selectedBillingAddress = addresses?.find(a => String(a.id) === String(selectedBillingAddressId));
  const getValidationWarning = () => {
    if (!hasAddresses) return 'Please add an address first';
    if (!selectedShippingAddressId) return 'Select a shipping address';
    if (!selectedBillingAddressId) return 'Select a billing address';
    if (deliveryMethod === 'SAFE_MEETUP' && (!meetupLocation || !meetupLocation.trim())) {
      return 'Buluşma noktası seçiniz veya giriniz';
    }
    return null;
  };
  const warning = getValidationWarning();
  const predefinedHubs = ['📍 Kadıköy İskele', '📍 Marmara Forum', '📍 Metrobüs Avcılar'];
  return <div className="p-5 sm:p-7">
      {/* Delivery Method Selection */}
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h3 className="text-sm font-medium text-text-primary mb-3.5">{t("teslimat_y_ntemi")}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Cargo Option */}
          <label className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-300 ${deliveryMethod === 'CARGO' ? 'border-zinc-950 bg-zinc-50/50 shadow-sm ring-1 ring-zinc-950/10' : 'border-slate-100 bg-background-primary hover:border-slate-300'}`}>
            <input type="radio" name="deliveryMethod" value="CARGO" checked={deliveryMethod === 'CARGO'} onChange={() => setDeliveryMethod('CARGO')} className="mt-1 h-4 w-4 rounded-full border-slate-300 text-zinc-900 focus:ring-zinc-900/10" />
            <div>
              <span className="block text-sm font-semibold text-text-primary">{t("kargo_ile_g_nderim")}</span>
              <span className="mt-0.5 block text-xs text-slate-500">{t("standart_kargo_irketi_arac_l_yla_adrese_")}</span>
            </div>
          </label>

          {/* Safe Meetup Option */}
          <label className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-300 ${!canMeetup ? 'opacity-50 cursor-not-allowed border-slate-100 bg-slate-50' : deliveryMethod === 'SAFE_MEETUP' ? 'border-zinc-950 bg-zinc-50/50 shadow-sm ring-1 ring-zinc-950/10' : 'border-slate-100 bg-background-primary hover:border-slate-300'}`}>
            <input type="radio" name="deliveryMethod" value="SAFE_MEETUP" disabled={!canMeetup} checked={deliveryMethod === 'SAFE_MEETUP'} onChange={() => setDeliveryMethod('SAFE_MEETUP')} className="mt-1 h-4 w-4 rounded-full border-slate-300 text-zinc-900 focus:ring-zinc-900/10 disabled:opacity-50" />
            <div>
              <span className="block text-sm font-semibold text-text-primary flex items-center gap-1.5">{t("elden_g_venli_teslimat")}<button type="button" onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('open-safe-meetup-onboarding'));
              }} className="inline-flex items-center justify-center p-0.5 rounded-full text-primary hover:text-primary hover:bg-indigo-50 transition-all focus:outline-none animate-pulse cursor-pointer" title={t("elden_g_venli_teslimat_nedir_detayl_bilg")}>
                  <Info className="h-3.5 w-3.5" />
                </button>
                {canMeetup && <span className="rounded bg-status-success-bg px-1.5 py-0.5 text-caption font-bold text-emerald-700 uppercase tracking-wider">{t("aktif")}</span>}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {!canMeetup ? 'Sepetteki bazı ürünler elden teslimatı desteklemiyor.' : 'Ortak bir güvenli buluşma noktasında yüz yüze teslimat.'}
              </span>
              {canMeetup && sellerLocations.length > 0 && <span className="mt-2 block text-xs text-primary font-bold bg-indigo-50/50 px-2 py-1 rounded-md border border-primary/30 w-fit">{t("sat_c_n_n_konumu")}<span className="text-slate-800 font-semibold">{sellerLocations.join(', ')}</span>
                </span>}
            </div>
          </label>
        </div>

        {/* Meetup Location Selector */}
        {deliveryMethod === 'SAFE_MEETUP' && <div className="mt-6 rounded-xl border border-zinc-200/60 bg-background-primary p-4 animate-fadeIn">
            <h4 className="mb-3 text-body font-bold uppercase tracking-wider text-slate-500">{t("bulu_ma_noktas_se_in")}</h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 mb-4">
              {predefinedHubs.map(hub => {
            const isSelected = meetupLocation === hub;
            return <button key={hub} type="button" onClick={() => {
              setMeetupLocation(hub);
              setCustomLocationActive(false);
            }} className={`rounded-lg border px-3.5 py-2.5 text-left text-xs font-medium transition-all ${isSelected ? 'border-zinc-900 bg-zinc-50 text-zinc-950 font-semibold' : 'border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
                    {hub}
                  </button>;
          })}
              <button type="button" onClick={() => {
            setCustomLocationActive(true);
            if (predefinedHubs.includes(meetupLocation)) {
              setMeetupLocation('');
            }
          }} className={`rounded-lg border px-3.5 py-2.5 text-left text-xs font-medium transition-all ${customLocationActive || !predefinedHubs.includes(meetupLocation) && meetupLocation ? 'border-zinc-900 bg-zinc-50 text-zinc-950 font-semibold' : 'border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>{t("serbest_metin_zel_konum")}</button>
            </div>

            {(customLocationActive || !predefinedHubs.includes(meetupLocation) && meetupLocation) && <div className="animate-slideDown">
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">{t("zel_bulu_ma_noktas_girin")}</label>
                <input type="text" value={meetupLocation || ''} onChange={e => setMeetupLocation(e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-background-primary px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-950/5" placeholder={t("rn_kad_k_y_bo_a_heykeli_n_metro_k")} />
              </div>}

            {meetupLocation && <p className="mt-3 text-xs text-slate-500 font-medium">{t("se_ilen_konum")}<span className="font-semibold text-slate-800">{meetupLocation}</span>
              </p>}
          </div>}
      </div>

      {/* Section: Shipping */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-primary text-[#111]">
            {deliveryMethod === 'SAFE_MEETUP' ? 'Fatura Adresi' : 'Adres Bilgisi'}
          </h3>
          <span className="text-caption font-medium uppercase tracking-widest text-[#999]">{t("gerekli")}</span>
        </div>

        {!hasAddresses ? <div className="rounded-lg border border-dashed border-[#ddd] bg-[#fafaf9] py-10 text-center">
            <p className="mb-4 text-sm text-[#999]">{t("no_saved_addresses")}</p>
            <button type="button" onClick={() => navigate(ROUTES.PROFILE)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#1466c6] bg-[#1466c6] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#0f529e]">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />{t("add_address")}</button>
          </div> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {addresses.map(address => {
          const isSelected = String(selectedShippingAddressId) === String(address.id);
          return <label key={address.id} className={`relative cursor-pointer rounded-xl border p-5 transition-all duration-300 ${isSelected ? 'border-transparent ring-2 ring-indigo-600 bg-indigo-50/15 shadow-sm scale-[1.01]' : 'border-slate-100 bg-background-primary hover:border-slate-300 hover:shadow-sm'}`}>
                  <input type="radio" name="shipping" value={address.id} checked={isSelected} onChange={e => handleShippingChange(e.target.value)} className="sr-only" />
                  <div className="flex items-start gap-3">
                    {/* Radio indicator */}
                    <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${isSelected ? 'border-primary' : 'border-slate-300'}`}>
                      {isSelected && <span className="h-2 w-2 rounded-full bg-primary animate-scaleUp" />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold tracking-tight text-text-primary">{address.addressLine}</div>
                      <div className="mt-1 text-xs text-slate-500 font-medium">
                        {address.city}, {address.state}
                        {address.neighborhoodKey ? `, ${address.neighborhoodKey.split('_').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}` : ''}
                        {` ${address.postalCode}`}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-caption font-bold text-slate-400 uppercase tracking-wider">{address.country}</span>
                        {address.mainAddress && <span className="rounded-md border border-border-light bg-slate-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">{t("default")}</span>}
                      </div>
                    </div>
                  </div>
                </label>;
        })}
          </div>}
      </div>

      {/* Section: Billing */}
      {hasAddresses && deliveryMethod !== 'SAFE_MEETUP' && <div className="mb-6 rounded-xl border border-slate-100 bg-background-primary shadow-sm p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer select-none items-center gap-3">
              <input type="checkbox" checked={billingSameAsShipping} onChange={handleBillingToggle} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-indigo-600/20" />
              <span className="text-sm font-semibold text-slate-800">{t("billing_same_as_shipping")}</span>
            </label>

            {!billingSameAsShipping && <div className="relative w-full sm:w-64">
                <select value={selectedBillingAddressId || ''} onChange={e => setSelectedBillingAddressId(Number(e.target.value))} className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 pr-10 text-sm text-text-primary outline-none transition focus:border-primary focus:bg-background-primary focus:ring-4 focus:ring-indigo-100 shadow-inner">
                  <option value="">{t("choose_billing_address")}</option>
                  {addresses.map(a => <option key={a.id} value={a.id}>
                      {a.addressLine} — {a.city}, {a.state}
                    </option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                {selectedBillingAddress && !billingSameAsShipping && <p className="mt-1.5 truncate pl-0.5 text-caption text-slate-400">
                    {selectedBillingAddress.city}, {selectedBillingAddress.state}
                    {selectedBillingAddress.neighborhoodKey ? `, ${selectedBillingAddress.neighborhoodKey.split('_').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}` : ''}{' '}
                    {selectedBillingAddress.postalCode}
                  </p>}
              </div>}
          </div>
        </div>}

      {/* Order name & notes */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{t("order_name")}<span className="font-normal text-slate-400 capitalize">{t("optional")}</span>
          </label>
          <input type="text" className="w-full rounded-xl border border-slate-100 bg-background-primary px-4 py-3 text-sm text-text-primary outline-none transition shadow-sm placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-indigo-100" placeholder={t("e_g_birthday_gift")} value={orderName || ''} onChange={e => setOrderName(e.target.value)} maxLength={100} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{t("notes")}<span className="font-normal text-slate-400 capitalize">{t("optional")}</span>
          </label>
          <input type="text" className="w-full rounded-xl border border-slate-100 bg-background-primary px-4 py-3 text-sm text-text-primary outline-none transition shadow-sm placeholder:text-slate-300 focus:border-primary focus:ring-4 focus:ring-indigo-100" placeholder={t("delivery_notes")} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
      </div>

      {/* Navigation — desktop */}
      <div className="hidden items-center justify-between border-t border-slate-100 pt-6 sm:flex">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-text-primary">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />{t("back")}</button>
        <div className="flex items-center gap-4">
          {warning && <span className="text-xs text-status-warning font-semibold tracking-wide">{warning}</span>}
          <button type="button" onClick={onNext} disabled={!isStepValid} className="flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-black disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 shadow-sm active:scale-[0.98]">{t("continue")}<ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Navigation — mobile */}
      <div className="sticky bottom-0 -mx-5 mt-6 flex flex-col gap-2 border-t border-slate-100 bg-background-primary px-5 py-4 sm:hidden">
        {warning && <p className="text-center text-xs text-status-warning font-semibold tracking-wide mb-1">{warning}</p>}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onBack} className="flex items-center justify-center gap-1.5 rounded-xl border border-border-light bg-background-primary py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition-all hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />{t("back")}</button>
          <button type="button" onClick={onNext} disabled={!isStepValid} className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-black disabled:bg-slate-100 disabled:text-slate-400">{t("continue")}<ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>;
};
export default memo(CheckoutAddressStep);