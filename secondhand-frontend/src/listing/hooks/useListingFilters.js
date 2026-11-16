import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cleanObject } from '../../common/formatters.js';
import { getDefaultFiltersForType } from './utils/filterDefaults.js';
import { LISTING_DEFAULTS, LISTING_TYPES } from '../types/index.js';

const parsePageFromSearch = (search) => {
  try {
    const raw = new URLSearchParams(search || '').get('page');
    if (raw === null || raw === '') return 0;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed >= 1 ? parsed - 1 : 0;
  } catch {
    return 0;
  }
};

const parseQueryFromSearch = (search) => {
  try {
    return new URLSearchParams(search || '').get('q')?.trim() || '';
  } catch {
    return '';
  }
};

const parseCategoryFromSearch = (search) => {
  try {
    const raw = new URLSearchParams(search || '').get('category');
    return raw ? String(raw).trim().toUpperCase() : null;
  } catch {
    return null;
  }
};

// Strip `page` so pagination clicks don't trigger URL-category filter resets.
const buildFilterSearchKey = (search) => {
  const params = new URLSearchParams(search || '');
  params.delete('page');
  params.sort();
  return params.toString();
};

const buildBrowseCategoryFilters = (params, category, page = 0) => {
  const base = getDefaultFiltersForType(category, { listingType: category, type: category, page });
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
    const roomConfigKey = params.get('roomConfigKeys') || params.get('roomConfigKey');
    const furnished = params.get('furnished');
    const zoningStatusKey = params.get('zoningStatusKeys') || params.get('zoningStatusKey');

    if (realEstateTypeId) next.realEstateTypeIds = [realEstateTypeId];
    if (adTypeId) next.adTypeId = adTypeId;
    if (ownerTypeId) next.ownerTypeId = ownerTypeId;
    if (heatingTypeId) next.heatingTypeIds = [heatingTypeId];
    if (roomConfigKey) next.roomConfigKeys = [roomConfigKey];
    if (furnished !== null && furnished !== undefined) next.furnished = furnished === 'true';
    if (zoningStatusKey) next.zoningStatusKeys = [zoningStatusKey];
  } else if (category === LISTING_TYPES.CLOTHING) {
    const brandId = params.get('brands') || params.get('brandId');
    const typeId = params.get('types') || params.get('clothingTypeId');
    const audience = params.get('audiences') || params.get('audience');
    const sizeSystem = params.get('sizeSystem');
    const size = params.get('sizes') || params.get('sizeKey');
    const color = params.get('colors') || params.get('color');
    const condition = params.get('conditions') || params.get('condition');

    if (brandId) next.brands = [brandId];
    if (typeId) next.types = [typeId];
    if (audience) next.audiences = [audience];
    if (sizeSystem) next.sizeSystem = sizeSystem;
    if (size) next.sizes = [size];
    if (color) next.colors = [color];
    if (condition) next.conditions = [condition];
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

  return next;
};

/**
 * Manages filter state, category selection, URL page sync, and filter sidebar UI
 */
