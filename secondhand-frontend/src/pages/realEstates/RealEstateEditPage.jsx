import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRealEstate } from '../../features/realEstates/hooks/useRealEstate';
import { useNotification } from '../../context/NotificationContext';
import RealEstateCreateForm from '../../features/realEstates/components/RealEstateCreateForm';

const RealEstateEditPage = () => {
  const { id } = useParams();
  const notification = useNotification();
  const { realEstate, isLoading, error, fetchRealEstate, updateRealEstate } = useRealEstate(id);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        await fetchRealEstate(id);
        setLoaded(true);
      } catch (e) {
        notification.showError('Error', 'Failed to load real estate listing');
      }
    };
    if (id) run();
  }, [id]);

  if (!loaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto p-6">Loading...</div>
      </div>
    );
  }

  if (!realEstate) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Listing</h1>
          <p className="text-gray-600">Update your real estate listing details</p>
        </div>
        <RealEstateCreateForm
          initialData={realEstate}
          isEdit={true}
          onUpdate={(data) => updateRealEstate(id, data)}
        />
      </div>
    </div>
  );
};

export default RealEstateEditPage;
