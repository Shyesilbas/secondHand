import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
const LanguageSwitcher = () => {
  const {
    t,
    i18n
  } = useTranslation();
  const changeLanguage = lng => {
    i18n.changeLanguage(lng);
  };
  const currentLanguage = i18n.language || 'tr';
  return <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50" aria-label={t('nav.language')}>
                    <Globe className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content className="min-w-[150px] bg-background-primary dark:bg-slate-900 rounded-xl shadow-lg border border-border-light dark:border-slate-800 p-1 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2" sideOffset={8} align="end">
                    <DropdownMenu.Item onClick={() => changeLanguage('tr')} className={`
                            flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer outline-none transition-colors
                            ${currentLanguage.startsWith('tr') ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}
                        `}>
                        <span>{t("t_rk_e_tr")}</span>
                        {currentLanguage.startsWith('tr') && <Check className="w-4 h-4" />}
                    </DropdownMenu.Item>
                    
                    <DropdownMenu.Item onClick={() => changeLanguage('en')} className={`
                            flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer outline-none transition-colors mt-1
                            ${currentLanguage.startsWith('en') ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}
                        `}>
                        <span>{t("english_en")}</span>
                        {currentLanguage.startsWith('en') && <Check className="w-4 h-4" />}
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>;
};
export default LanguageSwitcher;