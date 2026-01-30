
import { LISTING_TYPES } from '../types/index.js';

import VehicleDetails from '../components/details/VehicleDetails.jsx';
import ElectronicsDetails from '../components/details/ElectronicsDetails.jsx';
import RealEstateDetails from '../components/details/RealEstateDetails.jsx';
import ClothingDetails from '../components/details/ClothingDetails.jsx';
import BooksDetails from '../components/details/BooksDetails.jsx';
import SportsDetails from '../components/details/SportsDetails.jsx';

import VehicleCreateForm from '../../vehicle/components/VehicleCreateForm.jsx';
import ElectronicCreateForm from '../../electronics/electronics/components/ElectronicCreateForm.jsx';
import RealEstateCreateForm from '../../realEstate/components/RealEstateCreateForm.jsx';
import ClothingCreateForm from '../../clothing/components/ClothingCreateForm.jsx';
import BooksCreateForm from '../../books/components/BooksCreateForm.jsx';
import SportsCreateForm from '../../sports/components/SportsCreateForm.jsx';

import {
  createVehicleFilterConfig,
  createElectronicsFilterConfig,
  createRealEstateFilterConfig,
  createClothingFilterConfig,
  createBooksFilterConfig,
  createSportsFilterConfig
} from '../components/filters/filterConfigs.js';
import FilterRenderer from '../components/filters/FilterRenderer.jsx';

