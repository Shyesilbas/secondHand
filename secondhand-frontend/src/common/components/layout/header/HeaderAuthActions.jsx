import { useTranslation } from "react-i18next";
import HeaderInboxMenu from './HeaderInboxMenu.jsx';
import HeaderIconButton from './HeaderIconButton.jsx';
import HeaderPaymentsMenu from './HeaderPaymentsMenu.jsx';
import HeaderListingsMenu from './HeaderListingsMenu.jsx';
import HeaderProfileMenu from './HeaderProfileMenu.jsx';
import { Heart, Menu, ShoppingBag, X } from 'lucide-react';
import { ROUTES } from '../../../constants/routes.js';
const HeaderAuthActions = ({
  user,
  emailCount,
  chatCount,
  cartCount,
  orderCount,
  mobileMenuOpen,
  onToggleMobileMenu,
  paymentsMenuOpen,
  listingsMenuOpen,
  profileMenuOpen,
  inboxMenuOpen,
  onTogglePaymentsMenu,
  onToggleListingsMenu,
  onToggleProfileMenu,
  onToggleInboxMenu,
  closeAllDropdowns,
  paymentsMenuRef,
  listingsMenuRef,
  profileMenuRef,
  inboxMenuRef,
  onLogout
}) => {
  const {
    t
  } = useTranslation();

  return <>
        <div className="flex items-center gap-1 mr-2">
            <div className="relative" ref={inboxMenuRef}>
                <HeaderInboxMenu isOpen={inboxMenuOpen} onToggle={onToggleInboxMenu} onClose={closeAllDropdowns} emailCount={emailCount} chatCount={chatCount} />
            </div>

            <HeaderIconButton to={ROUTES.FAVORITES} icon={Heart} title={t("favorites")} />
            <HeaderIconButton to={ROUTES.SHOPPING_CART} icon={ShoppingBag} badge={cartCount} title={t("cart")} />

            <div className="relative" ref={paymentsMenuRef}>
                <HeaderPaymentsMenu isOpen={paymentsMenuOpen} onToggle={onTogglePaymentsMenu} onClose={closeAllDropdowns} />
            </div>

            <div className="relative" ref={listingsMenuRef}>
                <HeaderListingsMenu isOpen={listingsMenuOpen} orderCount={orderCount} onToggle={onToggleListingsMenu} onClose={closeAllDropdowns} />
            </div>
        </div>

        <div className="h-8 w-[1px] bg-border-light mx-2 hidden sm:block" />

        <div className="relative" ref={profileMenuRef}>
            <HeaderProfileMenu user={user} isOpen={profileMenuOpen} onToggle={onToggleProfileMenu} onClose={closeAllDropdowns} onLogout={onLogout} />
        </div>

        <button className="lg:hidden p-2.5 ml-2 text-text-muted hover:text-text-primary hover:bg-secondary transition-all duration-300 ease-in-out rounded-xl" onClick={onToggleMobileMenu}>
            {mobileMenuOpen ? <X /> : <Menu />}
        </button>
    </>;
};
export default HeaderAuthActions;
