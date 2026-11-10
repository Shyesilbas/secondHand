import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import { authService } from '../services/authService.js';
import { ROUTES } from '../../common/constants/routes.js';
import { LoginRequestDTO } from '../auth.js';
import logger from '../../common/utils/logger.js';
import Button from '../../common/components/ui/Button.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
import { AuthBrand, AuthDivider, AuthField, AuthHeader, GoogleButton, PasswordField } from '../components/AuthPrimitives.jsx';
import { isValidEmail } from '../utils/passwordRules.js';
import { getErrorMessage } from '../../common/utils/errorUtils.js';

const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || ROUTES.HOME;
  const successMessage = location.state?.message;

  const [formData, setFormData] = useState({ ...LoginRequestDTO });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (submitError) setSubmitError('');
  };

  const validate = () => {
    const next = {};
    if (!formData.email.trim()) next.email = t('auth_email_required', 'E-posta adresini gir.');
    else if (!isValidEmail(formData.email)) next.email = t('auth_email_invalid', 'Geçerli bir e-posta adresi gir.');
    if (!formData.password) next.password = t('auth_password_required', 'Şifreni gir.');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const response = await authService.login(formData.email.trim(), formData.password, formData.rememberMe);
      await login(response);
      navigate(from, { replace: true });
    } catch (error) {
      logger.error('Login error:', error);
      setSubmitError(getErrorMessage(error, t('auth_login_failed', 'Giriş yapılamadı. E-posta ve şifreni kontrol et.')));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <AuthBrand />
      <AuthHeader title={t('auth_login_title', 'Giriş yap')} subtitle={t('auth_login_subtitle', 'Hesabına giriş yaparak alışverişe devam et.')} />

      <div className="space-y-4">
        {successMessage && <Alert type="success" message={successMessage} />}
        {submitError && <Alert type="error" message={submitError} />}
      </div>

      <form onSubmit={handleSubmit} noValidate className={`space-y-4 ${successMessage || submitError ? 'mt-6' : ''}`}>
        <AuthField
          label={t('auth_email', 'E-posta')}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="ornek@eposta.com"
          error={errors.email}
          autoComplete="email"
          autoFocus
        />
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium text-text-primary">{t('auth_password', 'Şifre')}</label>
            <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-text-secondary hover:text-text-primary hover:underline">
              {t('auth_forgot_link', 'Şifremi unuttum')}
            </Link>
          </div>
          <PasswordField
            id="login-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
          />
        </div>

        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 rounded-sm border-border text-primary focus:ring-border-focus"
          />
          {t('auth_remember_me', 'Beni hatırla')}
        </label>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {isLoading ? t('auth_signing_in', 'Giriş yapılıyor…') : t('auth_login_submit', 'Giriş yap')}
        </Button>
      </form>

      <AuthDivider />
      <GoogleButton />

      <p className="mt-8 text-center text-sm text-text-secondary">
        {t('auth_no_account', 'Hesabın yok mu?')}{' '}
        <Link to={ROUTES.REGISTER} className="font-medium text-text-primary hover:underline">{t('auth_register_link', 'Kayıt ol')}</Link>
      </p>
    </div>
  );
};

export default LoginPage;
