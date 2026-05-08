import {
  OTP_CODE_LENGTH,
  OTP_EXTRACTION_REGEX,
  sanitizeOtpInput,
} from '../../common/constants/otp.js';

export { sanitizeOtpInput };

/** TR/EN labels often precede the 6-digit payment code in HTML emails. */
const CODE_AFTER_LABEL_RE =
  /(?:code|verification|dogrulama|doğrulama|kod|şifre|pin|otp)[^\d]{0,18}(\d{6})\b/i;

/**
 * Strip tags and collapse whitespace for regex scan (no DOM).
 */
export const normalizeOtpScanText = (raw) => {
  if (raw == null || typeof raw !== 'string') return '';
  let t = raw.replace(/<[^>]+>/g, ' ');
  t = t
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
};

export const extractSixDigitFromNormalizedText = (normalizedText) => {
  if (!normalizedText) return null;
  const m = normalizedText.match(OTP_EXTRACTION_REGEX);
  if (m) return m[0];
  const m2 = normalizedText.match(CODE_AFTER_LABEL_RE);
  if (m2?.[1] && m2[1].length === OTP_CODE_LENGTH) return m2[1];
  return null;
};

/**
 * One email row: optional type filter, uses content + body, HTML-safe normalize.
 */
export const extractOtpFromEmailRecord = (email, { expectedEmailType } = {}) => {
  if (!email) return null;
  if (expectedEmailType != null && email.emailType !== expectedEmailType) return null;

  const raw = email.content ?? email.body ?? '';
  const norm = normalizeOtpScanText(String(raw));
  return extractSixDigitFromNormalizedText(norm);
};

/** @deprecated Use extractOtpFromEmailRecord — kept for callers using old name */
export const extractVerificationCodeFromEmail = (email, expectedEmailType) =>
  extractOtpFromEmailRecord(email, { expectedEmailType: expectedEmailType || undefined });

/**
 * Newest matching emails first; returns first OTP found among up to maxScan candidates.
 */
export const findLatestOtpFromEmails = (emails, { emailType, maxScan = 12 } = {}) => {
  const list = Array.isArray(emails) ? emails : [];
  const sorted = [...list].sort((a, b) => {
    const tb = Date.parse(b?.createdAt || b?.sentAt || '') || 0;
    const ta = Date.parse(a?.createdAt || a?.sentAt || '') || 0;
    return tb - ta;
  });

  let scanned = 0;
  for (const e of sorted) {
    if (emailType != null && e?.emailType !== emailType) continue;
    if (scanned >= maxScan) break;
    scanned += 1;
    const code = extractOtpFromEmailRecord(e, emailType ? { expectedEmailType: emailType } : {});
    if (code) return code;
  }
  return null;
};
