import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useSports } from '../../features/sports/hooks/useSports';
import SportsCreateForm from '../../features/sports/components/SportsCreateForm';

const SportsEditPage = () => {
  const { id } = useParams();
  const notification = useNotification();
  const { sports, isLoading, fetchSports, updateSports } = useSports(id);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        await fetchSports(id);
        setLoaded(true);
      } catch (e) {
        notification.showError('Error', 'Failed to load sports listing');
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

  if (!sports) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Sports Listing</h1>
          <p className="text-gray-600">Update your sports listing details</p>
        </div>
        <SportsCreateForm
          initialData={sports}
          isEdit={true}
          onUpdate={(data) => updateSports(id, data)}
        />
      </div>
    </div>
  );
};

export default SportsEditPage;


