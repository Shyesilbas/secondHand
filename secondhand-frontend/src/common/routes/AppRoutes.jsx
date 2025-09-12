import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { ROUTES } from '../constants/routes.js';

import MainLayout from '../components/layout/MainLayout.jsx';
import AuthLayout from '../components/layout/AuthLayout.jsx';

import HomePage from '../../user/HomePage.jsx';
import LoginPage from '../../auth/LoginPage.jsx';
import RegisterPage from '../../auth/RegisterPage.jsx';
import ForgotPasswordPage from '../../auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../../auth/ResetPasswordPage.jsx';
import ChangePasswordPage from '../../auth/ChangePasswordPage.jsx';
import AccountVerificationPage from '../../auth/AccountVerificationPage.jsx';
import DashboardPage from '../../user/DashboardPage.jsx';
import ProfilePage from '../../user/ProfilePage.jsx';
import ListingsPage from '../../listing/pages/ListingsPage.jsx';
import MyListingsPage from '../../listing/pages/MyListingsPage.jsx';

import ListingDetailPage from '../../listing/pages/ListingDetailPage.jsx';
import CreateListingPage from '../../listing/pages/CreateListingPage.jsx';
import ComplaintsPage from '../../complaint/pages/ComplaintsPage.jsx';
import EditListingPage from '../../listing/pages/EditListingPage.jsx';
import FavoritesPage from '../../favorites/FavoritesPage';
import PaymentsPage from '../../payments/PaymentsPage.jsx';
import PayListingFeePage from '../../payments/PayListingFeePage.jsx';
import PaymentMethodsPage from '../../payments/PaymentMethodsPage.jsx';
import EmailsPage from '../../emails/EmailsPage';

import OAuthCallbackPage from '../../auth/OAuthCallbackPage.jsx';
import OAuthErrorPage from '../../auth/OAuthErrorPage.jsx';
import OAuthCompletePage from '../../auth/OAuthCompletePage.jsx';
import AgreementsPage from '../../agreements/pages/AgreementsPage.jsx';
import ChatPage from '../../chat/ChatPage.jsx';
import UserProfilePage from '../../user/UserProfilePage.jsx';
import SecurityPage from '../../audit/pages/SecurityPage.jsx';
import ShoppingCartPage from '../../cart/pages/ShoppingCartPage.jsx';
import MyOrdersPage from '../../order/pages/MyOrdersPage.jsx';
import UserReviewsPage from '../../reviews/pages/UserReviewsPage.jsx';

// Route Guards
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
                <Route
                    path={ROUTES.RESET_PASSWORD}
                    element={
                        <PublicRoute>
                            <ResetPasswordPage />
                        </PublicRoute>
                    }
                />
            </Route>

            {/* Public Routes with Main Layout */}
            <Route element={<MainLayout />}>
                <Route path={ROUTES.HOME} element={<HomePage />} />
                <Route path={ROUTES.LISTINGS} element={<ListingsPage />} />
                <Route path={ROUTES.LISTING_DETAIL(':id')} element={<ListingDetailPage />} />
            </Route>

            {/* Protected Routes with Main Layout */}
            <Route
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePasswordPage />} />
        <Route path={ROUTES.VERIFY_ACCOUNT} element={<AccountVerificationPage />} />
        <Route path={ROUTES.MY_LISTINGS} element={<MyListingsPage />} />
        <Route path={ROUTES.COMPLAINTS} element={<ComplaintsPage />} />

        <Route path={ROUTES.FAVORITES} element={<FavoritesPage />} />
        <Route path={ROUTES.CREATE_LISTING} element={<CreateListingPage />} />
        <Route path={ROUTES.PAY_LISTING_FEE} element={<PayListingFeePage />} />
        <Route path={ROUTES.PAYMENT_METHODS} element={<PaymentMethodsPage />} />
        <Route path={ROUTES.PAYMENTS} element={<PaymentsPage />} />
        <Route path={ROUTES.EMAILS} element={<EmailsPage />} />
        <Route path={ROUTES.CHAT} element={<ChatPage />} />
                        <Route path={ROUTES.USER_PROFILE(':userId')} element={<UserProfilePage />} />
                        <Route path={ROUTES.USER_REVIEWS(':userId')} element={<UserReviewsPage />} />
                        <Route path={ROUTES.EDIT_LISTING(':id')} element={<EditListingPage />} />
                  <Route path={ROUTES.CREATE_REAL_ESTATE} element={<Navigate to={`${ROUTES.CREATE_LISTING}?type=REAL_ESTATE`} replace />} />
                  <Route path={ROUTES.CREATE_CLOTHING} element={<Navigate to={`${ROUTES.CREATE_LISTING}?type=CLOTHING`} replace />} />
                        <Route path={ROUTES.AGREEMENTS_ALL} element={<AgreementsPage />} />
                        <Route path={ROUTES.MY_ORDERS} element={<MyOrdersPage />} />
                        <Route path={ROUTES.SECURITY} element={<SecurityPage />} />
                        <Route path={ROUTES.SHOPPING_CART} element={<ShoppingCartPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
    );
};

export default AppRoutes;