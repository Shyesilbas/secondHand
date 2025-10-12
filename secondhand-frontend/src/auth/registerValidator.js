import { validatePhoneNumber } from '../common/utils/phoneFormatter.js';

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
  } else {
    const phoneValidation = validatePhoneNumber(formData.phone);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.error;
    }
  }

    if (!formData.gender) {
    errors.gender = 'Gender is required';
  }

  if (!formData.birthdate?.trim()) {
    errors.birthdate = 'Birth date is required';
  } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.birthdate.trim())) {
    errors.birthdate = 'Please enter birth date in DD/MM/YYYY format';
  } else {
    // Validate the date
    const [day, month, year] = formData.birthdate.trim().split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const currentDate = new Date();
    
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      errors.birthdate = 'Please enter a valid date';
    } else if (date > currentDate) {
      errors.birthdate = 'Birth date cannot be in the future';
    } else if (year < 1900 || year > currentDate.getFullYear() - 13) {
      errors.birthdate = 'Age must be at least 13 years old';
    }
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
