import i18n from '../../i18n.js';
import { validatePhoneNumber } from '../../common/utils/phoneFormatter.js';
import { getPasswordError, isValidEmail } from './passwordRules.js';

/** Fields on the first register step; the form returns there when one of them fails. */
export const REGISTER_ACCOUNT_FIELDS = ['email', 'password', 'confirmPassword'];

export const validateAccountFields = (formData) => {
  const isEn = i18n?.language?.startsWith('en');
  const errors = {};
  if (!formData.email?.trim()) errors.email = isEn ? 'Enter your email address.' : 'E-posta adresini gir.';
  else if (!isValidEmail(formData.email)) errors.email = isEn ? 'Enter a valid email address.' : 'Geçerli bir e-posta adresi gir.';

  const passwordError = getPasswordError(formData.password);
  if (passwordError) errors.password = passwordError;

  if (!formData.confirmPassword) errors.confirmPassword = isEn ? 'Re-enter your password.' : 'Şifreni tekrar gir.';
  else if (formData.password !== formData.confirmPassword) errors.confirmPassword = isEn ? 'Passwords do not match.' : 'Şifreler eşleşmiyor.';
  return errors;
};

/** DD/MM/YYYY, a real date, and at least 13 years ago. */
export const validateBirthdate = (value) => {
  const isEn = i18n?.language?.startsWith('en');
  const text = value?.trim();
  if (!text) return isEn ? 'Enter your birth date.' : 'Doğum tarihini gir.';
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(text)) return isEn ? 'Enter birth date in DD/MM/YYYY format.' : 'Doğum tarihini GG/AA/YYYY biçiminde gir.';
  const [day, month, year] = text.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  const now = new Date();
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return isEn ? 'Enter a valid date.' : 'Geçerli bir tarih gir.';
  }
  if (date > now) return isEn ? 'Birth date cannot be in the future.' : 'Doğum tarihi gelecekte olamaz.';
  if (year < 1900 || year > now.getFullYear() - 13) {
    return isEn ? 'You must be at least 13 years old to register.' : 'Kayıt için en az 13 yaşında olmalısın.';
  }
  return '';
};

export const validatePhone = (value) => {
  const isEn = i18n?.language?.startsWith('en');
  if (!value?.trim()) return isEn ? 'Enter your phone number.' : 'Telefon numaranı gir.';
  return validatePhoneNumber(value).valid ? '' : (isEn ? 'Enter a valid phone number.' : 'Geçerli bir telefon numarası gir.');
};

export const validateRegisterForm = (formData, acceptedAgreements, agreements) => {
  const isEn = i18n?.language?.startsWith('en');
  const errors = validateAccountFields(formData);

  if (!formData.name?.trim()) errors.name = isEn ? 'Enter your name.' : 'Adını gir.';
  else if (formData.name.trim().length < 2) errors.name = isEn ? 'Name must be at least 2 characters.' : 'Ad en az 2 karakter olmalı.';

  if (!formData.surname?.trim()) errors.surname = isEn ? 'Enter your surname.' : 'Soyadını gir.';
  else if (formData.surname.trim().length < 2) errors.surname = isEn ? 'Surname must be at least 2 characters.' : 'Soyad en az 2 karakter olmalı.';

  const phoneError = validatePhone(formData.phone);
  if (phoneError) errors.phone = phoneError;

  const birthdateError = validateBirthdate(formData.birthdate);
  if (birthdateError) errors.birthdate = birthdateError;

  if (!formData.gender) errors.gender = isEn ? 'Select a gender.' : 'Cinsiyet seç.';

  if (acceptedAgreements.size !== agreements.length) {
    errors.agreements = isEn ? 'You must accept the agreements to continue.' : 'Devam etmek için sözleşmeleri onaylaman gerekiyor.';
  }

  return errors;
};
