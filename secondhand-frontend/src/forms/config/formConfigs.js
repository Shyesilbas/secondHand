/**
 * Form Configuration Factory
 * Centralized form configurations for different entity types
 */

/**
 * Vehicle Form Configuration
 */
export const vehicleFormConfig = {
  entityName: 'Vehicle',
  totalSteps: 3,
  initialData: {
    title: '',
    description: '',
    price: '',
    brand: '',
    model: '',
    year: '',
    mileage: '',
    engineCapacity: '',
    gearbox: '',
    seatCount: '',
    wheels: '',
    fuelCapacity: '',
    fuelConsumption: '',
    horsePower: '',
    kilometersPerLiter: '',
    fuelType: '',
    color: '',
    transmission: '',
    bodyType: '',
    city: '',
    district: '',
    address: '',
    latitude: '',
    longitude: ''
  },
  steps: [
    {
      id: 1,
      title: 'Basic Information',
      description: 'Set the title, description and price of your listing',
      icon: '📝',
      bgColor: 'bg-blue-100'
    },
    {
      id: 2,
      title: 'Vehicle Specifications',
      description: 'Specify the technical details of your vehicle',
      icon: '🚗',
      bgColor: 'bg-green-100'
    },
    {
      id: 3,
      title: 'Location',
      description: 'Set the location of your vehicle',
      icon: '📍',
      bgColor: 'bg-purple-100'
    }
  ],
  fieldGroups: {
    step1: ['title', 'description', 'price'],
    step2: ['brand', 'model', 'year', 'mileage', 'fuelType', 'color', 'transmission', 'bodyType'],
    step3: ['city', 'district', 'address', 'latitude', 'longitude']
  }
};

/**
 * Real Estate Form Configuration
 */
export const realEstateFormConfig = {
  entityName: 'Real Estate',
  totalSteps: 3,
  initialData: {
    title: '',
    description: '',
    price: '',
    adType: '',
    realEstateType: '',
    heatingType: '',
    ownerType: '',
    squareMeters: '',
    roomCount: '',
    bathroomCount: '',
    floor: '',
    buildingAge: '',
    city: '',
    district: '',
    address: '',
    latitude: '',
    longitude: ''
  },
  steps: [
    {
      id: 1,
      title: 'Basic Information',
      description: 'Set the title, description and price of your listing',
      icon: '📝',
      bgColor: 'bg-blue-100'
    },
    {
      id: 2,
      title: 'Property Details',
      description: 'Specify the property specifications',
      icon: '🏠',
      bgColor: 'bg-green-100'
    },
    {
      id: 3,
      title: 'Location',
      description: 'Set the location of your property',
      icon: '📍',
      bgColor: 'bg-purple-100'
    }
  ],
  fieldGroups: {
    step1: ['title', 'description', 'price'],
    step2: ['adType', 'realEstateType', 'heatingType', 'ownerType', 'squareMeters', 'roomCount', 'bathroomCount', 'floor', 'buildingAge'],
    step3: ['city', 'district', 'address', 'latitude', 'longitude']
  }
};

/**
 * Electronics Form Configuration
 */
export const electronicsFormConfig = {
  entityName: 'Electronic',
  totalSteps: 3,
  initialData: {
    title: '',
    description: '',
    price: '',
    electronicType: '',
    brand: '',
    model: '',
    condition: '',
    warranty: '',
    city: '',
    district: '',
    address: '',
    latitude: '',
    longitude: ''
  },
  steps: [
    {
      id: 1,
      title: 'Basic Information',
      description: 'Set the title, description and price of your listing',
      icon: '📝',
      bgColor: 'bg-blue-100'
    },
    {
      id: 2,
      title: 'Electronic Details',
      description: 'Specify the electronic specifications',
      icon: '📱',
      bgColor: 'bg-green-100'
    },
    {
      id: 3,
      title: 'Location',
      description: 'Set the location of your electronic',
      icon: '📍',
      bgColor: 'bg-purple-100'
    }
  ],
  fieldGroups: {
    step1: ['title', 'description', 'price'],
    step2: ['electronicType', 'brand', 'model', 'condition', 'warranty'],
    step3: ['city', 'district', 'address', 'latitude', 'longitude']
  }
};

/**
 * Generic Form Configuration Factory
 */
export const createFormConfig = (entityType, customConfig = {}) => {
  const baseConfigs = {
    vehicle: vehicleFormConfig,
    realEstate: realEstateFormConfig,
    electronics: electronicsFormConfig
  };

  const baseConfig = baseConfigs[entityType];
  if (!baseConfig) {
    throw new Error(`Form configuration not found for entity type: ${entityType}`);
  }

  return {
    ...baseConfig,
    ...customConfig
  };
};
