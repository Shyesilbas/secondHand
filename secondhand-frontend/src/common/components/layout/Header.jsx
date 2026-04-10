import React, {useRef, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../../../auth/AuthContext.jsx';
import {ROUTES} from '../../constants/routes.js';
import {useNotification} from '../../../notification/NotificationContext.jsx';
import UnifiedSearchBar from '../search/UnifiedSearchBar.jsx';
import HeaderNavLink from './header/HeaderNavLink.jsx';
import HeaderAuthActions from './header/HeaderAuthActions.jsx';
import HeaderGuestActions from './header/HeaderGuestActions.jsx';
import {useHeaderScroll} from '../../hooks/useHeaderScroll.js';
import {useDropdownManager} from '../../hooks/useDropdownManager.js';
import {useClickOutside} from '../../hooks/useClickOutside.js';
import {useBadgeCounts} from '../../hooks/useBadgeCounts.js';
import { ShoppingBag } from 'lucide-react';

const Header = () => {
    const { authState: { isAuthenticated, user }, logout } = useAuth();
    const navigate = useNavigate();
    const notification = useNotification();
    const scrolled = useHeaderScroll();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [inAppNotificationCenterOpen, setInAppNotificationCenterOpen] = useState(false);

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

    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-300 ease-in-out ${
            scrolled ? "bg-white/80 backdrop-blur-2xl border-b border-slate-200/30 py-2 shadow-sm" : "bg-white/70 backdrop-blur-2xl border-b border-slate-200/20 py-4"
        }`}>
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                <div className="flex items-center justify-between gap-8">

                    {/* Logo */}
                    <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group flex-shrink-0">
                        <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                            <ShoppingBag className="w-5 h-5 text-white stroke-[2.5px]" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900">
                            SH<span className="text-gray-500">.</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    {isAuthenticated && (
                        <nav className="hidden lg:flex items-center gap-1">
                            <HeaderNavLink to={ROUTES.FORUM}>Forum</HeaderNavLink>
                            <HeaderNavLink to={ROUTES.CREATE_LISTING}>Sell</HeaderNavLink>
                            <HeaderNavLink to={ROUTES.LISTINGS_PREFILTER}>Categories</HeaderNavLink>
                        </nav>
                    )}

                    {/* Search Bar */}
                    <div className="hidden md:block flex-1 max-w-md">
                        <UnifiedSearchBar className="w-full bg-gray-50 border border-gray-200 rounded-xl" />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {isAuthenticated ? (
                            <HeaderAuthActions
                                user={user}
                                emailCount={emailCount}
                                chatCount={chatCount}
                                cartCount={cartCount}
                                orderCount={orderCount}
                                mobileMenuOpen={mobileMenuOpen}
                                onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
                                inAppNotificationCenterOpen={inAppNotificationCenterOpen}
                                onToggleNotificationCenter={() => setInAppNotificationCenterOpen(!inAppNotificationCenterOpen)}
                                onCloseNotificationCenter={() => setInAppNotificationCenterOpen(false)}
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
    );
};

export default Header;