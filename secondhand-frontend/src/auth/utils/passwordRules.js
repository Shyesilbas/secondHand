// Mirrors the backend @Pattern on RegisterRequest / ResetPasswordRequest / ChangePasswordRequest:
// ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]+$ and at least 8 characters.
export const PASSWORD_SPECIALS = '@$!%*?&.';
export const PASSWORD_MIN_LENGTH = 8;

const SPECIAL_RE = /[@$!%*?&.]/;
const ALLOWED_RE = /^[A-Za-z\d@$!%*?&.]*$/;

export const PASSWORD_RULES = [
  { id: 'length', label: `En az ${PASSWORD_MIN_LENGTH} karakter`, test: (p) => p.length >= PASSWORD_MIN_LENGTH },
  { id: 'upper', label: 'Bir büyük harf', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'Bir küçük harf', test: (p) => /[a-z]/.test(p) },
  { id: 'digit', label: 'Bir rakam', test: (p) => /\d/.test(p) },
  { id: 'special', label: `Bir özel karakter (${PASSWORD_SPECIALS})`, test: (p) => SPECIAL_RE.test(p) },
];

/** First problem with the password as a Turkish message, or '' when it is valid. */
export const getPasswordError = (password) => {
  if (!password) return 'Şifre gerekli.';
  if (!ALLOWED_RE.test(password)) {
    return `Şifrede yalnızca harf, rakam ve ${PASSWORD_SPECIALS} karakterleri kullanılabilir.`;
  }
  const failed = PASSWORD_RULES.find(rule => !rule.test(password));
  return failed ? `Şifre kurallarını karşılamıyor: ${failed.label.toLowerCase()}.` : '';
};

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
