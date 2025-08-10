import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../features/listings/hooks/useListings';
import { ROUTES } from '../constants/routes';
import ListingGrid from '../features/listings/components/ListingGrid';

const HomePage = () => {
    const { isAuthenticated, user } = useAuth();
    const { listings, isLoading, error, refetch } = useListings();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            SecondHand
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100">
                            İkinci el ürünlerin güvenli adresi
                        </p>
                        {isAuthenticated ? (
                            <div className="space-y-4">
                                <p className="text-lg">
                                    Hoş geldin, <span className="font-semibold">{user?.name}</span>! 👋
                                </p>
                                <Link
                                    to={ROUTES.CREATE_LISTING}
                                    className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    İlan Ver
                                </Link>
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link
                                    to={ROUTES.REGISTER}
                                    className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Üye Ol
                                </Link>
                                <Link
                                    to={ROUTES.LOGIN}
                                    className="inline-block border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                                >
                                    Giriş Yap
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            {!isLoading && listings && (
                <div className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex justify-center items-center space-x-8 text-center">
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {listings.length}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Aktif İlan
                                </div>
                            </div>
                            <div className="w-px h-8 bg-gray-300"></div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {new Set(listings.map(l => `${l.sellerName} ${l.sellerSurname}`)).size}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Aktif Satıcı
                                </div>
                            </div>
                            <div className="w-px h-8 bg-gray-300"></div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {new Set(listings.map(l => l.city)).size}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Şehir
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Listings Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Son İlanlar
                    </h2>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={refetch}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            title="Yenile"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <Link
                            to={ROUTES.LISTINGS}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Tümünü Gör →
                        </Link>
                    </div>
                </div>

                <ListingGrid
                    listings={listings}
                    isLoading={isLoading}
                    error={error}
                />
            </div>

            {/* Features Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Neden SecondHand?
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Güvenli, hızlı ve kolay ikinci el alışverişin adresi
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Güvenli Alışveriş
                            </h3>
                            <p className="text-gray-600">
                                Tüm üyelerimiz doğrulanmış, güvenli ödeme seçenekleri
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Hızlı İşlemler
                            </h3>
                            <p className="text-gray-600">
                                Dakikalar içinde ilan ver, anında alıcı bul
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Geniş Topluluk
                            </h3>
                            <p className="text-gray-600">
                                Binlerce aktif kullanıcı, çok çeşitli ürün seçenekleri
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;