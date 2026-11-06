import { useTranslation } from 'react-i18next';
import { Package } from 'lucide-react';
import HeaderDropdownPanel from './HeaderDropdownPanel.jsx';
import HeaderMenuItem from './HeaderMenuItem.jsx';
import { getListingsMenuItems } from './headerMenuConfig.js';
import { useSellerToShipCount } from '../../../../order/hooks/useSellerToShipCount.js';

const AttentionMark = ({ label }) => (
  <span
    className="ml-auto flex h-5 min-w-5 items-center justify-center rounded bg-status-error px-1 text-xs font-semibold text-white"
    aria-label={label}
  >
    !
  </span>
);

const HeaderListingsMenu = ({ isOpen, onToggle, onClose, orderCount }) => {
  const { t } = useTranslation();
  const toShipCount = useSellerToShipCount();
  const toShipLabel = t('orders_to_ship_count', { defaultValue: '{{count}} sipariş kargolanmayı bekliyor', count: toShipCount });
  const needsAttention = orderCount > 0 || toShipCount > 0;

  const rightContentFor = (key) => {
    if (key === 'orders' && orderCount > 0) return <AttentionMark label={t('orders_awaiting_confirmation', 'Onay bekleyen teslimatın var')} />;
    if (key === 'sold' && toShipCount > 0) {
      return (
        <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-status-error">
          {toShipCount}
          <AttentionMark label={toShipLabel} />
        </span>
      );
    }
    return null;
  };

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-label={toShipCount > 0 ? toShipLabel : t('orders', 'Siparişler')}
        className="group relative p-2.5 text-text-secondary hover:text-text-primary transition-all duration-300 ease-in-out rounded hover:bg-background-tertiary/50"
      >
        <Package className="w-5 h-5 stroke-1.5" />
        {toShipCount > 0 ? (
          <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-status-error text-xs font-bold leading-none text-white">
            !
          </span>
        ) : needsAttention && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5 bg-status-error rounded-full border border-white shadow-sm" />
        )}
      </button>
      {isOpen && (
        <HeaderDropdownPanel>
          {getListingsMenuItems().map((item) => (
            <HeaderMenuItem
              key={item.key}
              to={item.to}
              onClick={onClose}
              icon={item.icon}
              labelKey={item.labelKey}
              label={item.label}
              rightContent={rightContentFor(item.key)}
            />
          ))}
        </HeaderDropdownPanel>
      )}
    </>
  );
};

export default HeaderListingsMenu;
