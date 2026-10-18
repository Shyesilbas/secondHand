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

  return (
    <div className="space-y-5">
      {/* Saved Address Quick Pick Banner / Chips */}
      {addresses.length > 0 && (
        <div className="rounded border border-border-light bg-background-secondary p-3.5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-text-secondary" strokeWidth={1.5} aria-hidden />
              <div>
                <p className="text-xs font-semibold text-text-primary">
                  {t("saved_addresses", "Kayıtlı Adreslerinizden Seçin")}
                </p>
                <p className="text-xs text-text-secondary">
                  {t("saved_addresses_hint", "Konum bilgilerini otomatik doldurmak için tıklayın.")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {addresses.map(addr => {
                const isSelected = selectedAddressId === addr.id ||
                  (formData.cityKey === addr.cityKey && formData.districtKey === addr.districtKey);
                const label = addr.addressType === 'HOME'
                  ? t("address_home", "Ev")
                  : addr.addressType === 'WORK'
                  ? t("address_work", "İş")
                  : t("address_other", "Diğer");
                return (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => handleSelectSavedAddress(addr)}
                    className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors ${
                      isSelected
                        ? 'border border-primary bg-primary font-semibold text-text-inverse'
                        : 'border border-border-light bg-background-primary font-medium text-text-primary hover:border-card-border-hover'
                    }`}
                  >
                    {addr.addressType === 'HOME' ? (
                      <Home className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                    ) : addr.addressType === 'WORK' ? (
                      <Building2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                    ) : (
                      <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                    )}
                    <span>{label}</span>
                    {addr.city && <span className="opacity-80">({addr.city})</span>}
                    {addr.mainAddress && (
                      <span className={`ml-0.5 rounded-sm px-1 py-0.5 text-xs font-semibold ${
                        isSelected ? 'bg-background-secondary/20 text-text-inverse' : 'bg-background-tertiary text-text-secondary'
                      }`}>
                        {t("default", "Varsayılan")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* City Select */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {t("city_i_l", "City")}<span className="text-status-error">*</span>
          </label>
          <div className="relative">
            <select
              name="cityKey"
              value={formData.cityKey || ''}
              onChange={handleCityChange}
              disabled={loadingCities}
              className={errors.cityKey || errors.city ? inputError : inputNormal}
            >
              <option value="">{t("select_city", "Select City...")}</option>
              {cities.map(c => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
            {loadingCities && (
              <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-muted" />
            )}
          </div>
          <FieldError error={errors.cityKey || errors.city} />
        </div>

        {/* District Select */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {t("district_i_l_e", "District")}<span className="text-status-error">*</span>
          </label>
          <div className="relative">
            <select
              name="districtKey"
              value={formData.districtKey || ''}
              onChange={handleDistrictChange}
              disabled={!formData.cityKey || loadingDistricts}
              className={errors.districtKey || errors.district ? inputError : inputNormal}
            >
              <option value="">{t("select_district", "Select District...")}</option>
              {districts.map(d => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
            {loadingDistricts && (
              <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-muted" />
            )}
          </div>
          <FieldError error={errors.districtKey || errors.district} />
        </div>

        {/* Neighborhood Select */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {t("neighborhood_mahalle", "Neighborhood")}{' '}
            <span className="font-normal text-text-muted">({t("optional", "Optional")})</span>
          </label>
          <div className="relative">
            <select
              name="neighborhoodKey"
              value={formData.neighborhoodKey || ''}
              onChange={handleNeighborhoodChange}
              disabled={!formData.districtKey || loadingNeighborhoods}
              className={errors.neighborhoodKey ? inputError : inputNormal}
            >
              <option value="">{t("select_neighborhood", "Select Neighborhood...")}</option>
              {neighborhoods.map(n => (
                <option key={n.key} value={n.key}>
                  {n.label}
                </option>
              ))}
            </select>
            {loadingNeighborhoods && (
              <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-muted" />
            )}
          </div>
          <FieldError error={errors.neighborhoodKey} />
        </div>
      </div>
      <FieldError error={locationError} />
    </div>
  );
};
export default LocationFields;