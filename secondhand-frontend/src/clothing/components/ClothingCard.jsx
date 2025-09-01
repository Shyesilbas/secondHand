import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import StatusBadge from '../../common/components/ui/StatusBadge.jsx';
import FavoriteButton from '../../favorites/components/FavoriteButton.jsx';
import FavoriteStats from '../../favorites/components/FavoriteStats.jsx';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import ListingCardActions from '../../listings/components/ListingCardActions';

const ClothingCard = ({ clothing, onDeleted }) => {
    const { getListingTypeLabel, getListingTypeIcon } = useEnums();
    const formatPrice = (price, currency) => formatCurrency(price, currency);
    const formatDate = (dateString) => formatDateTime(dateString);

    const getStatusBadge = (status) => (
        <StatusBadge
            status={status}
            labels={{ ACTIVE: 'Active', INACTIVE: 'Inactive', SOLD: 'Sold', DRAFT: 'Draft', PENDING: 'Pending' }}
        />
    );

    return (
        <div className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-300 overflow-hidden">
            <Link
                to={ROUTES.CLOTHING_DETAIL.replace(':id', clothing.id)}
                className="block"
            >
                <div className="flex">
                    {/* Left Side - Image Placeholder */}
                    <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                        <div className="text-center">
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                                {getListingTypeLabel(clothing.type)}
                            </span>
                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="flex-1 p-4">
                        {/* Top Section */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    {getStatusBadge(clothing.status)}
                                    <span className="text-xs text-slate-400">
                                        {formatDate(clothing.createdAt)}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-1 mb-1">
                                    {clothing.title}
                                </h3>
                                <p className="text-slate-600 text-sm line-clamp-1">
                                    {clothing.description}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-4">
                                <div className="text-xl font-bold text-slate-900">
                                    {formatPrice(clothing.price, clothing.currency)}
                                </div>
                                <FavoriteButton 
                                    listingId={clothing.id}
                                    listing={clothing}
                                    size="sm"
                                    showCount={true}
                                />
                                <ListingCardActions listing={clothing} onChanged={onDeleted} />
                            </div>
                        </div>

                        {/* Clothing Details - Compact */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {[
                                { label: clothing.brand, icon: '🏷️' },
                                { label: clothing.clothingType, icon: '👕' },
                                { label: clothing.color, icon: '🎨' },
                                { label: clothing.condition, icon: '⭐' },
                                { label: clothing.purchaseDate ? formatDate(clothing.purchaseDate) : null, icon: '📅' }
                            ].filter(detail => detail.label).slice(0, 3).map((detail, index) => (
                                <span key={index} className="inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded text-xs text-slate-700">
                                    <span className="opacity-70">{detail.icon}</span>
                                    {detail.label}
                                </span>
                            ))}
                        </div>

                        {/* Bottom Section */}
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-4 bg-slate-400 rounded-full flex items-center justify-center">
                                        <span className="text-white text-[10px] font-medium">
                                            {clothing.sellerName?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <span>
                                        {clothing.sellerName} {clothing.sellerSurname}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <FavoriteStats 
                                        listingId={clothing.id}
                                        size="xs"
                                        showIcon={false}
                                        showText={true}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>#{clothing.listingNo}</span>
                                <div className={`w-2 h-2 rounded-full ${clothing.isListingFeePaid ? 'bg-slate-500' : 'bg-slate-300'}`}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ClothingCard;
