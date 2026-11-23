import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const HeaderMenuItem = ({ to, onClick, icon: Icon, label, labelKey, rightContent }) => {
  const { t } = useTranslation();
  const textToShow = labelKey ? t(labelKey) : (label ? t(label) : '');

  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded px-3 py-2 text-sm text-text-secondary transition-colors duration-150 hover:bg-background-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
    >
      <Icon className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
      <span className="min-w-0 flex-1 truncate font-medium text-text-primary">{textToShow}</span>
      {rightContent}
    </Link>
  );
};

export default HeaderMenuItem;
