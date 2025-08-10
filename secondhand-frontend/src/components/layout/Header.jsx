import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

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
                        <Link
                            to={ROUTES.LISTINGS}
                            className="text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            Listings
                        </Link>
                        {isAuthenticated && (
                            <Link
                                to={ROUTES.CREATE_LISTING}
                                className="text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                İlan Ver
                            </Link>
                        )}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                <span className="text-gray-700">
                  Merhaba, {user?.name}
                </span>
                                <Link
                                    to={ROUTES.PROFILE}
                                    className="text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Profil
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Logout
                                </button>
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