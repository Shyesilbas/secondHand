import FilterRenderer from './FilterRenderer';
import { filterConfigs } from './filterConfigs';

export const filtersRegistry = {
  VEHICLE: {
    component: FilterRenderer,
    config: filterConfigs.VEHICLE,
    sortOptions: [
      { value: 'year', label: 'Year' },
      { value: 'mileage', label: 'Mileage' },
      { value: 'brand', label: 'Brand' },
    ],
  },
  ELECTRONICS: {
    component: FilterRenderer,
    config: filterConfigs.ELECTRONICS,
    sortOptions: [
      { value: 'year', label: 'Year' },
      { value: 'brand', label: 'Brand' },
      { value: 'type', label: 'Type' },
    ],
  },
  REAL_ESTATE: {
    component: FilterRenderer,
    config: filterConfigs.REAL_ESTATE,
    sortOptions: [
      { value: 'squareMeters', label: 'Square Meters' },
      { value: 'roomCount', label: 'Room Count' },
      { value: 'buildingAge', label: 'Building Age' },
      { value: 'floor', label: 'Floor' },
    ],
  },
  CLOTHING: {
    component: FilterRenderer,
    config: filterConfigs.CLOTHING,
    sortOptions: [
      { value: 'brand', label: 'Brand' },
      { value: 'type', label: 'Type' },
      { value: 'condition', label: 'Condition' },
      { value: 'purchaseDate', label: 'Purchase Date' },
    ],
  },
  BOOKS: {
    component: FilterRenderer,
    config: filterConfigs.BOOKS,
    sortOptions: [
      { value: 'author', label: 'Author' },
      { value: 'publicationYear', label: 'Year' },
      { value: 'pageCount', label: 'Page Count' },
    ],
  },
  SPORTS: {
    component: FilterRenderer,
    config: filterConfigs.SPORTS,
    sortOptions: [
      { value: 'discipline', label: 'Discipline' },
      { value: 'equipmentType', label: 'Equipment Type' },
      { value: 'condition', label: 'Condition' },
    ],
  },
};


