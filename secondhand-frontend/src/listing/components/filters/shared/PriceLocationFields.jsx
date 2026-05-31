import React, { useState, useEffect } from 'react';
import EnumDropdown from '../../../../common/components/ui/EnumDropdown.jsx';
import { MapPin, Landmark, Building2, Map, Loader2, Navigation } from 'lucide-react';
import { get } from '../../../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../../../common/constants/apiEndpoints.js';
import { useAuthState } from '../../../../auth/AuthContext.jsx';
import { userService } from '../../../../user/services/userService.js';

const inp =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm tabular-nums text-slate-900 placeholder:text-slate-400 shadow-sm transition-all focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed appearance-none pr-8';

const selectWrapper = 'relative flex items-center';

const dropdownIcon = (
  <div className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 flex items-center justify-center">
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

const fieldLabel = 'mb-1.5 block text-xs font-semibold text-slate-700';

const PriceLocationFields = ({ filters, onPriceChange, onInputChange, compact = false }) => {
  const minVal = filters.minPrice == null || filters.minPrice === '' ? '' : filters.minPrice;
  const maxVal = filters.maxPrice == null || filters.maxPrice === '' ? '' : filters.maxPrice;

  const { user, isAuthenticated } = useAuthState();
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [nearMeError, setNearMeError] = useState('');

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);

  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

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
        setLoadingDistricts(true);
        const districtsData = await get(API_ENDPOINTS.CATALOG.LOCATIONS.DISTRICTS(myAddress.cityKey));
        setDistricts(districtsData || []);
        const distLabel = districtsData?.find(d => d.key === myAddress.districtKey)?.label || '';
        onInputChange('districtKey', myAddress.districtKey);
        onInputChange('district', distLabel);

        // 3. Fetch and resolve neighborhood
        if (myAddress.neighborhoodKey) {
          setLoadingNeighborhoods(true);
          const neighborhoodsData = await get(API_ENDPOINTS.CATALOG.LOCATIONS.NEIGHBORHOODS(myAddress.districtKey));
          setNeighborhoods(neighborhoodsData || []);
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
      setLoadingDistricts(false);
      setLoadingNeighborhoods(false);
    }
  };

  // 1. Fetch cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const data = await get(API_ENDPOINTS.CATALOG.LOCATIONS.CITIES);
        setCities(data || []);
      } catch (err) {
        console.error('Failed to load cities for filter', err);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  // 2. Fetch districts when cityKey changes
  useEffect(() => {
    if (!filters.cityKey) {
      setDistricts([]);
      setNeighborhoods([]);
      return;
    }

    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const data = await get(API_ENDPOINTS.CATALOG.LOCATIONS.DISTRICTS(filters.cityKey));
        setDistricts(data || []);
      } catch (err) {
        console.error('Failed to load districts for filter', err);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [filters.cityKey]);

  // 3. Fetch neighborhoods when districtKey changes
  useEffect(() => {
    if (!filters.districtKey) {
      setNeighborhoods([]);
      return;
    }

    const fetchNeighborhoods = async () => {
      setLoadingNeighborhoods(true);
      try {
        const data = await get(API_ENDPOINTS.CATALOG.LOCATIONS.NEIGHBORHOODS(filters.districtKey));
        setNeighborhoods(data || []);
      } catch (err) {
        console.error('Failed to load neighborhoods for filter', err);
      } finally {
        setLoadingNeighborhoods(false);
      }
    };
    fetchNeighborhoods();
  }, [filters.districtKey]);

  const handleCityChange = (e) => {
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

  const handleDistrictChange = (e) => {
    const key = e.target.value;
    const selectedDist = districts.find(d => d.key === key);
    const label = selectedDist ? selectedDist.label : '';

    onInputChange('districtKey', key);
    onInputChange('district', label);

    // Clear dependent
    onInputChange('neighborhoodKey', '');
  };

  const handleNeighborhoodChange = (e) => {
    const key = e.target.value;
    onInputChange('neighborhoodKey', key);
  };

  const renderLocationFieldsList = () => {
    return (
      <>
        {/* City Select */}
        <div className="relative">
          <span className={`${fieldLabel} sr-only`}>City</span>
          <div className={selectWrapper}>
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
            <select
              value={filters.cityKey ?? ''}
              onChange={handleCityChange}
              disabled={loadingCities}
              className={`${inp} pl-10`}
            >
              <option value="">Select City (İl)...</option>
              {cities.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
            {loadingCities ? (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
            ) : dropdownIcon}
          </div>
        </div>

        {/* District Select */}
        <div className="relative">
          <span className={`${fieldLabel} sr-only`}>District</span>
          <div className={selectWrapper}>
            <Map className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
            <select
              value={filters.districtKey ?? ''}
              onChange={handleDistrictChange}
              disabled={!filters.cityKey || loadingDistricts}
              className={`${inp} pl-10`}
            >
              <option value="">Select District (İlçe)...</option>
              {districts.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
            {loadingDistricts ? (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
            ) : dropdownIcon}
          </div>
        </div>

        {/* Neighborhood Select */}
        <div className="relative">
          <span className={`${fieldLabel} sr-only`}>Neighborhood</span>
          <div className={selectWrapper}>
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
            <select
              value={filters.neighborhoodKey ?? ''}
              onChange={handleNeighborhoodChange}
              disabled={!filters.districtKey || loadingNeighborhoods}
              className={`${inp} pl-10`}
            >
              <option value="">Select Neighborhood (Mahalle)...</option>
              {neighborhoods.map((n) => (
                <option key={n.key} value={n.key}>
                  {n.label}
                </option>
              ))}
            </select>
            {loadingNeighborhoods ? (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
            ) : dropdownIcon}
          </div>
        </div>
      </>
    );
  };

  if (compact) {
    return (
      <div className="min-w-0 space-y-5">
        <div className="space-y-4">
          <div>
            <span className={fieldLabel}>Price range</span>
            <div className="flex items-stretch gap-2 min-w-0">
              <input
                type="number"
                inputMode="decimal"
                value={minVal}
                onChange={(e) => onPriceChange('minPrice', e.target.value)}
                placeholder="Min"
                min="0"
                className={`${inp} min-w-0 flex-1 pr-3`}
              />
              <span className="flex shrink-0 items-center text-slate-300" aria-hidden>
                –
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={maxVal}
                onChange={(e) => onPriceChange('maxPrice', e.target.value)}
                placeholder="Max"
                min="0"
                className={`${inp} min-w-0 flex-1 pr-3`}
              />
            </div>
            <p className="mt-1 text-[11px] font-medium text-slate-400">Leave blank for no limit.</p>
          </div>
          <div>
            <span className={fieldLabel}>Currency</span>
            <EnumDropdown
              enumKey="currencies"
              value={filters.currency ?? ''}
              onChange={(v) => onInputChange('currency', v)}
              multiple={false}
              placeholder="Any currency"
              searchPlaceholder="Search currency…"
              className="w-full"
              usePortal={true}
            />
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="h-4 w-4 shrink-0 text-indigo-500" aria-hidden />
            <span className="text-xs font-semibold">Location</span>
          </div>

          <button
            type="button"
            onClick={handleShowNearMe}
            disabled={loadingLocation}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-all duration-200 active:scale-[0.98] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingLocation ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Navigation className="h-3.5 w-3.5 fill-indigo-100" />
            )}
            Bana Yakın İlanları Göster
          </button>
          {nearMeError && (
            <p className="mt-1 text-center text-[10px] font-medium text-rose-500 animate-pulse">
              {nearMeError}
            </p>
          )}

          {renderLocationFieldsList()}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-slate-800">
          <Landmark className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-semibold tracking-tight">Price range</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={minVal}
              onChange={(e) => onPriceChange('minPrice', e.target.value)}
              placeholder="Min"
              min="0"
              className={`${inp} pr-3`}
            />
            <span className="text-slate-300">–</span>
            <input
              type="number"
              value={maxVal}
              onChange={(e) => onPriceChange('maxPrice', e.target.value)}
              placeholder="Max"
              min="0"
              className={`${inp} pr-3`}
            />
          </div>
          <EnumDropdown
            label="Currency"
            enumKey="currencies"
            value={filters.currency ?? ''}
            onChange={(v) => onInputChange('currency', v)}
            multiple={false}
            placeholder="Any currency"
            className="w-full"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2 text-slate-800">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-semibold tracking-tight">Location</h3>
          </div>
          <button
            type="button"
            onClick={handleShowNearMe}
            disabled={loadingLocation}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-all duration-200 active:scale-[0.98]"
          >
            {loadingLocation ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Navigation className="h-3 w-3 fill-indigo-100" />
            )}
            Bana Yakın İlanlar
          </button>
        </div>
        {nearMeError && (
          <p className="mb-2 text-right text-[10px] font-medium text-rose-500 animate-pulse">
            {nearMeError}
          </p>
        )}
        <div className="space-y-4">
          {renderLocationFieldsList()}
        </div>
      </div>
    </div>
  );
};

export default PriceLocationFields;
