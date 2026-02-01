import { useBooks } from '../hooks/useBooks.js';
import GenericListingForm from '../../listing/components/GenericListingForm.jsx';

const BooksCreateForm = ({ onBack, initialData = null, isEdit = false, onUpdate = null }) => {
  const { createBook, isLoading } = useBooks();

  return (
      <GenericListingForm
          listingType="BOOKS"
          onBack={onBack}
          initialData={initialData}
          isEdit={isEdit}
          onUpdate={onUpdate}
          submitFunction={createBook}
          isLoading={isLoading}
          successMessage={isEdit ? 'Books listing updated successfully!' : 'Books listing created successfully!'}
          errorMessage={isEdit ? 'Failed to update books listing' : 'Failed to create books listing'}
      />
  );
};

export default BooksCreateForm;
