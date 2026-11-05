import { createListingBaseCreatePayload, createListingBaseUpdatePayload } from '../listing/types/index.js';

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
	zoningStatusKey: '',
	roomConfigKey: '',
	_realEstateTypeName: '',
};

export const createRealEstateCreateRequest = (data) => {
	return {
		base: createListingBaseCreatePayload(data),

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
		zoningStatusKey: (data.zoningStatusKey || '').trim() || undefined,
		roomConfigKey: (data.roomConfigKey || '').trim() || undefined,
	};
};

export const createRealEstateUpdateRequest = (data) => {
	const updateData = {};

	const base = createListingBaseUpdatePayload(data);
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
	if (data.zoningStatus !== undefined && data.zoningStatus !== '') updateData.zoningStatus = data.zoningStatus.trim();
	if (data.zoningStatusKey !== undefined && data.zoningStatusKey !== '') updateData.zoningStatusKey = data.zoningStatusKey.trim();
	if (data.roomConfigKey !== undefined && data.roomConfigKey !== '') updateData.roomConfigKey = data.roomConfigKey.trim();
	if (Object.keys(base).length > 0) updateData.base = base;

	return updateData;
};
