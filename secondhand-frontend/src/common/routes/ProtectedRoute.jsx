import { useTranslation } from "react-i18next";
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { ROUTES } from '../constants/routes.js';
import Skeleton from '../components/ui/Skeleton.jsx';
import { useLoginPrompt } from '../../auth/hooks/useLoginPrompt.js';
const ProtectedRoute = ({
 children
}) => {
 const {
 t
 } = useTranslation();
 const {
 authState: {
 isAuthenticated,
 isLoading
 }
 } = useAuth();
 const navigate = useNavigate();
 const goHome = useCallback(() => navigate(ROUTES.HOME, { replace: true }), [navigate]);
 const promptLogin = useLoginPrompt({ onCancel: goHome });
 useEffect(() => {
 if (!isLoading && !isAuthenticated) promptLogin();
 }, [isAuthenticated, isLoading, promptLogin]);
 if (isLoading) {
 return <div className="mx-auto max-w-7xl space-y-4 px-4 py-8" aria-busy="true" aria-label={t("verifying_authentication")}>
 <Skeleton className="h-8 w-48" />
 <Skeleton className="h-64 w-full" />
 </div>;
 }
 if (!isAuthenticated) {
 // Notification modal is already shown via useEffect, render minimal placeholder
 return <div className="flex flex-col items-center justify-center min-h-screen gap-4">
 <p className="text-sm text-text-tertiary">{t("redirecting_to_login")}</p>
 </div>;
 }
 return children;
};
export default ProtectedRoute;