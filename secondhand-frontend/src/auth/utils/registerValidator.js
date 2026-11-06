import { validatePhoneNumber } from '../../common/utils/phoneFormatter.js';
import { getPasswordError, isValidEmail } from './passwordRules.js';

/** Fields on the first register step; the form returns there when one of them fails. */
export const REGISTER_ACCOUNT_FIELDS = ['email', 'password', 'confirmPassword'];

export const validateAccountFields = (formData) => {
  const errors = {};
  if (!formData.email?.trim()) errors.email = 'E-posta adresini gir.';
  else if (!isValidEmail(formData.email)) errors.email = 'Geçerli bir e-posta adresi gir.';

  const passwordError = getPasswordError(formData.password);
  if (passwordError) errors.password = passwordError;

  if (!formData.confirmPassword) errors.confirmPassword = 'Şifreni tekrar gir.';
  else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Şifreler eşleşmiyor.';
  return errors;
};

/** DD/MM/YYYY, a real date, and at least 13 years ago. */
export const validateBirthdate = (value) => {
  const text = value?.trim();
  if (!text) return 'Doğum tarihini gir.';
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(text)) return 'Doğum tarihini GG/AA/YYYY biçiminde gir.';
  const [day, month, year] = text.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  const now = new Date();
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) return 'Geçerli bir tarih gir.';
  if (date > now) return 'Doğum tarihi gelecekte olamaz.';
  if (year < 1900 || year > now.getFullYear() - 13) return 'Kayıt için en az 13 yaşında olmalısın.';
  return '';
};

export const validatePhone = (value) => {
  if (!value?.trim()) return 'Telefon numaranı gir.';
  return validatePhoneNumber(value).valid ? '' : 'Geçerli bir telefon numarası gir.';
};

export const validateRegisterForm = (formData, acceptedAgreements, agreements) => {
  const errors = validateAccountFields(formData);

  if (!formData.name?.trim()) errors.name = 'Adını gir.';
  else if (formData.name.trim().length < 2) errors.name = 'Ad en az 2 karakter olmalı.';

  if (!formData.surname?.trim()) errors.surname = 'Soyadını gir.';
  else if (formData.surname.trim().length < 2) errors.surname = 'Soyad en az 2 karakter olmalı.';

  const phoneError = validatePhone(formData.phone);
  if (phoneError) errors.phone = phoneError;

  const birthdateError = validateBirthdate(formData.birthdate);
  if (birthdateError) errors.birthdate = birthdateError;

  if (!formData.gender) errors.gender = 'Cinsiyet seç.';

  if (acceptedAgreements.size !== agreements.length) errors.agreements = 'Devam etmek için sözleşmeleri onaylaman gerekiyor.';

  return errors;
};
