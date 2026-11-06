// The dashboard API returns plain amounts without a currency; the platform settles in TRY.
export const DASHBOARD_CURRENCY = 'TRY';

/** Order statuses as the dashboards show them. */
export const ORDER_STATUS_ROWS = [
  { key: 'PENDING', label: 'Ödeme bekleniyor', dot: 'bg-text-muted' },
  { key: 'CONFIRMED', label: 'Onaylandı', dot: 'bg-status-warning' },
  { key: 'PROCESSING', label: 'Hazırlanıyor', dot: 'bg-status-warning' },
  { key: 'SHIPPED', label: 'Kargoda', dot: 'bg-primary' },
  { key: 'DELIVERED', label: 'Teslim edildi', dot: 'bg-status-success' },
  { key: 'COMPLETED', label: 'Tamamlandı', dot: 'bg-status-success' },
  { key: 'CANCELLED', label: 'İptal edildi', dot: 'bg-status-error' },
  { key: 'REFUNDED', label: 'İade edildi', dot: 'bg-status-error' },
];
