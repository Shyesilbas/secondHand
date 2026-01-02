import React, {useEffect, useState, useRef} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../../../auth/AuthContext.jsx';
import {ROUTES} from '../../constants/routes.js';
import {DropdownDivider, DropdownItem, DropdownMenu} from '../ui/DropdownMenu.jsx';
import {useNotification} from '../../../notification/NotificationContext.jsx';
import UnifiedSearchBar from '../search/UnifiedSearchBar.jsx';
import {useTotalUnreadCount} from '../../../chat/hooks/useUnreadCount.js';
import {useListingStatistics} from '../../../listing/hooks/useListingStatistics.js';
import {useEnums} from '../../hooks/useEnums.js';
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
    User,
    X
} from 'lucide-react';

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const notification = useNotification();
    const location = useLocation();

    const [cartCount, setCartCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
    const categoriesMenuRef = useRef(null);
    const { totalUnread, setTotalUnread } = useTotalUnreadCount({ enabled: isAuthenticated });
    const [unreadEmailCount, setUnreadEmailCount] = useState(0);
    const { countsByCategory } = useListingStatistics();
    const { enums, getListingTypeLabel, getListingTypeIcon } = useEnums();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoriesMenuRef.current && !categoriesMenuRef.current.contains(event.target)) {
                setCategoriesMenuOpen(false);
            }
        };
        if (categoriesMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [categoriesMenuOpen]);

    const handleLogout = async () => {
        notification.showConfirmation('Sign Out', 'Are you sure you want to exit your session?', async () => {
            await logout();
            navigate(ROUTES.HOME);
        });
    };

    const NavLink = ({ to, children, primary = false }) => (
        <Link
            to={to}
            className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-full ${
                primary
                    ? "bg-button-primary-bg text-button-primary-text hover:bg-button-primary-hover shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-secondary-50"
            }`}
        >
            {children}
        </Link>
    );

    const IconButton = ({ to, icon: Icon, badge, onClick, title }) => (
        <Link
            to={to}
            onClick={onClick}
            title={title}
            className="group relative p-2 text-text-tertiary hover:text-text-primary transition-all duration-200"
        >
            <Icon className="w-[21px] h-[21px] stroke-[1.5px]" />
            {badge > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-indigo-500"></span>
                </span>
            )}
        </Link>
    );

    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
            scrolled ? "bg-background-primary/80 backdrop-blur-md border-b border-border-light/60 py-2" : "bg-background-primary border-b border-transparent py-4"
        }`}>
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                <div className="flex items-center justify-between gap-8">

                    {/* Brand Logo */}
                    <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group flex-shrink-0">
                        <div className="w-9 h-9 bg-button-primary-bg rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                            <ShoppingBag className="w-5 h-5 text-text-inverse stroke-[2.5px]" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-text-primary">
                            SH<span className="text-accent-indigo-600">.</span>
                        </span>
                    </Link>

                    {/* Main Navigation - Desktop */}
                    {isAuthenticated && (
                        <nav className="hidden lg:flex items-center gap-1">
                            <NavLink to={ROUTES.LISTINGS}>Marketplace</NavLink>
                            <NavLink to={ROUTES.CREATE_LISTING}>Sell Item</NavLink>
                            <div className="h-4 w-[1px] bg-border-light mx-2" />
                            <div className="relative" ref={categoriesMenuRef}>
                                <button 
                                    onClick={() => setCategoriesMenuOpen(!categoriesMenuOpen)}
                                    className={`text-sm font-medium px-3 py-2 flex items-center gap-1 transition-colors ${
                                        categoriesMenuOpen 
                                            ? 'text-text-primary' 
                                            : 'text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    Categories 
                                    <ChevronDown className={`w-4 h-4 opacity-50 transition-transform ${categoriesMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {categoriesMenuOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-64 bg-background-primary rounded-xl shadow-lg border border-border-light py-2 z-50 max-h-[500px] overflow-y-auto">
                                        {enums?.listingTypes?.map((category) => {
                                            const count = countsByCategory[category.value] ?? 0;
                                            const iconText = getListingTypeIcon(category.value, enums?.listingTypes);
                                            return (
                                                <Link
                                                    key={category.value}
                                                    to={ROUTES.LISTINGS}
                                                    state={{ listingType: category.value }}
                                                    onClick={() => setCategoriesMenuOpen(false)}
                                                    className="flex items-center justify-between px-4 py-2.5 hover:bg-secondary-50 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary-200 transition-colors">
                                                            <span className="text-base">{iconText}</span>
                                                        </div>
                                                        <span className="text-sm font-medium text-text-primary truncate">
                                                            {getListingTypeLabel(category.value, enums?.listingTypes) || category.label || category.value}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-medium text-text-tertiary ml-3 flex-shrink-0">
                                                        {count}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </nav>
                    )}

                    {/* Central Search - Minimalist */}
                    {isAuthenticated && (
                        <div className="hidden md:block flex-1 max-w-md">
                            <div className="relative group">
                                <UnifiedSearchBar className="w-full bg-secondary-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 transition-all" />
                            </div>
                        </div>
                    )}

                    {/* Actions Area */}
                    <div className="flex items-center gap-1">
                        {isAuthenticated ? (
                            <>
                                <div className="flex items-center gap-0.5 mr-2">
                                    <IconButton to={ROUTES.CHAT} icon={MessageSquare} badge={totalUnread} title="Messages" />
                                    <IconButton to={ROUTES.EMAILS} icon={Mail} badge={unreadEmailCount} title="Inquiries" />
                                    <IconButton to={ROUTES.SHOPPING_CART} icon={ShoppingBag} badge={cartCount} title="Cart" />
                                    <IconButton to={ROUTES.MY_ORDERS} icon={Receipt} title="My Orders" />
                                    <IconButton to={ROUTES.FAVORITES} icon={Heart} title="Favorites" />
                                    <IconButton to={ROUTES.MY_LISTINGS} icon={Package} title="My Listings" />
                                </div>

                                <div className="h-8 w-[1px] bg-border-light mx-2 hidden sm:block" />

                                <DropdownMenu
                                    trigger={
                                        <button className="flex items-center gap-2 pl-2 group">
                                            <div className="w-9 h-9 rounded-full bg-secondary-100 border border-border-light flex items-center justify-center overflow-hidden group-hover:border-primary-300 transition-colors">
                                                {user?.avatar ? (
                                                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-text-tertiary" />
                                                )}
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors" />
                                        </button>
                                    }
                                >
                                    <div className="px-4 py-3 border-b border-border-light">
                                        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Account</p>
                                        <p className="text-sm font-semibold text-text-primary truncate">{user?.name || 'User'}</p>
                                    </div>
                                    <DropdownItem to={ROUTES.DASHBOARD} icon={<Settings className="w-4 h-4" />}>Dashboard</DropdownItem>
                                    <DropdownItem to={ROUTES.MY_LISTINGS} icon={<Package className="w-4 h-4" />}>Inventory</DropdownItem>
                                    <DropdownDivider />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </button>
                                </DropdownMenu>

                                <button
                                    className="lg:hidden p-2 ml-2 text-slate-600"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                >
                                    {mobileMenuOpen ? <X /> : <Menu />}
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to={ROUTES.LOGIN} className="text-sm font-semibold text-text-secondary hover:text-text-primary px-4">
                                    Sign In
                                </Link>
                                <Link to={ROUTES.REGISTER} className="text-sm font-semibold bg-button-primary-bg text-button-primary-text px-5 py-2.5 rounded-full hover:bg-button-primary-hover transition-all shadow-sm">
                                    Join Now
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;