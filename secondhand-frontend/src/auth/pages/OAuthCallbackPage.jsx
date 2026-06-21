import { useTranslation } from "react-i18next";
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
const OAuthCallbackPage = () => {
  const {
    t
  } = useTranslation();

  const navigate = useNavigate();

  useEffect(() => {
    navigate(ROUTES.AUTH_COMPLETE + window.location.search, {
      replace: true
    });
  }, [navigate]);
  return <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <LoadingIndicator />
                <p className="text-text-secondary">{t("signing_you_in")}</p>
            </div>
        </div>;
};
export default OAuthCallbackPage;