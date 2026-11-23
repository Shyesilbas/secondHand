import { useTranslation } from 'react-i18next';
import { Package } from 'lucide-react';
import HeaderDropdownPanel from './HeaderDropdownPanel.jsx';
import HeaderMenuItem from './HeaderMenuItem.jsx';
import { headerIconTriggerClass } from './HeaderIconButton.jsx';
import { getListingsMenuItems } from './headerMenuConfig.js';
import { useSellerToShipCount } from '../../../../order/hooks/useSellerToShipCount.js';

const StatusPill = ({ value, label }) => (
  <span
    className="ml-auto inline-flex items-center rounded-sm border border-status-error-border bg-status-error-bg px-1.5 py-0.5 text-xs font-medium tabular-nums text-status-error-text"
    aria-label={label}
  >
    {value}
  </span>
);

const HeaderListingsMenu = ({ isOpen, onToggle, onClose, orderCount }) => {
  const { t } = useTranslation();
  const toShipCount = useSellerToShipCount();
  const toShipLabel = t('orders_to_ship_count', {
    defaultValue: '{{count}} sipariş kargolanmayı bekliyor',
    count: toShipCount
  });
  const needsAttention = orderCount > 0 || toShipCount > 0;

  const rightContentFor = (key) => {
    if (key === 'orders' && orderCount > 0) {
      return (
        <StatusPill
          value={orderCount > 99 ? '99+' : orderCount}
          label={t('orders_awaiting_confirmation', 'Onay bekleyen teslimatın var')}
        />
      );
    }
    if (key === 'sold' && toShipCount > 0) {
      return <StatusPill value={toShipCount > 99 ? '99+' : toShipCount} label={toShipLabel} />;
    }
    return null;
  };

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        title={t('orders', 'Siparişler')}
        aria-label={toShipCount > 0 ? toShipLabel : t('orders_menu', 'Siparişler ve ilanlar menüsü')}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={headerIconTriggerClass(isOpen)}
      >
        <Package className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        {needsAttention && (
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-background-primary bg-status-error"
            aria-hidden
          />
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
