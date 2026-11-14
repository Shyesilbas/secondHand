
export const LISTING_TYPES = {
    VEHICLE: 'VEHICLE',
    ELECTRONICS: 'ELECTRONICS',
    REAL_ESTATE: 'REAL_ESTATE',
    CLOTHING: 'CLOTHING',
    BOOKS: 'BOOKS',
    SPORTS: 'SPORTS',
    OTHER: 'OTHER',
};

/** Types that cannot be added to cart or receive offers */
export const NON_PURCHASABLE_TYPES = [LISTING_TYPES.REAL_ESTATE, LISTING_TYPES.VEHICLE];

export const LISTING_STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    SOLD: 'SOLD',
    PENDING: 'PENDING',
    DRAFT: 'DRAFT',
    RESERVED: 'RESERVED',
    DELETED: 'DELETED',
};

export const LISTING_STATUSES = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SOLD', label: 'Sold' },
    { value: 'RESERVED', label: 'Reserved' },
    { value: 'DELETED', label: 'Deleted' },
];

// Shared defaults to avoid scattered magic strings across UI and service layers.
export const LISTING_DEFAULTS = Object.freeze({
    STATUS: LISTING_STATUS.ACTIVE,
    SORT_BY: 'createdAt',
    SORT_DIRECTION: 'DESC',
    PAGE: 0,
    // Used by UI filter state (see getDefaultFiltersForType)
    FILTER_PAGE_SIZE: 10,
    // Used by service payload serialization when size is not present
    SERVICE_FILTER_PAGE_SIZE: 20,
    MIN_PRICE: 0,
    MAX_PRICE: 0,
    CURRENCY: '',
    // Mine-mode: "low stock" alert threshold (exclusive upper bound).
    LOW_STOCK_MAX_QUANTITY: 10,
});

export const LISTING_SORT_FIELDS = {
    DATE: 'createdAt',
    PRICE: 'price',
    YEAR: 'year',
};

export const createListingBaseCreatePayload = (data) => ({
    title: (data.title || '').trim(),
    description: (data.description || '').trim(),
    price: parseFloat(data.price) || 0,
    currency: data.currency || 'TRY',
    city: (data.city || '').trim(),
    district: (data.district || '').trim(),
    cityKey: data.cityKey || '',
    districtKey: data.districtKey || '',
    neighborhoodKey: data.neighborhoodKey || undefined,
    imageUrl: data.imageUrl || undefined,
    allowMeetup: data.allowMeetup !== undefined ? Boolean(data.allowMeetup) : false,
    canSendMessage: data.canSendMessage !== undefined ? Boolean(data.canSendMessage) : undefined,
});

export const createListingBaseUpdatePayload = (data) => {
    const base = {};
    if (data.title !== undefined && data.title !== '') base.title = String(data.title).trim();
    if (data.description !== undefined && data.description !== '') base.description = String(data.description).trim();
    if (data.price !== undefined && data.price !== '') base.price = parseFloat(data.price);
    if (data.currency !== undefined && data.currency !== '') base.currency = data.currency;
    if (data.city !== undefined && data.city !== '') base.city = String(data.city).trim();
    if (data.district !== undefined && data.district !== '') base.district = String(data.district).trim();
    if (data.cityKey !== undefined) base.cityKey = data.cityKey;
    if (data.districtKey !== undefined) base.districtKey = data.districtKey;
    if (data.neighborhoodKey !== undefined) base.neighborhoodKey = data.neighborhoodKey || null;
    if (data.imageUrl !== undefined) base.imageUrl = data.imageUrl || undefined;
    if (data.allowMeetup !== undefined) base.allowMeetup = Boolean(data.allowMeetup);
    if (data.canSendMessage !== undefined) base.canSendMessage = Boolean(data.canSendMessage);
    return base;
};

export const ERROR_MESSAGES = {
    LISTING_NOT_FOUND: 'Listing not found',
    INVALID_LISTING_TYPE: 'Invalid listing type',
    INVALID_DATA: 'Invalid data provided',
    NETWORK_ERROR: 'Network error occurred',
    PERMISSION_DENIED: 'Permission denied',
    FORM_VALIDATION_ERROR: 'Please check the form fields',
};

