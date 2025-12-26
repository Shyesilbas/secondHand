import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { useEnums } from '../../hooks/useEnums.js';
import { ROUTES } from '../../constants/routes.js';
import { DropdownMenu, DropdownItem, DropdownDivider } from '../ui/DropdownMenu.jsx';
import { useNotification } from '../../../notification/NotificationContext.jsx';
import UnifiedSearchBar from '../search/UnifiedSearchBar.jsx';
import { useTotalUnreadCount } from '../../../chat/hooks/useUnreadCount.js';
import { useCart } from '../../../cart/hooks/useCart.js';
import { useListingStatistics } from '../../../listing/hooks/useListingStatistics.js';
import { emailService } from '../../../emails/services/emailService.js';
import { 
    ShoppingBag, 
    MessageSquare, 
    Mail, 
    Heart, 
    User, 
    Settings, 
    LogOut, 
    Package, 
    Plus, 
    Menu,
    Search,
    Bell,
    CreditCard,
    Receipt,
    Tag,
    HandCoins,
    ChevronDown,
    X
} from 'lucide-react';

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const notification = useNotification();
    const location = useLocation();
    
    const { cartCount: hookCartCount } = useCart({ 
        enabled: isAuthenticated,
        loadCartItems: true
    });
    
    const [cartCount, setCartCount] = useState(() => {
        if (!isAuthenticated) return 0;
        try {
            return parseInt(localStorage.getItem('cartCount') || '0', 10);
        } catch {
            return 0;
        }
    });
    
    useEffect(() => {
        if (!isAuthenticated) {
            setCartCount(0);
            return;
        }
        
        if (hookCartCount !== undefined) {
            setCartCount(hookCartCount);
        }
        
        const handleCartCountChange = (event) => {
            if (event.detail === 'refresh') {
                const latestCount = parseInt(localStorage.getItem('cartCount') || '0', 10);
                setCartCount(latestCount);
            } else {
                setCartCount(parseInt(event.detail || '0', 10));
            }
        };
        
        window.addEventListener('cartCountChanged', handleCartCountChange);
        return () => window.removeEventListener('cartCountChanged', handleCartCountChange);
    }, [isAuthenticated, hookCartCount]);
    
    const chatRelatedPages = [ROUTES.CHAT, ROUTES.DASHBOARD, ROUTES.LISTINGS, ROUTES.MY_LISTINGS, ROUTES.SHOPPING_CART];
    const isStaticPage = location.pathname.includes('/agreements') || 
                        location.pathname.includes('/terms') || 
                        location.pathname.includes('/privacy') ||
                        location.pathname === ROUTES.HOME;
    
    const { totalUnread, setTotalUnread } = useTotalUnreadCount({ 
        enabled: isAuthenticated && !isStaticPage
    });
    const [unreadEmailCount, setUnreadEmailCount] = useState(0);
    const { enums } = useEnums();
    const [allListingsOpen, setAllListingsOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
    const { countsByCategory, isLoading: countsLoading } = useListingStatistics();

    const getCategoryCount = (listingType) => {
        if (!listingType) return 0;
        const key = String(listingType).toUpperCase();
        return countsByCategory[key] ?? 0;
    };

    const handleChatClick = () => {
        setTotalUnread(0);
    };

    const handleEmailsClick = () => {
        setUnreadEmailCount(0);
    };

    const locationRef = useRef(location.pathname);

    useEffect(() => {
        locationRef.current = location.pathname;
        if (location.pathname === ROUTES.EMAILS) {
            setUnreadEmailCount(0);
        }
    }, [location.pathname]);

    useEffect(() => {
        if (!isAuthenticated) {
            setUnreadEmailCount(0);
            return;
        }

        if (locationRef.current === ROUTES.EMAILS) {
            setUnreadEmailCount(0);
            return;
        }

        let cancelled = false;
        let intervalId = null;

        const load = async () => {
            if (cancelled) return;
            
            if (locationRef.current === ROUTES.EMAILS) {
                setUnreadEmailCount(0);
                return;
            }

            try {
                const count = await emailService.getUnreadCount();
                if (!cancelled && locationRef.current !== ROUTES.EMAILS) {
                    setUnreadEmailCount(Number(count) || 0);
                }
            } catch {
                if (!cancelled) {
                    setUnreadEmailCount(0);
                }
            }
        };

        load();
        
        intervalId = setInterval(() => {
            if (locationRef.current !== ROUTES.EMAILS) {
                load();
            }
        }, 120_000);

        return () => {
            cancelled = true;
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isAuthenticated]);

    const handleLogout = async (e) => {
        e.preventDefault();
        notification.showConfirmation(
            'Logout',
            'Are you sure you want to logout?',
            async () => {
                await logout();
                navigate(ROUTES.HOME);
                notification.showSuccess('Successful', 'Logout successful.');
            }
        );
    };

    const categories = [
        { to: ROUTES.LISTINGS, label: 'All Categories', count: null },
        { to: `${ROUTES.LISTINGS}?category=VEHICLE`, label: 'Vehicles', count: getCategoryCount('VEHICLE') },
        { to: `${ROUTES.LISTINGS}?category=ELECTRONICS`, label: 'Electronics', count: getCategoryCount('ELECTRONICS') },
        { to: `${ROUTES.LISTINGS}?category=REAL_ESTATE`, label: 'Real Estate', count: getCategoryCount('REAL_ESTATE') },
        { to: `${ROUTES.LISTINGS}?category=CLOTHING`, label: 'Clothing', count: getCategoryCount('CLOTHING') },
        { to: `${ROUTES.LISTINGS}?category=BOOKS`, label: 'Books', count: getCategoryCount('BOOKS') },
        { to: `${ROUTES.LISTINGS}?category=SPORTS`, label: 'Sports', count: getCategoryCount('SPORTS') },
    ];

    const userMenuItems = [
        { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: Settings },
        { to: ROUTES.PROFILE, label: 'My Profile', icon: User },
        { to: ROUTES.CHANGE_PASSWORD, label: 'Change Password', icon: Settings },
        { to: ROUTES.MY_ORDERS, label: 'My Orders', icon: Package },
        { divider: true },
        { to: ROUTES.MY_LISTINGS, label: 'My Listings', icon: Package },
        { to: ROUTES.CREATE_LISTING, label: 'Create Listing', icon: Plus },
        { divider: true },
        { to: ROUTES.FAVORITES, label: 'Favorites', icon: Heart },
        { to: ROUTES.OFFERS, label: 'Offers', icon: HandCoins },
        { to: ROUTES.MY_COUPONS, label: 'My Coupons', icon: Tag },
        { divider: true },
        { to: ROUTES.PAYMENT_METHODS, label: 'Payment Methods', icon: CreditCard },
        { to: ROUTES.PAYMENTS, label: 'Payment History', icon: Receipt },
        { to: ROUTES.PAY_LISTING_FEE, label: 'Pay Listing Fee', icon: CreditCard },
        { divider: true },
        { action: handleLogout, label: 'Logout', icon: LogOut, isButton: true }
    ];

    const showSearch = isAuthenticated;

    return (
        <>
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Main Header */}
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center flex-shrink-0">
                            <Link to={ROUTES.HOME} className="flex items-center space-x-3 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                    <ShoppingBag className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-gray-900 leading-tight">SecondHand</span>
                                    <span className="text-[10px] text-gray-500 leading-tight -mt-0.5">Buy & Sell</span>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        {isAuthenticated && (
                            <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-2xl mx-8">
                                <Link
                                    to={ROUTES.LISTINGS}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Browse
                                </Link>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setCategoriesMenuOpen(!categoriesMenuOpen)}
                                        className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <span>Categories</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${categoriesMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {categoriesMenuOpen && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-10" 
                                                onClick={() => setCategoriesMenuOpen(false)}
                                            />
                                            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                                                {categories.map((category, idx) => (
                                                    <Link
                                                        key={idx}
                                                        to={category.to}
                                                        onClick={() => setCategoriesMenuOpen(false)}
                                                        className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <span>{category.label}</span>
                                                        {category.count !== null && (
                                                            <span className="text-xs text-gray-500 ml-2">
                                                                ({category.count})
                                                            </span>
                                                        )}
                                                    </Link>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <Link
                                    to={ROUTES.CREATE_LISTING}
                                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    Sell
                                </Link>
                            </nav>
                        )}

                        {/* Search Bar - Desktop */}
                        {showSearch && (
                            <div className="hidden md:flex flex-1 max-w-xl mx-4">
                                <UnifiedSearchBar />
                            </div>
                        )}

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-2">
                            {isAuthenticated ? (
                                <>
                                    {/* Messages */}
                                    <Link
                                        to={ROUTES.CHAT}
                                        onClick={handleChatClick}
                                        className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Messages"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        {totalUnread > 0 && (
                                            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                                                {totalUnread > 99 ? '99+' : totalUnread}
                                            </span>
                                        )}
                                    </Link>

                                    {/* Emails */}
                                    <Link
                                        to={ROUTES.EMAILS}
                                        onClick={handleEmailsClick}
                                        className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Emails"
                                    >
                                        <Mail className="w-5 h-5" />
                                        {unreadEmailCount > 0 && (
                                            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-emerald-500 rounded-full">
                                                {unreadEmailCount > 99 ? '99+' : unreadEmailCount}
                                            </span>
                                        )}
                                    </Link>

                                    {/* Cart */}
                                    <Link
                                        to={ROUTES.SHOPPING_CART}
                                        className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Shopping Cart"
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                        {cartCount > 0 && (
                                            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-blue-500 rounded-full">
                                                {cartCount > 99 ? '99+' : cartCount}
                                            </span>
                                        )}
                                    </Link>

                                    {/* User Menu */}
                                    <div className="ml-2 pl-2 border-l border-gray-200">
                                        <DropdownMenu 
                                            align="right" 
                                            trigger={
                                                <button
                                                    type="button"
                                                    className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
                                                </button>
                                            }
                                        >
                                            {userMenuItems.map((item, idx) =>
                                                item.divider ? (
                                                    <DropdownDivider key={idx} />
                                                ) : item.isButton ? (
                                                    <button
                                                        key={idx}
                                                        onClick={item.action}
                                                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                                    >
                                                        <item.icon className="w-4 h-4" />
                                                        <span>{item.label}</span>
                                                    </button>
                                                ) : (
                                                    <DropdownItem key={item.to} to={item.to} icon={<item.icon className="w-4 h-4" />}>
                                                        {item.label}
                                                    </DropdownItem>
                                                )
                                            )}
                                        </DropdownMenu>
                                    </div>

                                    {/* Mobile Menu Button */}
                                    <button
                                        type="button"
                                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                        className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                        aria-label="Toggle menu"
                                    >
                                        {mobileMenuOpen ? (
                                            <X className="w-6 h-6" />
                                        ) : (
                                            <Menu className="w-6 h-6" />
                                        )}
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <Link
                                        to={ROUTES.LOGIN}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to={ROUTES.REGISTER}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    {showSearch && (
                        <div className="md:hidden pb-3 border-t border-gray-100">
                            <div className="pt-3">
                                <UnifiedSearchBar />
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Menu */}
                {isAuthenticated && mobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-200 bg-white">
                        <div className="px-4 py-3 space-y-1">
                            <Link
                                to={ROUTES.LISTINGS}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                                <Package className="w-5 h-5" />
                                <span>Browse Listings</span>
                            </Link>
                            <Link
                                to={ROUTES.CREATE_LISTING}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Create Listing</span>
                            </Link>
                            <Link
                                to={ROUTES.MY_LISTINGS}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                                <Package className="w-5 h-5" />
                                <span>My Listings</span>
                            </Link>
                            <Link
                                to={ROUTES.MY_ORDERS}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                                <Receipt className="w-5 h-5" />
                                <span>My Orders</span>
                            </Link>
                            <Link
                                to={ROUTES.FAVORITES}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                                <Heart className="w-5 h-5" />
                                <span>Favorites</span>
                            </Link>
                            <Link
                                to={ROUTES.OFFERS}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                                <HandCoins className="w-5 h-5" />
                                <span>Offers</span>
                            </Link>
                            <Link
                                to={ROUTES.MY_COUPONS}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                                <Tag className="w-5 h-5" />
                                <span>My Coupons</span>
                            </Link>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default Header;
