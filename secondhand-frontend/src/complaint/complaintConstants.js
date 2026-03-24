export const COMPLAINT_DEFAULTS = Object.freeze({
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 500,
  STALE_TIME_MS: 5 * 60 * 1000,
  GC_TIME_MS: 15 * 60 * 1000,
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
});
