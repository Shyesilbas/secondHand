import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
const OAuthErrorPage = () => {
  const {
    t
  } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const message = params.get('message') || 'Authentication failed. Please try again.';
  return <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-md w-full bg-background-primary shadow rounded p-6 text-center">
                <h1 className="text-2xl font-semibold text-text-primary mb-2">{t("authentication_error")}</h1>
                <p className="text-text-secondary mb-6">{message}</p>
                <button className="px-4 py-2 bg-primary text-primary-content rounded-lg hover:opacity-90 transition-opacity font-medium" onClick={() => navigate(ROUTES.LOGIN)}>{t("back_to_login")}</button>
            </div>
        </div>;
};
export default OAuthErrorPage;