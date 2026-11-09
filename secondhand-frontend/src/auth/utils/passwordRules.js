import i18n from '../../i18n.js';

// Mirrors the backend @Pattern on RegisterRequest / ResetPasswordRequest / ChangePasswordRequest:
// ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]+$ and at least 8 characters.
export const PASSWORD_SPECIALS = '@$!%*?&.';
export const PASSWORD_MIN_LENGTH = 8;

const SPECIAL_RE = /[@$!%*?&.]/;
const ALLOWED_RE = /^[A-Za-z\d@$!%*?&.]*$/;

export const PASSWORD_RULES = [
  { id: 'length', labelKey: 'rule_length', label: `En az ${PASSWORD_MIN_LENGTH} karakter`, test: (p) => p.length >= PASSWORD_MIN_LENGTH },
  { id: 'upper', labelKey: 'rule_upper', label: 'Bir büyük harf', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', labelKey: 'rule_lower', label: 'Bir küçük harf', test: (p) => /[a-z]/.test(p) },
  { id: 'digit', labelKey: 'rule_digit', label: 'Bir rakam', test: (p) => /\d/.test(p) },
  { id: 'special', labelKey: 'rule_special', label: `Bir özel karakter (${PASSWORD_SPECIALS})`, test: (p) => SPECIAL_RE.test(p) },
];

/** First problem with the password in the active language, or '' when it is valid. */
export const getPasswordError = (password) => {
  const isEn = i18n?.language?.startsWith('en');
  if (!password) return isEn ? 'Password is required.' : 'Şifre gerekli.';
  if (!ALLOWED_RE.test(password)) {
    return isEn
      ? `Password can only contain letters, numbers, and ${PASSWORD_SPECIALS} characters.`
      : `Şifrede yalnızca harf, rakam ve ${PASSWORD_SPECIALS} karakterleri kullanılabilir.`;
  }
  const failed = PASSWORD_RULES.find(rule => !rule.test(password));
  if (!failed) return '';
  if (isEn) {
    const labels = {
      length: `at least ${PASSWORD_MIN_LENGTH} characters`,
      upper: 'one uppercase letter',
      lower: 'one lowercase letter',
      digit: 'one digit',
      special: `one special character (${PASSWORD_SPECIALS})`,
    };
    return `Password does not meet rules: ${labels[failed.id] || failed.id}.`;
  }
  return `Şifre kurallarını karşılamıyor: ${failed.label.toLowerCase()}.`;
};

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
