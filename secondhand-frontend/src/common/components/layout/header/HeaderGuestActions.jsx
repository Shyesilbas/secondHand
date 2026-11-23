import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { buttonClasses } from '../../ui/Button.jsx';

const HeaderGuestActions = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1.5">
      <Link to={ROUTES.LOGIN} className={buttonClasses('ghost', 'sm')}>
        {t('common.login', 'Giriş Yap')}
      </Link>
      <Link to={ROUTES.REGISTER} className={buttonClasses('primary', 'sm')}>
        {t('common.register', 'Kayıt Ol')}
      </Link>
    </div>
  );
};

export default HeaderGuestActions;
