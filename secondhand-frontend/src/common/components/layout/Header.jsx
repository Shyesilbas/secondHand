import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../../../auth/AuthContext.jsx';
import {ROUTES} from '../../constants/routes.js';
import {useNotification} from '../../../notification/NotificationContext.jsx';
import UnifiedSearchBar from '../search/UnifiedSearchBar.jsx';
import HeaderNavLink from './header/HeaderNavLink.jsx';
import HeaderAuthActions from './header/HeaderAuthActions.jsx';
import HeaderGuestActions from './header/HeaderGuestActions.jsx';
import HeaderSpotlight from './header/HeaderSpotlight.jsx';
import {useHeaderScroll} from '../../hooks/useHeaderScroll.js';
import {useDropdownManager} from '../../hooks/useDropdownManager.js';
import {useClickOutside} from '../../hooks/useClickOutside.js';
import {useBadgeCounts} from '../../hooks/useBadgeCounts.js';
import {ShoppingBag, Search, Command} from 'lucide-react';

const Header = () => {
    const { authState: { isAuthenticated, user }, logout } = useAuth();
    const navigate = useNavigate();
    const notification = useNotification();
    const scrolled = useHeaderScroll();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [spotlightOpen, setSpotlightOpen] = useState(false);

    const dropdowns = useDropdownManager();
    const listingsMenuOpen = dropdowns.isOpen('listings');
    const paymentsMenuOpen = dropdowns.isOpen('payments');
    const profileMenuOpen = dropdowns.isOpen('profile');

    const listingsMenuRef = useRef(null);
    const paymentsMenuRef = useRef(null);
    const profileMenuRef = useRef(null);

    useClickOutside(listingsMenuRef, dropdowns.closeAll, listingsMenuOpen);
    useClickOutside(paymentsMenuRef, dropdowns.closeAll, paymentsMenuOpen);
    useClickOutside(profileMenuRef, dropdowns.closeAll, profileMenuOpen);

    const { emailCount, chatCount, cartCount, orderCount } = useBadgeCounts({
        enabled: isAuthenticated,
        userId: user?.id
    });

    const handleLogout = async () => {
        notification.showConfirmation('Sign Out', 'Are you sure you want to exit?', async () => {
            await logout();
            navigate(ROUTES.HOME);
        });
    };

    // ⌘K / Ctrl+K global shortcut
    const handleGlobalKeyDown = useCallback((e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setSpotlightOpen((v) => !v);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, [handleGlobalKeyDown]);

    return (
        <>
            <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
                scrolled
                    ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm'
                    : 'bg-white border-b border-gray-200/40'
            }`}>
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
                    <div className={`flex items-center justify-between gap-4 transition-all duration-300 ${
                        scrolled ? 'h-14' : 'h-16'
                    }`}>

                        {/* ── Logo ─────────────────────────────── */}
                        <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group shrink-0">
                            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-6">
                                <ShoppingBag className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-gray-900 hidden sm:inline">
                                SH<span className="text-gray-400">.</span>
                            </span>
                        </Link>

                        {/* ── Desktop Nav Links ────────────────── */}
                        {isAuthenticated && (
                            <nav className="hidden lg:flex items-center gap-0.5">
                                <HeaderNavLink to={ROUTES.FORUM}>Forum</HeaderNavLink>
                                <HeaderNavLink to={ROUTES.LISTINGS_PREFILTER_CREATE}>Sell</HeaderNavLink>
                                <HeaderNavLink to={ROUTES.LISTINGS_PREFILTER}>Categories</HeaderNavLink>
                            </nav>
                        )}

                        {/* ── Center: Dual Search ──────────────── */}
                        <div className="flex-1 flex items-center justify-center gap-2 max-w-xl">
                            {/* Product/User search */}
                            <div className="hidden md:block flex-1">
                                <UnifiedSearchBar className="w-full" />
                            </div>

                            {/* In-app spotlight trigger */}
                            {isAuthenticated && (
                                <button
                                    type="button"
                                    onClick={() => setSpotlightOpen(true)}
                                    className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/80 text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 shrink-0"
                                    title="Search app (⌘K)"
                                >
                                    <Search className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium text-gray-400">Go to...</span>
                                    <kbd className="hidden lg:inline-flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded border border-gray-200 bg-white text-[10px] font-medium text-gray-400">
                                        <Command className="w-2.5 h-2.5" />K
                                    </kbd>
                                </button>
                            )}
                        </div>

                        {/* ── Right Actions ────────────────────── */}
                        <div className="flex items-center gap-1.5">
                            {isAuthenticated ? (
                                <HeaderAuthActions
                                    user={user}
                                    emailCount={emailCount}
                                    chatCount={chatCount}
                                    cartCount={cartCount}
                                    orderCount={orderCount}
                                    mobileMenuOpen={mobileMenuOpen}
                                    onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    paymentsMenuOpen={paymentsMenuOpen}
                                    listingsMenuOpen={listingsMenuOpen}
                                    profileMenuOpen={profileMenuOpen}
                                    onTogglePaymentsMenu={() => dropdowns.toggle('payments')}
                                    onToggleListingsMenu={() => dropdowns.toggle('listings')}
                                    onToggleProfileMenu={() => dropdowns.toggle('profile')}
                                    closeAllDropdowns={dropdowns.closeAll}
                                    paymentsMenuRef={paymentsMenuRef}
                                    listingsMenuRef={listingsMenuRef}
                                    profileMenuRef={profileMenuRef}
                                    onLogout={handleLogout}
                                />
                            ) : (
                                <HeaderGuestActions />
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Spotlight Modal ───────────────────── */}
            <HeaderSpotlight
                userId={user?.id}
                isOpen={spotlightOpen}
                onClose={() => setSpotlightOpen(false)}
            />
        </>
    );
};

export default Header;
