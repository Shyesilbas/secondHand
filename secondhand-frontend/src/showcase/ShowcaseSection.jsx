import React from 'react';
import {Link} from 'react-router-dom';
import {ROUTES} from '../common/constants/routes.js';
import {listingService} from '../listing/services/listingService.js';
import {formatCurrency} from '../common/formatters.js';

const ShowcaseSection = ({ showcases }) => {
    const [listingMap, setListingMap] = React.useState({});
    const [loadingIds, setLoadingIds] = React.useState([]);

    React.useEffect(() => {
        if (!Array.isArray(showcases)) return;
        const missingIds = Array.from(new Set(
            showcases
                .map(s => (!s?.listing && s?.listingId) ? s.listingId : null)
                .filter(Boolean)
                .filter(id => !listingMap[id])
        ));
        if (missingIds.length === 0) return;
        setLoadingIds(prev => Array.from(new Set([...prev, ...missingIds])));
                (async () => {
            const updates = {};
            for (const id of missingIds) {
                try {
                    const data = await listingService.getListingById(id);
                    updates[id] = data;
                } catch {
                    updates[id] = null;
                }
            }
            setListingMap(prev => ({ ...prev, ...updates }));
            setLoadingIds(prev => prev.filter(id => !missingIds.includes(id)));
        })();
    }, [showcases, listingMap]);

    if (!showcases || showcases.length === 0) {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900">
                        Featured Listings
                    </h2>
                </div>
                
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Discover our handpicked selection of premium second-hand items
                </p>
                
                <Link 
                    to={ROUTES.LISTINGS} 
                    className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    View All Listings
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            {/* Showcase Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {showcases.map((showcase, index) => {
                    const listing = showcase?.listing || listingMap[showcase?.listingId] || showcase || {};
                    const city = listing.city || '-';
                    const district = listing.district || '-';
                    const title = listing.title || (loadingIds.includes(showcase?.listingId) ? 'Loading…' : 'Untitled Listing');
                    const description = listing.description || '';
                    const price = typeof listing.price !== 'undefined' ? listing.price : '';
                    const currency = listing.currency || '';
                    const listingId = listing.id || showcase?.listingId;
                    const endDate = showcase?.endDate ? new Date(showcase.endDate) : null;
                    const daysLeft = endDate ? Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

                    return (
                        <div 
                            key={showcase.id || listingId} 
                            className="bg-white border border-gray-200 rounded overflow-hidden hover:border-gray-300 transition-colors"
                        >
                            {/* Card Header */}
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        Featured
                                    </span>
                                    {daysLeft !== null && daysLeft > 0 && (
                                        <span className="text-xs text-gray-500">
                                            {daysLeft} days left
                                        </span>
                                    )}
                                </div>
                                
                                {/* Location */}
                                <div className="flex items-center gap-1 mb-2">
                                    <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-xs text-gray-600">
                                        {city}{district ? `, ${district}` : ''}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-base font-medium text-gray-900 mb-2 line-clamp-2">
                                    {title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                    {description}
                                </p>
                            </div>

                            {/* Card Footer */}
                            <div className="p-4">
                                {/* Price */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-lg font-semibold text-gray-900">
                                        {formatCurrency(price, currency)}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                        <span className="text-xs text-gray-500">Active</span>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <Link
                                    to={listingId ? ROUTES.LISTING_DETAIL(listingId) : ROUTES.LISTINGS}
                                    className="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium text-center block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ShowcaseSection;
