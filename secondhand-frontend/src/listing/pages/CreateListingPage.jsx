import React, { useLayoutEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createFormRegistry, isCreateSelectionComplete } from '../config/listingConfig.js';
import { ROUTES } from '../../common/constants/routes.js';

/** Form only; category + selectors are completed on /listings/prefilter?flow=create */
const CreateListingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const st = location.state;

  const listingType = useMemo(() => {
    if (!st?.fromListingPrefilter || !st?.listingType) return null;
    return String(st.listingType).toUpperCase();
  }, [st?.fromListingPrefilter, st?.listingType]);

  const selection = st?.selection && typeof st.selection === 'object' ? st.selection : {};
  const SelectedForm = listingType ? createFormRegistry[listingType] : null;
  const complete =
    Boolean(listingType && SelectedForm && isCreateSelectionComplete(listingType, selection));

  useLayoutEffect(() => {
    if (complete) return;
    navigate(ROUTES.LISTINGS_PREFILTER_CREATE, { replace: true });
  }, [complete, navigate]);

  if (!complete || !SelectedForm) {
    return null;
  }

  return (
    <SelectedForm
      onBack={() => navigate(ROUTES.LISTINGS_PREFILTER_CREATE)}
      initialData={selection}
    />
  );
};

export default CreateListingPage;
