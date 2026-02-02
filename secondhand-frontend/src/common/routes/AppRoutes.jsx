import React from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import {useAuth} from '../../auth/AuthContext.jsx';
import {ROUTES} from '../constants/routes.js';

import MainLayout from '../components/layout/MainLayout.jsx';
import AuthLayout from '../components/layout/AuthLayout.jsx';

import HomePage from '../../user/HomePage.jsx';
import LoginPage from '../../auth/LoginPage.jsx';
import RegisterPage from '../../auth/RegisterPage.jsx';
import ForgotPasswordPage from '../../auth/ForgotPasswordPage.jsx';
import ChangePasswordPage from '../../auth/ChangePasswordPage.jsx';
import AccountVerificationPage from '../../auth/AccountVerificationPage.jsx';
import AccountHubPage from '../../user/AccountHubPage.jsx';
import ProfilePage from '../../user/ProfilePage.jsx';
import ListingsPage from '../../listing/pages/ListingsPage.jsx';
import ForumPage from '../../forum/pages/ForumPage.jsx';
import MyListingsPage from '../../listing/pages/MyListingsPage.jsx';

import ListingDetailPage from '../../listing/pages/ListingDetailPage.jsx';
import CreateListingPage from '../../listing/pages/CreateListingPage.jsx';
import ListingSubtypeSelectionPage from '../../listing/pages/ListingSubtypeSelectionPage.jsx';
import ComplaintsPage from '../../complaint/pages/ComplaintsPage.jsx';
import EditListingPage from '../../listing/pages/EditListingPage.jsx';
import FavoritesPage from '../../favorites/FavoritesPage';
import PaymentsPage from '../../payments/pages/PaymentsPage.jsx';
import PayListingFeePage from '../../payments/pages/PayListingFeePage.jsx';
import PaymentMethodsPage from '../../payments/pages/PaymentMethodsPage.jsx';
import EmailsPage from '../../emails/EmailsPage';

import OAuthCallbackPage from '../../auth/OAuthCallbackPage.jsx';
import OAuthErrorPage from '../../auth/OAuthErrorPage.jsx';
import OAuthCompletePage from '../../auth/OAuthCompletePage.jsx';
import AgreementsPage from '../../agreements/pages/AgreementsPage.jsx';
import ChatPage from '../../chat/ChatPage.jsx';
import UserProfilePage from '../../user/UserProfilePage.jsx';
import SecurityPage from '../../audit/pages/SecurityPage.jsx';
import ShoppingCartPage from '../../cart/pages/ShoppingCartPage.jsx';
import CheckoutPage from '../../cart/pages/CheckoutPage.jsx';
import MyOrdersPage from '../../order/pages/MyOrdersPage.jsx';
import ISoldPage from '../../order/pages/ISoldPage.jsx';
import UserReviewsPage from '../../reviews/pages/UserReviewsPage.jsx';
import MyCouponsPage from '../../campaign/pages/MyCouponsPage.jsx';
import OffersPage from '../../offer/pages/OffersPage.jsx';
import SellerDashboardPage from '../../dashboard/pages/SellerDashboardPage.jsx';
import BuyerDashboardPage from '../../dashboard/pages/BuyerDashboardPage.jsx';
import FavoriteListDetailPage from '../../favoritelist/pages/FavoriteListDetailPage.jsx';
import AuraChatPage from '../../ai/pages/AuraChatPage.jsx';

import ProtectedRoute from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';


