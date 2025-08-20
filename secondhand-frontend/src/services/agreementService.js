import { get, post, put } from './api/request';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { AGREEMENT_TYPES } from '../types/agreements';

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
  /**
   * Get all agreements
   * @returns {Promise<Array>} - List of all agreements
   */
  async getAllAgreements() {
    return get(API_ENDPOINTS.AGREEMENTS.ALL);
  }

  /**
   * Get required agreements for registration
   * @returns {Promise<Array>} - List of required agreements
   */
  async getRequiredAgreements() {
    return get(API_ENDPOINTS.AGREEMENTS.REQUIRED);
  }

  /**
   * Get agreement by type
   * @param {string} agreementType - Type of agreement
   * @returns {Promise<Object>} - Agreement details
   */
  async getAgreementByType(agreementType) {
    return get(API_ENDPOINTS.AGREEMENTS.BY_TYPE(agreementType));
  }

  /**
   * Accept an agreement
   * @param {Object} acceptRequest - Accept agreement request
   * @returns {Promise<Object>} - User agreement details
   */
  async acceptAgreement(acceptRequest) {
    return post(API_ENDPOINTS.AGREEMENTS.ACCEPT, acceptRequest);
  }

  /**
   * Get user agreements
   * @returns {Promise<Array>} - List of user agreements
   */
  async getUserAgreements() {
    const data = await get(API_ENDPOINTS.AGREEMENTS.USER_AGREEMENTS);
    return Array.isArray(data) ? data.map((ua) => this.normalizeUserAgreement(ua)) : [];
  }

  /**
   * Check if user has accepted all registration agreements
   * @returns {Promise<boolean>} - True if all agreements accepted
   */
  async hasAcceptedAllRegistrationAgreements() {
    return get(API_ENDPOINTS.AGREEMENTS.USER_STATUS_ALL);
  }

  /**
   * Check if user has accepted specific agreement type
   * @param {string} agreementType - Type of agreement
   * @returns {Promise<boolean>} - True if agreement accepted
   */
  async hasUserAcceptedAgreement(agreementType) {
    return get(API_ENDPOINTS.AGREEMENTS.USER_STATUS_BY_TYPE(agreementType));
  }

  /**
   * Initialize all agreements (admin only)
   * @returns {Promise<Array>} - List of initialized agreements
   */
  async initializeAgreements() {
    return post(API_ENDPOINTS.AGREEMENTS.INITIALIZE);
  }

  /**
   * Create new agreement (admin only)
   * @param {Object} createRequest - Create agreement request
   * @returns {Promise<Object>} - Created agreement details
   */
  async createAgreement(createRequest) {
    return post(API_ENDPOINTS.AGREEMENTS.CREATE, createRequest);
  }

  /**
   * Update agreement by ID (admin only)
   * @param {string} agreementId - Agreement ID
   * @param {Object} updateRequest - Update agreement request
   * @returns {Promise<Object>} - Updated agreement details
   */
  async updateAgreement(agreementId, updateRequest) {
    return put(API_ENDPOINTS.AGREEMENTS.UPDATE_BY_ID(agreementId), updateRequest);
  }

  /**
   * Update agreement by type (admin only)
   * @param {string} agreementType - Type of agreement
   * @param {Object} updateRequest - Update agreement request
   * @returns {Promise<Object>} - Updated agreement details
   */
  async updateAgreementByType(agreementType, updateRequest) {
    return put(API_ENDPOINTS.AGREEMENTS.UPDATE_BY_TYPE(agreementType), updateRequest);
  }

  /**
   * Accept agreements for all users (admin only)
   * @returns {Promise<string>} - Success message
   */
  async acceptAgreementsForAllUsers() {
    return post(API_ENDPOINTS.AGREEMENTS.ADMIN_ACCEPT_ALL);
  }

  /**
   * Accept agreements for specific user (admin only)
   * @param {number} userId - User ID
   * @returns {Promise<string>} - Success message
   */
  async acceptAgreementsForUser(userId) {
    // return post(API_ENDPOINTS.AGREEMENTS.ADMIN_ACCEPT_USER(userId)); // controller commented out
    throw new Error('acceptAgreementsForUser endpoint is disabled');
  }

  /**
   * Get pending agreements for current user
   * @returns {Promise<Array>} - List of pending agreements
   */
  async getPendingAgreements() {
    const allAgreements = await this.getRequiredAgreements();
    const userAgreements = await this.getUserAgreements();
    
    // Filter out agreements that user has already accepted
    const acceptedAgreementTypes = userAgreements
      .filter((ua) => ua.isAcceptedTheLastVersion)
      .map((ua) => ua.agreementType);
    
    return allAgreements.filter(agreement => 
      !acceptedAgreementTypes.includes(agreement.agreementType)
    );
  }

  /**
   * Get accepted agreements for current user
   * @returns {Promise<Array>} - List of accepted agreements
   */
  async getAcceptedAgreements() {
    const userAgreements = await this.getUserAgreements();
    return userAgreements.filter((ua) => ua.isAcceptedTheLastVersion);
  }
}

export const agreementService = new AgreementService();
