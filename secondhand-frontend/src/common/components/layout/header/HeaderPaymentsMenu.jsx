import { useTranslation } from 'react-i18next';
import { Receipt } from 'lucide-react';
import HeaderDropdownPanel from './HeaderDropdownPanel.jsx';
import HeaderMenuItem from './HeaderMenuItem.jsx';
import { headerIconTriggerClass } from './HeaderIconButton.jsx';
import { getPaymentsMenuItems } from './headerMenuConfig.js';

const HeaderPaymentsMenu = ({
  isOpen,
  onToggle,
  onClose
}) => {
  const { t } = useTranslation();

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        title={t('payments', 'Ödemeler')}
        aria-label={t('payments_menu', 'Ödemeler menüsü')}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={headerIconTriggerClass(isOpen)}
      >
        <Receipt className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      </button>

      {isOpen && (
        <HeaderDropdownPanel>
          {getPaymentsMenuItems().map((item) => (
            <HeaderMenuItem
              key={item.to}
              to={item.to}
              onClick={onClose}
              icon={item.icon}
              labelKey={item.labelKey}
              label={item.label}
            />
          ))}
        </HeaderDropdownPanel>
      )}
    </>
  );
};

export default HeaderPaymentsMenu;
