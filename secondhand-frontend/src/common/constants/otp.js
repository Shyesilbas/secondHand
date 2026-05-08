export const OTP_CODE_LENGTH = 6;

/** Word-boundary anchored block of digits; used for OTP scan (first match). */
const OTP_BOUNDARY_PATTERN = `\\b\\d{${OTP_CODE_LENGTH}}\\b`;

export const OTP_EXTRACTION_REGEX = new RegExp(OTP_BOUNDARY_PATTERN);

export const OTP_EXTRACTION_REGEX_GLOBAL = new RegExp(OTP_BOUNDARY_PATTERN, 'g');

export const sanitizeOtpInput = (raw, codeLength = OTP_CODE_LENGTH) => {
  const digits = String(raw ?? '').replace(/\D/g, '');
  return digits.slice(0, codeLength);
};
