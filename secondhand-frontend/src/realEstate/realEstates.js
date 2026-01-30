import { ListingDTO } from '../listing/listings.js';


export const RealEstateCreateRequestDTO = {
    title: '',
  description: '',
  price: 0,
  currency: 'TRY',
  city: '',
  district: '',
  imageUrl: '',
  
    adTypeId: '',
  realEstateTypeId: '',
  heatingTypeId: '',
  ownerTypeId: '',
  squareMeters: 0,
  roomCount: 0,
  bathroomCount: 0,
  floor: 0,
  buildingAge: 0,
  furnished: false,
  zoningStatus: '',
  _realEstateTypeName: '',
};

export const RealEstateListingDTO = {
  ...ListingDTO,
  imageUrl: '',
    adType: null,
  realEstateType: null,
  heatingType: null,
  ownerType: null,
  squareMeters: 0,
  roomCount: 0,
  bathroomCount: 0,
  floor: 0,
  buildingAge: 0,
  furnished: false,
  zoningStatus: '',
};

export const RealEstateSearchFiltersDTO = {
  listingType: 'REAL_ESTATE',
  status: 'ACTIVE',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 0,
  currency: 'TRY',
  
    adTypeId: '',
  realEstateTypeIds: [],
  heatingTypeIds: [],
  ownerTypeId: '',
  minSquareMeters: 0,
  maxSquareMeters: 0,
  minRoomCount: 0,
  maxRoomCount: 0,
  minBathroomCount: 0,
  maxBathroomCount: 0,
  floor: 0,
  minBuildingAge: 0,
  maxBuildingAge: 0,
  furnished: false,
  zoningStatus: '',
  
    sortBy: 'createdAt',
  sortDirection: 'DESC',
  
    page: 0,
  size: 20,
};

export const createRealEstateCreateRequest = (data) => {
  return {
        title: (data.title || '').trim(),
    description: (data.description || '').trim(),
    price: parseFloat(data.price) || 0,
    currency: data.currency || 'TRY',
    city: (data.city || '').trim(),
    district: (data.district || '').trim(),
    imageUrl: data.imageUrl || undefined,
    
        adTypeId: data.adTypeId || null,
    realEstateTypeId: data.realEstateTypeId || null,
    heatingTypeId: data.heatingTypeId || null,
    ownerTypeId: data.ownerTypeId || null,
    squareMeters: parseInt(data.squareMeters) || 0,
    roomCount: parseInt(data.roomCount) || 0,
    bathroomCount: parseInt(data.bathroomCount) || 0,
    floor: parseInt(data.floor) || 0,
    buildingAge: parseInt(data.buildingAge) || 0,
    furnished: Boolean(data.furnished),
    zoningStatus: (data.zoningStatus || '').trim() || null,
  };
};

export const createRealEstateUpdateRequest = (data) => {
  const updateData = {};
  
    if (data.title !== undefined && data.title !== '') updateData.title = data.title.trim();
  if (data.description !== undefined && data.description !== '') updateData.description = data.description.trim();
  if (data.price !== undefined && data.price !== '') updateData.price = parseFloat(data.price);
  if (data.currency !== undefined && data.currency !== '') updateData.currency = data.currency;
  if (data.city !== undefined && data.city !== '') updateData.city = data.city.trim();
  if (data.district !== undefined && data.district !== '') updateData.district = data.district.trim();
  if (data.adTypeId !== undefined && data.adTypeId !== '') updateData.adTypeId = data.adTypeId;
  if (data.realEstateTypeId !== undefined && data.realEstateTypeId !== '') updateData.realEstateTypeId = data.realEstateTypeId;
  if (data.heatingTypeId !== undefined && data.heatingTypeId !== '') updateData.heatingTypeId = data.heatingTypeId;
  if (data.ownerTypeId !== undefined && data.ownerTypeId !== '') updateData.ownerTypeId = data.ownerTypeId;
  if (data.squareMeters !== undefined && data.squareMeters !== '') updateData.squareMeters = parseInt(data.squareMeters);
  if (data.roomCount !== undefined && data.roomCount !== '') updateData.roomCount = parseInt(data.roomCount);
  if (data.bathroomCount !== undefined && data.bathroomCount !== '') updateData.bathroomCount = parseInt(data.bathroomCount);
  if (data.floor !== undefined && data.floor !== '') updateData.floor = parseInt(data.floor);
  if (data.buildingAge !== undefined && data.buildingAge !== '') updateData.buildingAge = parseInt(data.buildingAge);
  if (data.furnished !== undefined) updateData.furnished = Boolean(data.furnished);
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || undefined;
  if (data.zoningStatus !== undefined && data.zoningStatus !== '') updateData.zoningStatus = data.zoningStatus.trim();
  
  return updateData;
};
