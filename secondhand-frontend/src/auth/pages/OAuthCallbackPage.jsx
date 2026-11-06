import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';

/** Passes the provider's query string on to the completion page. */
const OAuthCallbackPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(ROUTES.AUTH_COMPLETE + window.location.search, { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-text-secondary" role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {t('auth_signing_in', 'Giriş yapılıyor…')}
    </div>
  );
};

export default OAuthCallbackPage;
