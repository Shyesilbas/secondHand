import { get, post, put } from '../../services/api/request.js';
import { API_ENDPOINTS } from '../../constants/apiEndpoints.js';
import { AGREEMENT_TYPES } from '../../types/agreements.js';

/**
 * Agreement Service
 * Handles all agreement-related API calls
 */
class AgreementService {
  normalizeUserAgreement(raw) {
    return {
      ...raw,
      isAcceptedTheLastVersion:
        raw?.isAcceptedTheLastVersion ?? raw?.acceptedTheLastVersion ?? false,
    };
  }

  async getAllAgreements() {
    return get(API_ENDPOINTS.AGREEMENTS.ALL);
  }

  async getRequiredAgreements() {
    return get(API_ENDPOINTS.AGREEMENTS.REQUIRED);
  }

  async acceptAgreement(acceptRequest) {
    return post(API_ENDPOINTS.AGREEMENTS.ACCEPT, acceptRequest);
  }

  async getUserAgreements() {
    const data = await get(API_ENDPOINTS.AGREEMENTS.USER_AGREEMENTS);
    return Array.isArray(data) ? data.map((ua) => this.normalizeUserAgreement(ua)) : [];
  }

}

export const agreementService = new AgreementService();
