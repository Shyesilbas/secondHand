import { useTranslation } from "react-i18next";
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import { useNotification } from '../../../notification/NotificationContext.jsx';
import UnifiedSearchBar from '../search/UnifiedSearchBar.jsx';
import HeaderAuthActions from './header/HeaderAuthActions.jsx';
import HeaderGuestActions from './header/HeaderGuestActions.jsx';
import LanguageSwitcher from './header/LanguageSwitcher.jsx';
import CategorySubHeader from './header/CategorySubHeader.jsx';
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
 <div className="bg-status-warning text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 z-50 relative">
 <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
 <span>{t("account_unverified_bar")}</span>
 <Link to={ROUTES.VERIFY_ACCOUNT} className="underline font-semibold hover:text-status-warning transition-colors ml-1 whitespace-nowrap">
 {t("verify_now")}
 </Link>
 </div>
 )}
 <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-background-primary border-b border-border' : 'bg-background-primary border-b border-border-light'}`}>
 <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
 <div className={`flex items-center justify-between gap-4 transition-all duration-300 ${scrolled ? 'h-14' : 'h-16'}`}>

 {/* ── Logo ─────────────────────────────── */}
 <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group shrink-0">
 <ShoppingBag className="h-5 w-5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 <span className="text-xl font-semibold tracking-tight text-text-primary hidden sm:inline font-sans">
 second<span className="text-text-tertiary">Hand</span>
 </span>
 </Link>

 {/* ── Desktop Nav Links ────────────────── */}
 {isAuthenticated && <nav className="hidden lg:flex items-center gap-1.5 ml-2">
 <Link to={ROUTES.LISTINGS_PREFILTER} className="text-sm font-semibold text-text-secondary hover:text-text-primary px-3 py-1.5 rounded hover:bg-background-tertiary transition-all">
 {t("categories")}
 </Link>
 <Link to={ROUTES.LISTINGS_PREFILTER_CREATE} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-9 px-3">
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

 {/* ── Direct Category Navigation SubHeader Bar ────────────────── */}
 <CategorySubHeader />
 </header>
 </>;
};
export default Header;