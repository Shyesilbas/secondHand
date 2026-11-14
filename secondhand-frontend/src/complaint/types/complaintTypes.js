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

export const isValidComplaintDto = (data) => (
  data &&
  typeof data === 'object' &&
  typeof data.complaintId === 'string' &&
  typeof data.reason === 'string'
);

/** Request body of POST /v1/complaints; mirrors the backend ComplaintRequest record. */
export const createComplaintRequest = ({
  complainedUserId,
  listingId,
  chatRoomId,
  reportedMessageId,
  reason,
  description,
  evidenceImageUrls,
}) => ({
  complainedUserId,
  listingId: listingId || null,
  chatRoomId: chatRoomId || null,
  reportedMessageId: reportedMessageId || null,
  reason,
  description: description?.trim() || null,
  evidenceImageUrls: evidenceImageUrls?.length ? evidenceImageUrls : [],
});

export class ComplaintDto {
  constructor(data = {}) {
    this.complaintId = data.complaintId;
    this.complainerName = data.complainerId;
    this.complainedUserName = data.complainedUserId;
    this.listingId = data.listingId;
    this.listingTitle = data.listingTitle;
    this.reason = data.reason;
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.resolvedAt = data.resolvedAt;
    this.status = data.status;
    this.adminNotes = data.adminNotes;
    this.eligibleForReviewAt = data.eligibleForReviewAt;
    this.chatRoomId = data.chatRoomId;
    this.reportedMessageId = data.reportedMessageId;
    this.reportedMessageContent = data.reportedMessageContent ?? null;
    this.evidenceImageUrls = Array.isArray(data.evidenceImageUrls) ? data.evidenceImageUrls : [];
    this.violationCategory = data.violationCategory;
    this.penaltyAction = data.penaltyAction;
    this.aiConfidenceScore = data.aiConfidenceScore;
    this.aiReviewedAt = data.aiReviewedAt;
    this.appealStatus = data.appealStatus || 'NONE';
    this.appealReason = data.appealReason;
    this.appealSubmittedAt = data.appealSubmittedAt;
    this.appealReviewedAt = data.appealReviewedAt;
    this.appealDecisionNotes = data.appealDecisionNotes;
    this.appealDeadline = data.appealDeadline;
    this.badFaithReport = Boolean(data.badFaithReport);
    this.complainerPenaltyAction = data.complainerPenaltyAction;
  }
}
