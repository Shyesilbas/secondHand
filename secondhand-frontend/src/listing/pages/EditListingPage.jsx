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
import { ArrowLeft } from 'lucide-react';
import { Button, ErrorState, Skeleton } from '../../common/components/ui/index.js';
import { getErrorMessage } from '../../common/utils/errorUtils.js';
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
const PageError = ({ error, onBack, onRetry }) => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background-page p-4">
      <ErrorState
        title={t('something_went_wrong', 'Bir şeyler ters gitti')}
        description={error}
        onRetry={onRetry}
        className="w-full max-w-md"
      />
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        <span>{t('go_back_to_listings', 'İlanlara dön')}</span>
      </Button>
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
 const { data, isLoading, error: queryError, refetch } = useQuery({
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
 const error = queryError ? getErrorMessage(queryError, 'İlan detayları yüklenemedi.') : null;

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
 } catch (err) {
 // The form shows the error and decides where to go on success (my listings, or the fee page for a draft).
 logger.error('Update failed:', err);
 throw err;
 }
 };
 if (isLoading) return <PageLoader />;
 if (error) return <PageError error={error} onRetry={refetch} onBack={() => navigate(ROUTES.MY_LISTINGS)} />;
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
 return <EditComponent initialData={data} isEdit={true} isDraft={data.status === 'DRAFT'} onUpdate={handleUpdate} onBack={() => navigate(-1)} />;
};
export default EditListingPage;