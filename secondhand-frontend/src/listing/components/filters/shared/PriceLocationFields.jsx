import { useTranslation } from "react-i18next";
import { useState } from 'react';
import EnumDropdown from '../../../../common/components/ui/EnumDropdown.jsx';
import { MapPin, Landmark, Building2, Map, Loader2, Navigation } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { districtsQuery, useLocationOptions } from '../../../../common/hooks/useLocationOptions.js';
import { useAuthState } from '../../../../auth/AuthContext.jsx';
import { userService } from '../../../../user/services/userService.js';
const inp = 'w-full rounded border border-border-light bg-background-primary px-3 py-2.5 text-sm tabular-nums text-text-primary placeholder:text-text-muted transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed appearance-none pr-8';
const selectWrapper = 'relative flex items-center';
const dropdownIcon = <div className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted flex items-center justify-center">
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </div>;
const fieldLabel = 'mb-1.5 block text-xs font-semibold text-text-secondary';
const PriceLocationFields = ({
 filters,
 onPriceChange,
 onInputChange,
 compact = false
}) => {
 const {
 t
 } = useTranslation();
 const minVal = filters.minPrice == null || filters.minPrice === '' ? '' : filters.minPrice;
 const maxVal = filters.maxPrice == null || filters.maxPrice === '' ? '' : filters.maxPrice;
 const {
 isAuthenticated
 } = useAuthState();
 const queryClient = useQueryClient();
 const [loadingLocation, setLoadingLocation] = useState(false);
 const [nearMeError, setNearMeError] = useState('');
 const { cities, districts, neighborhoods, loadingCities, loadingDistricts, loadingNeighborhoods, error: locationError } = useLocationOptions(filters.cityKey, filters.districtKey);
 const handleShowNearMe = async () => {
 if (!isAuthenticated) {
 setNearMeError('Lütfen önce giriş yapın.');
 setTimeout(() => setNearMeError(''), 4000);
 return;
 }
 setLoadingLocation(true);
 setNearMeError('');
 try {
 const addresses = await userService.getAddresses();
 if (!addresses || addresses.length === 0) {
 setNearMeError('Kayıtlı adresiniz bulunamadı. Lütfen profilinizden bir adres ekleyin.');
 setTimeout(() => setNearMeError(''), 4000);
 return;
 }
 const myAddress = addresses.find(a => a.mainAddress) || addresses[0];

 // 1. Resolve and set city
 const cityLabel = cities.find(c => c.key === myAddress.cityKey)?.label || myAddress.city || '';
 onInputChange('cityKey', myAddress.cityKey || '');
 onInputChange('city', cityLabel);

 // 2. Fetch and resolve district
 if (myAddress.cityKey && myAddress.districtKey) {
 const districtsData = await queryClient.fetchQuery(districtsQuery(myAddress.cityKey));
 const distLabel = districtsData?.find(d => d.key === myAddress.districtKey)?.label || '';
 onInputChange('districtKey', myAddress.districtKey);
 onInputChange('district', distLabel);

 // 3. Fetch and resolve neighborhood
 if (myAddress.neighborhoodKey) {
 onInputChange('neighborhoodKey', myAddress.neighborhoodKey);
 } else {
 onInputChange('neighborhoodKey', '');
 }
 } else {
 onInputChange('districtKey', '');
 onInputChange('district', '');
 onInputChange('neighborhoodKey', '');
 }
 } catch (err) {
 console.error('Failed to auto-locate filters near user', err);
 setNearMeError('Konum bilgileri yüklenirken bir hata oluştu.');
 setTimeout(() => setNearMeError(''), 4000);
 } finally {
 setLoadingLocation(false);
 }
 };

 const handleCityChange = e => {
 const key = e.target.value;
 const selectedCity = cities.find(c => c.key === key);
 const label = selectedCity ? selectedCity.label : '';
 onInputChange('cityKey', key);
 onInputChange('city', label);

 // Clear dependents
 onInputChange('districtKey', '');
 onInputChange('district', '');
 onInputChange('neighborhoodKey', '');
 };
 const handleDistrictChange = e => {
 const key = e.target.value;
 const selectedDist = districts.find(d => d.key === key);
 const label = selectedDist ? selectedDist.label : '';
 onInputChange('districtKey', key);
 onInputChange('district', label);

 // Clear dependent
 onInputChange('neighborhoodKey', '');
 };
 const handleNeighborhoodChange = e => {
 const key = e.target.value;
 onInputChange('neighborhoodKey', key);
 };
 const renderLocationFieldsList = () => {
 return <>
 {/* City Select */}
 <div className="relative">
 <span className={`${fieldLabel} sr-only`}>{t("city")}</span>
 <div className={selectWrapper}>
 <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted z-10" />
 <select value={filters.cityKey ?? ''} onChange={handleCityChange} disabled={loadingCities} className={`${inp} pl-10`}>
 <option value="">{t("select_city_i_l")}</option>
 {cities.map(c => <option key={c.key} value={c.key}>
 {c.label}
 </option>)}
 </select>
 {loadingCities ? <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-muted" /> : dropdownIcon}
 </div>
 </div>

 {/* District Select */}
 <div className="relative">
 <span className={`${fieldLabel} sr-only`}>{t("district")}</span>
 <div className={selectWrapper}>
 <Map className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted z-10" />
 <select value={filters.districtKey ?? ''} onChange={handleDistrictChange} disabled={!filters.cityKey || loadingDistricts} className={`${inp} pl-10`}>
 <option value="">{t("select_district_i_l_e")}</option>
 {districts.map(d => <option key={d.key} value={d.key}>
 {d.label}
 </option>)}
 </select>
 {loadingDistricts ? <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-muted" /> : dropdownIcon}
 </div>
 </div>

 {/* Neighborhood Select */}
 <div className="relative">
 <span className={`${fieldLabel} sr-only`}>{t("neighborhood")}</span>
 <div className={selectWrapper}>
 <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted z-10" />
 <select value={filters.neighborhoodKey ?? ''} onChange={handleNeighborhoodChange} disabled={!filters.districtKey || loadingNeighborhoods} className={`${inp} pl-10`}>
 <option value="">{t("select_neighborhood_mahalle")}</option>
 {neighborhoods.map(n => <option key={n.key} value={n.key}>
 {n.label}
 </option>)}
 </select>
 {loadingNeighborhoods ? <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-muted" /> : dropdownIcon}
 </div>
 </div>
 </>;
 };
 if (compact) {
 return <div className="min-w-0 space-y-5">
 <div className="space-y-4">
 <div>
 <span className={fieldLabel}>{t("price_range")}</span>
 <div className="flex items-stretch gap-2 min-w-0">
 <input type="number" inputMode="decimal" value={minVal} onChange={e => onPriceChange('minPrice', e.target.value)} placeholder={t("min")} min="0" className={`${inp} min-w-0 flex-1 pr-3`} />
 <span className="flex shrink-0 items-center text-secondary-300" aria-hidden>
 –
 </span>
 <input type="number" inputMode="decimal" value={maxVal} onChange={e => onPriceChange('maxPrice', e.target.value)} placeholder={t("max")} min="0" className={`${inp} min-w-0 flex-1 pr-3`} />
 </div>
 <p className="mt-1 text-xs font-medium text-text-muted">{t("leave_blank_for_no_limit")}</p>
 </div>
 <div>
 <span className={fieldLabel}>{t("currency")}</span>
 <EnumDropdown enumKey="currencies" value={filters.currency ?? ''} onChange={v => onInputChange('currency', v)} multiple={false} placeholder={t("any_currency")} searchPlaceholder="Search currency…" className="w-full" usePortal={true} />
 </div>
 </div>

 <div className="space-y-3 border-t border-border-light pt-4">
 <div className="flex items-center gap-2 text-text-secondary">
 <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
 <span className="text-xs font-semibold">{t("location")}</span>
 </div>

 <button type="button" onClick={handleShowNearMe} disabled={loadingLocation} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-10 px-4 w-full">
 {loadingLocation ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-4 w-4" strokeWidth={1.5} />}{t("bana_yak_n_i_lanlar_g_ster")}</button>
 {(nearMeError || locationError) && <p role="alert" className="mt-1 text-center text-xs text-status-error-text">
 {nearMeError || locationError}
 </p>}

 {renderLocationFieldsList()}
 </div>
 </div>;
 }
 return <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
 <div className="rounded-md border border-border-light bg-background-primary p-5">
 <div className="mb-4 flex items-center gap-2 text-text-primary">
 <Landmark className="h-4 w-4 text-primary" />
 <h3 className="text-sm font-medium text-text-primary tracking-tight">{t("price_range")}</h3>
 </div>
 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <input type="number" value={minVal} onChange={e => onPriceChange('minPrice', e.target.value)} placeholder={t("min")} min="0" className={`${inp} pr-3`} />
 <span className="text-secondary-300">–</span>
 <input type="number" value={maxVal} onChange={e => onPriceChange('maxPrice', e.target.value)} placeholder={t("max")} min="0" className={`${inp} pr-3`} />
 </div>
 <EnumDropdown label={t("currency")} enumKey="currencies" value={filters.currency ?? ''} onChange={v => onInputChange('currency', v)} multiple={false} placeholder={t("any_currency")} className="w-full" />
 </div>
 </div>

 <div className="rounded-md border border-border-light bg-background-primary p-5">
 <div className="mb-4 flex items-center justify-between gap-2 text-text-primary">
 <div className="flex items-center gap-2">
 <MapPin className="h-4 w-4 text-primary" />
 <h3 className="text-sm font-medium text-text-primary tracking-tight">{t("location")}</h3>
 </div>
 <button type="button" onClick={handleShowNearMe} disabled={loadingLocation} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-9 px-3">
 {loadingLocation ? <Loader2 className="h-3 w-3 animate-spin" /> : <Navigation className="h-4 w-4" strokeWidth={1.5} />}{t("bana_yak_n_i_lanlar")}</button>
 </div>
 {(nearMeError || locationError) && <p role="alert" className="mb-2 text-right text-xs text-status-error-text">
 {nearMeError || locationError}
 </p>}
 <div className="space-y-4">
 {renderLocationFieldsList()}
 </div>
 </div>
 </div>;
};
export default PriceLocationFields;