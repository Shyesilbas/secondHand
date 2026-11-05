import { useCallback, lazy, Suspense } from 'react';
import { useListingActionContext } from '../context/ListingActionContext.jsx';

const ShowcaseModal = lazy(() => import('../../showcase/components/ShowcaseModal.jsx'));
const CreateCampaignModal = lazy(() => import('../../campaign/components/CreateCampaignModal.jsx'));

const GlobalActionModal = () => {
 const ctx = useListingActionContext();
 const activeAction = ctx?.activeAction;
 const listing = ctx?.activeListing;
 const closeAction = ctx?.closeAction;

 const listingId = listing?.id;
 const listingTitle = listing?.title || '';

 const handleSuccess = useCallback(() => {
 closeAction?.();
 }, [closeAction]);

 if (!activeAction || !listingId) return null;

 return (
 <Suspense fallback={null}>
 {activeAction === 'showcase' && (
 <ShowcaseModal
 isOpen
 onClose={closeAction}
 listingId={listingId}
 listingTitle={listingTitle}
 onSuccess={handleSuccess}
 />
 )}

 {activeAction === 'campaign' && (
 <CreateCampaignModal
 isOpen
 onClose={closeAction}
 onSuccess={handleSuccess}
 initialListingId={listingId}
 />
 )}
 </Suspense>
 );
};

export default GlobalActionModal;

