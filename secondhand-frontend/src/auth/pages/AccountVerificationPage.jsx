import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { verificationService } from '../services/verificationService.js';
import logger from '../../common/utils/logger.js';
import { ROUTES } from '../../common/constants/routes.js';
import AuthButton from '../../common/components/ui/AuthButton.jsx';
import { SuccessIcon, WarningIcon } from '../../common/components/ui/Icons.jsx';
import { ShieldCheck as ShieldCheckIcon, Mail as EnvelopeIcon } from 'lucide-react';
const ResendButton = ({
  onClick,
  countdown,
  isSending
}) => <button type="button" onClick={onClick} disabled={countdown > 0 || isSending} className={`font-semibold text-xs tracking-wider uppercase transition-all duration-300 ${countdown > 0 || isSending ? 'text-stone-400 cursor-not-allowed' : 'text-stone-900 hover:text-stone-700 underline underline-offset-4 decoration-stone-200 hover:decoration-stone-900'}`}>
        {countdown > 0 ? `Resend in ${countdown}s` : isSending ? 'Sending...' : 'Send Code Again'}
    </button>;
const AccountVerificationPage = () => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const {
    authState: {
      user
    },
    updateUser
  } = useAuth();
  const notification = useNotification();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [errors, setErrors] = useState({});
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  useEffect(() => {
    if (user?.accountVerified) navigate(ROUTES.PROFILE);
  }, [user, navigate]);
  useEffect(() => {
    let timer;
    if (countdown > 0) timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);
  const handleSendCode = async () => {
    setIsSendingCode(true);
    setErrors({});
    try {
      await verificationService.sendVerificationCode();
      setCodeSent(true);
      setCountdown(60);
      notification.showSuccess('Success', 'Verification code has been sent to your email!');
      // Auto focus on first OTP slot
      setTimeout(() => {
        if (inputRefs[0].current) inputRefs[0].current.focus();
      }, 100);
    } catch (error) {
      logger.error(error);
      notification.showError('Error', error.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setIsSendingCode(false);
    }
  };
  const handleOtpChange = (index, value) => {
    // Allow numeric inputs only
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue) {
      const nextOtp = [...otp];
      nextOtp[index] = '';
      setOtp(nextOtp);
      return;
    }
    const nextOtp = [...otp];
    nextOtp[index] = cleanValue.slice(-1);
    setOtp(nextOtp);

    // Move to next input box if filled
    if (index < 5 && inputRefs[index + 1].current) {
      inputRefs[index + 1].current.focus();
    }
  };
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const nextOtp = [...otp];
      if (!otp[index] && index > 0) {
        // If current slot is empty and backspace is hit, move back and clear previous
        nextOtp[index - 1] = '';
        setOtp(nextOtp);
        if (inputRefs[index - 1].current) inputRefs[index - 1].current.focus();
      } else {
        nextOtp[index] = '';
        setOtp(nextOtp);
      }
    }
  };
  const handlePaste = e => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (pastedText.length === 6) {
      const pastedOtp = pastedText.split('').slice(0, 6);
      setOtp(pastedOtp);
      if (inputRefs[5].current) inputRefs[5].current.focus();
    }
  };
  const handleVerifyCode = async e => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      return setErrors({
        code: 'Please enter the complete 6-digit verification code'
      });
    }
    setIsLoading(true);
    setErrors({});
    try {
      await verificationService.verify({
        code
      });
      updateUser({
        accountVerified: true
      });
      notification.showSuccess('Success', 'Your account has been verified.');
      setTimeout(() => navigate(ROUTES.PROFILE), 1500);
    } catch (error) {
      const msg = error.response?.data?.message;
      if (msg?.toLowerCase().includes('code') || msg?.toLowerCase().includes('invalid') || msg?.toLowerCase().includes('expired')) {
        setErrors({
          code: msg
        });
      } else {
        notification.showError('Error', msg || 'Verification Failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center py-16 px-6">
            <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/50 shadow-[0_8px_32px_rgba(28,25,23,0.02)] p-8 md:p-10 space-y-8 animate-fade-in">
                {/* Logo Monogram */}
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center shrink-0">
                        <span className="text-amber-400 text-xs font-semibold leading-none">{t("s")}</span>
                    </div>
                    <span className="text-sm font-semibold text-stone-900 tracking-tight">{t("secondhand")}</span>
                </div>

                <div className="text-center">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-stone-100 text-stone-900 mb-4">
                        <ShieldCheckIcon className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <h2 className="text-2xl font-normal text-stone-900 tracking-tight">{t("verify_your_account")}</h2>
                    <p className="mt-2.5 text-xs text-stone-500 font-normal leading-relaxed max-w-xs mx-auto">
                        {!codeSent ? 'Verify your credentials to unlock full marketplace functionalities and trade securely.' : `We have dispatched a 6-digit confirmation code to ${user?.email}`}
                    </p>
                </div>

                {/* Soft Custom Alert */}
                {!codeSent && <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/20 text-xs text-amber-800 leading-normal flex items-start gap-3">
                        <WarningIcon className="w-4.5 h-4.5 shrink-0 text-amber-600 mt-0.5" />
                        <div>
                            <span className="font-semibold block mb-0.5">{t("account_unverified")}</span>
                            <span>{t("verify_your_account_to_enjoy_safe_buying")}</span>
                        </div>
                    </div>}

                {!codeSent ? <div className="space-y-6 text-center">
                        <div className="p-4 rounded-2xl bg-stone-50/50 border border-stone-100/65 flex flex-col gap-1">
                            <span className="text-[10px] tracking-wider uppercase font-semibold text-stone-400">{t("registered_email")}</span>
                            <span className="text-sm font-semibold text-stone-900">{user?.email}</span>
                        </div>
                        <AuthButton onClick={handleSendCode} isLoading={isSendingCode} disabled={isSendingCode} size="lg">{t("send_verification_code")}</AuthButton>
                    </div> : <form className="space-y-6" onSubmit={handleVerifyCode}>
                        <div className="space-y-4">
                            <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-stone-500 text-center">{t("verification_code")}</label>
                            
                            {/* Segmented OTP code boxes */}
                            <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
                                {otp.map((digit, idx) => <input key={idx} ref={inputRefs[idx]} type="text" maxLength={1} value={digit} onChange={e => handleOtpChange(idx, e.target.value)} onKeyDown={e => handleKeyDown(idx, e)} className="w-12 h-14 text-center text-xl font-mono font-semibold rounded-xl bg-stone-100/40 border border-stone-200/60 focus:bg-white focus:border-stone-900 focus:ring-4 focus:ring-stone-900/5 transition-all outline-none" />)}
                            </div>

                            {errors.code && <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-xs text-rose-600 leading-normal flex items-start gap-2">
                                    <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>{errors.code}</span>
                                </div>}

                            <div className="text-center pt-2">
                                <ResendButton onClick={handleSendCode} countdown={countdown} isSending={isSendingCode} />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <AuthButton type="submit" isLoading={isLoading} disabled={isLoading || otp.join('').length !== 6} className="flex-[2]">{t("verify_account")}</AuthButton>
                            <button type="button" onClick={() => navigate(ROUTES.PROFILE)} className="flex-1 py-3 px-4 border border-stone-200 hover:border-stone-300 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-850 active:scale-95 bg-white transition-all">{t("cancel")}</button>
                        </div>
                    </form>}

                <div className="text-center">
                    <p className="text-[10px] text-stone-400 font-medium leading-relaxed">{t("code_expires_in_10_minutes_need_assistan")}{' '}
                        <button onClick={() => navigate(ROUTES.PROFILE)} className="font-semibold text-stone-500 hover:text-stone-900 underline underline-offset-2">{t("return_to_profile")}</button>
                    </p>
                </div>
            </div>
        </div>;
};
export default AccountVerificationPage;