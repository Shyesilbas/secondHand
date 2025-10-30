import { ListingDTO } from '../listing/listings.js';


export const VehicleCreateRequestDTO = {
    title: '',
  description: '',
  price: 0,
  currency: 'TRY',
  city: '',
  district: '',
  imageUrl: '',
  
    brand: '',
  model: '',
  year: 0,
  mileage: 0,
  engineCapacity: 0,
  gearbox: '',
  seatCount: '',
  doors: '',
  wheels: 0,
  color: '',
  fuelCapacity: 0,
  fuelConsumption: 0,
  horsePower: 0,
  kilometersPerLiter: 0,
  fuelType: '',
  swap: false,
  accidentHistory: false,
  accidentDetails: '',
  inspectionValidUntil: '',
  drivetrain: '',
  bodyType: '',
};



export const VehicleListingDTO = {
  ...ListingDTO,
  imageUrl: '',
    brand: '',
  model: '',
  year: 0,
  mileage: 0,
  engineCapacity: 0,
  gearbox: '',
  seatCount: '',
  doors: '',
  wheels: 0,
  color: '',
  fuelCapacity: 0,
  fuelConsumption: 0,
  horsePower: 0,
  kilometersPerLiter: 0,
  fuelType: '',
  swap: false,
  accidentHistory: false,
  accidentDetails: '',
  inspectionValidUntil: '',
  drivetrain: '',
  bodyType: '',
};

export const VehicleSearchFiltersDTO = {
  listingType: 'VEHICLE',
  status: 'ACTIVE',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 0,
  currency: 'TRY',
  
    brands: [],
  minYear: 0,
  maxYear: 0,
  maxMileage: 0,
  fuelTypes: [],
  colors: [],
  doors: '',
  gearTypes: [],
  seatCounts: [],
  
    sortBy: 'createdAt',
  sortDirection: 'DESC',
  
    page: 0,
  size: 20,
};


export const createVehicleCreateRequest = (data) => {
  return {
        title: (data.title || '').trim(),
    description: (data.description || '').trim(),
    price: parseFloat(data.price) || 0,
    currency: data.currency || 'TRY',
    city: (data.city || '').trim(),
    district: (data.district || '').trim(),
    imageUrl: data.imageUrl || undefined,
    
        brand: data.brand || '',
    model: (data.model || '').trim(),
    year: parseInt(data.year) || 0,
    mileage: parseInt(data.mileage) || 0,
    engineCapacity: parseInt(data.engineCapacity) || 0,
    gearbox: data.gearbox || '',
    seatCount: data.seatCount || '',
    doors: data.doors || '',
    wheels: parseInt(data.wheels) || 0,
    color: data.color || '',
    fuelCapacity: parseInt(data.fuelCapacity) || 0,
    fuelConsumption: parseInt(data.fuelConsumption) || 0,
    horsePower: parseInt(data.horsePower) || 0,
    kilometersPerLiter: parseInt(data.kilometersPerLiter) || 0,
    fuelType: data.fuelType || '',
    swap: Boolean(data.swap),
    accidentHistory: Boolean(data.accidentHistory),
    accidentDetails: (data.accidentDetails || '').trim() || undefined,
    inspectionValidUntil: data.inspectionValidUntil ? String(data.inspectionValidUntil) : undefined,
    drivetrain: data.drivetrain || undefined,
    bodyType: data.bodyType || undefined,
  };
};

export const createVehicleUpdateRequest = (data) => {
  const updateData = {};
  
    if (data.title !== undefined && data.title !== '') updateData.title = data.title.trim();
  if (data.description !== undefined && data.description !== '') updateData.description = data.description.trim();
  if (data.price !== undefined && data.price !== '') updateData.price = parseFloat(data.price);
  if (data.currency !== undefined && data.currency !== '') updateData.currency = data.currency;
  if (data.city !== undefined && data.city !== '') updateData.city = data.city.trim();
  if (data.district !== undefined && data.district !== '') updateData.district = data.district.trim();
  if (data.model !== undefined && data.model !== '') updateData.model = data.model.trim();
  if (data.mileage !== undefined && data.mileage !== '') updateData.mileage = parseInt(data.mileage);
  if (data.engineCapacity !== undefined && data.engineCapacity !== '') updateData.engineCapacity = parseInt(data.engineCapacity);
  if (data.gearbox !== undefined && data.gearbox !== '') updateData.gearbox = data.gearbox;
  if (data.seatCount !== undefined && data.seatCount !== '') updateData.seatCount = data.seatCount;
  if (data.doors !== undefined && data.doors !== '') updateData.doors = data.doors;
  if (data.wheels !== undefined && data.wheels !== '') updateData.wheels = parseInt(data.wheels);
  if (data.color !== undefined && data.color !== '') updateData.color = data.color;
  if (data.fuelCapacity !== undefined && data.fuelCapacity !== '') updateData.fuelCapacity = parseInt(data.fuelCapacity);
  if (data.fuelConsumption !== undefined && data.fuelConsumption !== '') updateData.fuelConsumption = parseInt(data.fuelConsumption);
  if (data.horsePower !== undefined && data.horsePower !== '') updateData.horsePower = parseInt(data.horsePower);
  if (data.kilometersPerLiter !== undefined && data.kilometersPerLiter !== '') updateData.kilometersPerLiter = parseInt(data.kilometersPerLiter);
  if (data.fuelType !== undefined && data.fuelType !== '') updateData.fuelType = data.fuelType;
  if (data.swap !== undefined) updateData.swap = Boolean(data.swap);
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || undefined;
  if (data.accidentHistory !== undefined) updateData.accidentHistory = Boolean(data.accidentHistory);
  if (data.accidentDetails !== undefined) updateData.accidentDetails = (data.accidentDetails || '').trim();
  if (data.inspectionValidUntil !== undefined && data.inspectionValidUntil !== '') updateData.inspectionValidUntil = String(data.inspectionValidUntil);
  if (data.drivetrain !== undefined && data.drivetrain !== '') updateData.drivetrain = data.drivetrain;
  if (data.bodyType !== undefined && data.bodyType !== '') updateData.bodyType = data.bodyType;
  
  return updateData;
};

