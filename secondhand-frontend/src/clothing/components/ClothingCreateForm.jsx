import { useClothing } from '../hooks/useClothing.js';
import GenericListingForm from '../../listing/components/GenericListingForm.jsx';

const ClothingCreateForm = ({ onBack, initialData = null, isEdit = false, onUpdate = null }) => {
  const { createClothingListing, isLoading } = useClothing();

  return (
      <GenericListingForm
          listingType="CLOTHING"
          onBack={onBack}
          initialData={initialData}
          isEdit={isEdit}
          onUpdate={onUpdate}
          submitFunction={(data) =>
              isEdit && onUpdate
                  ? onUpdate(data)
                  : createClothingListing(data)
          }
          isLoading={isLoading}
          successMessage={isEdit ? 'Clothing listing updated successfully!' : 'Clothing listing created successfully!'}
          errorMessage={isEdit ? 'Failed to update clothing listing' : 'Failed to create clothing listing'}
      />
  );
};

export default ClothingCreateForm;
