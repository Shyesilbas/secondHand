import VehicleDetails from './details/VehicleDetails';
import ElectronicsDetails from './details/ElectronicsDetails';
import RealEstateDetails from './details/RealEstateDetails';
import ClothingDetails from './details/ClothingDetails';
import BooksDetails from './details/BooksDetails';
import SportsDetails from './details/SportsDetails';

export const listingTypeRegistry = {
  VEHICLE: {
    detailsComponent: VehicleDetails,
    compactBadges: (l) => ([
      { label: l.brand, icon: '🚗' },
      { label: l.year, icon: '📅' },
      { label: l.mileage ? `${l.mileage.toLocaleString('tr-TR')} km` : null, icon: '🛣️' },
      { label: l.fuelType, icon: '⛽' },
    ]),
  },
  ELECTRONICS: {
    detailsComponent: ElectronicsDetails,
    compactBadges: (l) => ([
      { label: l.electronicType, icon: '📱' },
      { label: l.electronicBrand, icon: '🏷️' },
      { label: l.year, icon: '📅' },
      { label: l.color, icon: '🎨' },
    ]),
  },
  REAL_ESTATE: {
    detailsComponent: RealEstateDetails,
    compactBadges: (l) => ([
      { label: l.realEstateType, icon: '🏠' },
      { label: l.adType, icon: '📋' },
      { label: l.squareMeters ? `${l.squareMeters} m²` : null, icon: '📏' },
      { label: l.roomCount ? `${l.roomCount} rooms` : null, icon: '🚪' },
      { label: l.heatingType, icon: '🔥' },
      { label: l.ownerType, icon: '👤' },
    ]),
  },
  CLOTHING: {
    detailsComponent: ClothingDetails,
    compactBadges: (l) => ([
      { label: l.brand, icon: '🏷️' },
      { label: l.clothingType, icon: '👕' },
      { label: l.color, icon: '🎨' },
      { label: l.condition, icon: '⭐' },
      { label: l.purchaseDate ? new Date(l.purchaseDate).toLocaleDateString() : null, icon: '📅' },
    ]),
  },
  BOOKS: {
    detailsComponent: BooksDetails,
    compactBadges: (l) => ([
      { label: l.author, icon: '✍️' },
      { label: l.genre, icon: '🏷️' },
      { label: l.publicationYear, icon: '📅' },
      { label: l.pageCount ? `${l.pageCount} pages` : null, icon: '📖' },
    ]),
  },
  SPORTS: {
    detailsComponent: SportsDetails,
    compactBadges: (l) => ([
      { label: l.discipline, icon: '🏅' },
      { label: l.equipmentType, icon: '🎽' },
      { label: l.condition, icon: '⭐' },
    ]),
  },
};


