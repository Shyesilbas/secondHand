import { ListingDTO } from '../listing/listings.js';

export const ElectronicCreateRequestDTO = {
    title: '',
  description: '',
  price: 0,
  currency: 'TRY',
  quantity: 1,
  city: '',
  district: '',
  imageUrl: '',

    electronicTypeId: '',
  electronicBrandId: '',
  electronicModelId: '',
  origin: '',
  warrantyProof: false,
  year: 0,
  color: '',
  ram: '',
  storage: '',
  storageType: '',
  processor: '',
  screenSize: '',
  gpuModel: '',
  operatingSystem: '',
  batteryHealthPercent: '',
  batteryCapacityMah: '',
  cameraMegapixels: '',
  supports5g: false,
  dualSim: false,
  hasNfc: false,
  connectionType: '',
  wireless: false,
  noiseCancelling: false,
  hasMicrophone: false,
  batteryLifeHours: '',
};

export const ElectronicListingDTO = {
  ...ListingDTO,
  imageUrl: '',
    electronicType: null,
  electronicBrand: null,
  model: null,
  origin: '',
  warrantyProof: false,
  year: 0,
  color: '',
  ram: '',
  storage: '',
  storageType: '',
  processor: '',
  screenSize: '',
  gpuModel: '',
  operatingSystem: '',
  batteryHealthPercent: '',
  batteryCapacityMah: '',
  cameraMegapixels: '',
  supports5g: false,
  dualSim: false,
  hasNfc: false,
  connectionType: '',
  wireless: false,
  noiseCancelling: false,
  hasMicrophone: false,
  batteryLifeHours: '',
};

export const ElectronicSearchFiltersDTO = {
  listingType: 'ELECTRONICS',
  status: 'ACTIVE',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 0,
  currency: 'TRY',

    electronicTypeIds: [],
  electronicBrandIds: [],
  minYear: 0,
  maxYear: 0,
  colors: [],
  minRam: 0,
  maxRam: 0,
  minStorage: 0,
  maxStorage: 0,
  storageTypes: [],
  processors: [],
  minScreenSize: 0,
  maxScreenSize: 0,
  minBatteryHealthPercent: 0,
  maxBatteryHealthPercent: 0,
  minBatteryCapacityMah: 0,
  maxBatteryCapacityMah: 0,
  minCameraMegapixels: 0,
  maxCameraMegapixels: 0,
  supports5g: null,
  dualSim: null,
  hasNfc: null,
  connectionTypes: [],
  wireless: null,
  noiseCancelling: null,
  hasMicrophone: null,
  minBatteryLifeHours: 0,
  maxBatteryLifeHours: 0,

    sortBy: 'createdAt',
  sortDirection: 'DESC',

    page: 0,
  size: 20,
};

export const createElectronicCreateRequest = (data) => {
  return {
    base: {
      title: (data.title || '').trim(),
      description: (data.description || '').trim(),
      price: parseFloat(data.price) || 0,
      currency: data.currency || 'TRY',
      city: (data.city || '').trim(),
      district: (data.district || '').trim(),
      imageUrl: data.imageUrl || undefined,
    },
    quantity: parseInt(data.quantity) || 1,

    electronicTypeId: data.electronicTypeId || null,
    electronicBrandId: data.electronicBrandId || null,
    electronicModelId: data.electronicModelId || null,
    origin: (data.origin || '').trim(),
    warrantyProof: Boolean(data.warrantyProof),
    year: parseInt(data.year) || 0,
    color: data.color || '',
    ram: data.ram ? parseInt(data.ram) : undefined,
    storage: data.storage ? parseInt(data.storage) : undefined,
    storageType: data.storageType || undefined,
    processor: data.processor || undefined,
    screenSize: data.screenSize ? parseInt(data.screenSize) : undefined,
    gpuModel: (data.gpuModel || '').trim() || undefined,
    operatingSystem: (data.operatingSystem || '').trim() || undefined,
    batteryHealthPercent: data.batteryHealthPercent ? parseInt(data.batteryHealthPercent) : undefined,
    batteryCapacityMah: data.batteryCapacityMah ? parseInt(data.batteryCapacityMah) : undefined,
    cameraMegapixels: data.cameraMegapixels ? parseInt(data.cameraMegapixels) : undefined,
    supports5g: data.supports5g === true ? true : (data.supports5g === false ? false : undefined),
    dualSim: data.dualSim === true ? true : (data.dualSim === false ? false : undefined),
    hasNfc: data.hasNfc === true ? true : (data.hasNfc === false ? false : undefined),
    connectionType: data.connectionType || undefined,
    wireless: data.wireless === true ? true : (data.wireless === false ? false : undefined),
    noiseCancelling: data.noiseCancelling === true ? true : (data.noiseCancelling === false ? false : undefined),
    hasMicrophone: data.hasMicrophone === true ? true : (data.hasMicrophone === false ? false : undefined),
    batteryLifeHours: data.batteryLifeHours ? parseInt(data.batteryLifeHours) : undefined,
  };
};

