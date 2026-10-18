import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { MapPin, Loader2, Building2, Home } from 'lucide-react';
import { useLocationOptions } from '../../hooks/useLocationOptions.js';
import useAddresses from '../../../user/hooks/useAddresses.js';
import { FieldError } from './FormPrimitives.jsx';
import { inputError as baseError, inputNormal as baseNormal } from './inputStyles.js';

const inputNormal = `${baseNormal} pl-10 pr-8 appearance-none`;
const inputError = `${baseError} pl-10 pr-8 appearance-none`;
const LocationFields = ({
 formData,
 errors = {},
 onInputChange
}) => {
 const {
 t
 } = useTranslation();
 const { addresses = [] } = useAddresses();
 const [selectedAddressId, setSelectedAddressId] = useState('');
 const { cities, districts, neighborhoods, loadingCities, loadingDistricts, loadingNeighborhoods, error: locationError } = useLocationOptions(formData.cityKey, formData.districtKey);

 // Handlers for selection change
 const handleCityChange = e => {
 const key = e.target.value;
 const selectedCity = cities.find(c => c.key === key);
 const label = selectedCity ? selectedCity.label : '';

 // Update parent values
 onInputChange({
 target: {
 name: 'cityKey',
 value: key
 }
 });
 onInputChange({
 target: {
 name: 'city',
 value: label
 }
 });

 // Clear lower hierarchies
 onInputChange({
 target: {
 name: 'districtKey',
 value: ''
 }
 });
 onInputChange({
 target: {
 name: 'district',
 value: ''
 }
 });
 onInputChange({
 target: {
 name: 'neighborhoodKey',
 value: ''
 }
 });
 };
 const handleDistrictChange = e => {
 const key = e.target.value;
 const selectedDist = districts.find(d => d.key === key);
 const label = selectedDist ? selectedDist.label : '';
 onInputChange({
 target: {
 name: 'districtKey',
 value: key
 }
 });
 onInputChange({
 target: {
 name: 'district',
 value: label
 }
 });

 // Clear neighborhood
 onInputChange({
 target: {
 name: 'neighborhoodKey',
 value: ''
 }
 });
 };
 const handleNeighborhoodChange = e => {
 const key = e.target.value;
 onInputChange({
 target: {
 name: 'neighborhoodKey',
 value: key
 }
 });
 };
 // Auto select address handler
 const handleSelectSavedAddress = (addr) => {
 if (!addr) return;
 setSelectedAddressId(addr.id);

 // 1. City
 if (addr.cityKey || addr.city) {
 const foundCity = cities.find(c => c.key === addr.cityKey || c.label.toLowerCase() === (addr.city || '').toLowerCase());
 const cKey = foundCity ? foundCity.key : addr.cityKey || '';
 const cLabel = foundCity ? foundCity.label : addr.city || '';
 onInputChange({ target: { name: 'cityKey', value: cKey } });
 onInputChange({ target: { name: 'city', value: cLabel } });
 }

 // 2. District
 if (addr.districtKey || addr.district || addr.state) {
 const distVal = addr.district || addr.state || '';
 onInputChange({ target: { name: 'districtKey', value: addr.districtKey || '' } });
 onInputChange({ target: { name: 'district', value: distVal } });
 }

 // 3. Neighborhood
 if (addr.neighborhoodKey) {
 onInputChange({ target: { name: 'neighborhoodKey', value: addr.neighborhoodKey } });
 }
 };

 return <div className="space-y-4">
 {/* Saved Address Quick Pick Banner / Chips */}
 {addresses.length > 0 && (
 <div className="rounded border border-primary/20 bg-primary/5 p-4 transition-all">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="flex items-center gap-2.5">
 <MapPin className="shrink-0 h-5 w-5 text-primary" strokeWidth={1.5} aria-hidden />
 <div>
 <p className="text-xs font-semibold text-text-primary">
 Kayıtlı Adreslerinizden Seçin
 </p>
 <p className="text-xs text-text-secondary">
 Konum bilgilerinizi otomatik doldurmak için kayıtlı adresinizi tıklayın.
 </p>
 </div>
 </div>
 
 <div className="flex flex-wrap gap-2 items-center">
 {addresses.map(addr => {
 const isSelected = selectedAddressId === addr.id || 
 (formData.cityKey === addr.cityKey && formData.districtKey === addr.districtKey);
 const label = addr.addressType === 'HOME' ? 'Ev' : addr.addressType === 'WORK' ? 'İş' : 'Diğer';
 return (
 <button
 key={addr.id}
 type="button"
 onClick={() => handleSelectSavedAddress(addr)}
 className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-all ${
 isSelected
 ? 'bg-primary text-white ring-2 ring-primary/30'
 : 'border border-border-light bg-background-primary text-text-primary hover:border-primary/50 hover:bg-primary/5'
 }`}
 >
 {addr.addressType === 'HOME' ? <Home className="h-4 w-4" strokeWidth={1.5} aria-hidden /> : addr.addressType === 'WORK' ? <Building2 className="h-4 w-4" strokeWidth={1.5} aria-hidden /> : <MapPin className="h-4 w-4" strokeWidth={1.5} aria-hidden />}
 <span>{label}</span>
 {addr.city && <span className="opacity-80">({addr.city})</span>}
 {addr.mainAddress && (
 <span className={`ml-0.5 rounded px-1 py-0.2 text-xs font-semibold ${isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
 Varsayılan
 </span>
 )}
 </button>
 );
 })}
 </div>
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
 {/* City Select */}
 <div>
 <label className="mb-1.5 block text-sm font-medium text-text-primary">{t("city_i_l")}<span className="text-status-error">*</span>
 </label>
 <div className="relative">
 <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
 <select name="cityKey" value={formData.cityKey || ''} onChange={handleCityChange} disabled={loadingCities} className={errors.cityKey || errors.city ? inputError : inputNormal}>
 <option value="">{t("select_city")}</option>
 {cities.map(c => <option key={c.key} value={c.key}>
 {c.label}
 </option>)}
 </select>
 {loadingCities && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-muted" />}
 {!loadingCities && <div className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted flex items-center justify-center">
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </div>}
 </div>
 <FieldError error={errors.cityKey || errors.city} />
 </div>

 {/* District Select */}
 <div>
 <label className="mb-1.5 block text-sm font-medium text-text-primary">{t("district_i_l_e")}<span className="text-status-error">*</span>
 </label>
 <div className="relative">
 <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
 <select name="districtKey" value={formData.districtKey || ''} onChange={handleDistrictChange} disabled={!formData.cityKey || loadingDistricts} className={errors.districtKey || errors.district ? inputError : inputNormal}>
 <option value="">{t("select_district")}</option>
 {districts.map(d => <option key={d.key} value={d.key}>
 {d.label}
 </option>)}
 </select>
 {loadingDistricts && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-muted" />}
 {!loadingDistricts && <div className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted flex items-center justify-center">
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </div>}
 </div>
 <FieldError error={errors.districtKey || errors.district} />
 </div>

 {/* Neighborhood Select */}
 <div>
 <label className="mb-1.5 block text-sm font-medium text-text-primary">{t("neighborhood_mahalle")}<span className="text-text-muted">{t("optional")}</span>
 </label>
 <div className="relative">
 <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
 <select name="neighborhoodKey" value={formData.neighborhoodKey || ''} onChange={handleNeighborhoodChange} disabled={!formData.districtKey || loadingNeighborhoods} className={errors.neighborhoodKey ? inputError : inputNormal}>
 <option value="">{t("select_neighborhood")}</option>
 {neighborhoods.map(n => <option key={n.key} value={n.key}>
 {n.label}
 </option>)}
 </select>
 {loadingNeighborhoods && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-muted" />}
 {!loadingNeighborhoods && <div className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted flex items-center justify-center">
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </div>}
 </div>
 <FieldError error={errors.neighborhoodKey} />
 </div>
 </div>
 <FieldError error={locationError} />
 </div>;
};
export default LocationFields;