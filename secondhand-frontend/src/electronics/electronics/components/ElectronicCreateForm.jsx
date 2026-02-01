import { useElectronic } from '../hooks/useElectronic.js';
import GenericListingForm from '../../../listing/components/GenericListingForm.jsx';

const ElectronicCreateForm = ({ onBack, initialData = null, isEdit = false, onUpdate = null }) => {
  const { createElectronic, isLoading } = useElectronic();

  return (
      <GenericListingForm
          listingType="ELECTRONICS"
          onBack={onBack}
          initialData={initialData}
          isEdit={isEdit}
          onUpdate={onUpdate}
          submitFunction={createElectronic}
          isLoading={isLoading}
          successMessage={isEdit ? 'Electronic listing updated successfully!' : 'Electronic listing created successfully!'}
          errorMessage={isEdit ? 'Failed to update electronic listing' : 'Failed to create electronic listing'}
      />
  );
};

export default ElectronicCreateForm;
