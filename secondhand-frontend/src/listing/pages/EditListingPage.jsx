import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingService } from '../services/listingService.js';
import { electronicService } from '../../electronics/electronics/services/electronicService.js';
import { vehicleService } from '../../vehicle/services/vehicleService.js';
import { realEstateService } from '../../realEstate/services/realEstateService.js';
import { clothingService } from '../../clothing/services/clothingService.js';
import { booksService } from '../../books/services/booksService.js';
import { sportsService } from '../../sports/services/sportsService.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { listingTypeRegistry } from '../components/typeRegistry.js';
import { ROUTES } from '../../common/constants/routes.js';
import { LISTING_TYPES } from '../types/index.js';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';

// --- Service Configuration Strategy ---
const SERVICE_STRATEGIES = {
    [LISTING_TYPES.ELECTRONICS]: {
        service: electronicService,
        serviceMethod: 'getElectronicById',
        updateMethod: 'updateElectronicListing'
    },
    [LISTING_TYPES.VEHICLE]: {
        service: vehicleService,
        serviceMethod: 'getVehicleById',
        updateMethod: 'updateVehicleListing'
    },
    [LISTING_TYPES.REAL_ESTATE]: {
        service: realEstateService,
        serviceMethod: 'getRealEstateById',
        updateMethod: 'updateRealEstateListing'
    },
    [LISTING_TYPES.CLOTHING]: {
        service: clothingService,
        serviceMethod: 'getClothingDetails',
        updateMethod: 'updateClothingListing'
    },
    [LISTING_TYPES.BOOKS]: {
        service: booksService,
        serviceMethod: 'getBooksDetails',
        updateMethod: 'updateBooksListing'
    },
    [LISTING_TYPES.SPORTS]: {
        service: sportsService,
        serviceMethod: 'getSportsDetails',
        updateMethod: 'updateSportsListing'
    }
};

const DEFAULT_SERVICE_STRATEGY = {
    service: listingService,
    serviceMethod: 'getListingById',
    updateMethod: 'updateListing'
};

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
    serviceMethod = null,
    updateMethod = null,
    type = null,
    entityName = 'listing',
    entityNameCapitalized = 'Listing'
}) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const notification = useNotification();

    // 1. Fetch Logic
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchingRef = useRef(false);

    const serviceConfig = useMemo(() => {
        if (service && serviceMethod) {
            return { service, method: serviceMethod };
        }
        if (type) {
            const strategy = SERVICE_STRATEGIES[type] || DEFAULT_SERVICE_STRATEGY;
            return { service: strategy.service, method: strategy.serviceMethod };
        }
        return null;
    }, [type, service, serviceMethod]);

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
                let activeService, activeMethod;

                if (serviceConfig) {
                    activeService = serviceConfig.service;
                    activeMethod = serviceConfig.method;
                } else {
                    initialData = await listingService.getListingById(id);
                    const currentType = initialData?.type;
                    const strategy = SERVICE_STRATEGIES[currentType] || DEFAULT_SERVICE_STRATEGY;
                    activeService = strategy.service;
                    activeMethod = strategy.serviceMethod;
                }

                const fullData = await activeService[activeMethod](id);
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
            const strategy = SERVICE_STRATEGIES[currentType] || DEFAULT_SERVICE_STRATEGY;
            
            const activeService = service || strategy.service;
            const activeUpdateMethod = updateMethod || strategy.updateMethod;

            console.log('Updating listing:', { id, method: activeUpdateMethod, fields: updatedFields });
            
            await activeService[activeUpdateMethod](id, updatedFields);
            
            notification.showSuccess('Success', 'Listing updated successfully');
            navigate(ROUTES.MY_LISTINGS);
        } catch (err) {
            console.error('Update failed:', err);
            notification.showError('Update Failed', err.response?.data?.message || err.message || 'Could not update listing');
            throw err; // Propagate to form for internal error handling if needed
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
