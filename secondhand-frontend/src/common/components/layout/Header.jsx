import { useTranslation } from "react-i18next";
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { ShoppingBag } from 'lucide-react';
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
            <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm' : 'bg-white border-b border-gray-200/40'}`}>
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
                    <div className={`flex items-center justify-between gap-4 transition-all duration-300 ${scrolled ? 'h-14' : 'h-16'}`}>

                        {/* ── Logo ─────────────────────────────── */}
                        <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group shrink-0">
                            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-6">
                                <ShoppingBag className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-gray-900 hidden sm:inline">{t("sh")}<span className="text-gray-400">.</span>
                            </span>
                        </Link>

                        {/* ── Desktop Nav Links ────────────────── */}
                        {isAuthenticated && <nav className="hidden lg:flex items-center gap-0.5">
                                <HeaderNavLink to={ROUTES.LISTINGS_PREFILTER_CREATE}>{t("sell")}</HeaderNavLink>
                                <HeaderNavLink to={ROUTES.LISTINGS_PREFILTER}>{t("categories")}</HeaderNavLink>
                            </nav>}

                        {/* ── Center: Dual Search ──────────────── */}
                        <div className="flex-1 flex items-center justify-center gap-2 max-w-xl">
                            {/* Product/User search */}
                            <div className="hidden md:block flex-1">
                                <UnifiedSearchBar className="w-full" />
                            </div>
                        </div>

                        {/* ── Right Actions ────────────────────── */}
                        <div className="flex items-center gap-1.5">
                            <LanguageSwitcher />
                            {isAuthenticated ? <HeaderAuthActions user={user} emailCount={emailCount} chatCount={chatCount} cartCount={cartCount} orderCount={orderCount} mobileMenuOpen={mobileMenuOpen} onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} paymentsMenuOpen={paymentsMenuOpen} listingsMenuOpen={listingsMenuOpen} profileMenuOpen={profileMenuOpen} inboxMenuOpen={inboxMenuOpen} onTogglePaymentsMenu={() => dropdowns.toggle('payments')} onToggleListingsMenu={() => dropdowns.toggle('listings')} onToggleProfileMenu={() => dropdowns.toggle('profile')} onToggleInboxMenu={() => dropdowns.toggle('inbox')} closeAllDropdowns={dropdowns.closeAll} paymentsMenuRef={paymentsMenuRef} listingsMenuRef={listingsMenuRef} profileMenuRef={profileMenuRef} inboxMenuRef={inboxMenuRef} onLogout={handleLogout} /> : <HeaderGuestActions />}
                        </div>
                    </div>
                </div>
            </header>
        </>;
};
export default Header;