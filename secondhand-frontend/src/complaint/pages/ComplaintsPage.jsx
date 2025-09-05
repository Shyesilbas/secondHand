import React, { useEffect } from 'react';
import { useComplaints } from '../hooks/useComplaints.js';
import ComplaintCard from '../components/ComplaintCard.jsx';

const ComplaintsPage = () => {
    const { complaints, isLoading, error, getUserComplaints } = useComplaints();

    useEffect(() => {
        getUserComplaints();
    }, [getUserComplaints]);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-64"></div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="animate-pulse">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    <div className="h-4 bg-gray-200 rounded w-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                </div>
                                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load complaints</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Complaints</h1>
                <p className="text-gray-600">Manage the complaints you have submitted here.</p>
            </div>

            {complaints && complaints.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {complaints.map((complaint, index) => (
                        <ComplaintCard
                            key={complaint?.complaintId || complaint?.id || `complaint-${index}`}
                            complaint={complaint}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No complaints submitted yet</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                        You can submit a complaint if you encounter inappropriate behavior.
                        All complaints will be reviewed and you will receive feedback.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ComplaintsPage;
