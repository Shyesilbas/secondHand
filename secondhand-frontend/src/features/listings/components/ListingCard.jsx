import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

const ListingCard = ({ listing }) => {
    const formatPrice = (price, currency) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency === 'TRY' ? 'TRY' : 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getListingTypeIcon = (type) => {
        switch (type) {
            case 'VEHICLE':
                return (
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 21l4-4 4-4-4-4-4-4" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 17l-4-4 4-4" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                    </svg>
                );
        }
    };

    const getVehicleDetails = (listing) => {
        if (listing.type === 'VEHICLE') {
            const details = [
                { label: listing.brand, icon: '🚗' },
                { label: listing.year, icon: '📅' },
                { label: listing.mileage ? `${listing.mileage.toLocaleString('tr-TR')} km` : null, icon: '🛣️' },
                { label: listing.fuelType, icon: '⛽' }
            ].filter(detail => detail.label);

            return (
                <div className="mt-4 space-y-2">
                    {details.map((detail, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="text-xs opacity-60">{detail.icon}</span>
                            <span>{detail.label}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'ACTIVE': { 
                label: 'Aktif',
                dot: 'bg-emerald-500'
            },
            'SOLD': { 
                label: 'Satıldı',
                dot: 'bg-red-500'
            },
            'DRAFT': { 
                label: 'Taslak',
                dot: 'bg-slate-400'
            },
            'PENDING': { 
                label: 'Beklemede',
                dot: 'bg-amber-500'
            }
        };

        const config = statusConfig[status] || statusConfig['DRAFT'];
        
        return (
            <div className="inline-flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
                <span className="text-xs font-medium text-slate-600">{config.label}</span>
            </div>
        );
    };

    return (
        <div className="group bg-white rounded-xl shadow-sm border border-slate-200/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
            {/* Card Content */}
            <div className="p-6">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {getListingTypeIcon(listing.type)}
                        <div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                {listing.type === 'VEHICLE' ? 'Araç' : 'Ürün'}
                            </span>
                            <div className="mt-1">
                                {getStatusBadge(listing.status)}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">
                            {formatPrice(listing.price, listing.currency)}
                        </div>
                    </div>
                </div>

                {/* Title Section */}
                <Link
                    to={ROUTES.LISTING_DETAIL.replace(':id', listing.id)}
                    className="block"
                >
                    <h3 className="text-lg font-semibold text-slate-800 hover:text-slate-600 transition-colors line-clamp-2 leading-relaxed mb-2">
                        {listing.title}
                    </h3>
                </Link>

                {/* Description */}
                <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                    {listing.description}
                </p>

                {/* Vehicle Details */}
                {getVehicleDetails(listing)}

                {/* Metadata Section */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>
                                {listing.district && listing.city
                                    ? `${listing.district}, ${listing.city}`
                                    : listing.city || 'Konum belirtilmemiş'
                                }
                            </span>
                        </div>
                        <span className="text-xs text-slate-400">
                            {formatDate(listing.createdAt)}
                        </span>
                    </div>
                </div>

                {/* Seller Section */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {listing.sellerName?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-800">
                                    {listing.sellerName} {listing.sellerSurname}
                                </p>
                                <p className="text-xs text-slate-500">Satıcı</p>
                            </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingCard;