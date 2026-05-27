import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { ROUTES } from '../../constants/routes.js';
import { getPageName } from '../../utils/getPageName.js';
import AuraChatWidget from '../../../ai/components/AuraChatWidget.jsx';
import { ListingActionProvider } from '../../../listing/context/ListingActionContext.jsx';
import GlobalActionModal from '../../../listing/components/GlobalActionModal.jsx';

const MainLayout = () => {
    const { pathname } = useLocation();
    const pageName = getPageName(pathname);
    const fullHeightWizard = pathname === ROUTES.CREATE_LISTING || pathname === ROUTES.AURA_CHAT || pathname === '/aura';
    return (
        <ListingActionProvider>
            <div
                className="flex min-h-screen flex-col bg-main-bg"
                data-page={pageName ?? undefined}
                data-path={pathname}
            >
                <Header />
                <main className="flex flex-1 flex-col min-h-0">
                    <Outlet />
                </main>
                {!fullHeightWizard ? <Footer /> : null}
                <AuraChatWidget />
                <GlobalActionModal />
            </div>
        </ListingActionProvider>
    );
};

export default MainLayout;