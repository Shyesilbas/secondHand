import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { useEnums } from '../../../hooks/useEnums';
import { LISTING_TYPE_ICONS } from '../../../utils/constants';
import StatusBadge from '../../../components/ui/StatusBadge';
import FavoriteButton from '../../favorites/components/FavoriteButton';
import FavoriteStats from '../../favorites/components/FavoriteStats';
import { useAuth } from '../../../context/AuthContext';
import { listingService } from '../services/listingService';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { useNotification } from '../../../context/NotificationContext';
import ListingCardActions from './ListingCardActions';

const ListingCard = ({ listing, onDeleted }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const notification = useNotification();
    const { getListingTypeLabel, getListingTypeIcon } = useEnums();
    const formatPrice = (price, currency) => formatCurrency(price, currency);
    const formatDate = (dateString) => formatDateTime(dateString);

    const getTypeIcon = (type) => {
        const icon = LISTING_TYPE_ICONS[type] || getListingTypeIcon(type) || '📦';
        return (
            <span className="text-lg">{icon}</span>
        );
    };



    const getStatusBadge = (status) => (
        <StatusBadge
            status={status}
            labels={{ ACTIVE: 'Aktif', INACTIVE: 'Pasif', SOLD: 'Satıldı', DRAFT: 'Taslak', PENDING: 'Beklemede' }}
        />
    );

    return (
        <div className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-300 overflow-hidden">
            <Link
                to={ROUTES.LISTING_DETAIL.replace(':id', listing.id)}
                className="block"
            >
                <div className="flex">
                    {/* Left Side - Image Placeholder */}
                    <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                        <div className="text-center">
                            <div className="text-3xl mb-1">
                                {getTypeIcon(listing.type)}
                            </div>
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                                {getListingTypeLabel(listing.type)}
                            </span>
                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="flex-1 p-4">
                        {/* Top Section */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    {getStatusBadge(listing.status)}
                                    <span className="text-xs text-slate-400">
                                        {formatDate(listing.createdAt)}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-1 mb-1">
                                    {listing.title}
                                </h3>
                                <p className="text-slate-600 text-sm line-clamp-1">
                                    {listing.description}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-4">
                                <div className="text-xl font-bold text-slate-900">
                                    {formatPrice(listing.price, listing.currency)}
                                </div>
                                <FavoriteButton 
                                    listingId={listing.id}
                                    listing={listing}
                                    size="sm"
                                    showCount={true}
                                />
                                <ListingCardActions listing={listing} onChanged={onDeleted} />
                            </div>
                        </div>

                        {/* Vehicle Details - Compact */}
                        {listing.type === 'VEHICLE' && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {[
                                    { label: listing.brand, icon: '🚗' },
                                    { label: listing.year, icon: '📅' },
                                    { label: listing.mileage ? `${listing.mileage.toLocaleString('tr-TR')} km` : null, icon: '🛣️' },
                                    { label: listing.fuelType, icon: '⛽' }
                                ].filter(detail => detail.label).slice(0, 3).map((detail, index) => (
                                    <span key={index} className="inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded text-xs text-slate-700">
                                        <span className="opacity-70">{detail.icon}</span>
                                        {detail.label}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Bottom Section */}
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>
                                        {listing.city || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-4 bg-slate-400 rounded-full flex items-center justify-center">
                                        <span className="text-white text-[10px] font-medium">
                                            {listing.sellerName?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <span>
                                        {listing.sellerName} {listing.sellerSurname}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <FavoriteStats 
                                        listingId={listing.id}
                                        size="xs"
                                        showIcon={false}
                                        showText={true}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>#{listing.listingNo}</span>
                                <div className={`w-2 h-2 rounded-full ${listing.isListingFeePaid ? 'bg-slate-500' : 'bg-slate-300'}`}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ListingCard;