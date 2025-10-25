import { useState, useMemo, useCallback } from 'react';
import { listingService } from '../services/listingService.js';

export const useListingsSearch = (listings, filters, selectedCategory) => {
    const [titleSearchTerm, setTitleSearchTerm] = useState('');
    const [allPagesLoaded, setAllPagesLoaded] = useState(false);
    const [allListings, setAllListings] = useState([]);
    const [loadingAllPages, setLoadingAllPages] = useState(false);

    const filteredListings = useMemo(() => {
        if (!titleSearchTerm.trim()) {
            return listings || [];
        }

        const searchLower = titleSearchTerm.toLowerCase().trim();
        const listingsToSearch = allPagesLoaded ? allListings : (listings || []);
        
        return listingsToSearch.filter(listing => {
            const titleMatch = listing.title?.toLowerCase().includes(searchLower);
            const listingNoMatch = listing.listingNo?.toLowerCase().includes(searchLower);
            return titleMatch || listingNoMatch;
        });
    }, [listings, titleSearchTerm, allPagesLoaded, allListings]);

    const clearSearch = useCallback(() => {
        setTitleSearchTerm('');
        setAllPagesLoaded(false);
        setAllListings([]);
    }, []);

    const loadAllPages = useCallback(async () => {
        setLoadingAllPages(true);
        try {
            const allListingsData = [];
            let currentPage = 0;
            let hasMorePages = true;
            
            while (hasMorePages) {
                const response = await listingService.filterListings({
                    ...filters,
                    listingType: selectedCategory || filters.listingType,
                    page: currentPage,
                    size: 100
                });
                
                if (response.content && response.content.length > 0) {
                    allListingsData.push(...response.content);
                    currentPage++;
                    
                    if (response.content.length < 100 || currentPage >= response.totalPages) {
                        hasMorePages = false;
                    }
                } else {
                    hasMorePages = false;
                }
            }
            
            setAllListings(allListingsData);
            setAllPagesLoaded(true);
        } catch (error) {
            console.error('Error loading all pages:', error);
        } finally {
            setLoadingAllPages(false);
        }
    }, [filters, selectedCategory]);

    return {
        titleSearchTerm,
        setTitleSearchTerm,
        filteredListings,
        allPagesLoaded,
        loadingAllPages,
        loadAllPages,
        clearSearch
    };
};
