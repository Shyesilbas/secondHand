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
 const currentLanguage = i18n.language || 'en';
 return <DropdownMenu.Root>
 <DropdownMenu.Trigger asChild>
 <button className="p-2 rounded hover:bg-background-tertiary transition-colors focus:outline-none focus-visible:ring-2 focus:ring-border-focus" aria-label={t('nav.language')}>
 <Globe className="w-5 h-5 text-text-secondary" strokeWidth={1.5} />
 </button>
 </DropdownMenu.Trigger>

 <DropdownMenu.Portal>
 <DropdownMenu.Content className="z-tooltip min-w-36 bg-background-primary rounded shadow-md border border-border p-1 data-[side=bottom]:slide-in-from-top-2" sideOffset={8} align="end">
 <DropdownMenu.Item onClick={() => changeLanguage('tr')} className={`flex items-center justify-between px-3 py-2 text-sm rounded cursor-pointer outline-none transition-colors
 ${currentLanguage.startsWith('tr') ? 'bg-background-secondary text-primary-600 font-medium' : 'text-text-secondary hover:bg-background-tertiary'}
 `}>
 <span>{t("t_rk_e_tr")}</span>
 {currentLanguage.startsWith('tr') && <Check className="w-4 h-4" strokeWidth={1.5} />}
 </DropdownMenu.Item>
 
 <DropdownMenu.Item onClick={() => changeLanguage('en')} className={`flex items-center justify-between px-3 py-2 text-sm rounded cursor-pointer outline-none transition-colors mt-1
 ${currentLanguage.startsWith('en') ? 'bg-background-secondary text-primary-600 font-medium' : 'text-text-secondary hover:bg-background-tertiary'}
 `}>
 <span>{t("english_en")}</span>
 {currentLanguage.startsWith('en') && <Check className="w-4 h-4" strokeWidth={1.5} />}
 </DropdownMenu.Item>
 </DropdownMenu.Content>
 </DropdownMenu.Portal>
 </DropdownMenu.Root>;
};
export default LanguageSwitcher;