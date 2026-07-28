import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { AlertCircle, MapPin, Loader2, ChevronDown } from 'lucide-react';
import { get } from '../../services/api/request.js';
import { API_ENDPOINTS } from '../../constants/apiEndpoints.js';

const FieldError = ({ error }) => {
  if (!error) return null;
  return (
    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 flex items-center gap-1 text-xs font-bold text-rose-600">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {error}
    </motion.p>
  );
};

const inputBase = 'w-full pl-10 pr-8 py-2.5 text-sm border rounded-xl outline-none transition-all duration-200 appearance-none bg-white font-medium cursor-pointer shadow-xs';
const inputNormal = `${inputBase} border-slate-200 text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 hover:border-slate-300`;
const inputError = `${inputBase} border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20`;

const LocationFields = ({
  formData,
  errors = {},
  onInputChange
}) => {
  const { t } = useTranslation();
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

  // 2. Fetch districts when cityKey changes
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

  // 3. Fetch neighborhoods when districtKey changes
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

  // Handlers
  const handleCityChange = e => {
    const key = e.target.value;
    const selectedCity = cities.find(c => c.key === key);
    const label = selectedCity ? selectedCity.label : '';

    onInputChange({ target: { name: 'cityKey', value: key } });
    onInputChange({ target: { name: 'city', value: label } });
    onInputChange({ target: { name: 'districtKey', value: '' } });
    onInputChange({ target: { name: 'district', value: '' } });
    onInputChange({ target: { name: 'neighborhoodKey', value: '' } });
  };

  const handleDistrictChange = e => {
    const key = e.target.value;
    const selectedDist = districts.find(d => d.key === key);
    const label = selectedDist ? selectedDist.label : '';
    onInputChange({ target: { name: 'districtKey', value: key } });
    onInputChange({ target: { name: 'district', value: label } });
    onInputChange({ target: { name: 'neighborhoodKey', value: '' } });
  };

  const handleNeighborhoodChange = e => {
    const key = e.target.value;
    onInputChange({ target: { name: 'neighborhoodKey', value: key } });
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* City Select */}
      <div>
        <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-700">
          {t("city_i_l", "İl")} <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            name="cityKey"
            value={formData.cityKey || ''}
            onChange={handleCityChange}
            disabled={loadingCities}
            className={errors.cityKey || errors.city ? inputError : inputNormal}
          >
            <option value="">{t("select_city", "İl Seçin")}</option>
            {cities.map(c => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
          {loadingCities ? (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-emerald-600" />
          ) : (
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          )}
        </div>
        <FieldError error={errors.cityKey || errors.city} />
      </div>

      {/* District Select */}
      <div>
        <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-700">
          {t("district_i_l_e", "İlçe")} <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            name="districtKey"
            value={formData.districtKey || ''}
            onChange={handleDistrictChange}
            disabled={!formData.cityKey || loadingDistricts}
            className={errors.districtKey || errors.district ? inputError : inputNormal}
          >
            <option value="">{t("select_district", "İlçe Seçin")}</option>
            {districts.map(d => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
          {loadingDistricts ? (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-emerald-600" />
          ) : (
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          )}
        </div>
        <FieldError error={errors.districtKey || errors.district} />
      </div>

      {/* Neighborhood Select */}
      <div>
        <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-700">
          {t("neighborhood_mahalle", "Mahalle")} <span className="text-slate-400 capitalize font-medium">({t("optional", "opsiyonel")})</span>
        </label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            name="neighborhoodKey"
            value={formData.neighborhoodKey || ''}
            onChange={handleNeighborhoodChange}
            disabled={!formData.districtKey || loadingNeighborhoods}
            className={errors.neighborhoodKey ? inputError : inputNormal}
          >
            <option value="">{t("select_neighborhood", "Mahalle Seçin")}</option>
            {neighborhoods.map(n => (
              <option key={n.key} value={n.key}>
                {n.label}
              </option>
            ))}
          </select>
          {loadingNeighborhoods ? (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-emerald-600" />
          ) : (
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          )}
        </div>
        <FieldError error={errors.neighborhoodKey} />
      </div>
    </div>
  );
};

export default LocationFields;