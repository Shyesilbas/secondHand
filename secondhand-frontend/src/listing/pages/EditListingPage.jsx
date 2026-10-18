import { useTranslation } from "react-i18next";
import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingService } from '../services/listingService.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LISTING_KEYS } from '../hooks/useListingData.js';
import { listingTypeRegistry, getListingConfig } from '../config/listingConfig.js';
import { ROUTES } from '../../common/constants/routes.js';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button, Skeleton } from '../../common/components/ui/index.js';
import logger from '../../common/utils/logger.js';

// --- Components ---

const PageLoader = () => {
 const { t } = useTranslation();
 return (
 <div className="mx-auto max-w-3xl space-y-4 px-4 py-10" aria-busy="true" aria-label={t("loading_listing_details")}>
 <Skeleton className="h-8 w-64" />
 <Skeleton className="h-40 w-full" />
 <Skeleton className="h-40 w-full" />
 </div>
 );
};
const PageError = ({ error, onBack }) => {
 const { t } = useTranslation();
 return (
 <div className="min-h-screen bg-background-secondary flex items-center justify-center p-4">
 <div className="w-full max-w-md rounded border border-border bg-background-primary p-6 text-center">
 <AlertTriangle className="mx-auto mb-3 h-5 w-5 text-status-error" strokeWidth={1.5} aria-hidden />
 <h3 className="text-lg font-semibold text-text-primary">{t("something_went_wrong")}</h3>
 <p className="mt-1 text-sm text-text-secondary">{error}</p>
 <Button variant="secondary" onClick={onBack} className="mt-5">
 <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />{t("go_back_to_listings")}</Button>
 </div>
 </div>
 );
};
const EditListingPage = ({
 service = null,
 type = null
}) => {
 const {
 id
 } = useParams();
 const navigate = useNavigate();
 const {
 user,
 isAuthenticated
 } = useAuthState();
 const notification = useNotification();
 const queryClient = useQueryClient();

 // 1. Fetch Logic
 const serviceConfig = useMemo(() => {
 if (service) {
 return service;
 }
 if (type) {
 return getListingConfig(type)?.service || null;
 }
 return null;
 }, [type, service]);
 const { data, isLoading, error: queryError } = useQuery({
 queryKey: ['listings', 'edit', id],
 queryFn: async () => {
 // Without an explicit type, read the base listing first to pick the type-specific editor service.
 const activeService = serviceConfig || getListingConfig((await listingService.getListingById(id))?.type)?.service;
 if (!activeService?.getById) throw new Error('Editor service not found for this listing type');
 return activeService.getById(id);
 },
 enabled: !!id,
 staleTime: 0
 });
 const error = queryError ? queryError.response?.data?.message || queryError.message || 'Failed to load listing details.' : null;

 // 2. Authorization Check
 useEffect(() => {
 if (!isLoading && data && isAuthenticated) {
 const isOwner = user?.id === data?.sellerId;
 if (!isOwner) {
 notification.showError('Access Denied', 'You can only edit your own listings.');
 navigate(ROUTES.MY_LISTINGS, {
 replace: true
 });
 }
 }
 }, [isLoading, data, isAuthenticated, user, navigate, notification]);

 // 3. Update Handler
 const handleUpdate = async updatedFields => {
 try {
 const currentType = type || data?.type;
 const activeService = service || getListingConfig(currentType)?.service || null;
 if (!activeService?.update) {
 throw new Error('Update service not found for this listing type');
 }
 await activeService.update(id, updatedFields);
 queryClient.invalidateQueries({ queryKey: LISTING_KEYS.detail(id) });
 queryClient.invalidateQueries({ queryKey: ['listings'] });
 notification.showSuccess('Success', 'Listing updated successfully');
 navigate(ROUTES.MY_LISTINGS);
 } catch (err) {
 logger.error('Update failed:', err);
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
 return <EditComponent initialData={data} isEdit={true} onUpdate={handleUpdate} onBack={() => navigate(-1)} />;
};
export default EditListingPage;