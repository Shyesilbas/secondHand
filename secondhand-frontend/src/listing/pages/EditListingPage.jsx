import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingService } from '../services/listingService.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { listingTypeRegistry } from '../config/listingConfig.js';
import { ROUTES } from '../../common/constants/routes.js';
import { getListingConfig } from '../config/listingConfig.js';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';

// --- Components ---

const PageLoader = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Loading listing details...</h3>
    </div>
);

const PageError = ({ error, onBack }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-8">{error}</p>
            <button 
                onClick={onBack}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors font-medium w-full justify-center"
            >
                <ArrowLeft className="w-4 h-4" />
                Go Back to Listings
            </button>
        </div>
    </div>
);

const EditListingPage = ({
    service = null,
    type = null,
    entityName = 'listing',
    entityNameCapitalized = 'Listing'
}) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthState();
    const notification = useNotification();

    // 1. Fetch Logic
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchingRef = useRef(false);

    const serviceConfig = useMemo(() => {
        if (service) {
            return service;
        }
        if (type) {
            return getListingConfig(type)?.service || null;
        }
        return null;
    }, [type, service]);

    useEffect(() => {
        if (!id || fetchingRef.current) {
            return;
        }

        fetchingRef.current = true;
        
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                let initialData = null;
                let activeService;

                if (serviceConfig) {
                    activeService = serviceConfig;
                } else {
                    initialData = await listingService.getListingById(id);
                    const currentType = initialData?.type;
                    activeService = getListingConfig(currentType)?.service || null;
                }

                if (!activeService?.getById) {
                    throw new Error('Editor service not found for this listing type');
                }

                const fullData = await activeService.getById(id);
                setData(fullData);
                
            } catch (err) {
                console.error('Failed to fetch listing:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load listing details.');
            } finally {
                setIsLoading(false);
                fetchingRef.current = false;
            }
        };

        fetchData();

        return () => {
            fetchingRef.current = false;
        };
    }, [id, serviceConfig]);

    // 2. Authorization Check
    useEffect(() => {
        if (!isLoading && data && isAuthenticated) {
             const isOwner = user?.id === data?.sellerId;
             if (!isOwner) {
                 notification.showError('Access Denied', 'You can only edit your own listings.');
                 navigate(ROUTES.MY_LISTINGS, { replace: true });
             }
        }
    }, [isLoading, data, isAuthenticated, user, navigate, notification]);

    // 3. Update Handler
    const handleUpdate = async (updatedFields) => {
        try {
            const currentType = type || data?.type;
            const activeService = service || getListingConfig(currentType)?.service || null;

            if (!activeService?.update) {
                throw new Error('Update service not found for this listing type');
            }

            await activeService.update(id, updatedFields);
            
            notification.showSuccess('Success', 'Listing updated successfully');
            navigate(ROUTES.MY_LISTINGS);
        } catch (err) {
            console.error('Update failed:', err);
            notification.showError('Update Failed', err.response?.data?.message || err.message || 'Could not update listing');
            throw err;
        }
    };

    if (isLoading) return <PageLoader />;
    if (error) return <PageError error={error} onBack={() => navigate(ROUTES.MY_LISTINGS)} />;
    if (!data) return <PageError error="Listing not found" onBack={() => navigate(ROUTES.MY_LISTINGS)} />;

    // 4. Render Form
    // We render the specific form component directly without a wrapping container
    // The form component (e.g. VehicleCreateForm) handles its own layout via ListingWizard
    
    const listingType = type || data.type;
    const config = listingTypeRegistry[listingType];
    const EditComponent = config?.editComponent;

    if (!EditComponent) {
        return <PageError error={`No editor available for listing type: ${listingType}`} onBack={() => navigate(ROUTES.MY_LISTINGS)} />;
    }

    return (
        <EditComponent 
            initialData={data} 
            isEdit={true} 
            onUpdate={handleUpdate} 
            onBack={() => navigate(-1)}
        />
    );
};

export default EditListingPage;
