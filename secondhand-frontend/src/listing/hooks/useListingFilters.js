import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cleanObject } from '../../common/formatters.js';
import { getDefaultFiltersForType } from './utils/filterDefaults.js';
import { LISTING_DEFAULTS, LISTING_TYPES } from '../types/index.js';

/**
 * Manages filter state, category selection, and filter sidebar UI
 */
export const useListingFilters = ({
  initialListingType = LISTING_TYPES.VEHICLE,
  mode = 'browse',
  location,
  navState,
  user,
  onFiltersChange,
}) => {
  const initialTypeFromNav = navState?.listingType ? String(navState.listingType).trim().toUpperCase() : null;

  const [selectedCategory, setSelectedCategory] = useState(
    mode === 'mine' ? (initialTypeFromNav || null) : (initialTypeFromNav || initialListingType || null)
  );

  const [mineStatus, setMineStatus] = useState(null);

  const [filters, setFilters] = useState(() => {
    if (mode === 'mine') {
      return {
        page: 0,
        size: LISTING_DEFAULTS.FILTER_PAGE_SIZE,
        listingType: initialTypeFromNav || null,
      };
    }
    const t = initialTypeFromNav || (initialListingType ? String(initialListingType).trim().toUpperCase() : null);
    return getDefaultFiltersForType(t, { listingType: t });
  });

  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const previousUserIdRef = useRef(user?.id ?? null);

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

    if (category === LISTING_TYPES.VEHICLE) {
      const vType = params.get('vehicleTypeIds');
      const brandId = params.get('brandIds');
      const modelId = params.get('vehicleModelIds');
      const bodyType = params.get('bodyTypes') || params.get('bodyType');
      const drivetrain = params.get('drivetrains') || params.get('drivetrain');
      const fuelType = params.get('fuelTypes') || params.get('fuelType');
      const gearType = params.get('gearTypes') || params.get('gearType') || params.get('gearbox');
      const door = params.get('doors');
      const seatCount = params.get('seatCounts') || params.get('seatCount');
      const color = params.get('colors') || params.get('color');

      if (vType) next.vehicleTypeIds = [vType];
      if (brandId) next.brandIds = [brandId];
      if (modelId) next.vehicleModelIds = [modelId];
      if (bodyType) next.bodyTypes = [bodyType];
      if (drivetrain) next.drivetrains = [drivetrain];
      if (fuelType) next.fuelTypes = [fuelType];
      if (gearType) next.gearTypes = [gearType];
      if (door) next.doors = door;
      if (seatCount) next.seatCounts = [seatCount];
      if (color) next.colors = [color];
    } else if (category === LISTING_TYPES.ELECTRONICS) {
      const typeId = params.get('electronicTypeIds');
      const brandId = params.get('electronicBrandIds');
      const modelId = params.get('electronicModelIds');
      const condition = params.get('conditions') || params.get('condition');
      const color = params.get('colors') || params.get('color');
      const storageType = params.get('storageTypes') || params.get('storageType');
      const processor = params.get('processors') || params.get('processor');
      const connectionType = params.get('connectionTypes') || params.get('connectionType');
      const ram = params.get('ram');
      const storage = params.get('storage');
      const screenSize = params.get('screenSize');
      const supports5g = params.get('supports5g');
      const dualSim = params.get('dualSim');
      const hasNfc = params.get('hasNfc');
      const wireless = params.get('wireless');
      const noiseCancelling = params.get('noiseCancelling');
      const hasBox = params.get('hasBox');
      const hasInvoice = params.get('hasInvoice');
      const imeiRegistered = params.get('imeiRegistered');

      if (typeId) next.electronicTypeIds = [typeId];
      if (brandId) next.electronicBrandIds = [brandId];
      if (modelId) next.electronicModelIds = [modelId];
      if (condition) next.conditions = [condition];
      if (color) next.colors = [color];
      if (storageType) next.storageTypes = [storageType];
      if (processor) next.processors = [processor];
      if (connectionType) next.connectionTypes = [connectionType];
      if (ram) next.ram = ram;
      if (storage) next.storage = storage;
      if (screenSize) next.screenSize = screenSize;
      if (supports5g !== null && supports5g !== undefined) next.supports5g = supports5g === 'true';
      if (dualSim !== null && dualSim !== undefined) next.dualSim = dualSim === 'true';
      if (hasNfc !== null && hasNfc !== undefined) next.hasNfc = hasNfc === 'true';
      if (wireless !== null && wireless !== undefined) next.wireless = wireless === 'true';
      if (noiseCancelling !== null && noiseCancelling !== undefined) next.noiseCancelling = noiseCancelling === 'true';
      if (hasBox !== null && hasBox !== undefined) next.hasBox = hasBox === 'true';
      if (hasInvoice !== null && hasInvoice !== undefined) next.hasInvoice = hasInvoice === 'true';
      if (imeiRegistered !== null && imeiRegistered !== undefined) next.imeiRegistered = imeiRegistered === 'true';
    } else if (category === LISTING_TYPES.REAL_ESTATE) {
      const realEstateTypeId = params.get('realEstateTypeIds') || params.get('realEstateTypeId');
      const adTypeId = params.get('adTypeId');
      const ownerTypeId = params.get('ownerTypeId');
      const heatingTypeId = params.get('heatingTypeIds') || params.get('heatingTypeId');
      const squareMeters = params.get('squareMeters');
      const roomCount = params.get('roomCount');
      const bathroomCount = params.get('bathroomCount');
      const floor = params.get('floor');
      const buildingAge = params.get('buildingAge');
      const furnished = params.get('furnished');
      const zoningStatus = params.get('zoningStatus');

      if (realEstateTypeId) next.realEstateTypeIds = [realEstateTypeId];
      if (adTypeId) next.adTypeId = adTypeId;
      if (ownerTypeId) next.ownerTypeId = ownerTypeId;
      if (heatingTypeId) next.heatingTypeIds = [heatingTypeId];
      if (squareMeters) next.squareMeters = squareMeters;
      if (roomCount) next.roomCount = roomCount;
      if (bathroomCount) next.bathroomCount = bathroomCount;
      if (floor) next.floor = floor;
      if (buildingAge) next.buildingAge = buildingAge;
      if (furnished !== null && furnished !== undefined) next.furnished = furnished === 'true';
      if (zoningStatus) next.zoningStatus = zoningStatus;
    } else if (category === LISTING_TYPES.CLOTHING) {
      const brandId = params.get('brands') || params.get('brandId');
      const typeId = params.get('types') || params.get('clothingTypeId');
      const gender = params.get('clothingGenders') || params.get('clothingGender');
      const categoryType = params.get('clothingCategories') || params.get('clothingCategory');
      const size = params.get('sizes') || params.get('size');
      const shoeSizeEu = params.get('shoeSizeEu');
      const color = params.get('colors') || params.get('color');
      const condition = params.get('conditions') || params.get('condition');
      const material = params.get('material');

      if (brandId) next.brands = [brandId];
      if (typeId) next.types = [typeId];
      if (gender) next.clothingGenders = [gender];
      if (categoryType) next.clothingCategories = [categoryType];
      if (size) next.sizes = [size];
      if (shoeSizeEu) next.shoeSizeEu = shoeSizeEu;
      if (color) next.colors = [color];
      if (condition) next.conditions = [condition];
      if (material) next.material = material;
    } else if (category === LISTING_TYPES.BOOKS) {
      const bookTypeId = params.get('bookTypeIds') || params.get('bookTypeId');
      const genreId = params.get('genreIds') || params.get('genreId');
      const languageId = params.get('languageIds') || params.get('languageId');
      const formatId = params.get('formatIds') || params.get('formatId');
      const conditionId = params.get('conditionIds') || params.get('conditionId');
      const year = params.get('year');
      const pageCount = params.get('pageCount');

      if (bookTypeId) next.bookTypeIds = [bookTypeId];
      if (genreId) next.genreIds = [genreId];
      if (languageId) next.languageIds = [languageId];
      if (formatId) next.formatIds = [formatId];
      if (conditionId) next.conditionIds = [conditionId];
      if (year) next.year = year;
      if (pageCount) next.pageCount = pageCount;
    } else if (category === LISTING_TYPES.SPORTS) {
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
    const currentUserId = user?.id ?? null;
    if (previousUserIdRef.current === currentUserId) return;
    previousUserIdRef.current = currentUserId;
    setFilters((prev) => ({ ...prev, page: 0 }));
    onFiltersChange?.();
  }, [onFiltersChange, user?.id]);

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
    const listingType = selectedCategory || initialListingType || null;
    setFilters(getDefaultFiltersForType(listingType, { listingType, type: listingType, page: 0 }));
  }, [initialListingType, mode, selectedCategory]);

  const onCategoryChange = useCallback((category) => {
    const normalized = category ? String(category).trim().toUpperCase() : null;
    setSelectedCategory(normalized);
    if (mode === 'mine') {
      setFilters((prev) => ({ ...prev, listingType: normalized || null, page: 0 }));
      return;
    }
    const listingType = normalized || (initialListingType ? String(initialListingType).trim().toUpperCase() : null) || null;
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
