import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { ROUTES } from '../../constants/routes.js';
import { getPageName } from '../../utils/getPageName.js';
import AuraChatWidget from '../../../ai/components/AuraChatWidget.jsx';
import { ListingActionProvider } from '../../../listing/context/ListingActionProvider.jsx';
import GlobalActionModal from '../../../listing/components/GlobalActionModal.jsx';

const MainLayout = () => {
 const { pathname } = useLocation();
 const pageName = getPageName(pathname);
 // Aura and the inbox scroll their own panes; the shell is locked to the viewport so composers and
 // lists end at the screen edge whatever the header height is (verification bar, mobile search row).
 const lockViewport = pathname === ROUTES.AURA_CHAT || pathname === ROUTES.INBOX;
 const fullHeightWizard = lockViewport || pathname === ROUTES.CREATE_LISTING;
 return (
 <ListingActionProvider>
 <div
 className={`flex flex-col bg-main-bg ${lockViewport ? 'h-dvh overflow-hidden' : 'min-h-screen'}`}
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