import VehicleCreateForm from '../../features/vehicles/components/VehicleCreateForm';
import ElectronicCreateForm from '../../features/electronics/components/ElectronicCreateForm';
import RealEstateCreateForm from '../../features/realEstates/components/RealEstateCreateForm';
import ClothingCreateForm from '../../features/clothing/components/ClothingCreateForm';
import BooksCreateForm from '../../features/books/components/BooksCreateForm';
import SportsCreateForm from '../../features/sports/components/SportsCreateForm.jsx';

export const createFormRegistry = {
  VEHICLE: VehicleCreateForm,
  ELECTRONICS: ElectronicCreateForm,
  REAL_ESTATE: RealEstateCreateForm,
  CLOTHING: ClothingCreateForm,
  BOOKS: BooksCreateForm,
  SPORTS: SportsCreateForm,
};


