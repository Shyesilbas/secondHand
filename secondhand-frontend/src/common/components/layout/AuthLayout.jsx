import { Outlet, useLocation } from 'react-router-dom';
import { getPageName } from '../../utils/getPageName.js';
import { OnboardingCarousel } from '../../../auth/components/OnboardingCarousel.jsx';

const AuthLayout = () => {
    const { pathname } = useLocation();
    const pageName = getPageName(pathname);

    // Serene split-screen layout with spacious proportions (Left: 56% width, Right: 44% width)
    return (
        <div 
            className="flex min-h-screen w-full bg-[#faf9f7]" 
            data-page={pageName ?? undefined} 
            data-path={pathname}
        >
            {/* ── Left: Form Area (56% width to give inputs generous space) ── */}
            <div className="flex flex-col w-full lg:w-[56%] min-h-screen overflow-y-auto bg-white shadow-[0_8px_32px_rgba(28,25,23,0.015)] z-15 relative">
                <div className="flex flex-col flex-1 justify-between px-6 py-10 sm:px-12 md:px-16 lg:px-18 xl:px-20 max-w-xl mx-auto w-full">
                    {/* Header Spacing wrapper */}
                    <div className="flex-1 flex flex-col justify-center py-6">
                        <Outlet />
                    </div>

                    <footer className="pt-8 text-center border-t border-stone-100 mt-auto">
                        <p className="text-[10px] tracking-wider text-stone-400 font-medium">
                            © 2026 SECONDHAND. ALL RIGHTS RESERVED.
                        </p>
                    </footer>
                </div>
            </div>

            {/* ── Right: Visual Carousel Area (44% width showcase) ── */}
            <div className="hidden lg:flex lg:w-[44%] sticky top-0 h-screen bg-[#faf9f7] border-l border-stone-200/50 relative overflow-hidden items-center justify-center">
                {/* Minimalist structural warm layers */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-400/5 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-stone-300/10 blur-[100px] pointer-events-none" />
                
                <div className="relative z-10 w-full h-full max-w-lg">
                    <OnboardingCarousel />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