export const useListingFilters = ({
 initialListingType = LISTING_TYPES.VEHICLE,
 mode = 'browse',
 location,
 navState,
 user,
 onFiltersChange,
}) => {
 const [, setSearchParams] = useSearchParams();
 const initialTypeFromNav = navState?.listingType ? String(navState.listingType).trim().toUpperCase() : null;
 const initialCategoryFromUrl = parseCategoryFromSearch(location?.search);

 const [selectedCategory, setSelectedCategory] = useState(
   mode === 'mine'
     ? (initialCategoryFromUrl || initialTypeFromNav || null)
     : (initialCategoryFromUrl || initialTypeFromNav || initialListingType || null)
 );

 const [mineStatus, setMineStatus] = useState(null);

 const [filters, setFilters] = useState(() => {
   const initialPage = parsePageFromSearch(location?.search);
   const initialQuery = parseQueryFromSearch(location?.search);

   if (mode === 'mine') {
     return {
       page: initialPage,
       size: LISTING_DEFAULTS.FILTER_PAGE_SIZE,
       listingType: initialCategoryFromUrl || initialTypeFromNav || null,
       ...(initialQuery ? { title: initialQuery } : {}),
     };
   }

   if (initialCategoryFromUrl) {
     const built = buildBrowseCategoryFilters(
       new URLSearchParams(location?.search || ''),
       initialCategoryFromUrl,
       initialPage
     );
     return initialQuery ? { ...built, title: initialQuery } : built;
   }

   const t = initialTypeFromNav || (initialListingType ? String(initialListingType).trim().toUpperCase() : null);
   return getDefaultFiltersForType(t, {
     listingType: t,
     page: initialPage,
     ...(initialQuery ? { title: initialQuery } : {}),
   });
 });

 const [showFilterSidebar, setShowFilterSidebar] = useState(false);
 const previousUserIdRef = useRef(user?.id ?? null);
 const previousNavTypeRef = useRef(initialTypeFromNav);
 const lastFilterSearchKeyRef = useRef(buildFilterSearchKey(location?.search));
 const lastUrlCategoryRef = useRef(initialCategoryFromUrl);

 const syncPageInUrl = useCallback((nextPage, { replace = false } = {}) => {
   const normalizedPage = Math.max(0, Number.parseInt(nextPage, 10) || 0);
   const currentParams = new URLSearchParams(location?.search || '');
   const hasRawPage = currentParams.has('page');
   const currentUrlPage = parsePageFromSearch(location?.search);

   if (normalizedPage === 0 && !hasRawPage) return;
   if (normalizedPage > 0 && hasRawPage && currentUrlPage === normalizedPage) return;

   setSearchParams((prev) => {
     const next = new URLSearchParams(prev);
     if (normalizedPage <= 0) {
       next.delete('page');
     } else {
       next.set('page', String(normalizedPage + 1));
     }
     return next;
   }, { replace });
 }, [location?.search, setSearchParams]);

 // Sync category from navigation state only when it changes
 useEffect(() => {
   if (!initialTypeFromNav || previousNavTypeRef.current === initialTypeFromNav) return;
   previousNavTypeRef.current = initialTypeFromNav;
   setSelectedCategory(initialTypeFromNav);
   setFilters((prev) => {
     if (mode === 'mine') return { ...prev, listingType: initialTypeFromNav, page: 0 };
     return { ...prev, listingType: initialTypeFromNav, type: initialTypeFromNav, page: 0 };
   });
   syncPageInUrl(0, { replace: true });
 }, [initialTypeFromNav, mode, syncPageInUrl]);

 // Sync URL filter params when non-page search changes, and sync page on browser Back/Forward
 useEffect(() => {
   const nextFilterKey = buildFilterSearchKey(location?.search);
   const urlPage = parsePageFromSearch(location?.search);

   if (nextFilterKey !== lastFilterSearchKeyRef.current) {
     lastFilterSearchKeyRef.current = nextFilterKey;
     const params = new URLSearchParams(location?.search || '');
     const category = parseCategoryFromSearch(location?.search);
     const prevHadUrlCategory = Boolean(lastUrlCategoryRef.current);
     lastUrlCategoryRef.current = category;

     if (category) {
       setSelectedCategory(category);
       if (mode === 'mine') {
         setFilters((prev) => ({ ...prev, listingType: category, page: urlPage }));
         return;
       }
       setFilters(buildBrowseCategoryFilters(params, category, urlPage));
       return;
     }

     if (prevHadUrlCategory) {
       setSelectedCategory(null);
       if (mode === 'mine') {
         setFilters((prev) => ({ ...prev, listingType: null, page: urlPage }));
       } else {
         setFilters(getDefaultFiltersForType(null, { listingType: null, page: urlPage }));
       }
       return;
     }
   }

   setFilters((prev) => (prev.page === urlPage ? prev : { ...prev, page: urlPage }));
 }, [location?.search, mode]);

 // Reset filters when user changes
 useEffect(() => {
 const currentUserId = user?.id ?? null;
 if (previousUserIdRef.current === currentUserId) return;
 previousUserIdRef.current = currentUserId;
 setFilters((prev) => ({ ...prev, page: 0 }));
 syncPageInUrl(0, { replace: true });
 onFiltersChange?.();
 }, [onFiltersChange, syncPageInUrl, user?.id]);

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

 const setPage = useCallback((nextPage) => {
   const normalizedPage = Math.max(0, Number.parseInt(nextPage, 10) || 0);
   setFilters((prev) => (prev.page === normalizedPage ? prev : { ...prev, page: normalizedPage }));
   syncPageInUrl(normalizedPage, { replace: false });
 }, [syncPageInUrl]);

 const updateFilters = useCallback((newFilters) => {
 const hasPage = Object.prototype.hasOwnProperty.call(newFilters ?? {}, 'page');
 const targetPage = hasPage ? Math.max(0, Number.parseInt(newFilters.page, 10) || 0) : 0;
 setFilters((prev) => ({
 ...prev,
 ...newFilters,
 page: targetPage,
 }));
 syncPageInUrl(targetPage, { replace: !hasPage });
 }, [syncPageInUrl]);

 const resetFilters = useCallback(() => {
 if (mode === 'mine') {
 setSelectedCategory(null);
 setMineStatus(null);
 setFilters((prev) => ({ ...prev, page: 0, listingType: null }));
 syncPageInUrl(0, { replace: true });
 return;
 }
 const listingType = selectedCategory || initialListingType || null;
 setFilters(getDefaultFiltersForType(listingType, { listingType, type: listingType, page: 0 }));
 syncPageInUrl(0, { replace: true });
 }, [initialListingType, mode, selectedCategory, syncPageInUrl]);

 const onCategoryChange = useCallback((category) => {
 const normalized = category ? String(category).trim().toUpperCase() : null;
 setSelectedCategory(normalized);
 if (mode === 'mine') {
 setFilters((prev) => ({ ...prev, listingType: normalized || null, page: 0 }));
 syncPageInUrl(0, { replace: true });
 return;
 }
 const listingType = normalized || (initialListingType ? String(initialListingType).trim().toUpperCase() : null) || null;
 setFilters(getDefaultFiltersForType(listingType, { listingType, type: listingType, page: 0 }));
 syncPageInUrl(0, { replace: true });
 }, [initialListingType, mode, syncPageInUrl]);

 const handleMineStatusChange = useCallback((status) => {
 setMineStatus(status || null);
 setFilters((prev) => ({ ...prev, page: 0 }));
 syncPageInUrl(0, { replace: true });
 }, [syncPageInUrl]);

 const toggleFilterSidebar = useCallback(() => setShowFilterSidebar((v) => !v), []);
 const closeFilterSidebar = useCallback(() => setShowFilterSidebar(false), []);
 const openFilterSidebar = useCallback(() => setShowFilterSidebar(true), []);

 return {
 filters,
 cleanedFilters,
 selectedCategory,
 mineStatus,
 setPage,
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
