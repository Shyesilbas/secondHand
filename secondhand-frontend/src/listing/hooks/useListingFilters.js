import { useCallback, useEffect, useMemo, useState } from 'react';
import { cleanObject } from '../../common/formatters.js';
import { getDefaultFiltersForType } from './utils/filterDefaults.js';

/**
 * Manages filter state, category selection, and filter sidebar UI
 */
export const useListingFilters = ({
  initialListingType = 'VEHICLE',
  mode = 'browse',
  location,
  navState,
  user,
  onFiltersChange,
}) => {
  const initialTypeFromNav = navState?.listingType ? String(navState.listingType).trim().toUpperCase() : null;

  const [selectedCategory, setSelectedCategory] = useState(
    mode === 'mine' ? (initialTypeFromNav || null) : (initialTypeFromNav || initialListingType || 'VEHICLE')
  );

  const [mineStatus, setMineStatus] = useState(null);

  const [filters, setFilters] = useState(() => {
    if (mode === 'mine') {
      return {
        page: 0,
        size: 10,
        listingType: initialTypeFromNav || null,
      };
    }
    const t = initialTypeFromNav || String(initialListingType || '').trim().toUpperCase() || 'VEHICLE';
    return getDefaultFiltersForType(t, { listingType: t });
  });

  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  // Sync category from navigation state
  useEffect(() => {
    if (initialTypeFromNav) {
      setSelectedCategory(initialTypeFromNav);
      setFilters((prev) => {
        if (mode === 'mine') return { ...prev, listingType: initialTypeFromNav, page: 0 };
        return { ...prev, listingType: initialTypeFromNav, type: initialTypeFromNav, page: 0 };
      });
    }
  }, [initialTypeFromNav, mode]);

  // Parse URL parameters and update filters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get('category');
    const category = raw ? String(raw).trim().toUpperCase() : null;
    if (!category) return;

    setSelectedCategory(category);

    if (mode === 'mine') {
      setFilters((prev) => ({ ...prev, listingType: category, page: 0 }));
      return;
    }

    const base = getDefaultFiltersForType(category, { listingType: category, type: category, page: 0 });
    const next = { ...base };

    if (category === 'VEHICLE') {
      const vType = params.get('vehicleTypeIds');
      const brandId = params.get('brandIds');
      const modelId = params.get('vehicleModelIds');
      if (vType) next.vehicleTypeIds = [vType];
      if (brandId) next.brandIds = [brandId];
      if (modelId) next.vehicleModelIds = [modelId];
    } else if (category === 'ELECTRONICS') {
      const typeId = params.get('electronicTypeIds');
      const brandId = params.get('electronicBrandIds');
      const modelId = params.get('electronicModelIds');
      if (typeId) next.electronicTypeIds = [typeId];
      if (brandId) next.electronicBrandIds = [brandId];
      if (modelId) next.electronicModelIds = [modelId];
    } else if (category === 'REAL_ESTATE') {
      const realEstateTypeId = params.get('realEstateTypeIds');
      const adTypeId = params.get('adTypeId');
      const ownerTypeId = params.get('ownerTypeId');
      if (realEstateTypeId) next.realEstateTypeIds = [realEstateTypeId];
      if (adTypeId) next.adTypeId = adTypeId;
      if (ownerTypeId) next.ownerTypeId = ownerTypeId;
    } else if (category === 'CLOTHING') {
      const brandId = params.get('brands');
      const typeId = params.get('types');
      if (brandId) next.brands = [brandId];
      if (typeId) next.types = [typeId];
    } else if (category === 'BOOKS') {
      const bookTypeId = params.get('bookTypeIds');
      const genreId = params.get('genreIds');
      if (bookTypeId) next.bookTypeIds = [bookTypeId];
      if (genreId) next.genreIds = [genreId];
    } else if (category === 'SPORTS') {
      const disciplineId = params.get('disciplineIds');
      const equipmentTypeId = params.get('equipmentTypeIds');
      const conditionId = params.get('conditionIds');
      if (disciplineId) next.disciplineIds = [disciplineId];
      if (equipmentTypeId) next.equipmentTypeIds = [equipmentTypeId];
      if (conditionId) next.conditionIds = [conditionId];
    }

    setFilters(next);
  }, [location.search, mode]);

  // Reset filters when user changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: 0 }));
    onFiltersChange?.();
  }, [user?.id]);

  const cleanedFilters = useMemo(() => cleanObject(filters), [filters]);

  const hasActiveFilters = useMemo(() => {
    if (!filters) return false;
    if (mode === 'mine') {
      return Boolean(filters.listingType || mineStatus);
    }
    return Object.keys(filters).some((key) => {
      if (key === 'page' || key === 'size' || key === 'listingType' || key === 'type' || key === 'status' || key === 'sortBy' || key === 'sortDirection') {
        return false;
      }
      const value = filters[key];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '' && value !== 0 && value !== false;
    });
  }, [filters, mineStatus, mode]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      ...(Object.prototype.hasOwnProperty.call(newFilters ?? {}, 'page') ? {} : { page: 0 }),
    }));
  }, []);

  const resetFilters = useCallback(() => {
    if (mode === 'mine') {
      setSelectedCategory(null);
      setMineStatus(null);
      setFilters((prev) => ({ ...prev, page: 0, listingType: null }));
      return;
    }
    const listingType = selectedCategory || initialListingType || 'VEHICLE';
    setFilters(getDefaultFiltersForType(listingType, { listingType, type: listingType, page: 0 }));
  }, [initialListingType, mode, selectedCategory]);

  const onCategoryChange = useCallback((category) => {
    const normalized = category ? String(category).trim().toUpperCase() : null;
    setSelectedCategory(normalized);
    if (mode === 'mine') {
      setFilters((prev) => ({ ...prev, listingType: normalized || null, page: 0 }));
      return;
    }
    const listingType = normalized || String(initialListingType || '').trim().toUpperCase() || 'VEHICLE';
    setFilters(getDefaultFiltersForType(listingType, { listingType, type: listingType, page: 0 }));
  }, [initialListingType, mode]);

  const handleMineStatusChange = useCallback((status) => {
    setMineStatus(status || null);
    setFilters((prev) => ({ ...prev, page: 0 }));
  }, []);

  const toggleFilterSidebar = useCallback(() => setShowFilterSidebar((v) => !v), []);
  const closeFilterSidebar = useCallback(() => setShowFilterSidebar(false), []);
  const openFilterSidebar = useCallback(() => setShowFilterSidebar(true), []);

  return {
    filters,
    cleanedFilters,
    selectedCategory,
    mineStatus,
    updateFilters,
    resetFilters,
    onCategoryChange,
    showFilterSidebar,
    hasActiveFilters,
    toggleFilterSidebar,
    openFilterSidebar,
    closeFilterSidebar,
    setMineStatus: handleMineStatusChange,
  };
};
