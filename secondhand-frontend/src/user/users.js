
export const UserDTO = {
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
};

export const UpdatePhoneRequestDTO = {
  newPhone: '',
  password: '',
};

export const createUpdatePhoneRequest = (data) => {
  return {
    newPhone: data.newPhone?.trim() || '',
    password: data.password || '',
  };
};


