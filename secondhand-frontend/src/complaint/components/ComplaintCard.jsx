import React from 'react';
import {ComplaintReason} from '../types/complaintTypes.js';

const COMPLAINT_REASONS = {
    [ComplaintReason.INAPPROPRIATE_CONTENT]: 'Inappropriate Content',
    [ComplaintReason.HARASSMENT]: 'Harassment',
    [ComplaintReason.SCAM_FRAUD]: 'Scam/Fraud Listing',
    [ComplaintReason.FALSE_ADVERTISING]: 'False Advertising',
    [ComplaintReason.COPYRIGHT_VIOLATION]: 'Copyright Violation',
    [ComplaintReason.SPAM]: 'Spam',
    [ComplaintReason.OTHER]: 'Other'
};

const ComplaintCard = ({ complaint }) => {
    if (!complaint) return null;

    const getReasonLabel = (reason) => COMPLAINT_REASONS[reason] || reason || 'UNKNOWN REASON';
    const getStatusColor = (resolvedAt) => resolvedAt ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200';
    const getStatusText = (resolvedAt) => resolvedAt ? 'Resolved' : 'Under Review';

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-5">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">Complaint #{complaint.complaintId}</h3>
                            </div>
                            <p className="text-sm text-gray-500">{formatDate(complaint.createdAt)}</p>
                        </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(complaint.resolvedAt)}`}>
                        {getStatusText(complaint.resolvedAt)}
                    </span>
                </div>

                <div className="mt-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700">
                        {getReasonLabel(complaint.reason)}
                    </span>
                </div>

                {complaint.description && (
                    <div className="mt-4">
                        <div className="text-sm text-gray-700 leading-relaxed">
                            {complaint.description}
                        </div>
                    </div>
                )}

                <div className="mt-5 grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Complained User</span>
                        <span className="font-medium text-gray-900 truncate max-w-[60%] text-right">{complaint.complainedUserId}</span>
                    </div>
                    {complaint.listingTitle && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">Listing</span>
                            <span className="font-medium text-gray-900 truncate max-w-[60%] text-right">{complaint.listingTitle}</span>
                        </div>
                    )}
                    {complaint.listingId && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400">Listing ID</span>
                            <span className="text-gray-500 truncate max-w-[60%] text-right">{complaint.listingId}</span>
                        </div>
                    )}
                    {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">Last Updated</span>
                            <span className="font-medium text-gray-900">{formatDate(complaint.updatedAt)}</span>
                        </div>
                    )}
                    {complaint.resolvedAt && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">Resolved</span>
                            <span className="font-medium text-gray-900">{formatDate(complaint.resolvedAt)}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="px-6 pb-5 mt-5 border-t border-gray-100">
                <div className="text-xs text-gray-500">This complaint is being processed according to platform policies.</div>
            </div>
        </div>
    );
};

export default ComplaintCard;
