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
import { useDropdownManager } from '../../hooks/useDropdownManager.js';
import { useClickOutside } from '../../hooks/useClickOutside.js';
import { useBadgeCounts } from '../../hooks/useBadgeCounts.js';
import { AlertTriangle, Plus } from 'lucide-react';
import BrandMark from './BrandMark.jsx';
import { buttonClasses } from '../ui/Button.jsx';
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
 <div role="status" className="flex items-center justify-center gap-2 border-b border-status-warning-border bg-status-warning-bg px-4 py-1.5 text-center text-xs font-medium text-status-warning-text">
 <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-status-warning-icon" strokeWidth={1.5} aria-hidden />
 <span>{t("account_unverified_bar")}</span>
 <Link to={ROUTES.VERIFY_ACCOUNT} className="ml-1 whitespace-nowrap font-semibold underline underline-offset-2 transition-colors duration-150 hover:text-text-primary">
 {t("verify_now")}
 </Link>
 </div>
 )}
 {/* Fixed height and one bottom border: animating height or border colour on scroll made the line flicker and the page jump. */}
 <header className="sticky top-0 z-dropdown w-full border-b border-border bg-background-primary">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex h-16 items-center justify-between gap-4">

 {/* ── Logo ─────────────────────────────── */}
 <BrandMark />

 {/* ── Desktop Nav Links ────────────────── */}
 {isAuthenticated && <nav className="hidden lg:flex items-center gap-1.5 ml-2">
 <Link to={ROUTES.LISTINGS_PREFILTER} className={buttonClasses('ghost', 'sm')}>
 {t("categories")}
 </Link>
 <Link to={ROUTES.LISTINGS_PREFILTER_CREATE} className={buttonClasses('primary', 'sm')}>
 <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 {t("sell")}
 </Link>
 </nav>}

 {/* ── Center: Dual Search ──────────────── */}
 <div className="hidden md:flex flex-1 items-center justify-center gap-2 max-w-xl">
 {/* Product/User search */}
 <UnifiedSearchBar className="w-full" />
 </div>

 {/* ── Right Actions ────────────────────── */}
 <div className="flex items-center gap-2">
 <LanguageSwitcher />
 {isAuthenticated ? <HeaderAuthActions user={user} emailCount={emailCount} chatCount={chatCount} cartCount={cartCount} orderCount={orderCount} mobileMenuOpen={mobileMenuOpen} onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} paymentsMenuOpen={paymentsMenuOpen} listingsMenuOpen={listingsMenuOpen} profileMenuOpen={profileMenuOpen} inboxMenuOpen={inboxMenuOpen} onTogglePaymentsMenu={() => dropdowns.toggle('payments')} onToggleListingsMenu={() => dropdowns.toggle('listings')} onToggleProfileMenu={() => dropdowns.toggle('profile')} onToggleInboxMenu={() => dropdowns.toggle('inbox')} closeAllDropdowns={dropdowns.closeAll} paymentsMenuRef={paymentsMenuRef} listingsMenuRef={listingsMenuRef} profileMenuRef={profileMenuRef} inboxMenuRef={inboxMenuRef} onLogout={handleLogout} /> : <HeaderGuestActions />}
 </div>
 </div>
 </div>

 {/* ── Mobile Search Row ────────────────── */}
 <div className="md:hidden bg-background-primary">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
 <UnifiedSearchBar className="w-full" />
 </div>
 </div>

 {/* ── Direct Category Navigation SubHeader Bar ────────────────── */}
 <CategorySubHeader />
 </header>
 </>;
};
export default Header;