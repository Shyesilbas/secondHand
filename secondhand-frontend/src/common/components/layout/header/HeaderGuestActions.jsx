import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';

const HeaderGuestActions = () => {
 const { t } = useTranslation();

 return (
 <div className="flex items-center gap-2">
 <Link
 to={ROUTES.LOGIN}
 className="text-xs font-semibold text-secondary-300 hover:text-white px-3.5 py-2 rounded hover:bg-primary-hover/80 transition-all"
 >
 {t('common.login')}
 </Link>
 <Link
 to={ROUTES.REGISTER}
 className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-9 px-3"
 >
 {t('common.register')}
 </Link>
 </div>
 );
};

export default HeaderGuestActions;