const AppRoutes = () => {
    let authContext;
    try {
        authContext = useAuth();
    } catch (error) {
        console.log('AuthContext not available yet, rendering loading state');
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const { isLoading } = authContext;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public Routes with Auth Layout */}
            <Route element={<AuthLayout />}>
                <Route
                    path={ROUTES.LOGIN}
                    element={
                        <PublicRoute>
                            <LoginPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path={ROUTES.AUTH_CALLBACK}
                    element={
                        <PublicRoute>
                            <OAuthCallbackPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path={ROUTES.AUTH_ERROR}
                    element={
                        <PublicRoute>
                            <OAuthErrorPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path={ROUTES.AUTH_COMPLETE}
                    element={
                        <PublicRoute>
                            <OAuthCompletePage />
                        </PublicRoute>
                    }
                />
                <Route
                    path={ROUTES.REGISTER}
                    element={
                        <PublicRoute>
                            <RegisterPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path={ROUTES.FORGOT_PASSWORD}
                    element={
                        <PublicRoute>
                            <ForgotPasswordPage />
                        </PublicRoute>
                    }
                />
            </Route>

            {/* Public Routes with Main Layout */}
            <Route element={<MainLayout />}>
                <Route path={ROUTES.HOME} element={<HomePage />} />
                <Route path={ROUTES.LISTINGS} element={<ListingsPage />} />
                <Route path={ROUTES.FORUM} element={<ForumPage />} />
                <Route path={ROUTES.LISTING_DETAIL(':id')} element={<ListingDetailPage />} />
                <Route path={ROUTES.FAVORITE_LIST_DETAIL(':listId')} element={<FavoriteListDetailPage />} />
            </Route>

            {/* Protected Routes with Main Layout */}
            <Route
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                        <Route path={ROUTES.DASHBOARD} element={<AccountHubPage />} />
                        <Route path={ROUTES.SELLER_DASHBOARD} element={<SellerDashboardPage />} />
                        <Route path={ROUTES.BUYER_DASHBOARD} element={<BuyerDashboardPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePasswordPage />} />
        <Route path={ROUTES.VERIFY_ACCOUNT} element={<AccountVerificationPage />} />
        <Route path={ROUTES.MY_LISTINGS} element={<MyListingsPage />} />
        <Route path={ROUTES.COMPLAINTS} element={<ComplaintsPage />} />

        <Route path={ROUTES.FAVORITES} element={<FavoritesPage />} />
        <Route path={ROUTES.CREATE_LISTING} element={<CreateListingPage />} />
        <Route path="/listings/create/:listingType/subtype" element={<ListingSubtypeSelectionPage />} />
        <Route path={ROUTES.PAY_LISTING_FEE} element={<PayListingFeePage />} />
        <Route path={ROUTES.PAYMENT_METHODS} element={<PaymentMethodsPage />} />
        <Route path={ROUTES.PAYMENTS} element={<PaymentsPage />} />
        <Route path={ROUTES.EMAILS} element={<EmailsPage />} />
        <Route path={ROUTES.CHAT} element={<ChatPage />} />
        <Route path={ROUTES.AURA_CHAT} element={<AuraChatPage />} />
                        <Route path={ROUTES.USER_PROFILE(':userId')} element={<UserProfilePage />} />
                        <Route path={ROUTES.USER_REVIEWS(':userId')} element={<UserReviewsPage />} />
                        <Route path={ROUTES.REVIEWS_RECEIVED(':userId')} element={<UserReviewsPage />} />
                        <Route path={ROUTES.REVIEWS_GIVEN(':userId')} element={<UserReviewsPage />} />
                        <Route path={ROUTES.EDIT_LISTING(':id')} element={<EditListingPage />} />
                        <Route path={ROUTES.AGREEMENTS} element={<AgreementsPage />} />
                        <Route path={ROUTES.AGREEMENTS_ALL} element={<AgreementsPage />} />
                        <Route path={ROUTES.MY_ORDERS} element={<MyOrdersPage />} />
                        <Route path={ROUTES.I_SOLD} element={<ISoldPage />} />
                        <Route path={ROUTES.SECURITY} element={<SecurityPage />} />
                        <Route path={ROUTES.SHOPPING_CART} element={<ShoppingCartPage />} />
                        <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
                        <Route path={ROUTES.MY_COUPONS} element={<MyCouponsPage />} />
                        <Route path={ROUTES.OFFERS} element={<OffersPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
    );
};

export default AppRoutes;