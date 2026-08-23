import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';

const HeaderGuestActions = () => {
 const { t } = useTranslation();

 return (
 <div className="flex items-center gap-2">
 <Link
 to={ROUTES.LOGIN}
 className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-800/80 transition-all"
 >
 {t('common.login')}
 </Link>
 <Link
 to={ROUTES.REGISTER}
 className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl shadow-md shadow-slate-900/10 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
 >
 {t('common.register')}
 </Link>
 </div>
 );
};

export default HeaderGuestActions;
