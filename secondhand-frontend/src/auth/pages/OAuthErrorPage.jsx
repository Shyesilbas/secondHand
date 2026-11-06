import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { buttonClasses } from '../../common/components/ui/Button.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
import { AuthBrand, AuthHeader } from '../components/AuthPrimitives.jsx';

/**
 * Google sign-in failed. The text is fixed on purpose: a `message` from the URL could be
 * written by anyone who sends the link, so it is never shown.
 */
const OAuthErrorPage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col">
      <AuthBrand />
      <AuthHeader title={t('auth_oauth_error_title', 'Google ile giriş yapılamadı')} />
      <Alert type="error" message={t('auth_oauth_error_text', 'Giriş tamamlanamadı. Tekrar dene ya da e-posta ve şifrenle giriş yap.')} />
      <Link to={ROUTES.LOGIN} className={`${buttonClasses('primary')} mt-6 w-full`}>
        {t('auth_back_to_login', 'Girişe dön')}
      </Link>
    </div>
  );
};

export default OAuthErrorPage;
