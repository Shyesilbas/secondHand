import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { passwordService } from '../services/passwordService.js';
import { ROUTES } from '../../common/constants/routes.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import logger from '../../common/utils/logger.js';
import { ChangePasswordRequestDTO } from '../auth.js';
import Button from '../../common/components/ui/Button.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
import { AuthCard, AuthHeader, PasswordField, PasswordRules } from '../components/AuthPrimitives.jsx';
import { getPasswordError } from '../utils/passwordRules.js';

const ChangePasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notification = useNotification();
  const [formData, setFormData] = useState({ ...ChangePasswordRequestDTO });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (submitError) setSubmitError('');
  };

  const validate = () => {
    const next = {};
    if (!formData.currentPassword) next.currentPassword = t('auth_current_password_required', 'Mevcut şifreni gir.');
    const passwordError = getPasswordError(formData.newPassword);
    if (passwordError) next.newPassword = passwordError;
    else if (formData.newPassword === formData.currentPassword) next.newPassword = t('auth_password_same', 'Yeni şifre mevcut şifrenden farklı olmalı.');
    if (!formData.confirmPassword) next.confirmPassword = t('auth_password_repeat_required', 'Yeni şifreni tekrar gir.');
    else if (formData.newPassword !== formData.confirmPassword) next.confirmPassword = t('auth_password_mismatch', 'Şifreler eşleşmiyor.');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await passwordService.changePassword({ currentPassword: formData.currentPassword, newPassword: formData.newPassword });
      notification.showSuccess(t('auth_password_changed_title', 'Şifren güncellendi'), t('auth_password_changed_text', 'Bir sonraki girişte yeni şifreni kullan.'));
      navigate(ROUTES.PROFILE, { replace: true });
    } catch (error) {
      logger.error(error);
      setSubmitError(error.response?.data?.message || t('auth_password_change_failed', 'Şifre değiştirilemedi. Lütfen tekrar dene.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthHeader title={t('auth_change_password_title', 'Şifreni değiştir')} subtitle={t('auth_change_password_subtitle', 'Güvenliğin için mevcut şifreni de soruyoruz.')} />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {submitError && <Alert type="error" message={submitError} />}
        <PasswordField
          label={t('auth_current_password', 'Mevcut şifre')}
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
          autoComplete="current-password"
          autoFocus
        />
        <div>
          <PasswordField
            label={t('auth_new_password', 'Yeni şifre')}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            autoComplete="new-password"
          />
          <div className="mt-2"><PasswordRules password={formData.newPassword} /></div>
        </div>
        <PasswordField
          label={t('auth_new_password_repeat', 'Yeni şifre tekrar')}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
          <Link to={ROUTES.PROFILE} className="inline-flex h-10 items-center justify-center rounded px-4 text-sm font-medium text-text-secondary hover:bg-background-secondary hover:text-text-primary">
            {t('cancel', 'Vazgeç')}
          </Link>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {isLoading ? t('auth_saving', 'Kaydediliyor…') : t('auth_save_password', 'Şifreyi güncelle')}
          </Button>
        </div>
      </form>
    </AuthCard>
  );
};

export default ChangePasswordPage;
