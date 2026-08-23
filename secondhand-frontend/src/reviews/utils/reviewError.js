import { REVIEW_MESSAGES } from '../reviewConstants.js';
import { getErrorMessage } from '../../common/utils/errorUtils.js';

export const getReviewErrorMessage = (error, fallback = REVIEW_MESSAGES.UNKNOWN_ERROR) => {
 return getErrorMessage(error, fallback);
};
