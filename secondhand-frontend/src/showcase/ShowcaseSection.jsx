import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../common/constants/routes.js';
import { listingService } from '../listing/services/listingService.js';

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
        // Fetch sequentially to keep it simple and avoid rate issues
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
        <div className="max-w-7xl mx-auto px-6">
            {/* Header Section */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent">
                        Featured Listings
                    </h2>
                </div>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                    Discover our handpicked selection of premium second-hand items
                </p>
                <Link 
                    to={ROUTES.LISTINGS} 
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    View All Listings
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            {/* Showcase Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Header with badges */}
                            <div className="relative p-6 pb-4">
                                {/* Featured Badge */}
                                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    Featured
                                </div>

                                {/* Location Badge */}
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    {city}{district ? `, ${district}` : ''}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-6 pb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                    {title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                    {description}
                                </p>

                                {/* Price and Time Info */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold text-emerald-600">
                                            {price} {currency}
                                        </span>
                                        {daysLeft !== null && (
                                            <span className="text-xs text-gray-500">
                                                {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                                            </span>
                                        )}
                                    </div>
                                    {endDate && (
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 mb-1">Ends</div>
                                            <div className="text-sm font-medium text-gray-700">
                                                {endDate.toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Button */}
                                <Link
                                    to={listingId ? ROUTES.LISTING_DETAIL(listingId) : ROUTES.LISTINGS}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 text-center block shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                >
                                    View Details
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
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
