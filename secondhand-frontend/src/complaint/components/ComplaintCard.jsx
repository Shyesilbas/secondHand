import React from 'react';
import { ComplaintReason } from '../types/complaintTypes.js';
import { formatDate as formatDateCommon } from '../../common/formatters.js';

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
    const getStatusColor = (resolvedAt) => resolvedAt ? 'bg-emerald-50/70 text-emerald-700 border-emerald-200/80' : 'bg-amber-50/70 text-amber-700 border-amber-200/80';
    const getStatusText = (resolvedAt) => resolvedAt ? 'Resolved' : 'Under Review';
    const getStripeColor = (resolvedAt) => resolvedAt ? 'bg-emerald-500' : 'bg-amber-500';

    const formatDate = (dateString) => {
        const formatted = formatDateCommon(dateString);
        return formatted || 'N/A';
    };

    return (
        <div className="relative flex h-full rounded-3xl border border-slate-200/70 bg-white/90 shadow-sm overflow-hidden">
            <div className={`absolute inset-y-0 left-0 w-1 ${getStripeColor(complaint.resolvedAt)}`} />
            <div className="px-6 pt-5 pb-5 flex-1">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                            <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold tracking-tight text-slate-900">Complaint</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">{formatDate(complaint.createdAt)}</p>
                        </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusColor(complaint.resolvedAt)}`}>
                        {getStatusText(complaint.resolvedAt)}
                    </span>
                </div>

                <div className="mt-4">
                    <span className="inline-flex items-center rounded-xl bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                        {getReasonLabel(complaint.reason)}
                    </span>
                </div>

                {complaint.description && (
                    <div className="mt-4">
                        <div className="text-sm leading-relaxed text-slate-800">
                            {complaint.description}
                        </div>
                    </div>
                )}

                <div className="mt-5 grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500">Complained User</span>
                        <span className="max-w-[60%] truncate text-right font-medium text-slate-900">
                            {complaint.complainedUserFullName || `${complaint.complainedUserName || ''} ${complaint.complainedUserSurname || ''}`.trim() || complaint.complainedUserId}
                        </span>
                    </div>
                    {complaint.listingTitle && (
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500">Listing</span>
                            <span className="max-w-[60%] truncate text-right font-medium text-slate-900">{complaint.listingTitle}</span>
                        </div>
                    )}
                    {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && (
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500">Last Updated</span>
                            <span className="font-medium text-slate-900">{formatDate(complaint.updatedAt)}</span>
                        </div>
                    )}
                    {complaint.resolvedAt && (
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500">Resolved</span>
                            <span className="font-medium text-slate-900">{formatDate(complaint.resolvedAt)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComplaintCard;
