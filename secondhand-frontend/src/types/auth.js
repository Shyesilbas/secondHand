/**
 * Authentication Related DTOs
 */

// Login Request DTO
export const LoginRequestDTO = {
  email: '',
  password: '',
};

// Login Response DTO
export const LoginResponseDTO = {
  message: '',
  success: false,
  userId: null,
  email: '',
  accessToken: '',
  refreshToken: '',
};

// Register Request DTO
export const RegisterRequestDTO = {
  name: '',
  surname: '',
  email: '',
  password: '',
  phone: '',
  gender: '',
  birthdate: '',
  userType: 'CUSTOMER',
};

// Register Response DTO
export const RegisterResponseDTO = {
  welcomeMessage: '',
  importantMessage: '',
  informationMessage: '',
  userId: null,
  email: '',
  name: '',
  surname: '',
};

// Forgot Password Request DTO
export const ForgotPasswordRequestDTO = {
  email: '',
};

// Reset Password Request DTO
export const ResetPasswordRequestDTO = {
  token: '',
  newPassword: '',
};

// Change Password Request DTO
export const ChangePasswordRequestDTO = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

// Token Validation Result DTO
export const TokenValidationResultDTO = {
  valid: false,
  user: null,
  message: '',
};

/**
 * Create Login Request DTO with validation
 * @param {Object} data - Form data
 * @returns {Object} - Validated DTO
 */
export const createLoginRequest = (data) => {
  return {
    email: data.email?.trim().toLowerCase() || '',
    password: data.password || '',
  };
};

/**
 * Create Register Request DTO with validation
 * @param {Object} data - Form data
 * @returns {Object} - Validated DTO
 */
export const createRegisterRequest = (data) => {
  return {
    name: data.name?.trim() || '',
    surname: data.surname?.trim() || '',
    email: data.email?.trim().toLowerCase() || '',
    password: data.password || '',
    phoneNumber: data.phone?.trim() || '',
    gender: data.gender || '',
    birthdate: data.birthdate || '',
    userType: data.userType || 'CUSTOMER',
  };
};

/**
 * Create Change Password Request DTO with validation
 * @param {Object} data - Form data
 * @returns {Object} - Validated DTO
 */
export const createChangePasswordRequest = (data) => {
  return {
    currentPassword: data.currentPassword || '',
    newPassword: data.newPassword || '',
    confirmPassword: data.confirmPassword || '',
  };
};

/**
 * Create Forgot Password Request DTO with validation
 * @param {Object} data - Form data
 * @returns {Object} - Validated DTO
 */
export const createForgotPasswordRequest = (data) => {
  return {
    email: data.email?.trim().toLowerCase() || '',
  };
};

/**
 * Create Reset Password Request DTO with validation
 * @param {Object} data - Form data
 * @returns {Object} - Validated DTO
 */
export const createResetPasswordRequest = (data) => {
  return {
    token: data.token || '',
    newPassword: data.newPassword || '',
  };
};