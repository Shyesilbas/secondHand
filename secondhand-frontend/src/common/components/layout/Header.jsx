import { useTranslation } from "react-i18next";
import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import { useNotification } from '../../../notification/NotificationContext.jsx';
import UnifiedSearchBar from '../search/UnifiedSearchBar.jsx';
import HeaderNavLink from './header/HeaderNavLink.jsx';
import HeaderAuthActions from './header/HeaderAuthActions.jsx';
import HeaderGuestActions from './header/HeaderGuestActions.jsx';
import LanguageSwitcher from './header/LanguageSwitcher.jsx';
import { useHeaderScroll } from '../../hooks/useHeaderScroll.js';
import { useDropdownManager } from '../../hooks/useDropdownManager.js';
import { useClickOutside } from '../../hooks/useClickOutside.js';
import { useBadgeCounts } from '../../hooks/useBadgeCounts.js';
import { AlertTriangle, ShoppingBag } from 'lucide-react';
const Header = () => {
  const {
    t
  } = useTranslation();
  const {
    authState: {
      isAuthenticated,
      user
    },
    logout
  } = useAuth();
  const navigate = useNavigate();
  const notification = useNotification();
  const scrolled = useHeaderScroll();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdowns = useDropdownManager();
  const listingsMenuOpen = dropdowns.isOpen('listings');
  const paymentsMenuOpen = dropdowns.isOpen('payments');
  const profileMenuOpen = dropdowns.isOpen('profile');
  const inboxMenuOpen = dropdowns.isOpen('inbox');
  const listingsMenuRef = useRef(null);
  const paymentsMenuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const inboxMenuRef = useRef(null);
  useClickOutside(listingsMenuRef, dropdowns.closeAll, listingsMenuOpen);
  useClickOutside(paymentsMenuRef, dropdowns.closeAll, paymentsMenuOpen);
  useClickOutside(profileMenuRef, dropdowns.closeAll, profileMenuOpen);
  useClickOutside(inboxMenuRef, dropdowns.closeAll, inboxMenuOpen);
  const {
    emailCount,
    chatCount,
    cartCount,
    orderCount
  } = useBadgeCounts({
    enabled: isAuthenticated,
    userId: user?.id
  });
  const handleLogout = async () => {
    notification.showConfirmation('Sign Out', 'Are you sure you want to exit?', async () => {
      await logout();
      navigate(ROUTES.HOME);
    });
  };
  return <>
            {isAuthenticated && user && user.accountVerified === false && (
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-xs z-50 relative">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{t("account_unverified_bar", "Hesabınız henüz doğrulanmadı. Tüm özellikleri aktif kullanabilmek için e-postanızı doğrulayın.")}</span>
                <Link to={ROUTES.VERIFY_ACCOUNT} className="underline font-black hover:text-amber-100 transition-colors ml-1 whitespace-nowrap">
                  {t("verify_now", "Şimdi Doğrula →")}
                </Link>
              </div>
            )}
            <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm' : 'bg-white/95 backdrop-blur-md border-b border-slate-100'}`}>
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
                    <div className={`flex items-center justify-between gap-4 transition-all duration-300 ${scrolled ? 'h-14' : 'h-16'}`}>

                        {/* ── Logo ─────────────────────────────── */}
                        <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group shrink-0">
                            <div className="w-9 h-9 bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                                <ShoppingBag className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-slate-900 hidden sm:inline font-sans">
                              second<span className="text-emerald-600">Hand</span>
                            </span>
                        </Link>

                        {/* ── Desktop Nav Links ────────────────── */}
                        {isAuthenticated && <nav className="hidden lg:flex items-center gap-1.5 ml-2">
                                <Link to={ROUTES.LISTINGS_PREFILTER} className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all">
                                  {t("categories")}
                                </Link>
                                <Link to={ROUTES.LISTINGS_PREFILTER_CREATE} className="inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-2 rounded-xl shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                                  + {t("sell")}
                                </Link>
                            </nav>}

                        {/* ── Center: Dual Search ──────────────── */}
                        <div className="flex-1 flex items-center justify-center gap-2 max-w-xl">
                            {/* Product/User search */}
                            <div className="hidden md:block flex-1">
                                <UnifiedSearchBar className="w-full" />
                            </div>
                        </div>

                        {/* ── Right Actions ────────────────────── */}
                        <div className="flex items-center gap-2">
                            <LanguageSwitcher />
                            {isAuthenticated ? <HeaderAuthActions user={user} emailCount={emailCount} chatCount={chatCount} cartCount={cartCount} orderCount={orderCount} mobileMenuOpen={mobileMenuOpen} onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} paymentsMenuOpen={paymentsMenuOpen} listingsMenuOpen={listingsMenuOpen} profileMenuOpen={profileMenuOpen} inboxMenuOpen={inboxMenuOpen} onTogglePaymentsMenu={() => dropdowns.toggle('payments')} onToggleListingsMenu={() => dropdowns.toggle('listings')} onToggleProfileMenu={() => dropdowns.toggle('profile')} onToggleInboxMenu={() => dropdowns.toggle('inbox')} closeAllDropdowns={dropdowns.closeAll} paymentsMenuRef={paymentsMenuRef} listingsMenuRef={listingsMenuRef} profileMenuRef={profileMenuRef} inboxMenuRef={inboxMenuRef} onLogout={handleLogout} /> : <HeaderGuestActions />}
                        </div>
                    </div>
                </div>
            </header>
        </>;
};
export default Header;