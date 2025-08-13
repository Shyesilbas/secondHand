import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { DropdownMenu, DropdownItem, DropdownDivider } from '../ui/DropdownMenu';

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate(ROUTES.HOME);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to={ROUTES.HOME} className="text-xl font-bold text-blue-600">
                        SecondHand
                    </Link>

                    <nav className="hidden md:flex space-x-8">
                        <DropdownMenu trigger="Listings">
                            {isAuthenticated && (
                                <>
                                    <DropdownItem 
                                        to={ROUTES.MY_LISTINGS}
                                        icon={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        }
                                    >
                                        My Listings
                                    </DropdownItem>
                                    <DropdownItem 
                                        to={ROUTES.MY_LISTINGS_INACTIVE}
                                        icon={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                        }
                                    >
                                        Inactive Listings
                                    </DropdownItem>
                                    <DropdownItem 
                                        to={ROUTES.CREATE_LISTING}
                                        icon={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        }
                                    >
                                        New Listing
                                    </DropdownItem>
                                    <DropdownDivider />
                                </>
                            )}
                            <DropdownItem 
                                to={ROUTES.LISTINGS}
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                }
                            >
                                All Listings
                            </DropdownItem>
                        </DropdownMenu>
                        
                        {isAuthenticated && (
                            <DropdownMenu trigger="Payment">
                                <DropdownItem 
                                    to={ROUTES.PAY_LISTING_FEE}
                                    icon={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    }
                                >
                                    Pay Listing Fee
                                </DropdownItem>
                                <DropdownDivider />
                                <DropdownItem 
                                    to={ROUTES.CREDIT_CARDS}
                                    icon={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    }
                                >
                                    Credit Card
                                </DropdownItem>
                                <DropdownItem 
                                    to={ROUTES.BANK_ACCOUNTS}
                                    icon={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    }
                                >
                                    Bank Account
                                </DropdownItem>
                                <DropdownDivider />
                                <DropdownItem 
                                    to={ROUTES.PAYMENTS}
                                    icon={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    }
                                >
                                    Payment History
                                </DropdownItem>
                            </DropdownMenu>
                        )}
                        
                        {isAuthenticated && (
                            <DropdownMenu trigger="Favorites">
                                <DropdownItem 
                                    to={ROUTES.FAVORITES}
                                    icon={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    }
                                >
                                    Favorilerim
                                </DropdownItem>
                            </DropdownMenu>
                        )}
                        
                        {isAuthenticated && (
                            <DropdownMenu trigger="E-mails">
                                <DropdownItem 
                                    to={ROUTES.EMAILS}
                                    icon={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.2a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    }
                                >
                                    Email History
                                </DropdownItem>
                            </DropdownMenu>
                        )}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <DropdownMenu trigger={`${user?.name || 'Profile'}`}>
                                    <DropdownItem 
                                        to={ROUTES.PROFILE}
                                        icon={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        }
                                    >
                                        Profile
                                    </DropdownItem>
                                    <DropdownItem 
                                        to={ROUTES.CHANGE_PASSWORD}
                                        icon={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        }
                                    >
                                        Change Password
                                    </DropdownItem>
                                    <DropdownDivider />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Logout</span>
                                    </button>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Link
                                    to={ROUTES.LOGIN}
                                    className="text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to={ROUTES.REGISTER}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;