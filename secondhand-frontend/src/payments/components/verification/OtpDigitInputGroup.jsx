import React, {useCallback} from 'react';
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

  const filledCount = codeArray.filter((c) => c !== '').length;

  return (
    <div className="text-center">
      <div className="flex justify-center gap-2.5">
        {codeArray.map((digit, index) => {
          const hasValue = Boolean(digit);
          return (
            <input
              key={`${dataSlotPrefix}-${index}`}
              type="text"
              inputMode="numeric"
              value={digit}
              disabled={disabled}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              aria-label={`Verification digit ${index + 1} of ${OTP_CODE_LENGTH}`}
              className={`w-11 h-12 text-center text-[16px] font-mono rounded-xl transition-all duration-150 focus:outline-none ${
                disabled ? 'opacity-50 cursor-not-allowed border border-slate-100 bg-slate-50 text-slate-400' :
                hasValue
                  ? 'border-indigo-600 bg-indigo-600 text-white border'
                  : 'border border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              }`}
              maxLength={1}
              data-otp-slot={`${dataSlotPrefix}-${index}`}
              autoComplete="one-time-code"
            />
          );
        })}
      </div>
      <div className="mt-2.5 flex items-center justify-center gap-1">
        {Array.from({length: OTP_CODE_LENGTH}, (_, i) => (
          <div
            key={i}
            className={`w-1 h-1 rounded-full transition-colors ${i < filledCount ? 'bg-gray-900' : 'bg-gray-200'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default OtpDigitInputGroup;