export const createElectronicUpdateRequest = (data) => {
  const updateData = {};
  const base = {};
  if (data.title !== undefined && data.title !== '') base.title = data.title.trim();
  if (data.description !== undefined && data.description !== '') base.description = data.description.trim();
  if (data.price !== undefined && data.price !== '') base.price = parseFloat(data.price);
  if (data.currency !== undefined && data.currency !== '') base.currency = data.currency;
  if (data.quantity !== undefined && data.quantity !== '') updateData.quantity = parseInt(data.quantity);
  if (data.city !== undefined && data.city !== '') base.city = data.city.trim();
  if (data.district !== undefined && data.district !== '') base.district = data.district.trim();
  if (data.electronicTypeId !== undefined && data.electronicTypeId !== '') updateData.electronicTypeId = data.electronicTypeId;
  if (data.electronicBrandId !== undefined && data.electronicBrandId !== '') updateData.electronicBrandId = data.electronicBrandId;
  if (data.electronicModelId !== undefined && data.electronicModelId !== '') updateData.electronicModelId = data.electronicModelId;
  if (data.origin !== undefined && data.origin !== '') updateData.origin = data.origin.trim();
  if (data.warrantyProof !== undefined && data.warrantyProof !== '') updateData.warrantyProof = Boolean(data.warrantyProof);
  if (data.year !== undefined && data.year !== '') updateData.year = parseInt(data.year);
  if (data.color !== undefined && data.color !== '') updateData.color = data.color;
  if (data.imageUrl !== undefined) base.imageUrl = data.imageUrl || undefined;
  if (data.ram !== undefined && data.ram !== '') updateData.ram = parseInt(data.ram);
  if (data.storage !== undefined && data.storage !== '') updateData.storage = parseInt(data.storage);
  if (data.storageType !== undefined && data.storageType !== '') updateData.storageType = data.storageType;
  if (data.processor !== undefined && data.processor !== '') updateData.processor = data.processor;
  if (data.screenSize !== undefined && data.screenSize !== '') updateData.screenSize = parseInt(data.screenSize);
  if (data.gpuModel !== undefined && data.gpuModel !== '') updateData.gpuModel = data.gpuModel.trim();
  if (data.operatingSystem !== undefined && data.operatingSystem !== '') updateData.operatingSystem = data.operatingSystem.trim();
  if (data.batteryHealthPercent !== undefined && data.batteryHealthPercent !== '') updateData.batteryHealthPercent = parseInt(data.batteryHealthPercent);
  if (data.batteryCapacityMah !== undefined && data.batteryCapacityMah !== '') updateData.batteryCapacityMah = parseInt(data.batteryCapacityMah);
  if (data.cameraMegapixels !== undefined && data.cameraMegapixels !== '') updateData.cameraMegapixels = parseInt(data.cameraMegapixels);
  if (data.supports5g !== undefined && data.supports5g !== '') updateData.supports5g = Boolean(data.supports5g);
  if (data.dualSim !== undefined && data.dualSim !== '') updateData.dualSim = Boolean(data.dualSim);
  if (data.hasNfc !== undefined && data.hasNfc !== '') updateData.hasNfc = Boolean(data.hasNfc);
  if (data.connectionType !== undefined && data.connectionType !== '') updateData.connectionType = data.connectionType;
  if (data.wireless !== undefined && data.wireless !== '') updateData.wireless = Boolean(data.wireless);
  if (data.noiseCancelling !== undefined && data.noiseCancelling !== '') updateData.noiseCancelling = Boolean(data.noiseCancelling);
  if (data.hasMicrophone !== undefined && data.hasMicrophone !== '') updateData.hasMicrophone = Boolean(data.hasMicrophone);
  if (data.batteryLifeHours !== undefined && data.batteryLifeHours !== '') updateData.batteryLifeHours = parseInt(data.batteryLifeHours);
  if (Object.keys(base).length > 0) updateData.base = base;
  return updateData;
};


