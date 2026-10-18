import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, User, Crown } from 'lucide-react';
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
 const { t } = useTranslation();
 const { isPremium } = usePlan();
 const [showUpgrade, setShowUpgrade] = useState(false);

 const isUnverified = Boolean(user && user.accountVerified === false);

 return (
 <>
 <button onClick={onToggle} className="flex items-center gap-2.5 pl-2 group cursor-pointer" type="button">
 <div className="relative">
 <div className={`w-9 h-9 rounded-full bg-background-tertiary border flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out ${isUnverified ? 'border-status-warning ring-2 ring-status-warning/20' : 'border-border-light/60 group-hover:border-card-border-hover/60'}`}>
 {user?.avatar ? (
 <img src={user.avatar} alt={t("profile")} className="w-full h-full object-cover" />
 ) : (
 <User className="w-5 h-5 text-text-secondary" />
 )}
 </div>

 {/* Premium Badge */}
 {isPremium && (
 <div className="absolute -top-1 -right-1.5 h-4 w-4 rounded bg-status-warning border border-white flex items-center justify-center shadow-sm">
 <Crown className="h-2.5 w-2.5 text-white" />
 </div>
 )}

 {/* Account Unverified Exclamation Badge */}
 {isUnverified && (
 <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded bg-status-warning border-2 border-white flex items-center justify-center shadow-md">
 <span className="text-xs font-semibold text-white leading-none">!</span>
 </div>
 )}
 </div>
 <ChevronDown className={`w-4 h-4 text-text-tertiary group-hover:text-text-secondary transition-all duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`} />
 </button>

 {isOpen && (
 <HeaderDropdownPanel className="z-tooltip">
 <div className="px-4 py-3 border-b border-border-light">
 <p className="text-xs font-medium text-text-tertiary tracking-tight">{t("account")}</p>
 <Link to={ROUTES.PROFILE} onClick={onClose} className="text-sm font-semibold text-text-primary truncate tracking-tight block hover:text-text-secondary transition-colors cursor-pointer flex items-center gap-1.5">
 {user?.name || 'User'}
 {isPremium && <Crown className="h-3.5 w-3.5 text-status-warning shrink-0" aria-label={t("premium_member")} />}
 </Link>
 </div>

 {/* Prominent Verification Callout Banner if Unverified */}
 {isUnverified && (
 <Link
 to={ROUTES.VERIFY_ACCOUNT}
 onClick={onClose}
 className="mx-2 my-2 p-3 rounded bg-background-secondary border border-border/90 flex items-center gap-3 hover:bg-background-secondary transition-all group cursor-pointer"
 >
 <div className="w-8 h-8 rounded bg-status-warning text-white flex items-center justify-center shrink-0 font-semibold text-sm">
 !
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-1.5">
 <p className="text-xs font-semibold text-status-warning-text leading-tight">{t("verify_account")}</p>
 <span className="w-2 h-2 rounded-full bg-status-warning inline-block" />
 </div>
 <p className="text-xs font-medium text-status-warning-text truncate mt-0.5">
 {t("verify_account_desc")}
 </p>
 </div>
 </Link>
 )}

 {getProfileMenuItems(user?.id).map(item => (
 <HeaderMenuItem key={item.key} to={item.to} onClick={onClose} icon={item.icon} labelKey={item.labelKey} label={item.label} compact />
 ))}
 
 <div className="border-t border-border-light my-1" />

 {!isPremium && (
 <div className="px-2 py-1.5 bg-background-secondary border border-border-light rounded mx-2 my-1">
 <button
 onClick={() => setShowUpgrade(true)}
 className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-9 px-3 w-full">
 <span className="flex items-center gap-1.5">
 <Crown className="h-3.5 w-3.5 text-status-warning" />
 {t('upgrade_to_premium', "Premium'a Geç")}
 </span>
 <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded font-semibold">{t("upgrade_badge")}</span>
 </button>
 </div>
 )}

 <button onClick={onLogout} type="button" className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-status-error-text hover:bg-background-secondary transition-all duration-300 ease-in-out rounded mx-1 cursor-pointer font-medium">
 <LogOut className="w-4 h-4" />{t("sign_out")}</button>
 </HeaderDropdownPanel>
 )}

 <PremiumUpgradeModal
 isOpen={showUpgrade}
 onClose={() => setShowUpgrade(false)}
 />
 </>
 );
};

export default HeaderProfileMenu;
