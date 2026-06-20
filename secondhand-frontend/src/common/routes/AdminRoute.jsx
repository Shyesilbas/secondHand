import { useTranslation } from "react-i18next";
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { ROUTES } from '../constants/routes.js';
import { isAdminUser } from '../utils/admin.js';

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
    return <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                <p className="text-sm text-slate-500">{t("loading")}</p>
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