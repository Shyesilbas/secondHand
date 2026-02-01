import { useRealEstate } from '../hooks/useRealEstate.js';
import GenericListingForm from '../../listing/components/GenericListingForm.jsx';

const RealEstateCreateForm = ({ onBack, initialData = null, isEdit = false, onUpdate = null }) => {
  const { createRealEstate, isLoading } = useRealEstate();

  return (
      <GenericListingForm
          listingType="REAL_ESTATE"
          onBack={onBack}
          initialData={initialData}
          isEdit={isEdit}
          onUpdate={onUpdate}
          submitFunction={createRealEstate}
          isLoading={isLoading}
          successMessage={isEdit ? 'Real estate listing updated successfully!' : 'Real estate listing created successfully!'}
          errorMessage={isEdit ? 'Failed to update real estate listing' : 'Failed to create real estate listing'}
      />
  );
};

export default RealEstateCreateForm;
