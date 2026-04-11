import React, { useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { getPrefilterSelectors } from '../config/listingConfig.js';
import ListingPrefilterSelectionFlow from '../components/ListingPrefilterSelectionFlow.jsx';

const ListingsPrefilterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flow = searchParams.get('flow') === 'create' ? 'create' : 'browse';

  useEffect(() => {
    const pageTitle = flow === 'create' ? 'List an item' : 'Categories';
    document.title = `${pageTitle} | SecondHand`;
    return () => {
      document.title = 'SecondHand';
    };
  }, [flow]);

  const handleBrowseComplete = useCallback(
    ({ listingType, selection }) => {
      const selectors = getPrefilterSelectors(listingType);
      const params = new URLSearchParams();
      params.set('category', listingType);
      selectors.forEach((sel) => {
        const v = selection[sel.initialDataKey];
        if (v) params.set(sel.paramKey, v);
      });
      navigate(`${ROUTES.LISTINGS}?${params.toString()}`);
    },
    [navigate],
  );

  const handleBrowseCancel = useCallback(() => {
    navigate(ROUTES.LISTINGS);
  }, [navigate]);

  const handleSellComplete = useCallback(
    (payload) => {
      navigate(ROUTES.CREATE_LISTING, {
        state: { fromListingPrefilter: true, ...payload },
      });
    },
    [navigate],
  );

  const handleSellCancel = useCallback(() => {
    navigate(ROUTES.MY_LISTINGS);
  }, [navigate]);

  if (flow === 'create') {
    return (
      <ListingPrefilterSelectionFlow mode="create" onComplete={handleSellComplete} onCancel={handleSellCancel} />
    );
  }

  return (
    <ListingPrefilterSelectionFlow mode="browse" onComplete={handleBrowseComplete} onCancel={handleBrowseCancel} />
  );
};

export default ListingsPrefilterPage;
