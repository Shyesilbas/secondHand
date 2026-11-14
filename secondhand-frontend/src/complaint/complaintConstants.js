export const COMPLAINT_DEFAULTS = Object.freeze({
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_APPEAL_LENGTH: 1000,
  MIN_APPEAL_LENGTH: 10,
  // Mirrors app.moderation.max-evidence-images on the backend.
  MAX_EVIDENCE_IMAGES: 3,
  MAX_EVIDENCE_FILE_BYTES: 10 * 1024 * 1024,
  STALE_TIME_MS: 5 * 60 * 1000,
  GC_TIME_MS: 15 * 60 * 1000,
  RESTRICTION_STALE_TIME_MS: 60 * 1000,
});

export const COMPLAINT_KEYS = Object.freeze({
  all: ['complaints'],
  my: () => ['complaints', 'my'],
  received: () => ['complaints', 'received'],
  restriction: () => ['complaints', 'restriction'],
});

export const COMPLAINT_TABS = Object.freeze({
  FILED: 'filed',
  RECEIVED: 'received',
});

export const COMPLAINT_MESSAGES = Object.freeze({
  SUBMITTED_TITLE: 'Complaint Submitted',
  SUBMITTED_SUCCESS:
    'Your complaint has been submitted successfully. You can Follow your complaints from Profile -> Quick Actions -> Support & Complaints',
  SUBMIT_FAILED_TITLE: 'Complaint Failed',
  SUBMIT_FAILED_FALLBACK: 'Failed to submit complaint.',
  REASON_REQUIRED: 'You must select a reason',
  DESCRIPTION_REQUIRED: 'Description is required',
  DESCRIPTION_TOO_SHORT: 'Description must be at least 10 characters',
  APPEAL_SUBMITTED_TITLE: 'Appeal submitted',
  APPEAL_SUBMITTED_SUCCESS: 'Aura will take a second look at the decision. You will be notified of the outcome.',
  APPEAL_FAILED_TITLE: 'Appeal failed',
  APPEAL_FAILED_FALLBACK: 'Failed to submit the appeal.',
  APPEAL_TOO_SHORT: 'Please explain your appeal in at least 10 characters',
  UPLOAD_FAILED_FALLBACK: 'Failed to upload the image.',
  UPLOAD_NOT_IMAGE: 'Please select an image file.',
  UPLOAD_TOO_LARGE: 'Each image must be smaller than 10MB.',
});

/** [i18n key, default label] pairs; backend enums are the keys. */
export const COMPLAINT_STATUS_LABELS = Object.freeze({
  PENDING: ['complaint_status_pending', 'Waiting for review'],
  INVESTIGATING: ['complaint_status_investigating', 'Under review'],
  RESOLVED: ['complaint_status_resolved', 'Upheld'],
  DISMISSED: ['complaint_status_dismissed', 'Dismissed'],
});

export const COMPLAINT_STATUS_TONES = Object.freeze({
  PENDING: 'warning',
  INVESTIGATING: 'warning',
  RESOLVED: 'success',
  DISMISSED: 'neutral',
});

export const PENALTY_LABELS = Object.freeze({
  NONE: ['penalty_none', 'No penalty'],
  WARNING: ['penalty_warning', 'Official warning'],
  LISTING_SUSPENDED: ['penalty_listing_suspended', 'Listing suspended'],
  TEMP_BAN_7_DAYS: ['penalty_temp_ban', '7-day restriction'],
  PERM_BAN: ['penalty_perm_ban', 'Permanent ban'],
});

export const VIOLATION_LABELS = Object.freeze({
  HARASSMENT: ['violation_harassment', 'Harassment or insults'],
  OFF_PLATFORM_TRADING: ['violation_off_platform', 'Off-platform trading'],
  SCAM_FRAUD: ['violation_scam', 'Scam or fraud'],
  INAPPROPRIATE_CONTENT: ['violation_inappropriate', 'Inappropriate content'],
  FALSE_ADVERTISING: ['violation_false_advertising', 'Misleading listing'],
  NONE: ['violation_none', 'No violation'],
  MALICIOUS_REPORT: ['violation_malicious_report', 'Bad-faith report'],
});

export const APPEAL_STATUS_LABELS = Object.freeze({
  PENDING: ['appeal_status_pending', 'Appeal under review'],
  APPROVED: ['appeal_status_approved', 'Appeal approved'],
  REJECTED: ['appeal_status_rejected', 'Appeal rejected'],
});

export const labelOf = (map, value, t) => {
  const entry = map[value];
  return entry ? t(entry[0], entry[1]) : value || '';
};
