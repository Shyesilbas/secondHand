import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { AlertCircle, MapPin, Loader2 } from 'lucide-react';
import { get } from '../../services/api/request.js';
import { API_ENDPOINTS } from '../../constants/apiEndpoints.js';
import useAddresses from '../../../user/hooks/useAddresses.js';

const FieldError = ({
 error
}) => {
 if (!error) return null;
 return <p className="mt-1.5 flex items-center gap-1 text-body text-status-error">
 <AlertCircle className="h-3 w-3 shrink-0" />
 {error}
 </p>;
};
const inputBase = 'w-full pl-10 pr-8 py-2.5 text-sm border rounded-lg focus:outline-none transition-all duration-200 appearance-none bg-background-primary';
const inputNormal = `${inputBase} border-zinc-200/60 text-zinc-900 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 wizard-input-glow hover:border-zinc-300`;
const inputError = `${inputBase} border-status-error-border bg-status-error-bg/30 focus:border-status-error-border focus:ring-2 focus:ring-status-error/10`;
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
 const [cities, setCities] = useState([]);
 const [districts, setDistricts] = useState([]);
 const [neighborhoods, setNeighborhoods] = useState([]);
 const [loadingCities, setLoadingCities] = useState(false);
 const [loadingDistricts, setLoadingDistricts] = useState(false);
 const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

 // 1. Fetch cities on mount
 useEffect(() => {
 const fetchCities = async () => {
 setLoadingCities(true);
 try {
 const data = await get(API_ENDPOINTS.CATALOG.LOCATIONS.CITIES);
 setCities(data || []);
 } catch (err) {
 console.error('Failed to load cities', err);
 } finally {
 setLoadingCities(false);
 }
 };
 fetchCities();
 }, []);

 // 2. Fetch districts when cityKey changes or exists initially (edit mode)
 useEffect(() => {
 if (!formData.cityKey) {
 setDistricts([]);
 setNeighborhoods([]);
 return;
 }
 const fetchDistricts = async () => {
 setLoadingDistricts(true);
 try {
 const data = await get(API_ENDPOINTS.CATALOG.LOCATIONS.DISTRICTS(formData.cityKey));
 setDistricts(data || []);
 } catch (err) {
 console.error('Failed to load districts', err);
 } finally {
 setLoadingDistricts(false);
 }
 };
 fetchDistricts();
 }, [formData.cityKey]);

 // 3. Fetch neighborhoods when districtKey changes or exists initially (edit mode)
 useEffect(() => {
 if (!formData.districtKey) {
 setNeighborhoods([]);
 return;
 }
 const fetchNeighborhoods = async () => {
 setLoadingNeighborhoods(true);
 try {
 const data = await get(API_ENDPOINTS.CATALOG.LOCATIONS.NEIGHBORHOODS(formData.districtKey));
 setNeighborhoods(data || []);
 } catch (err) {
 console.error('Failed to load neighborhoods', err);
 } finally {
 setLoadingNeighborhoods(false);
 }
 };
 fetchNeighborhoods();
 }, [formData.districtKey]);

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
 <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="flex items-center gap-2.5">
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
 <MapPin className="h-4 w-4" />
 </div>
 <div>
 <p className="text-xs font-semibold text-text-primary">
 Kayıtlı Adreslerinizden Seçin
 </p>
 <p className="text-caption text-text-secondary">
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
 className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
 isSelected
 ? 'bg-primary text-white shadow-sm ring-2 ring-primary/30'
 : 'border border-border-light bg-background-primary text-text-primary hover:border-primary/50 hover:bg-primary/5'
 }`}
 >
 <span>{addr.addressType === 'HOME' ? '🏠' : addr.addressType === 'WORK' ? '🏢' : '📍'}</span>
 <span>{label}</span>
 {addr.city && <span className="opacity-80">({addr.city})</span>}
 {addr.mainAddress && (
 <span className={`ml-0.5 rounded px-1 py-0.2 text-[10px] uppercase font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
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
 <label className="mb-1.5 block text-sm font-medium text-zinc-900">{t("city_i_l")}<span className="text-status-error">*</span>
 </label>
 <div className="relative">
 <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
 <select name="cityKey" value={formData.cityKey || ''} onChange={handleCityChange} disabled={loadingCities} className={errors.cityKey || errors.city ? inputError : inputNormal}>
 <option value="">{t("select_city")}</option>
 {cities.map(c => <option key={c.key} value={c.key}>
 {c.label}
 </option>)}
 </select>
 {loadingCities && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-400" />}
 {!loadingCities && <div className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 flex items-center justify-center">
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </div>}
 </div>
 <FieldError error={errors.cityKey || errors.city} />
 </div>

 {/* District Select */}
 <div>
 <label className="mb-1.5 block text-sm font-medium text-zinc-900">{t("district_i_l_e")}<span className="text-status-error">*</span>
 </label>
 <div className="relative">
 <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
 <select name="districtKey" value={formData.districtKey || ''} onChange={handleDistrictChange} disabled={!formData.cityKey || loadingDistricts} className={errors.districtKey || errors.district ? inputError : inputNormal}>
 <option value="">{t("select_district")}</option>
 {districts.map(d => <option key={d.key} value={d.key}>
 {d.label}
 </option>)}
 </select>
 {loadingDistricts && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-400" />}
 {!loadingDistricts && <div className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 flex items-center justify-center">
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </div>}
 </div>
 <FieldError error={errors.districtKey || errors.district} />
 </div>

 {/* Neighborhood Select */}
 <div>
 <label className="mb-1.5 block text-sm font-medium text-zinc-900">{t("neighborhood_mahalle")}<span className="text-zinc-400">{t("optional")}</span>
 </label>
 <div className="relative">
 <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
 <select name="neighborhoodKey" value={formData.neighborhoodKey || ''} onChange={handleNeighborhoodChange} disabled={!formData.districtKey || loadingNeighborhoods} className={errors.neighborhoodKey ? inputError : inputNormal}>
 <option value="">{t("select_neighborhood")}</option>
 {neighborhoods.map(n => <option key={n.key} value={n.key}>
 {n.label}
 </option>)}
 </select>
 {loadingNeighborhoods && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-400" />}
 {!loadingNeighborhoods && <div className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 flex items-center justify-center">
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </div>}
 </div>
 <FieldError error={errors.neighborhoodKey} />
 </div>
 </div>
 </div>;
};
export default LocationFields;