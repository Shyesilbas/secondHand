import React, {useCallback} from 'react';
import {Copy, CornerDownRight, MailCheck} from 'lucide-react';
import {useNotification} from '../../../notification/NotificationContext.jsx';
import {OTP_CODE_LENGTH} from '../../../common/constants/otp.js';

/** Suggested code from latest payment email: copy or apply to inputs. */
const OtpSuggestionBanner = ({ suggestedCode, onApply }) => {
  const notification = useNotification();

  const copy = useCallback(async () => {
    if (!suggestedCode?.length || suggestedCode.length !== OTP_CODE_LENGTH) return;
    try {
      await navigator.clipboard.writeText(suggestedCode);
      notification.showSuccess('Copied', `The ${OTP_CODE_LENGTH}-digit code was copied to your clipboard.`);
    } catch {
      notification.showWarning('Clipboard', 'Could not copy — select the code manually.');
    }
  }, [notification, suggestedCode]);

  const apply = useCallback(() => {
    onApply?.(suggestedCode);
  }, [onApply, suggestedCode]);

  if (!suggestedCode || String(suggestedCode).length !== OTP_CODE_LENGTH) return null;

  return (
    <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/95 to-teal-50/80 px-4 py-3.5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
          <MailCheck className="w-5 h-5 text-white" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">Verification code</p>
          <p className="text-[11px] text-emerald-800/85 mt-0.5">
            We detected this code in your latest verification email. Copy it or apply it below to complete this step securely.
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex font-mono text-xl font-bold tracking-[0.35em] text-emerald-950 tabular-nums px-3 py-1.5 rounded-lg bg-white/90 border border-emerald-100"
              aria-label="Suggested verification code"
            >
              {String(suggestedCode)}
            </span>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 text-xs font-bold transition-colors"
            >
              <Copy className="w-3.5 h-3.5 shrink-0" />
              Copy
            </button>
            <button
              type="button"
              onClick={apply}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/80 bg-white text-emerald-900 hover:bg-emerald-50 px-3 py-2 text-xs font-bold transition-colors"
            >
              <CornerDownRight className="w-3.5 h-3.5 shrink-0" />
              Fill inputs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpSuggestionBanner;
