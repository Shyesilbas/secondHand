import React from 'react';

const ListingStats = ({ listings, selectedStatus, onStatusClick }) => {
    if (!listings || listings.length === 0) return null;

    const stats = [
        {
            label: 'Active',
            count: listings.filter(l => l.status === 'ACTIVE').length,
            color: 'text-green-600'
        },
        {
            label: 'Draft',
            count: listings.filter(l => l.status === 'DRAFT').length,
            color: 'text-yellow-600'
        },
        {
            label: 'Inactive',
            count: listings.filter(l => l.status === 'INACTIVE').length,
            color: 'text-orange-600'
        },
        {
            label: 'Sold',
            count: listings.filter(l => l.status === 'SOLD').length,
            color: 'text-red-600'
        }
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {stats.map((stat, index) => {
                const isSelected = selectedStatus === stat.label.toUpperCase();
                const isClickable = stat.count > 0;

                return (
                    <div
                        key={index}
                        className={`px-3 py-2 rounded-md shadow-sm border transition-all duration-200 ${
                            isClickable ? 'cursor-pointer hover:shadow-md' : ''
                        } ${
                            isSelected
                                ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
                                : 'bg-white hover:bg-gray-50'
                        }`}
                        onClick={isClickable ? () => onStatusClick(stat.label.toUpperCase()) : undefined}
                    >
                        <div className="flex items-center justify-between">
                            <span className={`text-xs ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>
                                {stat.label}
                            </span>
                            <span className={`text-sm font-semibold ${isSelected ? 'text-blue-700' : stat.color}`}>
                                {stat.count}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ListingStats;
