export const OTP_CODE_LENGTH = 6;

export const OTP_EXTRACTION_REGEX = new RegExp(`\\\\b\\\\d{${OTP_CODE_LENGTH}}\\\\b`);

export const sanitizeOtpInput = (raw, codeLength = OTP_CODE_LENGTH) => {
  const digits = String(raw ?? '').replace(/\\D/g, '');
  return digits.slice(0, codeLength);
};

