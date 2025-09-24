export const validateRegisterForm = (formData, acceptedAgreements, agreements) => {
  const errors = {};

  if (!formData.name?.trim()) {
    errors.name = 'Name is required';
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!formData.surname?.trim()) {
    errors.surname = 'Surname is required';
  } else if (formData.surname.trim().length < 2) {
    errors.surname = 'Surname must be at least 2 characters';
  }

  if (!formData.email?.trim()) {
    errors.email = 'E-Mail is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

    if (!formData.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
    errors.phone = 'Please enter a valid phone number';
  }

    if (!formData.gender) {
    errors.gender = 'Gender is required';
  }

    if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }

    if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

    if (acceptedAgreements.size !== agreements.length) {
    errors.agreements = 'You must accept all agreements to register';
  }

  return errors;
};

export default validateRegisterForm;
