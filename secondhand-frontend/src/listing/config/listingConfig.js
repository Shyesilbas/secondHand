/**
 * Centralized configuration for listing types and their properties
 */

import { LISTING_TYPES } from '../types/index.js';

// Import detail components
import VehicleDetails from '../components/details/VehicleDetails.jsx';
import ElectronicsDetails from '../components/details/ElectronicsDetails.jsx';
import RealEstateDetails from '../components/details/RealEstateDetails.jsx';
import ClothingDetails from '../components/details/ClothingDetails.jsx';
import BooksDetails from '../components/details/BooksDetails.jsx';
import SportsDetails from '../components/details/SportsDetails.jsx';

// Import create form components
import VehicleCreateForm from '../../vehicle/components/VehicleCreateForm.jsx';
import ElectronicCreateForm from '../../electronics/electronics/components/ElectronicCreateForm.jsx';
import RealEstateCreateForm from '../../realEstate/components/RealEstateCreateForm.jsx';
import ClothingCreateForm from '../../clothing/components/ClothingCreateForm.jsx';
import BooksCreateForm from '../../books/components/BooksCreateForm.jsx';
import SportsCreateForm from '../../sports/components/SportsCreateForm.jsx';

// Import filter configurations
import {
  createVehicleFilterConfig,
  createElectronicsFilterConfig,
  createRealEstateFilterConfig,
  createClothingFilterConfig,
  createBooksFilterConfig,
  createSportsFilterConfig
} from '../components/filters/filterConfigs.js';
import FilterRenderer from '../components/filters/FilterRenderer.jsx';

/**
 * Comprehensive listing type configuration
 * Each type includes all necessary components and metadata
 */
export const listingTypeConfig = {
  [LISTING_TYPES.VEHICLE]: {
    // Display properties
    label: 'Vehicle',
    icon: '🚗',
    description: 'Cars, motorcycles, bicycles and other vehicles',
    
    // Components
    detailsComponent: VehicleDetails,
    createComponent: VehicleCreateForm,
    
    // Filter configuration
    filterConfig: createVehicleFilterConfig(),
    
    // Sort options specific to this type
    sortOptions: [
      { value: 'year', label: 'Year' },
      { value: 'mileage', label: 'Mileage' },
      { value: 'brand', label: 'Brand' },
      { value: 'price', label: 'Price' },
      { value: 'createdAt', label: 'Date Added' }
    ],
    
    // Compact badge configuration for card displays
    compactBadges: (listing) => [
      { label: listing.brand, icon: '🚗', show: !!listing.brand },
      { label: listing.year, icon: '📅', show: !!listing.year },
      { 
        label: listing.mileage ? `${listing.mileage.toLocaleString('tr-TR')} km` : null, 
        icon: '🛣️', 
        show: !!listing.mileage 
      },
      { label: listing.fuelType, icon: '⛽', show: !!listing.fuelType },
    ].filter(badge => badge.show),
    
    // Default values for filters
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
    
    filterConfig: createElectronicsFilterConfig(),
    
    sortOptions: [
      { value: 'year', label: 'Year' },
      { value: 'brand', label: 'Brand' },
      { value: 'type', label: 'Type' },
      { value: 'price', label: 'Price' },
      { value: 'createdAt', label: 'Date Added' }
    ],
    
    compactBadges: (listing) => [
      { label: listing.electronicType, icon: '📱', show: !!listing.electronicType },
      { label: listing.electronicBrand, icon: '🏷️', show: !!listing.electronicBrand },
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
    
    filterConfig: createClothingFilterConfig(),
    
    sortOptions: [
      { value: 'brand', label: 'Brand' },
      { value: 'type', label: 'Type' },
      { value: 'condition', label: 'Condition' },
      { value: 'purchaseDate', label: 'Purchase Date' },
      { value: 'price', label: 'Price' },
      { value: 'createdAt', label: 'Date Added' }
    ],
    
    compactBadges: (listing) => [
      { label: listing.brand, icon: '🏷️', show: !!listing.brand },
      { label: listing.clothingType, icon: '👕', show: !!listing.clothingType },
      { label: listing.color, icon: '🎨', show: !!listing.color },
      { label: listing.condition, icon: '⭐', show: !!listing.condition },
      { 
        label: listing.purchaseDate ? new Date(listing.purchaseDate).toLocaleDateString() : null, 
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
      { label: listing.genre, icon: '🏷️', show: !!listing.genre },
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
    
    filterConfig: createSportsFilterConfig(),
    
    sortOptions: [
      { value: 'discipline', label: 'Discipline' },
      { value: 'equipmentType', label: 'Equipment Type' },
      { value: 'condition', label: 'Condition' },
      { value: 'price', label: 'Price' },
      { value: 'createdAt', label: 'Date Added' }
    ],
    
    compactBadges: (listing) => [
      { label: listing.discipline, icon: '🏅', show: !!listing.discipline },
      { label: listing.equipmentType, icon: '🎽', show: !!listing.equipmentType },
      { label: listing.condition, icon: '⭐', show: !!listing.condition },
    ].filter(badge => badge.show),
    
    defaultFilters: {}
  }
};

/**
 * Helper functions to work with listing configuration
 */

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

// Backward compatibility exports
export const listingTypeRegistry = Object.fromEntries(
  Object.entries(listingTypeConfig).map(([type, config]) => [
    type,
    {
      detailsComponent: config.detailsComponent,
      editComponent: config.createComponent, // For edit forms, we use the same component
      compactBadges: config.compactBadges
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
