import {
  OTP_CODE_LENGTH,
  OTP_EXTRACTION_REGEX,
  sanitizeOtpInput,
} from '../../common/constants/otp.js';

export { sanitizeOtpInput };

export const extractVerificationCodeFromEmail = (email, expectedEmailType) => {
  if (!email) return null;
  if (expectedEmailType && email.emailType !== expectedEmailType) return null;

  const content = String(email?.content ?? '');
  const match = content.match(OTP_EXTRACTION_REGEX);
  return match ? match[0] : null;
};

