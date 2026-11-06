import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { authService } from '../services/authService.js';
import { ROUTES } from '../../common/constants/routes.js';
import { OTP_CODE_LENGTH } from '../../common/constants/otp.js';
import Button from '../../common/components/ui/Button.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
import OtpDigitInputGroup from '../../payments/components/verification/OtpDigitInputGroup.jsx';
import { AuthBrand, AuthField, AuthHeader, PasswordField, PasswordRules } from '../components/AuthPrimitives.jsx';
import { getPasswordError, isValidEmail } from '../utils/passwordRules.js';

const SubmitLabel = ({ loading, loadingText, children }) => (
  <>
    {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
    {loading ? loadingText : children}
  </>
);

/**
 * Step 1 asks for the email and requests a code. Step 2 takes the 6-digit code from the email
 * and the new password. The backend answers the same whether or not the email exists.
 */
const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const requestCode = async () => {
    await authService.forgotPassword(email.trim());
    setCodeSent(true);
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setErrors({ email: t('auth_email_required', 'E-posta adresini gir.') });
    if (!isValidEmail(email)) return setErrors({ email: t('auth_email_invalid', 'Geçerli bir e-posta adresi gir.') });
    setErrors({});
    setSubmitError('');
    setIsLoading(true);
    try {
      await requestCode();
    } catch (error) {
      setSubmitError(error.response?.data?.message || t('auth_reset_request_failed', 'Kod gönderilemedi. Lütfen tekrar dene.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setSubmitError('');
    try {
      await requestCode();
    } catch (error) {
      setSubmitError(error.response?.data?.message || t('auth_reset_request_failed', 'Kod gönderilemedi. Lütfen tekrar dene.'));
    } finally {
      setIsResending(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const next = {};
    if (code.length !== OTP_CODE_LENGTH) next.code = t('auth_code_incomplete', 'E-postandaki 6 haneli kodu gir.');
    const passwordError = getPasswordError(passwords.newPassword);
    if (passwordError) next.newPassword = passwordError;
    if (!passwords.confirmPassword) next.confirmPassword = t('auth_password_repeat_required', 'Yeni şifreni tekrar gir.');
    else if (passwords.newPassword !== passwords.confirmPassword) next.confirmPassword = t('auth_password_mismatch', 'Şifreler eşleşmiyor.');
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitError('');
    setIsLoading(true);
    try {
      await authService.resetPassword({ email: email.trim(), verificationCode: code, ...passwords });
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { message: t('auth_reset_done', 'Şifren güncellendi. Yeni şifrenle giriş yapabilirsin.') }
      });
    } catch (error) {
      setSubmitError(error.response?.data?.message || t('auth_reset_failed', 'Şifre güncellenemedi. Kodu kontrol edip tekrar dene.'));
    } finally {
      setIsLoading(false);
    }
  };

  const setPassword = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const backToLogin = (
    <Link to={ROUTES.LOGIN} className="mt-8 inline-flex items-center gap-1.5 self-center text-sm text-text-secondary hover:text-text-primary">
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      {t('auth_back_to_login', 'Girişe dön')}
    </Link>
  );

  if (!codeSent) {
    return (
      <div className="flex flex-col">
        <AuthBrand />
        <AuthHeader
          title={t('auth_forgot_title', 'Şifreni sıfırla')}
          subtitle={t('auth_forgot_subtitle', 'Hesabının e-posta adresini gir, sana 6 haneli bir kod gönderelim.')}
        />
        <form onSubmit={handleRequest} noValidate className="space-y-4">
          {submitError && <Alert type="error" message={submitError} />}
          <AuthField
            label={t('auth_email', 'E-posta')}
            type="email"
            name="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({}); }}
            placeholder="ornek@eposta.com"
            error={errors.email}
            autoComplete="email"
            autoFocus
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            <SubmitLabel loading={isLoading} loadingText={t('auth_sending', 'Gönderiliyor…')}>
              {t('auth_send_code', 'Kod gönder')}
            </SubmitLabel>
          </Button>
        </form>
        {backToLogin}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <AuthBrand />
      <AuthHeader title={t('auth_reset_title', 'Yeni şifre belirle')}>
        <p className="mt-2 text-sm text-text-secondary">
          {t('auth_reset_sent_to', 'Hesabın varsa kodu şu adrese gönderdik:')}{' '}
          <span className="font-medium text-text-primary">{email.trim()}</span>{' '}
          <button
            type="button"
            onClick={() => { setCodeSent(false); setCode(''); setErrors({}); setSubmitError(''); }}
            className="text-text-secondary underline hover:text-text-primary"
          >
            {t('auth_change', 'Değiştir')}
          </button>
        </p>
      </AuthHeader>

      <form onSubmit={handleReset} noValidate className="space-y-5">
        {submitError && <Alert type="error" message={submitError} />}

        <div>
          <p className="mb-2 text-sm font-medium text-text-primary">{t('auth_code', 'Doğrulama kodu')}</p>
          <OtpDigitInputGroup value={code} onChange={(v) => { setCode(v); if (errors.code) setErrors(prev => ({ ...prev, code: '' })); }} dataSlotPrefix="reset" />
          {errors.code && <p className="mt-1.5 text-xs text-status-error-text">{errors.code}</p>}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="mt-2 text-sm text-text-secondary underline hover:text-text-primary disabled:no-underline disabled:opacity-50"
          >
            {isResending ? t('auth_sending', 'Gönderiliyor…') : t('auth_resend_code', 'Kodu tekrar gönder')}
          </button>
        </div>

        <div>
          <PasswordField
            label={t('auth_new_password', 'Yeni şifre')}
            name="newPassword"
            value={passwords.newPassword}
            onChange={setPassword}
            error={errors.newPassword}
            autoComplete="new-password"
          />
          <div className="mt-2"><PasswordRules password={passwords.newPassword} /></div>
        </div>
        <PasswordField
          label={t('auth_new_password_repeat', 'Yeni şifre tekrar')}
          name="confirmPassword"
          value={passwords.confirmPassword}
          onChange={setPassword}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          <SubmitLabel loading={isLoading} loadingText={t('auth_saving', 'Kaydediliyor…')}>
            {t('auth_save_password', 'Şifreyi güncelle')}
          </SubmitLabel>
        </Button>
      </form>
      {backToLogin}
    </div>
  );
};

export default ForgotPasswordPage;
