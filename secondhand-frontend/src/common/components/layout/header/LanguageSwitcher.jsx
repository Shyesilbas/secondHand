import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { headerIconTriggerClass } from './HeaderIconButton.jsx';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  const currentLanguage = i18n.language || 'tr';
  const isTr = currentLanguage.startsWith('tr');
  const isEn = currentLanguage.startsWith('en');

  const itemClass = (selected) =>
    `flex cursor-pointer items-center justify-between rounded px-3 py-2 text-sm outline-none transition-colors duration-150 ${
      selected
        ? 'bg-accent-teal-50 font-medium text-accent-teal-800'
        : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary focus:bg-background-secondary'
    }`;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={headerIconTriggerClass(false)}
          aria-label={t('nav.language', 'Dil seçimi')}
          title={t('nav.language', 'Dil seçimi')}
        >
          <Globe className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-tooltip min-w-36 rounded border border-border bg-background-primary p-1 shadow-md"
          sideOffset={8}
          align="end"
        >
          <DropdownMenu.Item onClick={() => changeLanguage('tr')} className={itemClass(isTr)}>
            <span>{t('t_rk_e_tr', 'Türkçe (TR)')}</span>
            {isTr && <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />}
          </DropdownMenu.Item>

          <DropdownMenu.Item onClick={() => changeLanguage('en')} className={`${itemClass(isEn)} mt-0.5`}>
            <span>{t('english_en', 'English (EN)')}</span>
            {isEn && <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default LanguageSwitcher;