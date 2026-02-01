import React, {useEffect, useRef, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../../../auth/AuthContext.jsx';
import {ROUTES} from '../../constants/routes.js';
import {useNotification} from '../../../notification/NotificationContext.jsx';
import {useInAppNotificationsContext} from '../../../notification/InAppNotificationContext.jsx';
import NotificationBadge from '../../../notification/components/NotificationBadge.jsx';
import NotificationCenter from '../../../notification/components/NotificationCenter.jsx';
import UnifiedSearchBar from '../search/UnifiedSearchBar.jsx';
import {useTotalUnreadCount} from '../../../chat/hooks/useUnreadCount.js';
import {useListingStatistics} from '../../../listing/hooks/useListingStatistics.js';
import {useEnums} from '../../hooks/useEnums.js';
import {usePendingCompletionOrders} from '../../../order/hooks/useOrderFlow.js';
import {useCart} from '../../../cart/hooks/useCart.js';
import {useQuery} from '@tanstack/react-query';
import {emailService} from '../../../emails/services/emailService.js';
import {
    ChevronDown,
    Heart,
    LogOut,
    Mail,
    Menu,
    MessageSquare,
    Package,
    Receipt,
    Settings,
    ShoppingBag,
    Sparkles,
    TrendingUp,
    User,
    X
} from 'lucide-react';

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const notification = useNotification();
    const location = useLocation();

    const { cartCount } = useCart({
        loadCartItems: true,
        enabled: isAuthenticated
    });

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
    const [inAppNotificationCenterOpen, setInAppNotificationCenterOpen] = useState(false);
    const [listingsMenuOpen, setListingsMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const categoriesMenuRef = useRef(null);
    const listingsMenuRef = useRef(null);
    const profileMenuRef = useRef(null);

    const { totalUnread } = useTotalUnreadCount({ enabled: isAuthenticated });
    
    const { data: unreadEmailCount = 0 } = useQuery({
        queryKey: ['emails', 'unread-count', user?.id],
        queryFn: () => emailService.getUnreadCount(),
        enabled: !!isAuthenticated && !!user?.id,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchInterval: false,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
    });
    const { countsByCategory } = useListingStatistics();
    const { enums, getListingTypeLabel, getListingTypeIcon } = useEnums();
    const { hasPendingOrders } = usePendingCompletionOrders({ enabled: isAuthenticated });
    const inAppNotifications = useInAppNotificationsContext();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoriesMenuRef.current && !categoriesMenuRef.current.contains(event.target)) setCategoriesMenuOpen(false);
            if (listingsMenuRef.current && !listingsMenuRef.current.contains(event.target)) setListingsMenuOpen(false);
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setProfileMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        notification.showConfirmation('Sign Out', 'Are you sure you want to exit?', async () => {
            await logout();
            navigate(ROUTES.HOME);
        });
    };

    const NavLink = ({ to, children }) => (
        <Link
            to={to}
            className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/50 transition-all duration-300 ease-in-out px-4 py-2.5 rounded-xl"
        >
            {children}
        </Link>
    );

    const IconButton = ({ to, icon: Icon, badge, onClick, title }) => (
        <Link
            to={to}
            onClick={onClick}
            title={title}
            className="group relative p-2.5 text-slate-600 hover:text-slate-900 transition-all duration-300 ease-in-out rounded-xl hover:bg-slate-100/50"
        >
            <Icon className="w-[20px] h-[20px] stroke-[1.5px]" />
            {badge > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-semibold text-white bg-red-500 rounded-full border-2 border-white shadow-sm shadow-red-500/30">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </Link>
    );

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
                            <NavLink to={ROUTES.LISTINGS}>Marketplace</NavLink>
                            <NavLink to={ROUTES.CREATE_LISTING}>Sell</NavLink>
                            <div className="h-4 w-[1px] bg-gray-300 mx-2" />

                            {/* Categories Dropdown */}
                            <div className="relative" ref={categoriesMenuRef}>
                                <button
                                    onClick={() => setCategoriesMenuOpen(!categoriesMenuOpen)}
                                    className={`text-sm font-medium px-4 py-2.5 flex items-center gap-1.5 transition-all duration-300 ease-in-out rounded-xl ${
                                        categoriesMenuOpen ? 'text-slate-900 bg-slate-100/50' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/50'
                                    }`}
                                >
                                    Categories
                                    <ChevronDown className={`w-4 h-4 opacity-60 transition-all duration-300 ease-in-out ${categoriesMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {categoriesMenuOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 p-2 z-50 max-h-[500px] overflow-y-auto">
                                        {enums?.listingTypes?.map((category) => {
                                            const count = countsByCategory[category.value] ?? 0;
                                            const iconText = getListingTypeIcon(category.value, enums?.listingTypes);
                                            return (
                                                <Link
                                                    key={category.value}
                                                    to={ROUTES.LISTINGS}
                                                    state={{ listingType: category.value }}
                                                    onClick={() => setCategoriesMenuOpen(false)}
                                                    className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/80 transition-all duration-300 ease-in-out rounded-xl group"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-base">{iconText}</span>
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-900 truncate">
                                                            {getListingTypeLabel(category.value, enums?.listingTypes) || category.label}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-500 ml-3">{count}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </nav>
                    )}

                    {/* Search Bar */}
                    {isAuthenticated && (
                        <div className="hidden md:block flex-1 max-w-md">
                            <UnifiedSearchBar className="w-full bg-gray-50 border border-gray-200 rounded-xl" />
                        </div>
                    )}

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {isAuthenticated ? (
                            <>
                                <div className="flex items-center gap-1 mr-2">
                                    <div className="relative">
                                        <NotificationBadge
                                            onClick={() => setInAppNotificationCenterOpen(!inAppNotificationCenterOpen)}
                                        />
                                        <NotificationCenter
                                            isOpen={inAppNotificationCenterOpen}
                                            onClose={() => setInAppNotificationCenterOpen(false)}
                                        />
                                    </div>

                                    <div className="h-6 w-[1px] bg-gray-300 mx-1" />

                                    <IconButton to={ROUTES.EMAILS} icon={Mail} badge={unreadEmailCount} title="Mails" />
                                    <IconButton to={ROUTES.CHAT} icon={MessageSquare} badge={totalUnread} title="Chats" />
                                    <IconButton to={ROUTES.FAVORITES} icon={Heart} title="Favorites" />
                                    <IconButton to={ROUTES.SHOPPING_CART} icon={ShoppingBag} badge={cartCount} title="Cart" />
                                    <IconButton to={ROUTES.PAYMENTS} icon={Receipt} title="Payment History" />

                                    {/* Listings & Orders Dropdown */}
                                    <div className="relative" ref={listingsMenuRef}>
                                        <button
                                            onClick={() => setListingsMenuOpen(!listingsMenuOpen)}
                                            className="group relative p-2.5 text-slate-600 hover:text-slate-900 transition-all duration-300 ease-in-out rounded-xl hover:bg-slate-100/50"
                                        >
                                            <Package className="w-[20px] h-[20px] stroke-[1.5px]" />
                                            {hasPendingOrders && (
                                                <span className="absolute top-1 right-1 flex h-2.5 w-2.5 bg-red-500 rounded-full border border-white shadow-sm shadow-red-500/30"></span>
                                            )}
                                        </button>

                                        {listingsMenuOpen && (
                                            <div className="absolute top-full right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 p-2 z-50">
                                                <Link to={ROUTES.MY_ORDERS} onClick={() => setListingsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80 transition-all duration-300 ease-in-out rounded-xl">
                                                    <Receipt className="w-4 h-4 text-slate-600" />
                                                    <span className="text-sm font-medium text-slate-900">My Orders</span>
                                                    {hasPendingOrders && <span className="ml-auto text-[10px] font-semibold bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full shadow-sm shadow-red-500/30">!</span>}
                                                </Link>
                                                <Link to={ROUTES.I_SOLD} onClick={() => setListingsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80 transition-all duration-300 ease-in-out rounded-xl">
                                                    <TrendingUp className="w-4 h-4 text-slate-600" />
                                                    <span className="text-sm font-medium text-slate-900">I Sold</span>
                                                </Link>
                                                <Link to={ROUTES.MY_LISTINGS} onClick={() => setListingsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80 transition-all duration-300 ease-in-out rounded-xl">
                                                    <Package className="w-4 h-4 text-slate-600" />
                                                    <span className="text-sm font-medium text-slate-900">My Listings</span>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="h-8 w-[1px] bg-gray-300 mx-2 hidden sm:block" />

                                <div className="relative" ref={profileMenuRef}>
                                    <button
                                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                        className="flex items-center gap-2.5 pl-2 group cursor-pointer"
                                        type="button"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/60 flex items-center justify-center overflow-hidden group-hover:border-slate-300/60 transition-all duration-300 ease-in-out">
                                            {user?.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-600" />}
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-slate-700 transition-all duration-300 ease-in-out ${profileMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {profileMenuOpen && (
                                        <div className="absolute top-full right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 p-2 z-[9999]">
                                            <div className="px-4 py-3 border-b border-slate-200/60">
                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-tight">Account</p>
                                                <Link
                                                    to={ROUTES.PROFILE}
                                                    onClick={() => setProfileMenuOpen(false)}
                                                    className="text-sm font-semibold text-slate-900 truncate tracking-tight block hover:text-slate-600 transition-colors cursor-pointer"
                                                >
                                                    {user?.name || 'User'}
                                                </Link>
                                            </div>
                                            <Link
                                                to={ROUTES.DASHBOARD}
                                                onClick={() => setProfileMenuOpen(false)}
                                                className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50/80 hover:text-slate-900 transition-all duration-300 ease-in-out rounded-xl mx-1 cursor-pointer"
                                            >
                                                <Settings className="w-4 h-4 mr-3" /> Dashboard
                                            </Link>
                                            <Link
                                                to={ROUTES.AURA_CHAT}
                                                onClick={() => setProfileMenuOpen(false)}
                                                className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50/80 hover:text-slate-900 transition-all duration-300 ease-in-out rounded-xl mx-1 cursor-pointer"
                                            >
                                                <Sparkles className="w-4 h-4 mr-3" /> Aura Assistant
                                            </Link>
                                            <Link
                                                to={ROUTES.MY_LISTINGS}
                                                onClick={() => setProfileMenuOpen(false)}
                                                className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50/80 hover:text-slate-900 transition-all duration-300 ease-in-out rounded-xl mx-1 cursor-pointer"
                                            >
                                                <Package className="w-4 h-4 mr-3" /> Inventory
                                            </Link>
                                            <Link
                                                to={user?.id ? ROUTES.USER_PROFILE(user.id) : ROUTES.DASHBOARD}
                                                onClick={() => setProfileMenuOpen(false)}
                                                className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50/80 hover:text-slate-900 transition-all duration-300 ease-in-out rounded-xl mx-1 cursor-pointer"
                                            >
                                                <User className="w-4 h-4 mr-3" /> Profile Page
                                            </Link>
                                            <div className="border-t border-slate-200/60 my-1" />
                                            <button
                                                onClick={handleLogout}
                                                type="button"
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/80 transition-all duration-300 ease-in-out rounded-xl mx-1 cursor-pointer"
                                            >
                                                <LogOut className="w-4 h-4" /> Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile Menu Toggle */}
                                <button className="lg:hidden p-2.5 ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all duration-300 ease-in-out rounded-xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                    {mobileMenuOpen ? <X /> : <Menu />}
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to={ROUTES.LOGIN} className="text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/50 px-4 py-2.5 rounded-xl transition-all duration-300 ease-in-out">Sign In</Link>
                                <Link to={ROUTES.REGISTER} className="text-sm font-semibold bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-all duration-300 ease-in-out shadow-sm">Join Now</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;