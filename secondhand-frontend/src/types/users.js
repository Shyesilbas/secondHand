
export const UserDTO = {
  id: '',
  name: '',
  surname: '',
  email: '',
  phoneNumber: '',
  gender: '',
  accountStatus: '',
  accountVerified: false,
  createdAt: '',
  updatedAt: '',
};

export const UpdatePhoneRequestDTO = {
  newPhone: '',
  password: '',
};

export const VerificationRequestDTO = {
  code: '',
};

export const createUpdateEmailRequest = (data) => {
  return {
    newEmail: data.newEmail?.trim().toLowerCase() || '',
    password: data.password || '',
  };
};

/**
 * Create Update Phone Request DTO with validation
 * @param {Object} data - Form data
 * @returns {Object} - Validated DTO
 */
export const createUpdatePhoneRequest = (data) => {
  return {
    newPhone: data.newPhone?.trim() || '',
    password: data.password || '',
  };
};export const createVerificationRequest = (data) => {
  return {
    code: data.code?.trim() || '',
  };
};


