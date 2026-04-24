import React, { useCallback, useEffect } from 'react';
import { useEnums } from '../../common/hooks/useEnums.js';
import { useListingEngine } from '../hooks/useListingEngine.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import ListingsModuleLayout from '../components/ListingsModuleLayout.jsx';

const ListingsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get('category');

    // If no category in URL and no nav state, redirect to prefilter
    useEffect(() => {
        const navState = location.state || window.history.state?.usr;
        const hasCategory = categoryFromUrl || navState?.listingType;
        if (!hasCategory) {
            navigate(ROUTES.LISTINGS_PREFILTER, { replace: true });
        }
    }, [categoryFromUrl, location.state, navigate]);

    const engine = useListingEngine({ initialListingType: categoryFromUrl || null, mode: 'browse' });
    const { getListingTypeLabel } = useEnums();

    const handleListingChanged = useCallback(() => {
        engine.refresh();
    }, [engine]);

    return (
      <ListingsModuleLayout
        mode="browse"
        engine={engine}
        getListingTypeLabel={getListingTypeLabel}
        onListingChanged={handleListingChanged}
        title="Browse Listings"
      />
    );
};

export default ListingsPage;
