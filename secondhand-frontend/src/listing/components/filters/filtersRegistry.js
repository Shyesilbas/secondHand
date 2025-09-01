import VehicleFilters from './VehicleFilters';
import ElectronicsFilters from './ElectronicsFilters';
import RealEstateFilters from './RealEstateFilters';
import ClothingFilters from './ClothingFilters';
import BooksFilters from './BooksFilters';
import SportsFilters from './SportsFilters';

export const filtersRegistry = {
  VEHICLE: {
    component: VehicleFilters,
    sortOptions: [
      { value: 'year', label: 'Year' },
      { value: 'mileage', label: 'Mileage' },
      { value: 'brand', label: 'Brand' },
    ],
  },
  ELECTRONICS: {
    component: ElectronicsFilters,
    sortOptions: [
      { value: 'year', label: 'Year' },
      { value: 'brand', label: 'Brand' },
      { value: 'type', label: 'Type' },
    ],
  },
  REAL_ESTATE: {
    component: RealEstateFilters,
    sortOptions: [
      { value: 'squareMeters', label: 'Square Meters' },
      { value: 'roomCount', label: 'Room Count' },
      { value: 'buildingAge', label: 'Building Age' },
      { value: 'floor', label: 'Floor' },
    ],
  },
  CLOTHING: {
    component: ClothingFilters,
    sortOptions: [
      { value: 'brand', label: 'Brand' },
      { value: 'type', label: 'Type' },
      { value: 'condition', label: 'Condition' },
      { value: 'purchaseDate', label: 'Purchase Date' },
    ],
  },
  BOOKS: {
    component: BooksFilters,
    sortOptions: [
      { value: 'author', label: 'Author' },
      { value: 'publicationYear', label: 'Year' },
      { value: 'pageCount', label: 'Page Count' },
    ],
  },
  SPORTS: {
    component: SportsFilters,
    sortOptions: [
      { value: 'discipline', label: 'Discipline' },
      { value: 'equipmentType', label: 'Equipment Type' },
      { value: 'condition', label: 'Condition' },
    ],
  },
};


