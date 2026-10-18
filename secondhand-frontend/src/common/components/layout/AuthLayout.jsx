import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from 'react-router-dom';
import { getPageName } from '../../utils/getPageName.js';
import { OnboardingCarousel } from '../../../auth/components/OnboardingCarousel.jsx';
const AuthLayout = () => {
 const {
 t
 } = useTranslation();
 const {
 pathname
 } = useLocation();
 const pageName = getPageName(pathname);

 // Serene split-screen layout with spacious proportions (Left: 56% width, Right: 44% width)
 return <div className="flex min-h-screen w-full bg-background-secondary" data-page={pageName ?? undefined} data-path={pathname}>
 {/* ── Left: Form Area (56% width to give inputs generous space) ── */}
 <div className="flex flex-col w-full lg:w-7/12 min-h-screen overflow-y-auto bg-background-primary shadow-sm z-15 relative">
 <PageContainer narrow className="flex-col flex-1 justify-between py-10 px-6 sm:px-12 md:px-16 lg:px-18 xl:px-20 w-full">
 {/* Header Spacing wrapper */}
 <div className="flex-1 flex flex-col justify-center py-6">
 <Outlet />
 </div>

 <footer className="pt-8 text-center border-t border-border-light mt-auto">
 <p className="text-xs text-text-muted font-medium">{t("2026_secondhand_all_rights_reserved")}</p>
 </footer>
 </PageContainer>
 </div>

 {/* ── Right: Visual Carousel Area (44% width showcase) ── */}
 <div className="hidden lg:flex lg:w-5/12 sticky top-0 h-screen bg-background-secondary border-l border-border/50 relative overflow-hidden items-center justify-center">
 <div className="relative z-10 w-full h-full max-w-lg">
 <OnboardingCarousel />
 </div>
 </div>
 </div>;
};
export default AuthLayout;