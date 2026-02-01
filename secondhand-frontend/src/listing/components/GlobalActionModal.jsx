import React, { useCallback } from 'react';
import ShowcaseModal from '../../showcase/components/ShowcaseModal.jsx';
import CreateCampaignModal from '../../campaign/components/CreateCampaignModal.jsx';
import { useListingActionContext } from '../context/ListingActionContext.jsx';

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

  return (
    <>
      <ShowcaseModal
        isOpen={activeAction === 'showcase' && !!listingId}
        onClose={closeAction}
        listingId={listingId}
        listingTitle={listingTitle}
        onSuccess={handleSuccess}
      />

      <CreateCampaignModal
        isOpen={activeAction === 'campaign' && !!listingId}
        onClose={closeAction}
        onSuccess={handleSuccess}
        initialListingId={listingId}
      />
    </>
  );
};

export default GlobalActionModal;

