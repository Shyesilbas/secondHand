import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';

import HomePage from '../pages/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/user/ProfilePage';
import ListingsPage from '../pages/listings/ListingsPage';
import ListingDetailPage from '../pages/listings/ListingDetailPage';
import CreateListingPage from '../pages/listings/CreateListingPage';
import PaymentsPage from '../pages/payments/PaymentsPage';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

const AppRoutes = () => {
    const { isLoading } = useAuth();

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
                <Route path={ROUTES.LISTING_DETAIL} element={<ListingDetailPage />} />
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
                <Route path={ROUTES.CREATE_LISTING} element={<CreateListingPage />} />
                <Route path={ROUTES.PAYMENTS} element={<PaymentsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
    );
};

export default AppRoutes;