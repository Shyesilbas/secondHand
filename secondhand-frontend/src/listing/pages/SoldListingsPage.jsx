import React from 'react';
import { useMyListings } from '../hooks/useMyListings.js';
import  ListingGrid  from '../components/ListingGrid.jsx';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';

const InactiveListingsPage = () => {
    const { listings, isLoading, error, refetch } = useMyListings('SOLD');

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Sold Listings
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Listings you have Sold
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={refetch}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        title="Refresh"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                    <Link
                        to={ROUTES.MY_LISTINGS}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <span>Back to My Listings</span>
                    </Link>
                </div>
            </div>

            <ListingGrid
                listings={listings}
                isLoading={isLoading}
                error={error}
                onDeleted={() => refetch()}
            />
        </div>
    );
};

export default InactiveListingsPage;


