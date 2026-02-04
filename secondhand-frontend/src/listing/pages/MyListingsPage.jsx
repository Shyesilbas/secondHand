import React, {useMemo} from 'react';
import {Link} from 'react-router-dom';
import {ROUTES} from '../../common/constants/routes.js';
import {useEnums} from '../../common/hooks/useEnums.js';
import {useListingEngine} from '../hooks/useListingEngine.js';
import ListingsModuleLayout from '../components/ListingsModuleLayout.jsx';
import {AlertTriangle, ChevronDown, ChevronUp, Plus} from 'lucide-react';

const MyListingsPage = () => {
    const { getListingTypeLabel } = useEnums();
    const engine = useListingEngine({
        initialListingType: null,
        mode: 'mine'
    });

    const lowStock = engine.alerts?.lowStock;

    const extraActions = (
        <Link
            to={ROUTES.LISTINGS.NEW}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                 hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm
                 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
            <Plus className="w-4 h-4" />
            New Listing
        </Link>
    );

    const topSlot = useMemo(() => {
        if (!lowStock || lowStock.count <= 0) return null;

        const stockText = `${lowStock.count} listing${lowStock.count === 1 ? '' : 's'}`;

        // Collapsed state
        if (!lowStock.isOpen) {
            return (
                <div
                    className="bg-amber-50 border border-amber-200 rounded-lg p-4 cursor-pointer
                     hover:bg-amber-100 transition-colors duration-200 mb-6"
                    onClick={() => engine.toggleAlert('lowStock')}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-amber-900">Low Stock Alert</h3>
                                <p className="text-sm text-amber-700">
                                    {stockText} {lowStock.count === 1 ? 'has' : 'have'} less than 10 items in stock.
                                </p>
                            </div>
                        </div>
                        <ChevronDown className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    </div>
                </div>
            );
        }

        // Expanded state
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-6">
                <div
                    className="flex items-center justify-between cursor-pointer mb-4"
                    onClick={() => engine.toggleAlert('lowStock')}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-amber-900">Stock Running Low</h3>
                            <p className="text-sm text-amber-700">
                                {stockText} {lowStock.count === 1 ? 'has' : 'have'} less than 10 items in stock.
                            </p>
                        </div>
                    </div>
                    <ChevronUp className="w-5 h-5 text-amber-600 flex-shrink-0" />
                </div>

                <div className="space-y-2 mt-3">
                    {lowStock.listings.slice(0, 6).map((listing) => (
                        <div
                            key={listing.id}
                            className="bg-white border border-amber-100 rounded-lg p-3
                         hover:border-amber-300 hover:shadow-sm transition-all duration-200"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600
                                rounded-lg flex items-center justify-center text-white font-semibold
                                text-sm shadow-sm">
                                    {listing.title?.charAt(0)?.toUpperCase() || 'L'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">
                                        {listing.title}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        {listing.listingNo}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 px-3 py-1 bg-amber-100 rounded-full">
                  <span className="text-sm font-medium text-amber-800">
                    Stock: {Number(listing.quantity)}
                  </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {lowStock.count > 6 && (
                        <div className="text-center py-2 text-sm text-amber-700 font-medium">
                            And {lowStock.count - 6} more listing{lowStock.count - 6 === 1 ? '' : 's'} with low stock.
                        </div>
                    )}
                </div>
            </div>
        );
    }, [lowStock, engine]);

    return (
        <ListingsModuleLayout
            mode="mine"
            title="My Listings"
            getListingTypeLabel={getListingTypeLabel}
            engine={engine}
            extraActions={extraActions}
            topSlot={topSlot}
            disableSticky={true}
        />
    );
};

export default MyListingsPage;