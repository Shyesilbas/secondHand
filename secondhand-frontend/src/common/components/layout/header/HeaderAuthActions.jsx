import { useTranslation } from 'react-i18next';
import HeaderInboxMenu from './HeaderInboxMenu.jsx';
import HeaderIconButton, { headerIconTriggerClass } from './HeaderIconButton.jsx';
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
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center gap-1">
        <div className="relative" ref={inboxMenuRef}>
          <HeaderInboxMenu
            isOpen={inboxMenuOpen}
            onToggle={onToggleInboxMenu}
            onClose={closeAllDropdowns}
            emailCount={emailCount}
            chatCount={chatCount}
          />
        </div>

        <HeaderIconButton to={ROUTES.FAVORITES} icon={Heart} title={t('favorites', 'Favoriler')} />
        <HeaderIconButton to={ROUTES.SHOPPING_CART} icon={ShoppingBag} badge={cartCount} title={t('cart', 'Sepet')} />

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

      <div className="mx-1.5 hidden h-5 w-px bg-border-light sm:block" aria-hidden />

      <div className="relative" ref={profileMenuRef}>
        <HeaderProfileMenu
          user={user}
          isOpen={profileMenuOpen}
          onToggle={onToggleProfileMenu}
          onClose={closeAllDropdowns}
          onLogout={onLogout}
        />
      </div>

      <button
        type="button"
        onClick={onToggleMobileMenu}
        aria-expanded={mobileMenuOpen}
        aria-label={mobileMenuOpen ? t('close_menu', 'Menüyü kapat') : t('open_menu', 'Menüyü aç')}
        className={`lg:hidden ${headerIconTriggerClass(mobileMenuOpen)}`}
      >
        {mobileMenuOpen ? (
          <X className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        ) : (
          <Menu className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        )}
      </button>
    </>
  );
};

export default HeaderAuthActions;
