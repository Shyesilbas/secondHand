import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { ROUTES } from '../../../constants/routes.js';
import HeaderDropdownPanel from './HeaderDropdownPanel.jsx';
import HeaderMenuItem from './HeaderMenuItem.jsx';
import { getProfileMenuItems } from './headerMenuConfig.js';
const HeaderProfileMenu = ({
  user,
  isOpen,
  onToggle,
  onClose,
  onLogout
}) => {
  const {
    t
  } = useTranslation();

  return <>
        <button onClick={onToggle} className="flex items-center gap-2.5 pl-2 group cursor-pointer" type="button">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-border-light/60 flex items-center justify-center overflow-hidden group-hover:border-slate-300/60 transition-all duration-300 ease-in-out">
                {user?.avatar ? <img src={user.avatar} alt={t("profile")} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-600" />}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-slate-700 transition-all duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && <HeaderDropdownPanel className="z-[9999]">
                <div className="px-4 py-3 border-b border-border-light/60">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-tight">{t("account")}</p>
                    <Link to={ROUTES.PROFILE} onClick={onClose} className="text-sm font-semibold text-text-primary truncate tracking-tight block hover:text-slate-600 transition-colors cursor-pointer">
                        {user?.name || 'User'}
                    </Link>
                </div>
                {getProfileMenuItems(user?.id).map(item => <HeaderMenuItem key={item.key} to={item.to} onClick={onClose} icon={item.icon} label={item.label} compact />)}
                <div className="border-t border-border-light/60 my-1" />
                <button onClick={onLogout} type="button" className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-status-error hover:bg-status-error-bg/80 transition-all duration-300 ease-in-out rounded-xl mx-1 cursor-pointer">
                    <LogOut className="w-4 h-4" />{t("sign_out")}</button>
            </HeaderDropdownPanel>}
    </>;
};
export default HeaderProfileMenu;
