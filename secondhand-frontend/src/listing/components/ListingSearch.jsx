import React, { useState } from 'react';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { listingService } from '../services/listingService';

const ListingSearch = ({ onSearchResult, onClearSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const notification = useNotification();

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchQuery.trim()) {
            notification.showError('Error', 'Please enter a listing number');
            return;
        }

        setIsSearching(true);
        try {
            const result = await listingService.getListingByNo(searchQuery.trim());
            onSearchResult(result);
            notification.showSuccess('Success', 'Listing found!');
        } catch (error) {
            console.error('Search error:', error);
            if (error.response?.status === 404) {
                notification.showError('Not Found', 'No listing found with this number');
            } else {
                notification.showError('Error', 'Search failed. Please try again.');
            }
            onSearchResult(null);
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        onClearSearch();
    };

    return (
        <div className="mt-6">
            <form onSubmit={handleSearch} className="flex gap-4 max-w-md">
                <div className="flex-1">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                        placeholder="Enter listing number (e.g., ABC123DE)"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                        maxLength={8}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSearching}
                    className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSearching ? 'Searching...' : 'Search'}
                </button>
                {onClearSearch && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="px-4 py-2 bg-app-bg0 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Clear
                    </button>
                )}
            </form>
        </div>
    );
};

export default ListingSearch;
