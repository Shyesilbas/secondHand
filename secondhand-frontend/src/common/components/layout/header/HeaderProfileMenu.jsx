import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, User, Crown } from 'lucide-react';
import { useState } from 'react';
import { usePlan } from '@/common/hooks/usePlan';
import PremiumUpgradeModal from '@/common/components/ui/PremiumUpgradeModal';
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

  const { isPremium } = usePlan();
  const [showUpgrade, setShowUpgrade] = useState(false);

  return <>
        <button onClick={onToggle} className="flex items-center gap-2.5 pl-2 group cursor-pointer" type="button">
            <div className="relative">
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-border-light/60 flex items-center justify-center overflow-hidden group-hover:border-slate-300/60 transition-all duration-300 ease-in-out">
                    {user?.avatar ? <img src={user.avatar} alt={t("profile")} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-600" />}
                </div>
                {isPremium && (
                  <div className="absolute -top-1 -right-1.5 h-4 w-4 rounded-full bg-accent-amber-500 border border-white flex items-center justify-center shadow-sm">
                    <Crown className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-slate-700 transition-all duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && <HeaderDropdownPanel className="z-[9999]">
                <div className="px-4 py-3 border-b border-border-light/60">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-tight">{t("account")}</p>
                    <Link to={ROUTES.PROFILE} onClick={onClose} className="text-sm font-semibold text-text-primary truncate tracking-tight block hover:text-slate-600 transition-colors cursor-pointer flex items-center gap-1.5">
                        {user?.name || 'User'}
                        {isPremium && <Crown className="h-3.5 w-3.5 text-accent-amber-500 shrink-0" aria-label="Premium üye" />}
                    </Link>
                </div>
                {getProfileMenuItems(user?.id).map(item => <HeaderMenuItem key={item.key} to={item.to} onClick={onClose} icon={item.icon} label={item.label} compact />)}
                <div className="border-t border-border-light/60 my-1" />
                {!isPremium && (
                  <div className="px-2 py-1.5 bg-background-secondary border border-border-light rounded-xl mx-2 my-1">
                    <button
                      onClick={() => setShowUpgrade(true)}
                      className="flex w-full items-center justify-between px-3 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-hover transition-all duration-200 rounded-lg cursor-pointer shadow-sm active:scale-97">
                      <span className="flex items-center gap-1.5">
                        <Crown className="h-3.5 w-3.5" />
                        Premium'a Geç
                      </span>
                      <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded uppercase font-extrabold tracking-wider">YÜKSELT</span>
                    </button>
                  </div>
                )}
                <button onClick={onLogout} type="button" className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-status-error hover:bg-status-error-bg/80 transition-all duration-300 ease-in-out rounded-xl mx-1 cursor-pointer">
                    <LogOut className="w-4 h-4" />{t("sign_out")}</button>
            </HeaderDropdownPanel>}
            <PremiumUpgradeModal
              isOpen={showUpgrade}
              onClose={() => setShowUpgrade(false)}
            />
    </>;
};
export default HeaderProfileMenu;
