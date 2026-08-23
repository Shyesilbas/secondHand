import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect, memo } from 'react';
import { ChevronDown, Plus, ArrowLeft, ArrowRight, Info, Truck, Users, MapPin, CheckCircle2 } from 'lucide-react';
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
 if (!hasAddresses) return 'Lütfen önce bir teslimat/fatura adresi ekleyin.';
 if (!selectedShippingAddressId) return 'Lütfen teslimat adresi seçin.';
 if (!selectedBillingAddressId) return 'Lütfen fatura adresi seçin.';
 if (deliveryMethod === 'SAFE_MEETUP' && (!meetupLocation || !meetupLocation.trim())) {
 return 'Lütfen bir buluşma noktası seçin veya girin.';
 }
 return null;
 };

 const warning = getValidationWarning();
 const predefinedHubs = ['📍 Kadıköy İskele Meydanı', '📍 Mecidiyeköy Meydanı / Metro Çıkışı', '📍 Beşiktaş Çarşı / Kartal Heykeli', '📍 Kızılay Meydanı (Ankara)', '📍 Konak Vapur İskelesi (İzmir)'];

 return (
 <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
 {/* Delivery Method Selection */}
 <div className="mb-8 border-b border-slate-100 pb-7">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">{t("teslimat_y_ntemi", "Teslimat Yöntemi")}</h3>
 <span className="text-[11px] font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
 {deliveryMethod === 'CARGO' ? '📦 Standart Gönderim' : '🤝 Elden Teslim'}
 </span>
 </div>

 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 {/* Cargo Option */}
 <label className={`relative flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-5 transition-all duration-200 ${
 deliveryMethod === 'CARGO'
 ? 'border-slate-900 bg-slate-100/40 shadow-xs ring-1 ring-slate-900/10'
 : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs'
 }`}>
 <input type="radio" name="deliveryMethod" value="CARGO" checked={deliveryMethod === 'CARGO'} onChange={() => setDeliveryMethod('CARGO')} className="sr-only" />
 <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
 deliveryMethod === 'CARGO' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-600 border-slate-200'
 }`}>
 <Truck className="h-5 w-5" />
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-center justify-between">
 <span className="block text-sm font-bold text-slate-900">{t("kargo_ile_g_nderim", "Adrese Kargo Teslimatı")}</span>
 {deliveryMethod === 'CARGO' && <CheckCircle2 className="h-4 w-4 text-slate-900 shrink-0" />}
 </div>
 <span className="mt-1 block text-xs text-slate-500 font-medium leading-relaxed">
 {t("standart_kargo_irketi_arac_l_yla_adrese_", "Anlaşmalı kargo firmaları ile kapınıza kadar güvenli teslimat.")}
 </span>
 </div>
 </label>

 {/* Safe Meetup Option */}
 <label className={`relative flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-5 transition-all duration-200 ${
 !canMeetup
 ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
 : deliveryMethod === 'SAFE_MEETUP'
 ? 'border-slate-900 bg-slate-100/40 shadow-xs ring-1 ring-slate-900/10'
 : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs'
 }`}>
 <input type="radio" name="deliveryMethod" value="SAFE_MEETUP" disabled={!canMeetup} checked={deliveryMethod === 'SAFE_MEETUP'} onChange={() => setDeliveryMethod('SAFE_MEETUP')} className="sr-only" />
 <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
 deliveryMethod === 'SAFE_MEETUP' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-600 border-slate-200'
 }`}>
 <Users className="h-5 w-5" />
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-center justify-between">
 <span className="block text-sm font-bold text-slate-900 flex items-center gap-1.5">
 {t("elden_g_venli_teslimat", "Elden Güvenli Buluşma")}
 <button
 type="button"
 onClick={e => {
 e.preventDefault();
 e.stopPropagation();
 window.dispatchEvent(new CustomEvent('open-safe-meetup-onboarding'));
 }}
 className="inline-flex items-center justify-center p-0.5 rounded-full text-slate-900 hover:bg-slate-200 transition-all cursor-pointer"
 title={t("elden_g_venli_teslimat_nedir_detayl_bilg", "Güvenli Buluşma Rehberi")}
 >
 <Info className="h-3.5 w-3.5" />
 </button>
 </span>
 {deliveryMethod === 'SAFE_MEETUP' && <CheckCircle2 className="h-4 w-4 text-slate-900 shrink-0" />}
 </div>
 <span className="mt-1 block text-xs text-slate-500 font-medium leading-relaxed">
 {!canMeetup ? 'Sepetteki bazı ürünler elden teslimatı desteklemiyor.' : 'Ortak belirlenen güvenli noktada 6 haneli PIN ile teslimat.'}
 </span>
 {canMeetup && sellerLocations.length > 0 && (
 <div className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-slate-900 font-semibold bg-slate-200/70 px-2.5 py-1 rounded-lg border border-slate-300">
 <MapPin className="h-3 w-3 text-slate-900" />
 <span>Satıcı Konumu: <strong className="text-slate-900">{sellerLocations.join(', ')}</strong></span>
 </div>
 )}
 </div>
 </label>
 </div>

 {/* Meetup Location Selector */}
 {deliveryMethod === 'SAFE_MEETUP' && (
 <div className="mt-6 rounded-2xl border border-amber-200/90 bg-amber-50/40 p-5 animate-fadeIn">
 <div className="flex items-center gap-2 mb-3">
 <MapPin className="h-4 w-4 text-amber-700" />
 <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
 {t("bulu_ma_noktas_se_in", "Buluşma Noktası Seçin")}
 </h4>
 </div>
 <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 mb-3">
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
 className={`rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
 isSelected
 ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
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
 className={`rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
 customLocationActive || (!predefinedHubs.includes(meetupLocation) && meetupLocation)
 ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
 : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
 }`}
 >
 ✏️ Farklı / Özel Konum Gir
 </button>
 </div>

 {(customLocationActive || (!predefinedHubs.includes(meetupLocation) && meetupLocation)) && (
 <div className="mt-3">
 <input
 type="text"
 value={meetupLocation || ''}
 onChange={e => setMeetupLocation(e.target.value)}
 className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs placeholder:text-slate-400"
 placeholder={t("rn_kad_k_y_bo_a_heykeli_n_metro_k", "Örn: Kadıköy Boğa Heykeli önü veya Levent Metro çıkışı")}
 />
 </div>
 )}

 {meetupLocation && (
 <p className="mt-3 text-xs text-amber-900 font-medium">
 Seçilen Buluşma Noktası: <strong className="text-slate-900">{meetupLocation}</strong>
 </p>
 )}
 </div>
 )}
 </div>

 {/* Section: Shipping Addresses */}
 <div className="mb-8">
 <div className="mb-4 flex items-center justify-between">
 <div>
 <h3 className="text-sm font-bold text-slate-900">
 {deliveryMethod === 'SAFE_MEETUP' ? 'Fatura Adresi' : 'Teslimat Adresi'}
 </h3>
 <p className="text-xs text-slate-500 font-medium mt-0.5">
 {deliveryMethod === 'SAFE_MEETUP' ? 'Yasal fatura düzenlemesi için kayıtlı adresiniz.' : 'Siparişinizin gönderileceği kayıtlı adresiniz.'}
 </p>
 </div>
 <button
 type="button"
 onClick={() => setIsAddAddressModalOpen(true)}
 className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-300 transition-colors"
 >
 <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
 {t("add_address", "Yeni Adres Ekle")}
 </button>
 </div>

 {!hasAddresses ? (
 <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 py-10 text-center">
 <p className="mb-4 text-sm text-slate-500 font-medium">{t("no_saved_addresses", "Henüz kayıtlı bir adresiniz bulunmuyor.")}</p>
 <button
 type="button"
 onClick={() => setIsAddAddressModalOpen(true)}
 className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-slate-900 shadow-xs"
 >
 <Plus className="h-3.5 w-3.5" strokeWidth={2} />
 {t("add_address", "Adres Ekle")}
 </button>
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
 {addresses.map(address => {
 const isSelected = String(selectedShippingAddressId) === String(address.id);
 return (
 <label
 key={address.id}
 className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 ${
 isSelected
 ? 'border-slate-900 bg-slate-100/30 shadow-xs ring-1 ring-slate-900/10'
 : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs'
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
 <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
 isSelected ? 'border-slate-900 bg-white ring-2 ring-slate-900/10' : 'border-slate-300 bg-white'
 }`}>
 {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />}
 </span>

 <div className="min-w-0 flex-1">
 <div className="flex items-center justify-between">
 <span className="text-sm font-bold text-slate-900 tracking-tight">{address.title || 'Ev / İş Adresi'}</span>
 {address.mainAddress && (
 <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
 {t("default", "Varsayılan")}
 </span>
 )}
 </div>
 <div className="mt-1.5 text-xs text-slate-700 leading-relaxed font-semibold">
 {address.addressLine}
 </div>
 <div className="mt-1 text-xs text-slate-500 font-medium">
 {address.city}, {address.state} {address.postalCode}
 </div>
 </div>
 </div>
 </label>
 );
 })}
 </div>
 )}
 </div>

 {/* Section: Billing Address Selection (when delivery is CARGO) */}
 {hasAddresses && deliveryMethod !== 'SAFE_MEETUP' && (
 <div className="mb-8 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <label className="flex cursor-pointer select-none items-center gap-3">
 <input
 type="checkbox"
 checked={billingSameAsShipping}
 onChange={handleBillingToggle}
 className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
 />
 <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
 {t("billing_same_as_shipping", "Fatura adresi teslimat adresiyle aynı")}
 </span>
 </label>

 {!billingSameAsShipping && (
 <div className="relative w-full sm:w-72">
 <select
 value={selectedBillingAddressId || ''}
 onChange={e => setSelectedBillingAddressId(Number(e.target.value))}
 className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-10 text-xs font-semibold text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-xs"
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

 {/* Order name & notes */}
 <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
 <div>
 <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
 {t("order_name", "Sipariş Başlığı")} <span className="font-normal text-slate-400 lowercase">({t("optional", "isteğe bağlı")})</span>
 </label>
 <input
 type="text"
 className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition shadow-xs placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
 placeholder={t("e_g_birthday_gift", "Örn: Kendime Doğum Günü Hediyesi")}
 value={orderName || ''}
 onChange={e => setOrderName(e.target.value)}
 maxLength={100}
 />
 </div>
 <div>
 <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
 {t("notes", "Teslimat / Sipariş Notu")} <span className="font-normal text-slate-400 lowercase">({t("optional", "isteğe bağlı")})</span>
 </label>
 <input
 type="text"
 className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition shadow-xs placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
 placeholder={t("delivery_notes", "Kurye için kapı zili veya teslimat notu...")}
 value={notes || ''}
 onChange={e => setNotes(e.target.value)}
 />
 </div>
 </div>

 {/* Navigation — desktop */}
 <div className="hidden items-center justify-between border-t border-slate-100 pt-6 sm:flex">
 <button
 type="button"
 onClick={onBack}
 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-900"
 >
 <ArrowLeft className="h-4 w-4" strokeWidth={2} />
 {t("back", "Geri")}
 </button>
 <div className="flex items-center gap-4">
 {warning && <span className="text-xs text-amber-700 font-semibold">{warning}</span>}
 <button
 type="button"
 onClick={onNext}
 disabled={!isStepValid}
 className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white transition-all hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 shadow-xs active:scale-[0.98]"
 >
 {t("continue", "Ödeme Adımına Geç")}
 <ArrowRight className="h-4 w-4" strokeWidth={2} />
 </button>
 </div>
 </div>

 {/* Navigation — mobile */}
 <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:hidden">
 {warning && <p className="text-center text-xs text-amber-700 font-semibold mb-1">{warning}</p>}
 <div className="grid grid-cols-2 gap-2">
 <button
 type="button"
 onClick={onBack}
 className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700"
 >
 <ArrowLeft className="h-4 w-4" strokeWidth={2} />
 {t("back", "Geri")}
 </button>
 <button
 type="button"
 onClick={onNext}
 disabled={!isStepValid}
 className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white disabled:bg-slate-200 disabled:text-slate-400"
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