import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';

const UserSearchResults = ({ 
    results, 
    isLoading, 
    isVisible, 
    onUserSelect,
    selectedIndex = -1,
    className = "" 
}) => {
    if (!isVisible) return null;

    return (
        <div className={`absolute top-full left-0 right-0 mt-1 bg-white border border-sidebar-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto ${className}`}>
            {isLoading ? (
                <div className="p-4 text-center">
                    <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-text-muted mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-text-secondary">Aranıyor...</span>
                    </div>
                </div>
            ) : results.length > 0 ? (
                <div className="py-2">
                    {results.map((user, index) => (
                        <Link
                            key={user.id}
                            to={ROUTES.USER_PROFILE(user.id)}
                            onClick={() => onUserSelect && onUserSelect(user)}
                            className={`flex items-center px-4 py-3 transition-colors border-b border-sidebar-border last:border-b-0 ${
                                index === selectedIndex 
                                    ? 'bg-btn-primary text-white' 
                                    : 'hover:bg-app-bg'
                            }`}
                        >
                            {/* Avatar */}
                            <div className="w-10 h-10 bg-gradient-to-br from-btn-primary to-btn-primary-hover rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                                {user.profilePicture ? (
                                    <img 
                                        src={user.profilePicture} 
                                        alt={`${user.name} ${user.surname}`}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white text-sm font-medium">
                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center">
                                    <p className={`text-sm font-medium truncate ${
                                        index === selectedIndex ? 'text-white' : 'text-text-primary'
                                    }`}>
                                        {user.name} {user.surname}
                                    </p>
                                </div>
                                <p className={`text-xs truncate ${
                                    index === selectedIndex ? 'text-blue-100' : 'text-text-muted'
                                }`}>
                                    {user.email}
                                </p>
                            </div>

                            {/* Arrow Icon */}
                            <div className="flex-shrink-0 ml-2">
                                <svg className={`w-4 h-4 ${
                                    index === selectedIndex ? 'text-white' : 'text-text-muted'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-app-bg rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <p className="text-text-secondary text-sm">Kullanıcı bulunamadı</p>
                    <p className="text-text-muted text-xs mt-1">Farklı bir isim deneyin</p>
                </div>
            )}
        </div>
    );
};

export default UserSearchResults;
