import { lazy, Suspense } from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import {useAuth} from '../../auth/AuthContext.jsx';
import {ROUTES} from '../constants/routes.js';
import LoadingIndicator from '../components/ui/LoadingIndicator.jsx';

// Layouts - Always loaded
import MainLayout from '../components/layout/MainLayout.jsx';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';

// Critical Routes - Eager loaded (always needed on initial load)
import HomePage from '../../home/pages/HomePage.jsx';
import LoginPage from '../../auth/pages/LoginPage.jsx';
import RegisterPage from '../../auth/pages/RegisterPage.jsx';

// High Priority - Lazy loaded (frequently accessed)
const ListingsPage = lazy(() => import('../../listing/pages/ListingsPage.jsx'));
const ListingDetailPage = lazy(() => import('../../listing/pages/ListingDetailPage.jsx'));
const ListingsPrefilterPage = lazy(() => import('../../listing/pages/ListingsPrefilterPage.jsx'));

// Auth Pages - Lazy loaded
const ForgotPasswordPage = lazy(() => import('../../auth/pages/ForgotPasswordPage.jsx'));
const ChangePasswordPage = lazy(() => import('../../auth/pages/ChangePasswordPage.jsx'));
const AccountVerificationPage = lazy(() => import('../../auth/pages/AccountVerificationPage.jsx'));
const OAuthCallbackPage = lazy(() => import('../../auth/pages/OAuthCallbackPage.jsx'));
const OAuthErrorPage = lazy(() => import('../../auth/pages/OAuthErrorPage.jsx'));
const OAuthCompletePage = lazy(() => import('../../auth/pages/OAuthCompletePage.jsx'));

// User Pages - Lazy loaded
const AccountHubPage = lazy(() => import('../../user/pages/AccountHubPage.jsx'));
const ProfilePage = lazy(() => import('../../user/pages/ProfilePage.jsx'));
const UserProfilePage = lazy(() => import('../../user/pages/UserProfilePage.jsx'));

// Listing Management - Lazy loaded
const MyListingsPage = lazy(() => import('../../listing/pages/MyListingsPage.jsx'));
const CreateListingPage = lazy(() => import('../../listing/pages/CreateListingPage.jsx'));
const EditListingPage = lazy(() => import('../../listing/pages/EditListingPage.jsx'));

// Dashboard Pages - Lazy loaded (heavy with charts)
const SellerDashboardPage = lazy(() => import('../../dashboard/pages/SellerDashboardPage.jsx'));
const BuyerDashboardPage = lazy(() => import('../../dashboard/pages/BuyerDashboardPage.jsx'));

// Chat & Communication - Lazy loaded
const ChatPage = lazy(() => import('../../chat/pages/ChatPage.jsx'));
const AuraChatPage = lazy(() => import('../../ai/pages/AuraChatPage.jsx'));
const EmailsPage = lazy(() => import('../../emails/pages/EmailsPage'));

// Forum - Lazy loaded
const ForumPage = lazy(() => import('../../forum/pages/ForumPage.jsx'));

// Shopping & Orders - Lazy loaded
const ShoppingCartPage = lazy(() => import('../../cart/pages/ShoppingCartPage.jsx'));
const CheckoutPage = lazy(() => import('../../cart/pages/CheckoutPage.jsx'));
const MyOrdersPage = lazy(() => import('../../order/pages/MyOrdersPage.jsx'));
const ISoldPage = lazy(() => import('../../order/pages/ISoldPage.jsx'));

// Favorites & Lists - Lazy loaded
const FavoritesPage = lazy(() => import('../../favorites/pages/FavoritesPage'));
const FavoriteListDetailPage = lazy(() => import('../../favoritelist/pages/FavoriteListDetailPage.jsx'));

// Payments - Lazy loaded
const PaymentsPage = lazy(() => import('../../payments/pages/PaymentsPage.jsx'));
const PayListingFeePage = lazy(() => import('../../payments/pages/PayListingFeePage.jsx'));
const PaymentMethodsPage = lazy(() => import('../../payments/pages/PaymentMethodsPage.jsx'));

// Reviews & Ratings - Lazy loaded
const UserReviewsPage = lazy(() => import('../../reviews/pages/UserReviewsPage.jsx'));

