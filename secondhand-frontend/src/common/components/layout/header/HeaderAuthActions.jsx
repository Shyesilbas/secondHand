import NotificationBadge from '../../../../notification/components/NotificationBadge.jsx';
import NotificationCenter from '../../../../notification/components/NotificationCenter.jsx';
import HeaderIconButton from './HeaderIconButton.jsx';
import HeaderPaymentsMenu from './HeaderPaymentsMenu.jsx';
import HeaderListingsMenu from './HeaderListingsMenu.jsx';
import HeaderProfileMenu from './HeaderProfileMenu.jsx';
import { Heart, Mail, Menu, MessageSquare, ShoppingBag, X } from 'lucide-react';
import { ROUTES } from '../../../constants/routes.js';

const HeaderAuthActions = ({
    user,
    emailCount,
    chatCount,
    cartCount,
    orderCount,
    mobileMenuOpen,
    onToggleMobileMenu,
    inAppNotificationCenterOpen,
    onToggleNotificationCenter,
    onCloseNotificationCenter,
    paymentsMenuOpen,
    listingsMenuOpen,
    profileMenuOpen,
    onTogglePaymentsMenu,
    onToggleListingsMenu,
    onToggleProfileMenu,
    closeAllDropdowns,
    paymentsMenuRef,
    listingsMenuRef,
    profileMenuRef,
    onLogout,
}) => (
    <>
        <div className="flex items-center gap-1 mr-2">
            <div className="relative">
                <NotificationBadge onClick={onToggleNotificationCenter} />
                <NotificationCenter isOpen={inAppNotificationCenterOpen} onClose={onCloseNotificationCenter} />
            </div>

            <div className="h-6 w-[1px] bg-gray-300 mx-1" />

            <HeaderIconButton to={ROUTES.EMAILS} icon={Mail} badge={emailCount} title="Mails" />
            <HeaderIconButton to={ROUTES.CHAT} icon={MessageSquare} badge={chatCount} title="Chats" />
            <HeaderIconButton to={ROUTES.FAVORITES} icon={Heart} title="Favorites" />
            <HeaderIconButton to={ROUTES.SHOPPING_CART} icon={ShoppingBag} badge={cartCount} title="Cart" />

            <div className="relative" ref={paymentsMenuRef}>
                <HeaderPaymentsMenu
                    isOpen={paymentsMenuOpen}
                    onToggle={onTogglePaymentsMenu}
                    onClose={closeAllDropdowns}
                />
            </div>

            <div className="relative" ref={listingsMenuRef}>
                <HeaderListingsMenu
                    isOpen={listingsMenuOpen}
                    orderCount={orderCount}
                    onToggle={onToggleListingsMenu}
                    onClose={closeAllDropdowns}
                />
            </div>
        </div>

        <div className="h-8 w-[1px] bg-gray-300 mx-2 hidden sm:block" />

        <div className="relative" ref={profileMenuRef}>
            <HeaderProfileMenu
                user={user}
                isOpen={profileMenuOpen}
                onToggle={onToggleProfileMenu}
                onClose={closeAllDropdowns}
                onLogout={onLogout}
            />
        </div>

        <button className="lg:hidden p-2.5 ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all duration-300 ease-in-out rounded-xl" onClick={onToggleMobileMenu}>
            {mobileMenuOpen ? <X /> : <Menu />}
        </button>
    </>
);

export default HeaderAuthActions;
