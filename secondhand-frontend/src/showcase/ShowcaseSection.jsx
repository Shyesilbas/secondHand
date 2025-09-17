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
        <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-text-primary">Featured Listings</h2>
                </div>
                <Link to={ROUTES.LISTINGS} className="text-emerald-700 hover:text-emerald-800 font-medium">
                    See all →
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {showcases.map((showcase) => {
                    const listing = showcase?.listing || listingMap[showcase?.listingId] || showcase || {};
                    const city = listing.city || '-';
                    const district = listing.district || '-';
                    const title = listing.title || (loadingIds.includes(showcase?.listingId) ? 'Loading…' : 'Untitled Listing');
                    const description = listing.description || '';
                    const price = typeof listing.price !== 'undefined' ? listing.price : '';
                    const currency = listing.currency || '';
                    const listingId = listing.id || showcase?.listingId;
                    const endDate = showcase?.endDate ? new Date(showcase.endDate).toLocaleDateString() : '';

                    return (
                        <div key={showcase.id || listingId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-emerald-100">
                            <div className="relative">
                                <div className="absolute top-2 right-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                                    ⭐ Featured
                                </div>
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-1.5 py-0.5 rounded text-xs">
                                    {city}{district ? `, ${district}` : ''}
                                </div>
                            </div>
                            <div className="p-3">
                                <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
                                    {title}
                                </h3>
                                <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                                    {description}
                                </p>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-lg font-bold text-emerald-600">
                                        {price} {currency}
                                    </span>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">Until</div>
                                        <div className="text-xs font-medium text-gray-700">
                                            {endDate}
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    to={listingId ? ROUTES.LISTING_DETAIL(listingId) : ROUTES.LISTINGS}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-3 py-1.5 rounded-md hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 text-center block font-medium text-sm"
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
