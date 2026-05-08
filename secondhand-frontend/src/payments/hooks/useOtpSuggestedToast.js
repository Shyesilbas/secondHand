import { useEffect, useRef } from 'react';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { OTP_CODE_LENGTH } from '../../common/constants/otp.js';

/** One info toast when a valid suggestedCode first appears (deduped per code). */
export function useOtpSuggestedToast({ suggestedCode, enabled = true }) {
  const notifiedForCodeRef = useRef(null);
  const { showInfo } = useNotification();

  useEffect(() => {
    if (!enabled) return;
    const code =
      suggestedCode != null &&
      String(suggestedCode).length === OTP_CODE_LENGTH &&
      /^\d{6}$/.test(String(suggestedCode))
        ? String(suggestedCode)
        : null;
    if (!code) return;
    if (notifiedForCodeRef.current === code) return;
    notifiedForCodeRef.current = code;
    showInfo(
      'Verification code ready',
      `${code} — found in your email. Use the banner or fields above to enter it quickly.`,
      { toast: true, autoCloseDelay: 6500 },
    );
  }, [enabled, suggestedCode, showInfo]);
}
