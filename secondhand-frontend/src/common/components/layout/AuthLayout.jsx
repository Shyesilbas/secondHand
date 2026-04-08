import { Outlet, useLocation } from 'react-router-dom';
import { getPageName } from '../../utils/getPageName.js';

const AuthLayout = () => {
    const { pathname } = useLocation();
    const pageName = getPageName(pathname);
    const isRegisterPage = pageName === 'RegisterPage';

    // Register kendi tam ekran layout'unu yönetiyor
    if (isRegisterPage) {
        return (
            <div className="min-h-screen" data-page={pageName} data-path={pathname}>
                <Outlet />
            </div>
        );
    }

    // Diğer auth sayfaları: beyaz, ortalanmış, sade
    return (
        <div
            className="min-h-screen bg-white flex flex-col"
            data-page={pageName ?? undefined}
            data-path={pathname}
        >
            <div className="flex flex-1 flex-col justify-center px-6 py-12">
                <div className="mx-auto w-full max-w-sm">
                    <Outlet />
                </div>
            </div>

            <footer className="pb-6 text-center">
                <p className="text-xs text-secondary-400">
                    © 2025 SecondHand. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default AuthLayout;
