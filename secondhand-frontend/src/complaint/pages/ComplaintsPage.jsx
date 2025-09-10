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
            <div className="container mx-auto px-6 py-10">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                                <div className="space-y-3">
                                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-6 py-16">
                <div className="max-w-md mx-auto text-center bg-red-50 border border-red-200 rounded-xl p-10 shadow-sm">
                    <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to load complaints</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium shadow transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-10">
            {/* Header */}
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-3">My Complaints</h1>
                <p className="text-gray-600 text-lg">Track and manage the complaints you have submitted.</p>
            </div>

            {/* Complaints List */}
            {complaints && complaints.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {complaints.map((complaint, index) => (
                        <div
                            key={complaint?.complaintId || complaint?.id || `complaint-${index}`}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-200"
                        >
                            <ComplaintCard complaint={complaint} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">No complaints submitted yet</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                        If you encounter inappropriate behavior, you can submit a complaint.
                        Our team will review it and provide feedback.
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow transition">
                        Submit Complaint
                    </button>
                </div>
            )}
        </div>
    );
};

export default ComplaintsPage;