export const listingTypeConfig = {
  [LISTING_TYPES.VEHICLE]: {
    label: 'Vehicle',
    icon: '🚗',
    description: 'Cars, motorcycles, bicycles and other vehicles',
    
    detailsComponent: VehicleDetails,
    createComponent: VehicleCreateForm,
    createFlow: {
      subtypeSelector: {
        enumKey: 'vehicleTypes',
        queryParamKey: 'vehicleTypeId',
        initialDataKey: 'vehicleTypeId',
        title: 'Choose vehicle type',
        description: 'Select a type to tailor the form fields.'
      }
    },
    
    filterConfig: createVehicleFilterConfig(),
    
    sortOptions: [
      { value: 'year', label: 'Year' },
      { value: 'mileage', label: 'Mileage' },
      { value: 'brand', label: 'Brand' },
      { value: 'price', label: 'Price' },
      { value: 'createdAt', label: 'Date Added' }
    ],
    
    compactBadges: (listing) => [
      { label: listing.brand?.label || listing.brand?.name || listing.brand, icon: '🚗', show: !!listing.brand },
      { label: listing.year, icon: '📅', show: !!listing.year },
      { 
        label: listing.mileage ? `${listing.mileage.toLocaleString('tr-TR')} km` : null, 
        icon: '🛣️', 
        show: !!listing.mileage 
      },
      { label: listing.fuelType, icon: '⛽', show: !!listing.fuelType },
    ].filter(badge => badge.show),
    
    defaultFilters: {
      minYear: 1980,
      maxYear: new Date().getFullYear(),
    }
  },

  [LISTING_TYPES.ELECTRONICS]: {
    label: 'Electronics',
    icon: '📱',
    description: 'Mobile phones, laptops, TVs and electronic devices',
    
    detailsComponent: ElectronicsDetails,
    createComponent: ElectronicCreateForm,
    createFlow: {
      subtypeSelector: {
        enumKey: 'electronicTypes',
        queryParamKey: 'electronicTypeId',
        initialDataKey: 'electronicTypeId',
        title: 'Choose electronics type',
        description: 'Select a type to tailor the form fields.'
      }
    },
    
    filterConfig: createElectronicsFilterConfig(),
    
    sortOptions: [
      { value: 'year', label: 'Year' },
      { value: 'brand', label: 'Brand' },
      { value: 'type', label: 'Type' },
      { value: 'price', label: 'Price' },
      { value: 'createdAt', label: 'Date Added' }
    ],
    
    compactBadges: (listing) => [
      { label: listing.electronicType?.label || listing.electronicType?.name || listing.electronicType, icon: '📱', show: !!listing.electronicType },
      { label: listing.electronicBrand?.label || listing.electronicBrand?.name || listing.electronicBrand, icon: '🏷️', show: !!listing.electronicBrand },
      { label: listing.year, icon: '📅', show: !!listing.year },
      { label: listing.color, icon: '🎨', show: !!listing.color },
    ].filter(badge => badge.show),
    
    defaultFilters: {
      minYear: 2000,
      maxYear: new Date().getFullYear(),
    }
  },

  [LISTING_TYPES.REAL_ESTATE]: {
    label: 'Real Estate',
    icon: '🏠',
    description: 'Houses, apartments, land and real estate properties',
    
    detailsComponent: RealEstateDetails,
    createComponent: RealEstateCreateForm,
    createFlow: {
      subtypeSelector: {
        enumKey: 'realEstateTypes',
        queryParamKey: 'realEstateTypeId',
        initialDataKey: 'realEstateTypeId',
        title: 'Choose property type',
        description: 'Select a type to tailor the form fields.'
      }
    },
    
    filterConfig: createRealEstateFilterConfig(),
    
    sortOptions: [
      { value: 'squareMeters', label: 'Square Meters' },
      { value: 'roomCount', label: 'Room Count' },
      { value: 'buildingAge', label: 'Building Age' },
      { value: 'floor', label: 'Floor' },
      { value: 'price', label: 'Price' },
      { value: 'createdAt', label: 'Date Added' }
    ],
    
    compactBadges: (listing) => [
      { label: listing.realEstateType, icon: '🏠', show: !!listing.realEstateType },
      { label: listing.adType, icon: '📋', show: !!listing.adType },
      { 
        label: listing.squareMeters ? `${listing.squareMeters} m²` : null, 
        icon: '📏', 
        show: !!listing.squareMeters 
      },
      { 
        label: listing.roomCount ? `${listing.roomCount} rooms` : null, 
        icon: '🚪', 
        show: !!listing.roomCount 
      },
      { label: listing.heatingType, icon: '🔥', show: !!listing.heatingType },
      { label: listing.ownerType, icon: '👤', show: !!listing.ownerType },
    ].filter(badge => badge.show),
    
    defaultFilters: {
      minSquareMeters: 0,
      minRoomCount: 1,
    }
  },

  [LISTING_TYPES.CLOTHING]: {
    label: 'Clothing',
    icon: '👕',
    description: 'Clothing, shoes and fashion accessories',
    
    detailsComponent: ClothingDetails,
    createComponent: ClothingCreateForm,
    createFlow: {
      subtypeSelector: {
        enumKey: 'clothingTypes',
        queryParamKey: 'clothingTypeId',
        initialDataKey: 'clothingTypeId',
        title: 'Choose clothing type',
        description: 'Select a type to tailor the form fields.'
      }
    },
    
    filterConfig: createClothingFilterConfig(),
    
    sortOptions: [
      { value: 'brand', label: 'Brand' },
      { value: 'type', label: 'Type' },
      { value: 'condition', label: 'Condition' },
      { value: 'clothingGender', label: 'Clothing Gender' },
      { value: 'clothingCategory', label: 'Clothing Category' },
      { value: 'purchaseDate', label: 'Purchase Date' },
      { value: 'price', label: 'Price' },
      { value: 'createdAt', label: 'Date Added' }
    ],
    
    compactBadges: (listing) => [
      { label: listing.brand?.label || listing.brand?.name || listing.brand, icon: '🏷️', show: !!listing.brand },
      { label: listing.clothingType?.label || listing.clothingType?.name || listing.clothingType, icon: '👕', show: !!listing.clothingType },
      { label: listing.color, icon: '🎨', show: !!listing.color },
      { label: listing.condition, icon: '⭐', show: !!listing.condition },
      { label: listing.clothingGender, icon: '👤', show: !!listing.clothingGender },
      { label: listing.clothingCategory, icon: '👶', show: !!listing.clothingCategory },
      { 
        label: listing.purchaseDate ? String(new Date(listing.purchaseDate).getFullYear()) : null, 
        icon: '📅', 
        show: !!listing.purchaseDate 
      },
    ].filter(badge => badge.show),
    
    defaultFilters: {}
  },

  [LISTING_TYPES.BOOKS]: {
    label: 'Books',
    icon: '📚',
    description: 'Books, magazines and printed materials',
    
    detailsComponent: BooksDetails,
    createComponent: BooksCreateForm,
    createFlow: {
      subtypeSelector: {
        enumKey: 'bookTypes',
        queryParamKey: 'bookTypeId',
        initialDataKey: 'bookTypeId',
        title: 'Choose book type',
        description: 'Select a type to tailor the form fields.'
      }
    },
    
    filterConfig: createBooksFilterConfig(),
    
    sortOptions: [
      { value: 'author', label: 'Author' },
      { value: 'publicationYear', label: 'Year' },
      { value: 'pageCount', label: 'Page Count' },
      { value: 'genre', label: 'Genre' },
      { value: 'price', label: 'Price' },
      { value: 'createdAt', label: 'Date Added' }
    ],
    
    compactBadges: (listing) => [
      { label: listing.author, icon: '✍️', show: !!listing.author },
      { label: listing.bookType?.label || listing.bookType?.name || listing.bookType, icon: '📚', show: !!listing.bookType },
      { label: listing.genre?.label || listing.genre?.name || listing.genre, icon: '🏷️', show: !!listing.genre },
      { label: listing.publicationYear, icon: '📅', show: !!listing.publicationYear },
      { 
        label: listing.pageCount ? `${listing.pageCount} pages` : null, 
        icon: '📖', 
        show: !!listing.pageCount 
      },
    ].filter(badge => badge.show),
    
    defaultFilters: {
      minYear: 1450,
      maxYear: new Date().getFullYear(),
    }
  },

  [LISTING_TYPES.SPORTS]: {
    label: 'Sports',
    icon: '⚽',
    description: 'Sports equipment and accessories',
    
    detailsComponent: SportsDetails,
    createComponent: SportsCreateForm,
    createFlow: {
      subtypeSelector: {
        enumKey: 'sportDisciplines',
        queryParamKey: 'disciplineId',
        initialDataKey: 'disciplineId',
        title: 'Choose sport discipline',
        description: 'Select a discipline to tailor the form fields.'
      }
    },
    
    filterConfig: createSportsFilterConfig(),
    
    sortOptions: [
      { value: 'discipline', label: 'Discipline' },
      { value: 'equipmentType', label: 'Equipment Type' },
      { value: 'condition', label: 'Condition' },
      { value: 'price', label: 'Price' },
      { value: 'createdAt', label: 'Date Added' }
    ],
    
    compactBadges: (listing) => [
      { label: listing.discipline?.label || listing.discipline?.name || listing.discipline, icon: '🏅', show: !!listing.discipline },
      { label: listing.equipmentType?.label || listing.equipmentType?.name || listing.equipmentType, icon: '🎽', show: !!listing.equipmentType },
      { label: listing.condition?.label || listing.condition?.name || listing.condition, icon: '⭐', show: !!listing.condition },
    ].filter(badge => badge.show),
    
    defaultFilters: {}
  }
};


export const getListingConfig = (listingType) => {
  return listingTypeConfig[listingType] || null;
};

export const getAllListingTypes = () => {
  return Object.keys(listingTypeConfig);
};

export const getListingTypeOptions = () => {
  return Object.entries(listingTypeConfig).map(([value, config]) => ({
    value,
    label: config.label,
    icon: config.icon,
    description: config.description
  }));
};

export const isValidListingType = (listingType) => {
  return listingType && listingTypeConfig.hasOwnProperty(listingType);
};

export const listingTypeRegistry = Object.fromEntries(
  Object.entries(listingTypeConfig).map(([type, config]) => [
    type,
    {
      detailsComponent: config.detailsComponent,
      editComponent: config.createComponent,       compactBadges: config.compactBadges
    }
  ])
);

export const createFormRegistry = Object.fromEntries(
  Object.entries(listingTypeConfig).map(([type, config]) => [
    type,
    config.createComponent
  ])
);

export const filtersRegistry = Object.fromEntries(
  Object.entries(listingTypeConfig).map(([type, config]) => [
    type,
    {
      component: FilterRenderer,
      config: config.filterConfig,
      sortOptions: config.sortOptions
    }
  ])
);

export default listingTypeConfig;
