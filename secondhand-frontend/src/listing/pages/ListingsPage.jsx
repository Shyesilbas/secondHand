import React, { useCallback } from 'react';
import { useEnums } from '../../common/hooks/useEnums.js';
import { useListingEngine } from '../hooks/useListingEngine.js';
import { useLocation } from 'react-router-dom';
import ListingsModuleLayout from '../components/ListingsModuleLayout.jsx';

const ListingsPage = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get('category');

    /** Kategori yoksa prefiltreye yönlendirme yok: doğrudan grid. Filtre motoru `listingType` için VEHICLE varsayılanını kullanır; kategori seçimi Header → Categories. */
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
