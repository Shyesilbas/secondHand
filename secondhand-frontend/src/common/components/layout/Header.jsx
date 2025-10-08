import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import { DropdownMenu, DropdownItem, DropdownDivider } from '../ui/DropdownMenu.jsx';
import { useNotification } from '../../../notification/NotificationContext.jsx';
import UserSearchBar from '../../../user/components/UserSearchBar.jsx';
import { useTotalUnreadCount } from '../../../chat/hooks/useUnreadCount.js';

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
        
        const handleCartCountChange = (event) => {
            setCartCount(parseInt(event.detail || '0', 10));
        };
        
        window.addEventListener('cartCountChanged', handleCartCountChange);
        return () => window.removeEventListener('cartCountChanged', handleCartCountChange);
    }, [isAuthenticated]);
    
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

    const linkClass = "text-text-secondary hover:text-btn-primary transition-colors flex items-center space-x-2";

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
        <header className="bg-header-bg shadow-sm border-b border-header-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to={ROUTES.HOME} className="text-xl font-bold text-btn-primary">SecondHand</Link>
                    {isAuthenticated && <div className="flex-1 max-w-xs mx-4"><UserSearchBar /></div>}

                    <nav className="hidden md:flex space-x-8">
                        <DropdownMenu trigger="Listings">
                            {listingsMenu.map((item, idx) =>
                                item.divider ? <DropdownDivider key={idx} /> : <DropdownItem key={item.to} to={item.to} icon={<item.icon />}>{item.label}</DropdownItem>
                            )}
                        </DropdownMenu>

                        {isAuthenticated && (
                            <DropdownMenu trigger="Payment">
                                {paymentMenu.map((item, idx) =>
                                    item.divider ? <DropdownDivider key={idx} /> : <DropdownItem key={item.to} to={item.to} icon={<item.icon />}>{item.label}</DropdownItem>
                                )}
                            </DropdownMenu>
                        )}

                        {isAuthenticated && userLinks.map(link => (
                            <Link key={link.to} to={link.to} onClick={link.onClick} className="relative flex items-center">
                                <div className={linkClass}>
                                    <link.icon />
                                    <span>{link.label}</span>
                                </div>

                                {link.to === ROUTES.CHAT && totalUnread > 0 && (
                                    <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 flex items-center justify-center px-2.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full shadow-lg animate-pulse">
                {totalUnread > 99 ? '99+' : totalUnread}
                                    </span>
                                )}

                                {link.to === ROUTES.SHOPPING_CART && link.badge > 0 && (
                                    <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 flex items-center justify-center px-2.5 py-0.5 text-xs font-semibold leading-none text-white bg-blue-600 rounded-full shadow-lg">
                {link.badge > 99 ? '99+' : link.badge}
                                    </span>
                                )}
                            </Link>
                        ))}

                    </nav>

                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <DropdownMenu trigger={`${user?.name || 'Profile'}`}>
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
                        ) : (
                            <>
                                <Link to={ROUTES.LOGIN} className="text-text-secondary hover:text-btn-primary transition-colors">Login</Link>
                                <Link to={ROUTES.REGISTER} className="bg-btn-primary text-white px-4 py-2 rounded-md hover:bg-btn-primary-hover transition-colors">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
