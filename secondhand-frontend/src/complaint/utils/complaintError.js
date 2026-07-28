import { COMPLAINT_MESSAGES } from '../complaintConstants.js';
import { getErrorMessage } from '../../common/utils/errorUtils.js';

export const getComplaintErrorMessage = (error, fallback = COMPLAINT_MESSAGES.SUBMIT_FAILED_FALLBACK) => {
  return getErrorMessage(error, fallback);
};
