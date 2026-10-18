
export const LoginRequestDTO = Object.freeze({
 email: '',
 password: '',
 rememberMe: false,
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

export const ForgotPasswordRequestDTO = Object.freeze({
 email: '',
});

export const ChangePasswordRequestDTO = Object.freeze({
 currentPassword: '',
 newPassword: '',
 confirmPassword: '',
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