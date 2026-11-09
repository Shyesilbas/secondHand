import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import {
 OTP_CODE_LENGTH,
 sanitizeOtpInput,
} from '../../../common/constants/otp.js';

/**
 * Controlled 6-cell OTP row: paste, backspace navigate, numeric only.
 *
 * @param {string} value — digits only, max OTP_CODE_LENGTH
 * @param {(next: string) => void} onChange
 * @param {string} [dataSlotPrefix='otp'] — unique data-otp-slot prefix per screen
 */
const OtpDigitInputGroup = ({
 value,
 onChange,
 dataSlotPrefix = 'otp',
 disabled = false,
}) => {
  const { t } = useTranslation();
 const digits = sanitizeOtpInput(value, OTP_CODE_LENGTH);
 const codeArray = Array.from({length: OTP_CODE_LENGTH}, (_, i) => digits[i] || '');

 const selector = useCallback(
 (index) => `[data-otp-slot="${dataSlotPrefix}-${index}"]`,
 [dataSlotPrefix]
 );

 const emit = useCallback(
 (arr) => {
 onChange?.(sanitizeOtpInput(arr.join(''), OTP_CODE_LENGTH));
 },
 [onChange]
 );

 const handleChange = useCallback(
 (index, char) => {
 if (!/^\d*$/.test(char) || char.length > 1) return;
 const next = [...codeArray];
 next[index] = char;
 emit(next);
 if (char && index < OTP_CODE_LENGTH - 1) {
 document.querySelector(selector(index + 1))?.focus();
 }
 },
 [codeArray, emit, selector]
 );

 const handleKeyDown = useCallback(
 (index, e) => {
 if (e.key === 'Backspace' && !codeArray[index] && index > 0) {
 document.querySelector(selector(index - 1))?.focus();
 }
 },
 [codeArray, selector]
 );

 const handlePaste = useCallback(
 (e) => {
 const pasted = sanitizeOtpInput(e.clipboardData.getData('text'), OTP_CODE_LENGTH);
 if (!pasted) return;
 e.preventDefault();
 emit(pasted.split(''));

 const focusIndex = Math.min(pasted.length, OTP_CODE_LENGTH - 1);
 requestAnimationFrame(() => {
 document.querySelector(selector(focusIndex))?.focus();
 });
 },
 [emit, selector]
 );

 return (
 <div className="flex justify-center gap-2 sm:gap-2.5" role="group" aria-label={t('digit_verification_code_group', '{{count}} haneli doğrulama kodu', { count: OTP_CODE_LENGTH })}>
 {codeArray.map((digit, index) => (
 <input
 key={`${dataSlotPrefix}-${index}`}
 type="text"
 inputMode="numeric"
 value={digit}
 disabled={disabled}
 onChange={(e) => handleChange(index, e.target.value)}
 onKeyDown={(e) => handleKeyDown(index, e)}
 onPaste={handlePaste}
 onFocus={(e) => e.target.select()}
 aria-label={t('digit_input_index', '{{index}}. hane', { index: index + 1 })}
 className={`h-14 w-11 rounded border bg-background-primary text-center text-xl font-semibold tabular-nums text-text-primary transition-colors duration-150 focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus disabled:cursor-not-allowed disabled:bg-background-secondary disabled:text-text-muted sm:w-12 ${
 digit ? 'border-border-dark' : 'border-border'
 }`}
 maxLength={1}
 data-otp-slot={`${dataSlotPrefix}-${index}`}
 autoComplete="one-time-code"
 />
 ))}
 </div>
 );
};

export default OtpDigitInputGroup;
