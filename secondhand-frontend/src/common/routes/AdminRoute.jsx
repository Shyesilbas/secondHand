import { useTranslation } from "react-i18next";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { ROUTES } from '../constants/routes.js';
import { isAdminUser } from '../utils/admin.js';
import Skeleton from '../components/ui/Skeleton.jsx';

/** Children only if authenticated user has ADMIN role; otherwise 403-style redirect home. */
const AdminRoute = ({
 children
}) => {
 const {
 t
 } = useTranslation();
 const {
 authState: {
 user,
 isAuthenticated,
 isLoading
 }
 } = useAuth();
 const location = useLocation();
 if (isLoading) {
 return <div className="mx-auto max-w-7xl space-y-4 px-4 py-8" aria-busy="true" aria-label={t("loading")}>
 <Skeleton className="h-8 w-48" />
 <Skeleton className="h-64 w-full" />
 </div>;
 }
 if (!isAuthenticated) {
 return <Navigate to={ROUTES.LOGIN} state={{
 from: location
 }} replace />;
 }
 if (!isAdminUser(user)) {
 return <Navigate to={ROUTES.HOME} replace />;
 }
 return children;
};
export default AdminRoute;