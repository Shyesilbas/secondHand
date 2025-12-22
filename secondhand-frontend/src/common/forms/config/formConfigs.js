
const basicInfoStep = {
  id: 1,
  title: 'Basic Information',
  description: 'Set the title, description and price of your listing',
  icon: '📝',
  bgColor: 'bg-blue-100'
};

const locationStep = {
  id: 3,
  title: 'Location',
  description: 'Set the location of your item',
  icon: '📍',
  bgColor: 'bg-purple-100'
};

const vehicleDetailsStep = {
  id: 2,
  title: 'Vehicle Specifications',
  description: 'Specify the technical details of your vehicle',
  icon: '🚗',
  bgColor: 'bg-green-100'
};

const realEstateDetailsStep = {
  id: 2,
  title: 'Property Details',
  description: 'Specify the property specifications',
  icon: '🏠',
  bgColor: 'bg-green-100'
};

const electronicsDetailsStep = {
  id: 2,
  title: 'Electronic Details',
  description: 'Specify the electronic specifications',
  icon: '📱',
  bgColor: 'bg-green-100'
};

const sportsDetailsStep = {
  id: 2,
  title: 'Sports Details',
  description: 'Specify the sports equipment specifications',
  icon: '🏀',
  bgColor: 'bg-green-100'
};

const bookDetailsStep = {
  id: 2,
  title: 'Book Specifications',
  description: 'Specify the details of your book',
  icon: '📚',
  bgColor: 'bg-green-100'
};

const clothingDetailsStep = {
  id: 2,
  title: 'Clothing Specifications',
  description: 'Specify the details of your clothing item',
  icon: '👕',
  bgColor: 'bg-green-100'
};

export const vehicleFormConfig = {
  entityName: 'Vehicle',
  totalSteps: 3,
  initialData: {
    title: '', description: '', price: '', brand: '', model: '', year: '', mileage: '',
    engineCapacity: '', gearbox: '', seatCount: '', wheels: '', fuelCapacity: '', fuelConsumption: '',
    horsePower: '', kilometersPerLiter: '', fuelType: '', color: '', transmission: '', bodyType: '',
    city: '', district: '', address: '', latitude: '', longitude: ''
  },
  steps: [basicInfoStep, vehicleDetailsStep, locationStep],
  fieldGroups: {
    step1: ['title', 'description', 'price'],
    step2: ['brand', 'model', 'year', 'mileage', 'fuelType', 'color', 'transmission', 'bodyType'],
    step3: ['city', 'district', 'address', 'latitude', 'longitude']
  }
};

export const realEstateFormConfig = {
  entityName: 'Real Estate',
  totalSteps: 3,
  initialData: {
    title: '', description: '', price: '', adType: '', realEstateType: '', heatingType: '', ownerType: '',
    squareMeters: '', roomCount: '', bathroomCount: '', floor: '', buildingAge: '', city: '', district: '',
    address: '', latitude: '', longitude: ''
  },
  steps: [basicInfoStep, realEstateDetailsStep, locationStep],
  fieldGroups: {
    step1: ['title', 'description', 'price'],
    step2: ['adType', 'realEstateType', 'heatingType', 'ownerType', 'squareMeters', 'roomCount', 'bathroomCount', 'floor', 'buildingAge'],
    step3: ['city', 'district', 'address', 'latitude', 'longitude']
  }
};

export const electronicsFormConfig = {
  entityName: 'Electronic',
  totalSteps: 3,
  initialData: {
    title: '', description: '', price: '', electronicType: '', brand: '', model: '', condition: '', warranty: '',
    city: '', district: '', address: '', latitude: '', longitude: ''
  },
  steps: [basicInfoStep, electronicsDetailsStep, locationStep],
  fieldGroups: {
    step1: ['title', 'description', 'price'],
    step2: ['electronicType', 'brand', 'model', 'condition', 'warranty'],
    step3: ['city', 'district', 'address', 'latitude', 'longitude']
  }
};

export const sportsFormConfig = {
  entityName: 'Sports',
  totalSteps: 3,
  initialData: {
    title: '', description: '', price: '', currency: 'TRY', quantity: 1, sportType: '', equipmentType: '', condition: '',
    city: '', district: '', address: '', latitude: '', longitude: ''
  },
  steps: [basicInfoStep, sportsDetailsStep, locationStep],
  fieldGroups: {
    step1: ['title', 'description', 'price', 'currency'],
    step2: ['sportType', 'equipmentType', 'condition'],
    step3: ['city', 'district', 'address', 'latitude', 'longitude']
  }
};

export const booksFormConfig = {
  entityName: 'Books',
  totalSteps: 3,
  initialData: {
    title: '', description: '', price: '', currency: 'TRY', quantity: 1, author: '', genre: '', language: '',
    publicationYear: '', pageCount: '', format: '', condition: '', isbn: '', city: '', district: ''
  },
  steps: [basicInfoStep, bookDetailsStep, locationStep],
  fieldGroups: {
    step1: ['title', 'description', 'price'],
    step2: ['author', 'genre', 'language', 'publicationYear', 'pageCount', 'format', 'condition', 'isbn'],
    step3: ['city', 'district']
  }
};

export const clothingFormConfig = {
  entityName: 'Clothing',
  totalSteps: 3,
  initialData: {
    title: '', description: '', price: '', currency: 'TRY', quantity: 1, brand: '', clothingType: '', color: '',
    condition: '', clothingGender: '', clothingCategory: '', purchaseDate: '', city: '', district: ''
  },
  steps: [basicInfoStep, clothingDetailsStep, locationStep],
  fieldGroups: {
    step1: ['title', 'description', 'price'],
    step2: ['brand', 'clothingType', 'color', 'condition', 'clothingGender', 'clothingCategory', 'purchaseDate'],
    step3: ['city', 'district']
  }
};

export const createFormConfig = (entityType, customConfig = {}) => {
  const baseConfigs = {
    vehicle: vehicleFormConfig,
    realEstate: realEstateFormConfig,
    electronics: electronicsFormConfig,
    sports: sportsFormConfig,
    books: booksFormConfig,
    clothing: clothingFormConfig
  };

  const baseConfig = baseConfigs[entityType];
  if (!baseConfig) throw new Error(`Form configuration not found for entity type: ${entityType}`);

  return {
    ...baseConfig,
    ...customConfig
  };
};
