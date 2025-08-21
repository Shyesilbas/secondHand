import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useVehicle } from '../../features/vehicles/hooks/useVehicle';
import VehicleCreateForm from '../../features/vehicles/components/VehicleCreateForm';

const VehicleEditPage = () => {
  const { id } = useParams();
  const notification = useNotification();
  const { vehicle, isLoading, error, fetchVehicle, updateVehicle } = useVehicle(id);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        await fetchVehicle(id);
        setLoaded(true);
      } catch (e) {
        notification.showError('Hata', 'Araç bilgisi yüklenemedi');
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

  if (!vehicle) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Listing</h1>
          <p className="text-gray-600">Araç ilanı detaylarını güncelle</p>
        </div>
        <VehicleCreateForm
          initialData={vehicle}
          isEdit={true}
          onUpdate={(data) => updateVehicle(id, data)}
        />
      </div>
    </div>
  );
};

export default VehicleEditPage;

