import { useSports } from '../hooks/useSports.js';
import GenericListingForm from '../../listing/components/GenericListingForm.jsx';

const SportsCreateForm = ({ onBack, initialData = null, isEdit = false, onUpdate = null }) => {
  const { createSports, isLoading } = useSports();

  return (
      <GenericListingForm
          listingType="SPORTS"
          onBack={onBack}
          initialData={initialData}
          isEdit={isEdit}
          onUpdate={onUpdate}
          submitFunction={createSports}
          isLoading={isLoading}
          successMessage={isEdit ? 'Sports listing updated successfully!' : 'Sports listing created successfully!'}
          errorMessage={isEdit ? 'Failed to update sports listing' : 'Failed to create sports listing'}
      />
  );
};

export default SportsCreateForm;
