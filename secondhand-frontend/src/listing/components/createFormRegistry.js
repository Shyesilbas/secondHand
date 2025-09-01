import VehicleCreateForm from '../../vehicle/components/VehicleCreateForm';
import ElectronicCreateForm from '../../electronics/electronics/components/ElectronicCreateForm';
import RealEstateCreateForm from '../../realEstate/components/RealEstateCreateForm';
import ClothingCreateForm from '../../clothing/components/ClothingCreateForm';
import BooksCreateForm from '../../books/components/BooksCreateForm';
import SportsCreateForm from '../../sports/components/SportsCreateForm.jsx';

export const createFormRegistry = {
  VEHICLE: VehicleCreateForm,
  ELECTRONICS: ElectronicCreateForm,
  REAL_ESTATE: RealEstateCreateForm,
  CLOTHING: ClothingCreateForm,
  BOOKS: BooksCreateForm,
  SPORTS: SportsCreateForm,
};


