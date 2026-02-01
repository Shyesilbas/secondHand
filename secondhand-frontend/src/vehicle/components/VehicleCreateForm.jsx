import { useVehicle } from '../hooks/useVehicle.js';
import GenericListingForm from '../../listing/components/GenericListingForm.jsx';

const VehicleCreateForm = ({ onBack, initialData = null, isEdit = false, onUpdate = null }) => {
  const { createVehicle, isLoading } = useVehicle();
  return (
    <GenericListingForm
      listingType="VEHICLE"
      onBack={onBack}
      initialData={initialData}
      isEdit={isEdit}
      onUpdate={onUpdate}
      submitFunction={createVehicle}
      isLoading={isLoading}
      successMessage={isEdit ? 'Vehicle listing updated successfully!' : undefined}
      errorMessage={isEdit ? 'Failed to update vehicle listing' : undefined}
    />
  );
};

export default VehicleCreateForm;
