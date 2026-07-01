import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect, memo } from 'react';
import { ChevronDown, Plus, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import AddressForm from '../../../user/components/address/AddressForm.jsx';
import useAddresses from '../../../user/hooks/useAddresses.js';

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
  const { addAddress, loading: addressMutating, error: addressError } = useAddresses();
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const hasAddresses = Array.isArray(addresses) && addresses.length > 0;
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(() => !selectedBillingAddressId || selectedBillingAddressId === selectedShippingAddressId);
  const [customLocationActive, setCustomLocationActive] = useState(false);

  const handleAddAddressSubmit = async (newAddress) => {
    try {
      const result = await addAddress(newAddress);
      if (result?.id) {
        setSelectedShippingAddressId(Number(result.id));
        setSelectedBillingAddressId(Number(result.id));
      }
      setIsAddAddressModalOpen(false);
    } catch (e) {
      console.error('Failed to add address:', e);
    }
  };
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
      <div className="mb-8 border-b border-border-light pb-6">
        <h3 className="text-sm font-bold text-text-primary mb-4 tracking-wide uppercase">{t("teslimat_y_ntemi")}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Cargo Option */}
          <label className={`relative flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-all duration-300 active:scale-[0.99] ${deliveryMethod === 'CARGO' ? 'border-primary bg-primary/[0.02] shadow-[0_4px_20px_rgba(20,102,198,0.06)] ring-1 ring-primary/10' : 'border-border-light bg-background-primary hover:border-border hover:shadow-[0_2px_12px_rgba(0,0,0,0.02)]'}`}>
            <input type="radio" name="deliveryMethod" value="CARGO" checked={deliveryMethod === 'CARGO'} onChange={() => setDeliveryMethod('CARGO')} className="sr-only" />
            <span className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${deliveryMethod === 'CARGO' ? 'border-primary bg-white ring-4 ring-primary/10' : 'border-border bg-white'}`}>
              {deliveryMethod === 'CARGO' && <span className="h-2 w-2 rounded-full bg-primary" />}
            </span>
            <div>
              <span className="block text-sm font-bold text-text-primary">{t("kargo_ile_g_nderim")}</span>
              <span className="mt-1 block text-xs text-text-muted leading-relaxed">{t("standart_kargo_irketi_arac_l_yla_adrese_")}</span>
            </div>
          </label>

          {/* Safe Meetup Option */}
          <label className={`relative flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-all duration-300 active:scale-[0.99] ${!canMeetup ? 'opacity-50 cursor-not-allowed border-border-light bg-background-secondary' : deliveryMethod === 'SAFE_MEETUP' ? 'border-primary bg-primary/[0.02] shadow-[0_4px_20px_rgba(20,102,198,0.06)] ring-1 ring-primary/10' : 'border-border-light bg-background-primary hover:border-border hover:shadow-[0_2px_12px_rgba(0,0,0,0.02)]'}`}>
            <input type="radio" name="deliveryMethod" value="SAFE_MEETUP" disabled={!canMeetup} checked={deliveryMethod === 'SAFE_MEETUP'} onChange={() => setDeliveryMethod('SAFE_MEETUP')} className="sr-only" />
            <span className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${deliveryMethod === 'SAFE_MEETUP' ? 'border-primary bg-white ring-4 ring-primary/10' : 'border-border bg-white'}`}>
              {deliveryMethod === 'SAFE_MEETUP' && <span className="h-2 w-2 rounded-full bg-primary" />}
            </span>
            <div>
              <span className="block text-sm font-bold text-text-primary flex items-center gap-1.5">{t("elden_g_venli_teslimat")}<button type="button" onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('open-safe-meetup-onboarding'));
              }} className="inline-flex items-center justify-center p-0.5 rounded-full text-primary hover:text-primary hover:bg-primary/15 transition-all focus:outline-none animate-pulse cursor-pointer" title={t("elden_g_venli_teslimat_nedir_detayl_bilg")}>
                  <Info className="h-3.5 w-3.5" />
                </button>
                {canMeetup && <span className="rounded-lg bg-status-success-bg px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 uppercase tracking-widest border border-emerald-500/20">{t("aktif")}</span>}
              </span>
              <span className="mt-1 block text-xs text-text-muted leading-relaxed">
                {!canMeetup ? 'Sepetteki bazı ürünler elden teslimatı desteklemiyor.' : 'Ortak bir güvenli buluşma noktasında yüz yüze teslimat.'}
              </span>
              {canMeetup && sellerLocations.length > 0 && <span className="mt-3 inline-flex items-center gap-1 text-[10px] text-primary font-bold bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/25">{t("sat_c_n_n_konumu")}<span className="text-text-primary font-bold">{sellerLocations.join(', ')}</span>
                </span>}
            </div>
          </label>
        </div>

        {/* Meetup Location Selector */}
        {deliveryMethod === 'SAFE_MEETUP' && <div className="mt-6 rounded-xl border border-border-light bg-background-primary p-4 animate-fadeIn">
            <h4 className="mb-3 text-body font-bold uppercase tracking-wider text-text-muted">{t("bulu_ma_noktas_se_in")}</h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 mb-4">
              {predefinedHubs.map(hub => {
            const isSelected = meetupLocation === hub;
            return <button key={hub} type="button" onClick={() => {
              setMeetupLocation(hub);
              setCustomLocationActive(false);
            }} className={`rounded-lg border px-3.5 py-2.5 text-left text-xs font-medium transition-all ${isSelected ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-border-light text-text-secondary hover:border-border hover:bg-background-secondary'}`}>
                    {hub}
                  </button>;
          })}
              <button type="button" onClick={() => {
            setCustomLocationActive(true);
            if (predefinedHubs.includes(meetupLocation)) {
              setMeetupLocation('');
            }
          }} className={`rounded-lg border px-3.5 py-2.5 text-left text-xs font-medium transition-all ${customLocationActive || !predefinedHubs.includes(meetupLocation) && meetupLocation ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-border-light text-text-secondary hover:border-border hover:bg-background-secondary'}`}>{t("serbest_metin_zel_konum")}</button>
            </div>

            {(customLocationActive || !predefinedHubs.includes(meetupLocation) && meetupLocation) && <div className="animate-slideDown">
                <label className="mb-1.5 block text-xs font-semibold text-text-secondary">{t("zel_bulu_ma_noktas_girin")}</label>
                <input type="text" value={meetupLocation || ''} onChange={e => setMeetupLocation(e.target.value)} className="w-full rounded-lg border border-border-light bg-background-primary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/5" placeholder={t("rn_kad_k_y_bo_a_heykeli_n_metro_k")} />
              </div>}

            {meetupLocation && <p className="mt-3 text-xs text-text-muted font-medium">{t("se_ilen_konum")}<span className="font-semibold text-text-primary">{meetupLocation}</span>
              </p>}
          </div>}
      </div>

      {/* Section: Shipping */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-primary">
            {deliveryMethod === 'SAFE_MEETUP' ? 'Fatura Adresi' : 'Adres Bilgisi'}
          </h3>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setIsAddAddressModalOpen(true)} className="inline-flex items-center gap-1 text-xs font-bold text-primary uppercase tracking-wider hover:text-primary-hover">
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              {t("add_address")}
            </button>
            <span className="text-caption font-medium uppercase tracking-widest text-text-muted">{t("gerekli")}</span>
          </div>
        </div>

        {!hasAddresses ? (
          <div className="rounded-lg border border-dashed border-border-light bg-background-secondary py-10 text-center">
            <p className="mb-4 text-sm text-text-muted">{t("no_saved_addresses")}</p>
            <button type="button" onClick={() => setIsAddAddressModalOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-hover">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />{t("add_address")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {addresses.map(address => {
              const isSelected = String(selectedShippingAddressId) === String(address.id);
              return (
                <label key={address.id} className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-300 active:scale-[0.99] ${isSelected ? 'border-primary bg-primary/[0.02] shadow-[0_4px_20px_rgba(20,102,198,0.06)] ring-1 ring-primary/10' : 'border-border-light bg-background-primary hover:border-border hover:shadow-[0_2px_12px_rgba(0,0,0,0.02)]'}`}>
                  <input type="radio" name="shipping" value={address.id} checked={isSelected} onChange={e => handleShippingChange(e.target.value)} className="sr-only" />
                  <div className="flex items-start gap-3">
                    {/* Radio indicator */}
                    <span className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isSelected ? 'border-primary bg-white ring-4 ring-primary/10' : 'border-border bg-white'}`}>
                      {isSelected && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold tracking-tight text-text-primary">{address.addressLine}</div>
                      <div className="mt-1.5 text-xs text-text-secondary leading-relaxed font-medium">
                        {address.city}, {address.state}
                        {address.neighborhoodKey ? `, ${address.neighborhoodKey.split('_').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}` : ''}
                        {` ${address.postalCode}`}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{address.country}</span>
                        {address.mainAddress && <span className="rounded-lg border border-border-light bg-background-secondary px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-text-muted">{t("default")}</span>}
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Section: Billing */}
      {hasAddresses && deliveryMethod !== 'SAFE_MEETUP' && <div className="mb-6 rounded-xl border border-border-light bg-background-primary shadow-sm p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer select-none items-center gap-3">
              <input type="checkbox" checked={billingSameAsShipping} onChange={handleBillingToggle} className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20" />
              <span className="text-sm font-semibold text-text-primary">{t("billing_same_as_shipping")}</span>
            </label>

            {!billingSameAsShipping && <div className="relative w-full sm:w-64">
                <select value={selectedBillingAddressId || ''} onChange={e => setSelectedBillingAddressId(Number(e.target.value))} className="w-full appearance-none rounded-xl border border-border-light bg-background-secondary px-4 py-2.5 pr-10 text-sm text-text-primary outline-none transition focus:border-primary focus:bg-background-primary focus:ring-2 focus:ring-primary/20 shadow-inner">
                  <option value="">{t("choose_billing_address")}</option>
                  {addresses.map(a => <option key={a.id} value={a.id}>
                      {a.addressLine} — {a.city}, {a.state}
                    </option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                {selectedBillingAddress && !billingSameAsShipping && <p className="mt-1.5 truncate pl-0.5 text-caption text-text-muted">
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
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-text-muted">{t("order_name")}<span className="font-normal text-text-muted capitalize">{t("optional")}</span>
          </label>
          <input type="text" className="w-full rounded-xl border border-border-light bg-background-primary px-4 py-3 text-sm text-text-primary outline-none transition shadow-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder={t("e_g_birthday_gift")} value={orderName || ''} onChange={e => setOrderName(e.target.value)} maxLength={100} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-text-muted">{t("notes")}<span className="font-normal text-text-muted capitalize">{t("optional")}</span>
          </label>
          <input type="text" className="w-full rounded-xl border border-border-light bg-background-primary px-4 py-3 text-sm text-text-primary outline-none transition shadow-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder={t("delivery_notes")} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
      </div>

      {/* Navigation — desktop */}
      <div className="hidden items-center justify-between border-t border-border-light pt-6 sm:flex">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />{t("back")}</button>
        <div className="flex items-center gap-4">
          {warning && <span className="text-xs text-status-warning font-semibold tracking-wide">{warning}</span>}
          <button type="button" onClick={onNext} disabled={!isStepValid} className="flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-background-secondary disabled:text-text-muted shadow-sm active:scale-[0.98]">{t("continue")}<ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Navigation — mobile */}
      <div className="sticky bottom-0 -mx-5 mt-6 flex flex-col gap-2 border-t border-border-light bg-background-primary px-5 py-4 sm:hidden">
        {warning && <p className="text-center text-xs text-status-warning font-semibold tracking-wide mb-1">{warning}</p>}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onBack} className="flex items-center justify-center gap-1.5 rounded-xl border border-border-light bg-background-primary py-3.5 text-xs font-bold uppercase tracking-wider text-text-secondary transition-all hover:bg-background-secondary">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />{t("back")}</button>
          <button type="button" onClick={onNext} disabled={!isStepValid} className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-primary-hover disabled:bg-background-secondary disabled:text-text-muted">{t("continue")}<ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      <AddressForm
        isOpen={isAddAddressModalOpen}
        onClose={() => setIsAddAddressModalOpen(false)}
        onSubmit={handleAddAddressSubmit}
        loading={addressMutating}
        error={addressError}
      />
    </div>;
};

export default memo(CheckoutAddressStep);