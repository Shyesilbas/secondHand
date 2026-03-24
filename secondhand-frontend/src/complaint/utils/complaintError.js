import { COMPLAINT_MESSAGES } from '../complaintConstants.js';

export const getComplaintErrorMessage = (error, fallback = COMPLAINT_MESSAGES.SUBMIT_FAILED_FALLBACK) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.message) return error.message;
  return fallback;
};
