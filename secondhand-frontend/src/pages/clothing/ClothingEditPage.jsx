import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClothing } from '../../features/clothing/hooks/useClothing';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { ROUTES } from '../../constants/routes';
import ClothingCreateForm from '../../features/clothing/components/ClothingCreateForm';

const ClothingEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const notification = useNotification();
    const { getClothingDetails, updateClothingListing, isLoading, error } = useClothing();
    const [clothing, setClothing] = useState(null);

    useEffect(() => {
        const fetchClothing = async () => {
            try {
                const data = await getClothingDetails(id);
                setClothing(data);
            } catch (err) {
                notification.showError('Error', 'Failed to load clothing details');
                navigate(ROUTES.MY_LISTINGS);
            }
        };

        if (id) {
            fetchClothing();
        }
    }, [id, getClothingDetails, notification, navigate]);

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
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Clothing</h3>
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

    if (!clothing) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Clothing Listing</h1>
                    <p className="text-gray-600">Update your clothing listing details</p>
                </div>
                
                <ClothingCreateForm 
                    initialData={clothing}
                    isEdit={true}
                    onUpdate={(data) => updateClothingListing(id, data)}
                />
            </div>
        </div>
    );
};

export default ClothingEditPage;
