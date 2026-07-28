import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect, memo } from 'react';
import { ChevronDown, Plus, ArrowLeft, ArrowRight, Info, CheckCircle2, MapPin, Truck } from 'lucide-react';
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
  const { t } = useTranslation();
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

  const isStepValid = selectedShippingAddressId && selectedBillingAddressId && (deliveryMethod !== 'SAFE_MEETUP' || (meetupLocation && meetupLocation.trim().length > 0));
  const selectedBillingAddress = addresses?.find(a => String(a.id) === String(selectedBillingAddressId));

  const getValidationWarning = () => {
    if (!hasAddresses) return t("please_add_address_first", "Lütfen önce bir adres ekleyin");
    if (!selectedShippingAddressId) return t("select_shipping_address", "Lütfen teslimat adresi seçin");
    if (!selectedBillingAddressId) return t("select_billing_address", "Lütfen fatura adresi seçin");
    if (deliveryMethod === 'SAFE_MEETUP' && (!meetupLocation || !meetupLocation.trim())) {
      return t("select_meetup_location", "Lütfen buluşma noktası seçiniz veya giriniz");
    }
    return null;
  };

  const warning = getValidationWarning();
  const predefinedHubs = ['📍 Kadıköy İskele', '📍 Marmara Forum', '📍 Metrobüs Avcılar'];

  return (
    <div className="p-5 sm:p-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
      {/* Delivery Method Selection */}
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h3 className="text-xs font-black text-slate-900 mb-4 tracking-wider uppercase flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-600" />
          {t("teslimat_y_ntemi", "Teslimat Yöntemi")}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Cargo Option */}
          <label className={`relative flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-all duration-200 active:scale-[0.99] ${deliveryMethod === 'CARGO' ? 'border-emerald-600 bg-emerald-50/20 shadow-md shadow-emerald-600/10 ring-2 ring-emerald-600/10' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'}`}>
            <input type="radio" name="deliveryMethod" value="CARGO" checked={deliveryMethod === 'CARGO'} onChange={() => setDeliveryMethod('CARGO')} className="sr-only" />
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${deliveryMethod === 'CARGO' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'}`}>
              {deliveryMethod === 'CARGO' && <span className="h-2 w-2 rounded-full bg-white" />}
            </span>
            <div>
              <span className="block text-sm font-bold text-slate-900">{t("kargo_ile_g_nderim", "Kargo ile Gönderim")}</span>
              <span className="mt-1 block text-xs text-slate-500 font-medium leading-relaxed">{t("standart_kargo_irketi_arac_l_yla_adrese_", "Güvenli kargo ile adresinize teslimat yapılacaktır.")}</span>
            </div>
          </label>

          {/* Safe Meetup Option */}
          <label className={`relative flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-all duration-200 active:scale-[0.99] ${!canMeetup ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50' : deliveryMethod === 'SAFE_MEETUP' ? 'border-emerald-600 bg-emerald-50/20 shadow-md shadow-emerald-600/10 ring-2 ring-emerald-600/10' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'}`}>
            <input type="radio" name="deliveryMethod" value="SAFE_MEETUP" disabled={!canMeetup} checked={deliveryMethod === 'SAFE_MEETUP'} onChange={() => setDeliveryMethod('SAFE_MEETUP')} className="sr-only" />
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${deliveryMethod === 'SAFE_MEETUP' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'}`}>
              {deliveryMethod === 'SAFE_MEETUP' && <span className="h-2 w-2 rounded-full bg-white" />}
            </span>
            <div>
              <span className="block text-sm font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                {t("elden_g_venli_teslimat", "Elden Güvenli Teslimat")}
                <button type="button" onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.dispatchEvent(new CustomEvent('open-safe-meetup-onboarding'));
                }} className="inline-flex items-center justify-center p-0.5 rounded-full text-emerald-600 hover:bg-emerald-100 transition-all focus:outline-none cursor-pointer" title={t("elden_g_venli_teslimat_nedir_detayl_bilg", "Güvenli buluşma garantisi hakkında bilgi")}>
                  <Info className="h-3.5 w-3.5" />
                </button>
                {canMeetup && <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold text-emerald-800 uppercase tracking-wider border border-emerald-300/40">{t("aktif", "Aktif")}</span>}
              </span>
              <span className="mt-1 block text-xs text-slate-500 font-medium leading-relaxed">
                {!canMeetup ? 'Sepetteki bazı ürünler elden teslimatı desteklemiyor.' : 'Ortak bir güvenli buluşma noktasında yüz yüze teslimat.'}
              </span>
              {canMeetup && sellerLocations.length > 0 && (
                <span className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {t("sat_c_n_n_konumu", "Satıcının Konumu")}: <span className="text-slate-900 font-bold">{sellerLocations.join(', ')}</span>
                </span>
              )}
            </div>
          </label>
        </div>

        {/* Meetup Location Selector */}
        {deliveryMethod === 'SAFE_MEETUP' && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 animate-fadeIn">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {t("bulu_ma_noktas_se_in", "Buluşma Noktası Seçin")}
            </h4>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 mb-4">
              {predefinedHubs.map(hub => {
                const isSelected = meetupLocation === hub;
                return (
                  <button
                    key={hub}
                    type="button"
                    onClick={() => {
                      setMeetupLocation(hub);
                      setCustomLocationActive(false);
                    }}
                    className={`rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-white text-emerald-700 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {hub}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setCustomLocationActive(true);
                  if (predefinedHubs.includes(meetupLocation)) {
                    setMeetupLocation('');
                  }
                }}
                className={`rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold transition-all ${
                  customLocationActive || (!predefinedHubs.includes(meetupLocation) && meetupLocation)
                    ? 'border-emerald-600 bg-white text-emerald-700 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                ✏️ {t("serbest_metin_zel_konum", "Özel Konum Gir")}
              </button>
            </div>

            {(customLocationActive || (!predefinedHubs.includes(meetupLocation) && meetupLocation)) && (
              <div className="animate-slideDown mt-3">
                <label className="mb-1.5 block text-xs font-bold text-slate-700">{t("zel_bulu_ma_noktas_girin", "Özel Buluşma Noktası Girin")}</label>
                <input
                  type="text"
                  value={meetupLocation || ''}
                  onChange={e => setMeetupLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  placeholder={t("rn_kad_k_y_bo_a_heykeli_n_metro_k", "Örn: Kadıköy Boğa Heykeli önü / Metro çıkışı")}
                />
              </div>
            )}

            {meetupLocation && (
              <p className="mt-3 text-xs text-slate-600 font-medium">
                {t("se_ilen_konum", "Seçilen Konum")}: <span className="font-extrabold text-slate-900">{meetupLocation}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Section: Shipping Address Selection */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            {deliveryMethod === 'SAFE_MEETUP' ? 'Fatura Adresi' : 'Teslimat Adresi'}
          </h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddAddressModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider cursor-pointer"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              {t("add_address", "Yeni Adres Ekle")}
            </button>
          </div>
        </div>

        {!hasAddresses ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
            <p className="mb-3 text-sm text-slate-600 font-medium">{t("no_saved_addresses", "Kayıtlı adresiniz bulunmuyor.")}</p>
            <button
              type="button"
              onClick={() => setIsAddAddressModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-extrabold text-white transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              {t("add_address", "Yeni Adres Ekle")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {addresses.map(address => {
              const isSelected = String(selectedShippingAddressId) === String(address.id);
              return (
                <label
                  key={address.id}
                  className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-200 active:scale-[0.99] ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/20 shadow-md shadow-emerald-600/10 ring-2 ring-emerald-600/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value={address.id}
                    checked={isSelected}
                    onChange={e => handleShippingChange(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                        isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-extrabold tracking-tight text-slate-900">{address.addressLine}</div>
                        {isSelected && (
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {t("selected", "Seçili")}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 text-xs text-slate-600 leading-relaxed font-medium">
                        {address.city}, {address.state}
                        {address.neighborhoodKey ? `, ${address.neighborhoodKey.split('_').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}` : ''}
                        {` ${address.postalCode}`}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{address.country}</span>
                        {address.mainAddress && (
                          <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-600">
                            {t("default", "Varsayılan")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Section: Billing Address Selection */}
      {hasAddresses && deliveryMethod !== 'SAFE_MEETUP' && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer select-none items-center gap-3">
              <input
                type="checkbox"
                checked={billingSameAsShipping}
                onChange={handleBillingToggle}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
              />
              <span className="text-xs font-bold text-slate-900">{t("billing_same_as_shipping", "Fatura adresi teslimat adresi ile aynı olsun")}</span>
            </label>

            {!billingSameAsShipping && (
              <div className="relative w-full sm:w-64">
                <select
                  value={selectedBillingAddressId || ''}
                  onChange={e => setSelectedBillingAddressId(Number(e.target.value))}
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-xs pr-8"
                >
                  <option value="">{t("choose_billing_address", "Fatura Adresi Seçin")}</option>
                  {addresses.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.addressLine} — {a.city}, {a.state}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Name & Notes */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
            {t("order_name", "Sipariş Adı")} <span className="font-normal text-slate-400 capitalize">({t("optional", "opsiyonel")})</span>
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition shadow-xs placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-medium"
            placeholder={t("e_g_birthday_gift", "Örn: Doğum Günü Hediyesi")}
            value={orderName || ''}
            onChange={e => setOrderName(e.target.value)}
            maxLength={100}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
            {t("notes", "Sipariş Notu")} <span className="font-normal text-slate-400 capitalize">({t("optional", "opsiyonel")})</span>
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition shadow-xs placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-medium"
            placeholder={t("delivery_notes", "Kuryeye iletilecek sipariş notu")}
            value={notes || ''}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-extrabold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          {t("back", "Geri")}
        </button>

        <div className="flex items-center gap-3">
          {warning && <span className="text-xs text-amber-600 font-extrabold tracking-wide hidden sm:inline">{warning}</span>}
          <button
            type="button"
            onClick={onNext}
            disabled={!isStepValid}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-7 py-3 text-xs font-extrabold uppercase tracking-wider text-white transition-all shadow-md shadow-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none active:scale-[0.98] cursor-pointer"
          >
            {t("continue", "Devam Et")}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
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
    </div>
  );
};

export default memo(CheckoutAddressStep);