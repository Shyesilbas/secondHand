import React from 'react';
import { useShowcase } from '../hooks/useShowcase.js';
import { formatDateTime } from '../../common/formatters.js';

const MyShowcasesPage = () => {
    const { showcases, loading, error, extendShowcase, cancelShowcase } = useShowcase();

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-text-primary mb-8">My Showcases</h1>
            
            {showcases.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-text-secondary text-lg">You don't have any active showcases yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {showcases.map((showcase) => (
                        <div key={showcase.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="relative">
                                <img
                                    src={showcase.listing.images[0]?.url || '/placeholder-image.jpg'}
                                    alt={showcase.listing.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-emerald-600 text-white px-2 py-1 rounded-full text-sm font-medium">
                                    {showcase.status}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
                                    {showcase.listing.title}
                                </h3>
                                <div className="space-y-2 text-sm text-text-secondary">
                                    <div className="flex justify-between">
                                        <span>Start Date:</span>
                                        <span>{formatDateTime(showcase.startDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>End Date:</span>
                                        <span>{formatDateTime(showcase.endDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Cost:</span>
                                        <span className="font-semibold text-emerald-600">
                                            {showcase.totalCost} units
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() => extendShowcase(showcase.id, 7)}
                                        className="flex-1 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                                    >
                                        Extend 7 Days
                                    </button>
                                    <button
                                        onClick={() => cancelShowcase(showcase.id)}
                                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyShowcasesPage;
