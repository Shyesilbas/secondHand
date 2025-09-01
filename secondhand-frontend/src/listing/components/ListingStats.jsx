import React from 'react';

const ListingStats = ({ listings }) => {
    if (!listings || listings.length === 0) return null;

    const stats = [
        {
            label: 'Total',
            count: listings.length,
            color: 'text-blue-600'
        },
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white px-3 py-2 rounded-md shadow-sm border">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{stat.label}</span>
                        <span className={`text-sm font-semibold ${stat.color}`}>{stat.count}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ListingStats;
