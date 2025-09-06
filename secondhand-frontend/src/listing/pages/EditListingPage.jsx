import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingService } from '../services/listingService.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { listingTypeRegistry } from '../components/typeRegistry.js';
import { ROUTES } from '../../common/constants/routes.js';

const PageLoader = () => (
    <div className="min-h-screen bg-app-bg py-8">
      <div className="max-w-2xl mx-auto p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="bg-white rounded-lg shadow-sm border p-6 grid gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-gray-200 rounded"></div>)}
        </div>
      </div>
    </div>
);

const PageError = ({ error, entityNameCapitalized, onBack }) => (
    <div className="min-h-screen bg-app-bg py-8">
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">{entityNameCapitalized} not found</h3>
        <p className="text-text-secondary mb-4">{error}</p>
        <button onClick={onBack} className="bg-btn-primary text-white px-4 py-2 rounded-md hover:bg-btn-primary-hover transition-colors">Go Back</button>
      </div>
    </div>
);

const BackButton = ({ navigate }) => (
    <button
        onClick={() => navigate(-1)}
        className="flex items-center text-text-secondary hover:text-text-primary transition-colors mb-4"
    >
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Go Back
    </button>
);

const useFetchData = (fetchFunc) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetchFunc();
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunc]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, setData, isLoading, error, refetch: fetchData };
};

const renderEditForm = (listing, type, handleUpdate) => {
  const listingType = type || listing.type;
  const cfg = listingTypeRegistry[listingType];
  if (!cfg?.editComponent) {
    return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Edit form not available for listing type: {listingType}</p>
        </div>
    );
  }
  const EditForm = cfg.editComponent;
  return <EditForm initialData={listing} isEdit onUpdate={handleUpdate} />;
};

const useOwnershipRedirect = (listing, isOwner, notification, navigate) => {
  useEffect(() => {
    if (listing && !isOwner) {
      notification.showError('Error', 'You are not authorized to edit this listing');
      navigate(ROUTES.MY_LISTINGS);
    }
  }, [listing, isOwner, navigate, notification]);
};

const EditListingPage = ({
                           service = listingService,
                           serviceMethod = 'getListingById',
                           updateMethod = 'updateListing',
                           type = null,
                           entityName = 'listing',
                           entityNameCapitalized = 'Listing'
                         }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const notification = useNotification();

  const { data: listing, setData: setListing, isLoading, error, refetch } = useFetchData(() => service[serviceMethod](id));

  const handleUpdate = async (updatedData) => {
    try {
      await service[updateMethod](id, updatedData);
      notification.showSuccess('Success', `${entityNameCapitalized} updated successfully`);
      navigate(ROUTES.MY_LISTINGS);
    } catch (err) {
      notification.showError('Error', `Failed to update ${entityName}: ${err.response?.data?.message || err.message}`);
      throw err;
    }
  };

  const isOwner = isAuthenticated && user?.id === listing?.sellerId;
  useOwnershipRedirect(listing, isOwner, notification, navigate);

  if (isLoading) return <PageLoader />;
  if (error) return <PageError error={error} entityNameCapitalized={entityNameCapitalized} onBack={() => navigate(ROUTES.MY_LISTINGS)} />;
  if (!listing) return null;

  return (
      <div className="min-h-screen bg-app-bg py-8">
        <div className="max-w-2xl mx-auto p-6">
          <BackButton navigate={navigate} />
          <h1 className="text-3xl font-bold text-text-primary mb-2">Edit {entityNameCapitalized}</h1>
          <p className="text-text-secondary mb-8">Update your listing details</p>
          {renderEditForm(listing, type, handleUpdate)}
        </div>
      </div>
  );
};

export default EditListingPage;
