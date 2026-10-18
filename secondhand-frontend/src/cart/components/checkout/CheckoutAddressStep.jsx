import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect, memo } from 'react';
import { ChevronDown, Plus, ArrowLeft, ArrowRight, Truck, Users, MapPin, CheckCircle2, Home, FileText, Sparkles, ShieldCheck, AlertCircle, Pencil } from 'lucide-react';
import AddressForm from '../../../user/components/address/AddressForm.jsx';
import useAddresses from '../../../user/hooks/useAddresses.js';

const PREDEFINED_HUBS = [
  'Kadıköy İskele Meydanı',
  'Mecidiyeköy Meydanı / Metro Çıkışı',
  'Beşiktaş Çarşı / Kartal Heykeli',
  'Kızılay Meydanı (Ankara)',
  'Konak Vapur İskelesi (İzmir)'
];

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
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(
    () => !selectedBillingAddressId || selectedBillingAddressId === selectedShippingAddressId
  );
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

  const handleShippingChange = (id) => {
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

  const getValidationWarning = () => {
    if (!hasAddresses) return 'Lütfen devam etmek için en az bir adres ekleyin.';
    if (!selectedShippingAddressId) return 'Lütfen bir teslimat adresi seçin.';
    if (!selectedBillingAddressId) return 'Lütfen bir fatura adresi seçin.';
    if (deliveryMethod === 'SAFE_MEETUP' && (!meetupLocation || !meetupLocation.trim())) {
      return 'Lütfen güvenli elden teslim için bir buluşma noktası belirleyin.';
    }
    return null;
  };

  const warning = getValidationWarning();

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* ── Section 1: Delivery Method ──────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary tracking-tight">
              {t("teslimat_y_ntemi", "Teslimat Yöntemi Seçin")}
            </h3>
            <p className="text-xs text-text-tertiary font-medium mt-0.5">
              Ürününüzü nasıl teslim almak istediğinizi belirleyin.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold bg-background-tertiary text-text-secondary border border-border">
            {deliveryMethod === 'CARGO' ? 'Standart Gönderim' : 'Elden Teslimat'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Cargo Option */}
          <label className={`group relative flex cursor-pointer items-start gap-4 rounded-md border-2 p-5 transition-all duration-200 ${
            deliveryMethod === 'CARGO'
              ? 'border-primary bg-background-secondary ring-2'
              : 'border-border/80 bg-white hover:border-card-border-hover'
          }`}>
            <input 
              type="radio" 
              name="deliveryMethod" 
              value="CARGO" 
              checked={deliveryMethod === 'CARGO'} 
              onChange={() => setDeliveryMethod('CARGO')} 
              className="sr-only" 
            />
            
            <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded border transition-colors ${
              deliveryMethod === 'CARGO' 
                ? 'bg-primary text-white border-primary' 
                : 'bg-background-tertiary text-text-secondary border-border group-hover:bg-secondary-200/60'
            }`}>
              <Truck className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="block text-sm font-semibold text-text-primary">
                  {t("kargo_ile_g_nderim", "Adrese Kargo Teslimatı")}
                </span>
                {deliveryMethod === 'CARGO' && (
                  <CheckCircle2 className="h-4 w-4 text-text-primary shrink-0" />
                )}
              </div>
              <span className="mt-1 block text-xs text-text-tertiary font-medium leading-relaxed">
                {t("standart_kargo_irketi_arac_l_yla_adrese_", "Anlaşmalı kargo firmaları ile kapınıza kadar sigortalı teslimat.")}
              </span>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-status-success-text bg-background-secondary w-fit px-2 py-0.5 rounded-md border border-border">
                <Sparkles className="h-3 w-3" />
                <span>Ücretsiz & Takip Numaralı</span>
              </div>
            </div>
          </label>

          {/* Safe Meetup Option */}
          <label className={`group relative flex cursor-pointer items-start gap-4 rounded-md border-2 p-5 transition-all duration-200 ${
            !canMeetup
              ? 'opacity-50 cursor-not-allowed border-border bg-background-secondary/70'
              : deliveryMethod === 'SAFE_MEETUP'
              ? 'border-primary bg-background-secondary ring-2'
              : 'border-border/80 bg-white hover:border-card-border-hover'
          }`}>
            <input 
              type="radio" 
              name="deliveryMethod" 
              value="SAFE_MEETUP" 
              disabled={!canMeetup} 
              checked={deliveryMethod === 'SAFE_MEETUP'} 
              onChange={() => setDeliveryMethod('SAFE_MEETUP')} 
              className="sr-only" 
            />

            <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded border transition-colors ${
              deliveryMethod === 'SAFE_MEETUP' 
                ? 'bg-primary text-white border-primary' 
                : 'bg-background-tertiary text-text-secondary border-border group-hover:bg-secondary-200/60'
            }`}>
              <Users className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="block text-sm font-semibold text-text-primary">
                  {t("elden_g_venli_teslimat", "Elden Güvenli Buluşma")}
                </span>
                {deliveryMethod === 'SAFE_MEETUP' && (
                  <CheckCircle2 className="h-4 w-4 text-text-primary shrink-0" />
                )}
              </div>

              <span className="mt-1 block text-xs text-text-tertiary font-medium leading-relaxed">
                {!canMeetup 
                  ? 'Sepetteki ürünlerden bazıları elden teslimatı desteklemiyor.' 
                  : 'Ortak güvenli noktada 6 haneli PIN ile yüz yüze kontrol ve teslimat.'
                }
              </span>

              {canMeetup && sellerLocations.length > 0 && (
                <div className="mt-2.5 inline-flex items-center gap-1 text-xs text-text-secondary font-semibold bg-background-tertiary px-2 py-0.5 rounded-md border border-border">
                  <MapPin className="h-3 w-3 text-text-secondary" />
                  <span>Satıcı Konumu: <strong className="text-text-primary">{sellerLocations.join(', ')}</strong></span>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Meetup Location Selector Sub-panel */}
        {deliveryMethod === 'SAFE_MEETUP' && (
          <div className="mt-4 rounded-md border border-border/90 bg-background-secondary/50 p-5 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-status-warning-text" />
                <h4 className="text-xs font-semibold text-status-warning-text">
                  {t("bulu_ma_noktas_se_in", "Buluşma Noktası Belirleyin")}
                </h4>
              </div>
              <span className="text-xs text-status-warning-text font-medium">Önerilen Güvenli Noktalar</span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 mb-3">
              {PREDEFINED_HUBS.map(hub => {
                const isSelected = meetupLocation === hub;
                return (
                  <button
                    key={hub}
                    type="button"
                    onClick={() => {
                      setMeetupLocation(hub);
                      setCustomLocationActive(false);
                    }}
                    className={`flex items-center gap-2 rounded border px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-border/70 bg-white text-text-secondary hover:border-card-border-hover hover:bg-background-secondary/30'
                    }`}
                  >
                    <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    <span className="truncate">{hub}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setCustomLocationActive(true);
                  if (PREDEFINED_HUBS.includes(meetupLocation)) {
                    setMeetupLocation('');
                  }
                }}
                className={`flex items-center justify-center gap-1.5 rounded border px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  customLocationActive || (!PREDEFINED_HUBS.includes(meetupLocation) && meetupLocation)
                    ? 'border-primary bg-primary text-white'
                    : 'border-border/70 bg-white text-text-secondary hover:border-card-border-hover'
                }`}
              >
                <Pencil className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                <span>Farklı / Özel Konum Gir</span>
              </button>
            </div>

            {(customLocationActive || (!PREDEFINED_HUBS.includes(meetupLocation) && meetupLocation)) && (
              <div className="mt-3">
                <input
                  type="text"
                  value={meetupLocation || ''}
                  onChange={e => setMeetupLocation(e.target.value)}
                  className="w-full rounded border border-card-border-hover bg-white px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-text-muted"
                  placeholder={t("rn_kad_k_y_bo_a_heykeli_n_metro_k", "Örn: Kadıköy Boğa Heykeli önü veya Levent Metro çıkışı")}
                />
              </div>
            )}

            {meetupLocation && (
              <div className="mt-3 flex items-center gap-2 text-xs text-status-warning-text bg-background-secondary/60 px-3 py-2 rounded border border-border">
                <ShieldCheck className="h-4 w-4 text-status-warning-text shrink-0" />
                <span>Belirlenen Nokta: <strong className="text-text-primary">{meetupLocation}</strong></span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Section 2: Shipping Addresses ───────────────────────── */}
      <div className="border-t border-border-light pt-7">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary tracking-tight">
              {deliveryMethod === 'SAFE_MEETUP' ? 'Yasal Fatura Adresi' : 'Teslimat Adresi'}
            </h3>
            <p className="text-xs text-text-tertiary font-medium mt-0.5">
              {deliveryMethod === 'SAFE_MEETUP' 
                ? 'Elden teslimatlarda mevzuat gereği fatura düzenlenecek kayıtlı adresiniz.' 
                : 'Siparişinizin güvenle gönderileceği kayıtlı adresinizi seçin.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddAddressModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-9 px-3"
          >
            <Plus className="h-3.5 w-3.5 text-text-primary" strokeWidth={2.5} />
            {t("add_address", "Yeni Adres")}
          </button>
        </div>

        {!hasAddresses ? (
          <div className="rounded-md border-2 border-dashed border-border bg-background-secondary/70 p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-white border border-border text-text-muted">
              <Home className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-text-primary">{t("no_saved_addresses", "Henüz kayıtlı bir adresiniz bulunmuyor")}</p>
            <p className="text-xs text-text-tertiary mt-1 max-w-sm mx-auto">
              Siparişinizi tamamlamak için teslimat adresinizi ekleyerek başlayabilirsiniz.
            </p>
            <button
              type="button"
              onClick={() => setIsAddAddressModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-9 px-3 mt-4"
            >
              <Plus className="h-3.5 w-3.5" />
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
                  className={`relative flex flex-col justify-between cursor-pointer rounded-md border-2 p-5 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-background-secondary ring-2'
                      : 'border-border/80 bg-white hover:border-card-border-hover'
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
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          isSelected ? 'border-primary bg-white' : 'border-card-border-hover bg-white'
                        }`}>
                          {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                        </span>
                        <span className="text-sm font-semibold text-text-primary truncate">
                          {address.title || 'Adres'}
                        </span>
                      </div>

                      {address.mainAddress && (
                        <span className="rounded-md bg-background-tertiary border border-border px-2 py-0.5 text-xs font-semibold text-text-secondary">
                          {t("default", "Varsayılan")}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-text-secondary font-medium leading-relaxed mt-2 line-clamp-2">
                      {address.addressLine}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border-light flex items-center justify-between text-xs text-text-tertiary font-semibold">
                    <span>{address.city}{address.state ? ` / ${address.state}` : ''}</span>
                    <span>{address.postalCode}</span>
                  </div>
                </label>
              );
            })}

            {/* Quick Add Address card directly in grid */}
            <button
              type="button"
              onClick={() => setIsAddAddressModalOpen(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-background-secondary/50 p-5 hover:border-secondary-400 hover:bg-background-secondary transition-all text-text-tertiary hover:text-text-primary min-h-36"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded bg-white border border-border">
                <Plus className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold">Farklı Adres Ekle</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Section 3: Billing Address Toggle (Cargo Mode) ─────────── */}
      {hasAddresses && deliveryMethod !== 'SAFE_MEETUP' && (
        <div className="rounded-md border border-border/90 bg-background-secondary/60 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer select-none items-center gap-3">
              <input
                type="checkbox"
                checked={billingSameAsShipping}
                onChange={handleBillingToggle}
                className="h-4 w-4 rounded border-card-border-hover text-text-primary focus:ring-primary"
              />
              <span className="text-xs font-semibold text-text-primary">
                {t("billing_same_as_shipping", "Fatura adresi teslimat adresiyle aynı")}
              </span>
            </label>

            {!billingSameAsShipping && (
              <div className="relative w-full sm:w-80">
                <select
                  value={selectedBillingAddressId || ''}
                  onChange={e => setSelectedBillingAddressId(Number(e.target.value))}
                  className="w-full appearance-none rounded border border-card-border-hover bg-white px-4 py-2.5 pr-10 text-xs font-semibold text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">{t("choose_billing_address", "Fatura Adresi Seçin")}</option>
                  {addresses.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.title ? `${a.title}: ` : ''}{a.addressLine} ({a.city})
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Section 4: Order Name & Delivery Notes ───────────────── */}
      <div className="border-t border-border-light pt-7">
        <h3 className="text-sm font-semibold text-text-primary tracking-tight mb-4">
          Sipariş Özelleştirme & Notlar
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text-tertiary">
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-text-muted" />
                {t("order_name", "Sipariş Başlığı")}
              </span>
              <span className="font-normal text-text-muted text-xs lowercase">({t("optional", "isteğe bağlı")})</span>
            </label>
            <input
              type="text"
              className="w-full rounded border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder={t("e_g_birthday_gift", "Örn: Kendime Doğum Günü Hediyesi")}
              value={orderName || ''}
              onChange={e => setOrderName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text-tertiary">
              <span className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-text-muted" />
                {t("notes", "Teslimat / Kurye Notu")}
              </span>
              <span className="font-normal text-text-muted text-xs lowercase">({t("optional", "isteğe bağlı")})</span>
            </label>
            <input
              type="text"
              className="w-full rounded border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder={t("delivery_notes", "Örn: Zil çalışmıyor, kapıda bırakabilirsiniz.")}
              value={notes || ''}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Navigation: Desktop & Mobile ────────────────────────── */}
      <div className="border-t border-border-light pt-6">
        {warning && (
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-status-warning-text bg-background-secondary border border-border px-4 py-2.5 rounded">
            <AlertCircle className="h-4 w-4 text-status-warning-text shrink-0" />
            <span>{warning}</span>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-10 px-4"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {t("back", "Sepete Dön")}
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!isStepValid}
            className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4"
          >
            {t("continue", "Ödeme Adımına Geç")}
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