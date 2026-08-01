import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const baseClassName = 'flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80 transition-all duration-300 ease-in-out rounded-xl';

const HeaderMenuItem = ({ to, onClick, icon: Icon, label, labelKey, rightContent, compact = false }) => {
    const { t } = useTranslation();
    const className = compact
        ? 'flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50/80 hover:text-text-primary transition-all duration-300 ease-in-out rounded-xl mx-1 cursor-pointer'
        : baseClassName;

    const textToShow = labelKey ? t(labelKey) : (label ? t(label) : '');

    return (
        <Link to={to} onClick={onClick} className={className}>
            <Icon className={compact ? 'w-4 h-4 mr-3' : 'w-4 h-4 text-slate-600'} />
            <span className={compact ? '' : 'text-sm font-medium text-text-primary'}>{textToShow}</span>
            {rightContent}
        </Link>
    );
};

export default HeaderMenuItem;
