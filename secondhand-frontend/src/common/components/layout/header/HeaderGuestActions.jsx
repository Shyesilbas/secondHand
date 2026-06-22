import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';

const HeaderGuestActions = () => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-2">
            <Link
                to={ROUTES.LOGIN}
                className="text-sm font-medium text-text-secondary hover:text-text-primary px-3.5 py-2 rounded-lg hover:bg-secondary transition-all duration-200"
            >
                {t('common.login')}
            </Link>
            <Link
                to={ROUTES.REGISTER}
                className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-all duration-200 shadow-sm"
            >
                {t('common.register')}
            </Link>
        </div>
    );
};

export default HeaderGuestActions;
