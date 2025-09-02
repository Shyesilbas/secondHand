import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingService } from '../services/listingService.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { listingTypeRegistry } from '../components/typeRegistry.js';
import { ROUTES } from '../../common/constants/routes.js';

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
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListing = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await service[serviceMethod](id);
      setListing(data);
    } catch (err) {
      setError(err.response?.data?.message || `An error occurred while fetching the ${entityName}. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  }, [id, service, serviceMethod, entityName]);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id, fetchListing]);

  const handleUpdate = async (updatedData) => {
    try {
      await service[updateMethod](id, updatedData);
      notification.showSuccess('Success', `${entityNameCapitalized} updated successfully`);
      navigate(ROUTES.MY_LISTINGS);
    } catch (err) {
      notification.showError('Error', `Failed to update ${entityName}: ${err.response?.data?.message || err.message}`);
      throw err; // Re-throw to let the form handle it
    }
  };

  const isOwner = isAuthenticated && user?.id === listing?.sellerId;

  // Redirect if not owner
  useEffect(() => {
    if (!isLoading && listing && !isOwner) {
      notification.showError('Error', 'You are not authorized to edit this listing');
      navigate(ROUTES.MY_LISTINGS);
    }
  }, [listing, isOwner, isLoading, navigate, notification]);

  if (isLoading) {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-2xl mx-auto p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-2xl mx-auto p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{entityNameCapitalized} not found</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                  onClick={() => navigate(ROUTES.MY_LISTINGS)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
    );
  }

  if (!listing) {
    return null;
  }

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto p-6">
          <div className="mb-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Go Back
            </button>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit {entityNameCapitalized}</h1>
            <p className="text-gray-600">Update your listing details</p>
          </div>

          {/* Type-specific Edit Form */}
          {(() => {
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
            return <EditForm
                initialData={listing}
                isEdit={true}
                onUpdate={handleUpdate}
            />;
          })()}
        </div>
      </div>
  );
};

export default EditListingPage;
