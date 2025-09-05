
export const ComplaintReason = {
    INAPPROPRIATE_CONTENT: 'INAPPROPRIATE_CONTENT',
    HARASSMENT: 'HARASSMENT',
    SCAM_FRAUD: 'SCAM_FRAUD',
    FALSE_ADVERTISING: 'FALSE_ADVERTISING',
    COPYRIGHT_VIOLATION: 'COPYRIGHT_VIOLATION',
    SPAM: 'SPAM',
    OTHER: 'OTHER'
};

export const COMPLAINT_REASONS = [
    { value: ComplaintReason.INAPPROPRIATE_CONTENT, label: 'Inappropriate Content' },
    { value: ComplaintReason.HARASSMENT, label: 'Harassment/Abuse' },
    { value: ComplaintReason.SCAM_FRAUD, label: 'Scam/Fraudulent Listing' },
    { value: ComplaintReason.FALSE_ADVERTISING, label: 'False Advertising' },
    { value: ComplaintReason.COPYRIGHT_VIOLATION, label: 'Copyright Violation' },
    { value: ComplaintReason.SPAM, label: 'Spam' },
    { value: ComplaintReason.OTHER, label: 'Other' }
];


export const isValidComplaintDto = (data) => {
    return (
        data &&
        typeof data === 'object' &&
        typeof data.complaintId === 'string' &&
        typeof data.complainerId === 'string' &&
        typeof data.complainedUserId === 'string' &&
        typeof data.reason === 'string' &&
        typeof data.description === 'string'
    );
};

export const createComplaintRequest = ({ complainerId, complainedUserId, listingId, reason, description }) => ({
    complainerId,
    complainedUserId,
    listingId,
    reason,
    description: description.trim()
});

export class ComplaintDto {
    constructor({ complaintId, complainerId, complainedUserId, listingId, reason, description, createdAt, updatedAt, resolvedAt }) {
        this.complaintId = complaintId;
        this.complainerId = complainerId;
        this.complainedUserId = complainedUserId;
        this.listingId = listingId;
        this.reason = reason;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.resolvedAt = resolvedAt;
    }
}