// Other Features - Lazy loaded
const ComplaintsPage = lazy(() => import('../../complaint/pages/ComplaintsPage.jsx'));
const AgreementsPage = lazy(() => import('../../agreements/pages/AgreementsPage.jsx'));
const SecurityPage = lazy(() => import('../../audit/pages/SecurityPage.jsx'));
const MyCouponsPage = lazy(() => import('../../campaign/pages/MyCouponsPage.jsx'));
const OffersPage = lazy(() => import('../../offer/pages/OffersPage.jsx'));

// Suspense Fallback Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <LoadingIndicator size="h-12 w-12" />
      <p className="mt-4 text-sm text-gray-600">Loading...</p>
    </div>
  </div>
);


const AppRoutes = () => {
    let authContext;
    try {
        authContext = useAuth();
    } catch (error) {
        // AuthContext not available yet, render loading state
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
        <Suspense fallback={<PageLoader />}>
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
                                <Suspense fallback={<PageLoader />}>
                                    <OAuthCallbackPage />
                                </Suspense>
                            </PublicRoute>
                        }
                    />
                    <Route
                        path={ROUTES.AUTH_ERROR}
                        element={
                            <PublicRoute>
                                <Suspense fallback={<PageLoader />}>
                                    <OAuthErrorPage />
                                </Suspense>
                            </PublicRoute>
                        }
                    />
                    <Route
                        path={ROUTES.AUTH_COMPLETE}
                        element={
                            <PublicRoute>
                                <Suspense fallback={<PageLoader />}>
                                    <OAuthCompletePage />
                                </Suspense>
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
                                <Suspense fallback={<PageLoader />}>
                                    <ForgotPasswordPage />
                                </Suspense>
                            </PublicRoute>
                        }
                    />
                </Route>

                {/* Public Routes with Main Layout */}
                <Route element={<MainLayout />}>
                    <Route path={ROUTES.HOME} element={<HomePage />} />
                    <Route 
                        path={ROUTES.LISTINGS_PREFILTER} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <ListingsPrefilterPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.LISTINGS} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <ListingsPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.FORUM} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <ForumPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.LISTING_DETAIL(':id')} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <ListingDetailPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.FAVORITE_LIST_DETAIL(':listId')} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <FavoriteListDetailPage />
                            </Suspense>
                        } 
                    />
                </Route>

                {/* Protected Routes with Main Layout */}
                <Route
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route 
                        path={ROUTES.DASHBOARD} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <AccountHubPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.SELLER_DASHBOARD} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <SellerDashboardPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.BUYER_DASHBOARD} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <BuyerDashboardPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.PROFILE} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <ProfilePage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.CHANGE_PASSWORD} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <ChangePasswordPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.VERIFY_ACCOUNT} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <AccountVerificationPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.MY_LISTINGS} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <MyListingsPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.COMPLAINTS} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <ComplaintsPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.FAVORITES} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <FavoritesPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.CREATE_LISTING} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <CreateListingPage />
                            </Suspense>
                        } 
                    />
                    <Route
                      path="/listings/create/:listingType/subtype"
                      element={<Navigate to={ROUTES.CREATE_LISTING} replace />}
                    />
                    <Route 
                        path={ROUTES.PAY_LISTING_FEE} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <PayListingFeePage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.PAYMENT_METHODS} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <PaymentMethodsPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.PAYMENTS} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <PaymentsPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.EMAILS} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <EmailsPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.CHAT} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <ChatPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.AURA_CHAT} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <AuraChatPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.USER_PROFILE(':userId')} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <UserProfilePage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.USER_REVIEWS(':userId')} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <UserReviewsPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.REVIEWS_RECEIVED(':userId')} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <UserReviewsPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.REVIEWS_GIVEN(':userId')} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <UserReviewsPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.EDIT_LISTING(':id')} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <EditListingPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.AGREEMENTS} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <AgreementsPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.AGREEMENTS_ALL} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <AgreementsPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.MY_ORDERS} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <MyOrdersPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.I_SOLD} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <ISoldPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.SECURITY} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <SecurityPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.SHOPPING_CART} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <ShoppingCartPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.CHECKOUT} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <CheckoutPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.MY_COUPONS} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <MyCouponsPage />
                            </Suspense>
                        } 
                    />
                    <Route 
                        path={ROUTES.OFFERS} 
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <OffersPage />
                            </Suspense>
                        } 
                    />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;