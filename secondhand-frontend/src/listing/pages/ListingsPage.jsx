import React, { useCallback } from 'react';
import { useEnums } from '../../common/hooks/useEnums.js';
import { useListingEngine } from '../hooks/useListingEngine.js';
import ListingsModuleLayout from '../components/ListingsModuleLayout.jsx';

const ListingsPage = () => {
    const engine = useListingEngine({ initialListingType: 'VEHICLE', mode: 'browse' });
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
