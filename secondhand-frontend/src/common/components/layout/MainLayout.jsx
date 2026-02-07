import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { getPageName } from '../../utils/getPageName.js';
import AuraChatWidget from '../../../ai/components/AuraChatWidget.jsx';
import { ListingActionProvider } from '../../../listing/context/ListingActionContext.jsx';
import GlobalActionModal from '../../../listing/components/GlobalActionModal.jsx';

const MainLayout = () => {
    const { pathname } = useLocation();
    const pageName = getPageName(pathname);
    return (
        <ListingActionProvider>
            <div
                className="min-h-screen flex flex-col bg-main-bg"
                data-page={pageName ?? undefined}
                data-path={pathname}
            >
                <Header />
                <main className="flex-1">
                    <Outlet />
                </main>
                <Footer />
                <AuraChatWidget />
                <GlobalActionModal />
            </div>
        </ListingActionProvider>
    );
};

export default MainLayout;