
export const UserDTO = Object.freeze({
  id: '',
  name: '',
  surname: '',
  email: '',
  phoneNumber: '',
  gender: '',
  accountStatus: '',
  accountVerified: false,
  accountCreationDate: '',
  updatedAt: '',
  /** USER | ADMIN — from GET /v1/users/me */
  role: null,
});

export const UpdatePhoneRequestDTO = Object.freeze({
  newPhone: '',
  password: '',
});

export const createUpdatePhoneRequest = (data) => {
  return {
    newPhone: data.newPhone?.trim() || '',
    password: data.password || '',
  };
};


