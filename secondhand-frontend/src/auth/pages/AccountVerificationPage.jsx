import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { verificationService } from '../services/verificationService.js';
import logger from '../../common/utils/logger.js';
import { ROUTES } from '../../common/constants/routes.js';
import { OTP_CODE_LENGTH } from '../../common/constants/otp.js';
import Button from '../../common/components/ui/Button.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
import OtpDigitInputGroup from '../../payments/components/verification/OtpDigitInputGroup.jsx';
import { AuthCard, AuthHeader } from '../components/AuthPrimitives.jsx';
import { getErrorMessage } from '../../common/utils/errorUtils.js';

const RESEND_COOLDOWN_S = 60;

/** Sends a 6-digit code to the account email and verifies it. */
const AccountVerificationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authState: { user }, updateUser } = useAuth();
  const notification = useNotification();
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.accountVerified) navigate(ROUTES.PROFILE, { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendCode = async () => {
    setIsSending(true);
    setError('');
    try {
      await verificationService.sendVerificationCode();
      setCodeSent(true);
      setCode('');
      setCountdown(RESEND_COOLDOWN_S);
    } catch (err) {
      logger.error(err);
      setError(getErrorMessage(err, t('auth_verify_send_failed', 'Kod gönderilemedi. Lütfen tekrar dene.')));
    } finally {
      setIsSending(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    if (code.length !== OTP_CODE_LENGTH) {
      setError(t('auth_code_incomplete', 'E-postandaki 6 haneli kodu gir.'));
      return;
    }
    setIsVerifying(true);
    setError('');
    try {
      await verificationService.verify({ code });
      updateUser({ accountVerified: true });
      notification.showSuccess(t('auth_verified_title', 'Hesabın doğrulandı'), t('auth_verified_text', 'Artık tüm özellikleri kullanabilirsin.'));
      navigate(ROUTES.PROFILE, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, t('auth_verify_failed', 'Kod doğrulanamadı. Kodu kontrol edip tekrar dene.')));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AuthCard>
      <AuthHeader
        title={t('auth_verify_title', 'Hesabını doğrula')}
        subtitle={codeSent
          ? t('auth_verify_sent', { defaultValue: '6 haneli kodu {{email}} adresine gönderdik. Kod 10 dakika geçerli.', email: user?.email })
          : t('auth_verify_intro', { defaultValue: 'Satış yapabilmek ve güvenle alışveriş için e-posta adresini doğrula: {{email}}', email: user?.email })}
      />

      {error && <div className="mb-5"><Alert type="error" message={error} /></div>}

      {!codeSent ? (
        <Button className="w-full" onClick={sendCode} disabled={isSending}>
          {isSending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {isSending ? t('auth_sending', 'Gönderiliyor…') : t('auth_send_code', 'Kod gönder')}
        </Button>
      ) : (
        <form onSubmit={verify} className="space-y-5">
          <OtpDigitInputGroup value={code} onChange={(v) => { setCode(v); if (error) setError(''); }} dataSlotPrefix="verify" />
          <Button type="submit" className="w-full" disabled={isVerifying || code.length !== OTP_CODE_LENGTH}>
            {isVerifying && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {isVerifying ? t('auth_verifying', 'Doğrulanıyor…') : t('auth_verify_submit', 'Doğrula')}
          </Button>
          <p className="text-center text-sm text-text-secondary">
            {countdown > 0 ? (
              <span className="tabular-nums">{t('auth_resend_in', { defaultValue: '{{s}} sn sonra yeni kod isteyebilirsin', s: countdown })}</span>
            ) : (
              <button type="button" onClick={sendCode} disabled={isSending} className="underline hover:text-text-primary disabled:opacity-50">
                {t('auth_resend_code', 'Kodu tekrar gönder')}
              </button>
            )}
          </p>
        </form>
      )}

      <div className="mt-6 border-t border-border-light pt-4 text-center">
        <Link to={ROUTES.PROFILE} className="text-sm text-text-secondary hover:text-text-primary">
          {t('auth_verify_later', 'Daha sonra')}
        </Link>
      </div>
    </AuthCard>
  );
};

export default AccountVerificationPage;
