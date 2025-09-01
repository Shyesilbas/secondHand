import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useElectronic } from '../../features/electronics/hooks/useElectronic';
import ElectronicCreateForm from '../../features/electronics/components/ElectronicCreateForm';

const ElectronicEditPage = () => {
  const { id } = useParams();
  const notification = useNotification();
  const { electronic, isLoading, fetchElectronic, updateElectronic } = useElectronic(id);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        await fetchElectronic(id);
        setLoaded(true);
      } catch (e) {
        notification.showError('Error', 'Failed to load electronic');
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

  if (!electronic) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Electronics Listing</h1>
          <p className="text-gray-600">Update your electronics listing details</p>
        </div>
        <ElectronicCreateForm
          initialData={electronic}
          isEdit={true}
          onUpdate={(data) => updateElectronic(id, data)}
        />
      </div>
    </div>
  );
};

export default ElectronicEditPage;
