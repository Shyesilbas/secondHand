import React from 'react';
import { ComplaintReason } from '../types/complaintTypes.js';

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

    return (
        <div className="bg-white rounded-lg border border-sidebar-border p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-2 text-sm">
                <div>
                    <strong>Complaint ID:</strong> {complaint.complaintId}
                </div>
                <div>
                    <strong>Complainer ID:</strong> {complaint.complainerId}
                </div>
                <div>
                    <strong>Complained User ID:</strong> {complaint.complainedUserId}
                </div>
                <div>
                    <strong>Listing ID:</strong> {complaint.listingId || 'N/A'}
                </div>
                <div>
                    <strong>Reason:</strong> {getReasonLabel(complaint.reason)}
                </div>
                <div>
                    <strong>Description:</strong> {complaint.description || 'No description'}
                </div>
                <div>
                    <strong>Created At:</strong> {complaint.createdAt || '-'}
                </div>
                <div>
                    <strong>Updated At:</strong> {complaint.updatedAt || '-'}
                </div>
                <div>
                    <strong>Resolved At:</strong> {complaint.resolvedAt || '-'}
                </div>
            </div>
        </div>
    );
};

export default ComplaintCard;
