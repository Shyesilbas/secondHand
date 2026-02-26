
export const LoginRequestDTO = Object.freeze({
  email: '',
  password: '',
  rememberMe: false,
});

export const LoginResponseDTO = Object.freeze({
  message: '',
  success: false,
  userId: null,
  email: '',
  accessToken: '',
  refreshToken: '',
});

export const RegisterRequestDTO = Object.freeze({
  name: '',
  surname: '',
  email: '',
  password: '',
  phoneNumber: '',
  gender: '',
  birthdate: '',
  agreementsAccepted: false,
  acceptedAgreementIds: [],
});

export const RegisterResponseDTO = Object.freeze({
  welcomeMessage: '',
  importantMessage: '',
  informationMessage: '',
  userId: null,
  email: '',
  name: '',
  surname: '',
});

export const ForgotPasswordRequestDTO = Object.freeze({
  email: '',
});

export const ResetPasswordRequestDTO = Object.freeze({
  token: '',
  newPassword: '',
});

export const ChangePasswordRequestDTO = Object.freeze({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

export const TokenValidationResultDTO = Object.freeze({
  valid: false,
  user: null,
  message: '',
});

export const createLoginRequest = (data) => {
  return {
    email: data.email?.trim().toLowerCase() || '',
    password: data.password || '',
    rememberMe: Boolean(data.rememberMe),
  };
};

export const createRegisterRequest = (data) => {
  return {
    name: data.name?.trim() || '',
    surname: data.surname?.trim() || '',
    email: data.email?.trim().toLowerCase() || '',
    password: data.password || '',
    phoneNumber: data.phoneNumber?.trim() || '',
    gender: data.gender || '',
    birthdate: data.birthdate || '',
    agreementsAccepted: data.agreementsAccepted || false,
    acceptedAgreementIds: Array.isArray(data.acceptedAgreementIds)
      ? data.acceptedAgreementIds
      : Array.from(data.acceptedAgreementIds || []),
  };
};

export const createChangePasswordRequest = (data) => {
  return {
    currentPassword: data.currentPassword || '',
    newPassword: data.newPassword || '',
    confirmPassword: data.confirmPassword || '',
  };
};

export const createForgotPasswordRequest = (data) => {
  return {
    email: data.email?.trim().toLowerCase() || '',
  };
};

export const createResetPasswordRequest = (data) => {
  return {
    token: data.token || '',
    newPassword: data.newPassword || '',
  };
};