import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import { DropdownMenu, DropdownItem, DropdownDivider } from '../ui/DropdownMenu.jsx';
import { useNotification } from '../../../notification/NotificationContext.jsx';
import UnifiedSearchBar from '../search/UnifiedSearchBar.jsx';
import { useTotalUnreadCount } from '../../../chat/hooks/useUnreadCount.js';
import { useCart } from '../../../cart/hooks/useCart.js';

const icons = {
    myListings: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    newListing: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    allListings: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    favorites: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    emails: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.2a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    chat: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    dashboard: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M13 5v6a2 2 0 002 2h6" /></svg>,
    profile: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    changePassword: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    logout: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    payListingFee: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    paymentMethods: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    paymentHistory: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    cart: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" /></svg>
};

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const notification = useNotification();
    const location = useLocation();
    
    // Use useCart hook for real-time cart count
    const { cartCount: hookCartCount } = useCart({ 
        enabled: isAuthenticated,
        loadCartItems: true // We need cart items to calculate accurate count
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
        
        // Update from hook cart count
        if (hookCartCount !== undefined) {
            setCartCount(hookCartCount);
        }
        
        // Listen for cart count changes
        const handleCartCountChange = (event) => {
            if (event.detail === 'refresh') {
                // If it's a refresh signal, get the latest count from localStorage
                const latestCount = parseInt(localStorage.getItem('cartCount') || '0', 10);
                setCartCount(latestCount);
            } else {
                setCartCount(parseInt(event.detail || '0', 10));
            }
        };
        
        window.addEventListener('cartCountChanged', handleCartCountChange);
        return () => window.removeEventListener('cartCountChanged', handleCartCountChange);
    }, [isAuthenticated, hookCartCount]);
    
    // Only load unread count on chat-related or main app pages, not on static pages
    const chatRelatedPages = [ROUTES.CHAT, ROUTES.DASHBOARD, ROUTES.LISTINGS, ROUTES.MY_LISTINGS, ROUTES.SHOPPING_CART];
    const isStaticPage = location.pathname.includes('/agreements') || 
                        location.pathname.includes('/terms') || 
                        location.pathname.includes('/privacy') ||
                        location.pathname === ROUTES.HOME;
    
    const { totalUnread, setTotalUnread } = useTotalUnreadCount({ 
        enabled: isAuthenticated && !isStaticPage
    });

    const handleChatClick = () => {
        setTotalUnread(0);
    };

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

    const listingsMenu = [
        { to: ROUTES.MY_LISTINGS, label: 'My Listings', icon: icons.myListings },
        { to: ROUTES.CREATE_LISTING, label: 'New Listing', icon: icons.newListing },
        { divider: true },
        { to: ROUTES.LISTINGS, label: 'All Listings', icon: icons.allListings },
    ];

    const paymentMenu = [
        { to: ROUTES.PAY_LISTING_FEE, label: 'Pay Listing Fee', icon: icons.payListingFee },
        { divider: true },
        { to: ROUTES.PAYMENT_METHODS, label: 'Payment Methods', icon: icons.paymentMethods },
        { divider: true },
        { to: ROUTES.PAYMENTS, label: 'Payment History', icon: icons.paymentHistory },
    ];

    const userLinks = [
        { to: ROUTES.FAVORITES, label: 'Favorites', icon: icons.favorites },
        { to: ROUTES.EMAILS, label: 'E-mails', icon: icons.emails },
        { to: ROUTES.CHAT, label: 'Messages', icon: icons.chat, onClick: handleChatClick },
        { to: ROUTES.SHOPPING_CART, label: 'Cart', icon: icons.cart, badge: cartCount },
    ];

    const userMenuItems = [
        { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: icons.dashboard },
        { to: ROUTES.PROFILE, label: 'Profile', icon: icons.profile },
        { to: ROUTES.CHANGE_PASSWORD, label: 'Change Password', icon: icons.changePassword },
        { divider: true },
        { action: handleLogout, label: 'Logout', icon: icons.logout, isButton: true }
    ];

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to={ROUTES.HOME} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-900">SecondHand</span>
                        </Link>
                    </div>

                    {/* Search Bar - Center */}
                    {isAuthenticated && (
                        <div className="flex-1 max-w-lg mx-8">
                            <UnifiedSearchBar />
                        </div>
                    )}

                    {/* Right Side Navigation */}
                    <div className="flex items-center space-x-1">
                        {isAuthenticated ? (
                            <>
                                {/* Quick Actions */}
                                <div className="hidden lg:flex items-center space-x-1 mr-4">
                                    {/* Listings Dropdown */}
                                    <DropdownMenu trigger={
                                        <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                            <icons.allListings />
                                            <span>Listings</span>
                                        </button>
                                    }>
                                        {listingsMenu.map((item, idx) =>
                                            item.divider ? <DropdownDivider key={idx} /> : <DropdownItem key={item.to} to={item.to} icon={<item.icon />}>{item.label}</DropdownItem>
                                        )}
                                    </DropdownMenu>

                                    {/* Payment Dropdown */}
                                    <DropdownMenu trigger={
                                        <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                            <icons.paymentMethods />
                                            <span>Payment</span>
                                        </button>
                                    }>
                                        {paymentMenu.map((item, idx) =>
                                            item.divider ? <DropdownDivider key={idx} /> : <DropdownItem key={item.to} to={item.to} icon={<item.icon />}>{item.label}</DropdownItem>
                                        )}
                                    </DropdownMenu>
                                </div>

                                {/* Icon Links */}
                                <div className="flex items-center space-x-1">
                                    {userLinks.map(link => (
                                        <Link 
                                            key={link.to} 
                                            to={link.to} 
                                            onClick={link.onClick} 
                                            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                            title={link.label}
                                        >
                                            <link.icon />
                                            
                                            {link.to === ROUTES.CHAT && totalUnread > 0 && (
                                                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                                                    {totalUnread > 9 ? '9+' : totalUnread}
                                                </span>
                                            )}

                                            {link.to === ROUTES.SHOPPING_CART && link.badge > 0 && (
                                                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                                                    {link.badge > 9 ? '9+' : link.badge}
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>

                                {/* User Menu */}
                                <div className="ml-3 pl-3 border-l border-gray-200">
                                    <DropdownMenu trigger={
                                        <button className="flex items-center space-x-2 p-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <span className="hidden sm:block">{user?.name || 'Profile'}</span>
                                        </button>
                                    }>
                                        {userMenuItems.map((item, idx) =>
                                            item.divider ? <DropdownDivider key={idx} /> :
                                                item.isButton ? (
                                                    <button key={idx} onClick={item.action} className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors">
                                                        <item.icon />
                                                        <span>{item.label}</span>
                                                    </button>
                                                ) : (
                                                    <DropdownItem key={item.to} to={item.to} icon={<item.icon />}>{item.label}</DropdownItem>
                                                )
                                        )}
                                    </DropdownMenu>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link 
                                    to={ROUTES.LOGIN} 
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to={ROUTES.REGISTER} 
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                >
                                    Register
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
