import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';
import { buttonClasses } from '../../ui/Button.jsx';

const HeaderGuestActions = () => {
 const { t } = useTranslation();

 return (
 <div className="flex items-center gap-2">
 <Link
 to={ROUTES.LOGIN}
 className="rounded px-3 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-background-tertiary hover:text-text-primary"
 >
 {t('common.login')}
 </Link>
 <Link
 to={ROUTES.REGISTER}
 className={buttonClasses('primary', 'sm')}
 >
 {t('common.register')}
 </Link>
 </div>
 );
};

export default HeaderGuestActions;
