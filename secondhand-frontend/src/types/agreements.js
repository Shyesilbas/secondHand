/**
 * Agreements Related DTOs
 */

// Agreement DTO
export const AgreementDTO = {
  agreementId: null,
  agreementType: '',
  version: '',
  content: '',
  createdDate: '',
  updatedDate: '',
};

// User Agreement DTO
export const UserAgreementDTO = {
  userAgreementId: null,
  userId: null,
  agreementId: null,
  agreementType: '',
  agreementVersion: '',
  isAcceptedTheLastVersion: false,
  acceptedDate: '',
};

// Accept Agreement Request DTO
export const AcceptAgreementRequestDTO = {
  agreementId: null,
  isAcceptedTheLastVersion: false,
};

// Create Agreement Request DTO
export const CreateAgreementRequestDTO = {
  agreementType: '',
  version: '',
  content: '',
};

// Update Agreement Request DTO
export const UpdateAgreementRequestDTO = {
  version: '',
  content: '',
};

// Required Agreements DTO
export const RequiredAgreementsDTO = {
  agreements: [],
  requiredTypes: [],
  allAccepted: false,
};

/**
 * Agreement Types Enum
 */
export const AGREEMENT_TYPES = {
  TERMS_OF_SERVICE: 'TERMS_OF_SERVICE',
  PRIVACY_POLICY: 'PRIVACY_POLICY',
  KVKK: 'KVKK',
};

/**
 * Agreement Type Labels
 */
export const AGREEMENT_TYPE_LABELS = {
  [AGREEMENT_TYPES.TERMS_OF_SERVICE]: 'Kullanım Şartları',
  [AGREEMENT_TYPES.PRIVACY_POLICY]: 'Gizlilik Politikası',
  [AGREEMENT_TYPES.KVKK]: 'KVKK Aydınlatma Metni',
};

/**
 * Create Accept Agreement Request DTO with validation
 * @param {Object} data - Form data
 * @returns {Object} - Validated DTO
 */
export const createAcceptAgreementRequest = (data) => {
  return {
    agreementId: data.agreementId || null,
    isAcceptedTheLastVersion: data.isAcceptedTheLastVersion || false,
  };
};

/**
 * Create Agreement DTO with validation
 * @param {Object} data - Form data
 * @returns {Object} - Validated DTO
 */
export const createAgreementDTO = (data) => {
  return {
    agreementId: data.agreementId || null,
    agreementType: data.agreementType || '',
    version: data.version || '',
    content: data.content || '',
    createdDate: data.createdDate || '',
    updatedDate: data.updatedDate || '',
  };
};

/**
 * Create User Agreement DTO with validation
 * @param {Object} data - Form data
 * @returns {Object} - Validated DTO
 */
export const createUserAgreementDTO = (data) => {
  return {
    userAgreementId: data.userAgreementId || null,
    userId: data.userId || null,
    agreementId: data.agreementId || null,
    agreementType: data.agreementType || '',
    agreementVersion: data.agreementVersion || '',
    isAcceptedTheLastVersion: data.isAcceptedTheLastVersion || false,
    acceptedDate: data.acceptedDate || '',
  };
};
