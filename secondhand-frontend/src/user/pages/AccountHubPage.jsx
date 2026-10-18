import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Heart,
  Menu,
  MessageSquare,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usePlan } from '@/common/hooks/usePlan';
import PremiumUpgradeModal from '@/common/components/ui/PremiumUpgradeModal';
import Alert from '@/common/components/ui/Alert';
import Button, { buttonClasses } from '@/common/components/ui/Button';
import Modal from '@/common/components/ui/Modal';
import Skeleton from '@/common/components/ui/Skeleton';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { USER_DEFAULTS } from '../userConstants.js';
import { getAccountHubNavGroups } from '../utils/accountHubSections.js';
import { isAdminUser } from '../../common/utils/admin.js';
import { orderService } from '../../order/services/orderService.js';
import { formatCurrency, formatDate } from '../../common/formatters.js';
import MyShowcasesPanel from '../../showcase/components/MyShowcasesPanel.jsx';
import { useMyShowcases } from '../../showcase/hooks/useMyShowcases.js';

const getInitials = (name) => {
  const value = (name || '').trim();
  if (!value) return USER_DEFAULTS.FALLBACK_NAME_INITIAL;
  const parts = value.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || USER_DEFAULTS.FALLBACK_NAME_INITIAL;
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return `${first}${last}`.toUpperCase();
};

const isRouteActive = (pathname, route) => pathname === route;

const formatGroupLabel = (text, isTr) => {
  if (!text) return '';
  const locale = isTr ? 'tr-TR' : 'en-US';
  const lower = text.toLocaleLowerCase(locale);
  return lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1);
};

const formatOrderDate = (dateString) => {
  if (!dateString) return '';
  try {
    let date;
    if (typeof dateString === 'string' && dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateString);
    }
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

const CARD = 'rounded border border-border bg-background-primary';

const ORDER_STATUS_DOT = {
  COMPLETED: 'bg-status-success',
  DELIVERED: 'bg-status-success',
  SHIPPED: 'bg-primary',
  IN_TRANSIT: 'bg-primary',
  PROCESSING: 'bg-status-warning',
  CANCELLED: 'bg-status-error',
};


const QuickActionLink = ({ to, icon: Icon, title }) => (
  <Link
    to={to}
    className={`${CARD} group flex items-center justify-between gap-3 px-4 py-3 transition-colors duration-150 ease-out hover:border-card-border-hover`}
  >
    <span className="flex min-w-0 items-center gap-2.5">
      <Icon className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
      <span className="truncate text-sm font-medium text-text-primary">{title}</span>
    </span>
    <ChevronRight
      className="h-4 w-4 shrink-0 text-text-muted transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none"
      strokeWidth={1.5}
      aria-hidden
    />
  </Link>
);

const DetailRow = ({ label, value, hint }) => (
  <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
    <span className="text-text-secondary">{label}</span>
    <span className="text-right font-medium tabular-nums text-text-primary">
      {value}
      {hint ? <span className="ml-1.5 text-xs font-normal text-text-tertiary">{hint}</span> : null}
    </span>
  </div>
);

const AccountHubPage = () => {
  const { t, i18n } = useTranslation();
  const isTr = Boolean(i18n?.language?.startsWith('tr'));
  const trEn = (trText, enText) => (isTr ? trText : enText);

  const { user } = useAuthState();
  const { pathname } = useLocation();
  const [openGroups, setOpenGroups] = useState(() => new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const navGroups = useMemo(() => {
    const id = user?.id;
    return getAccountHubNavGroups(id ?? 0, {
      isAdmin: isAdminUser(user),
    });
  }, [user]);

  const toggleGroup = (id) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['myOrders', user?.id, 0, 5],
    queryFn: () => orderService.myOrders(0, 5),
    enabled: Boolean(user?.id),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const recentOrders = useMemo(() => ordersData?.content || [], [ordersData]);

  const {
    plan,
    isPremium,
    expirationDate,
    dailyAuraUsage,
    dailyAuraLimit,
    maxShowcaseSlots,
    estimatedShippingDays,
    autoRenew,
    cancelSubscription,
    isCancelling,
    toggleAutoRenew,
    isTogglingAutoRenew,
  } = usePlan();

  const { showcases } = useMyShowcases(user?.id);
  const activeShowcasesCount = useMemo(
    () => (showcases ? showcases.filter((s) => new Date(s.endDate) > new Date()).length : 0),
    [showcases]
  );

  const isExpiringSoon = useMemo(() => {
    if (!isPremium || !expirationDate) return false;
    const diff = new Date(expirationDate) - new Date();
    const days = diff / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 3;
  }, [isPremium, expirationDate]);

  const fullName = user?.name ? `${user.name}${user.surname ? ` ${user.surname}` : ''}` : 'User';
  const firstName = user?.name?.split(' ')[0] || fullName;

  if (!user) {
    return (
      <PageContainer className="py-8">
        <Skeleton className="h-8 w-64" />
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {['a', 'b', 'c'].map((k) => (
            <Skeleton key={k} className="h-12" />
          ))}
        </div>
      </PageContainer>
    );
  }

  const renderNavContent = (onItemClick) => (
    <div className="space-y-1">
      {navGroups.map((group) => {
        if (group.items.length === 1) {
          const item = group.items[0];
          const ItemIcon = item.icon;
          const active = isRouteActive(pathname, item.route);
          return (
            <div key={group.id} className="pb-1">
              <Link
                to={item.route}
                onClick={onItemClick}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors duration-150 ${
                  active
                    ? 'bg-primary font-medium text-white'
                    : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'
                }`}
              >
                <ItemIcon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                <span className="truncate">{t(item.nameKey || item.name)}</span>
              </Link>
            </div>
          );
        }

        const isOpen = openGroups.has(group.id);
        const hasActiveChild = group.items.some((item) => isRouteActive(pathname, item.route));
        const rawGroupLabel = t(group.labelKey || group.label);

        return (
          <div key={group.id} className="border-t border-border-light pt-1.5 first:border-t-0 first:pt-0">
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={isOpen}
              className={`flex w-full items-center justify-between rounded px-3 py-1.5 text-left text-xs font-semibold transition-colors duration-150 ${
                hasActiveChild
                  ? 'text-text-primary'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              <span className="truncate">{formatGroupLabel(rawGroupLabel, isTr)}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-text-muted transition-transform duration-150 ${
                  isOpen ? '' : '-rotate-90'
                }`}
                strokeWidth={1.5}
                aria-hidden
              />
            </button>
            {isOpen && (
              <div className="mt-0.5 space-y-0.5 pb-1">
                {group.items.map((item) => {
                  const ItemIcon = item.icon;
                  const active = isRouteActive(pathname, item.route);
                  return (
                    <Link
                      key={`${group.id}-${item.route}`}
                      to={item.route}
                      onClick={onItemClick}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors duration-150 ${
                        active
                          ? 'bg-primary font-medium text-white'
                          : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'
                      }`}
                    >
                      <ItemIcon
                        className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-text-tertiary'}`}
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      <span className="truncate">{t(item.nameKey || item.name)}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background-secondary">
      <PageContainer className="py-6 lg:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* Left Sidebar */}
          <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-64 xl:w-72">
            <div className={`${CARD} p-4`}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background-tertiary text-sm font-semibold text-text-secondary">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="" className="h-full w-full object-cover" />
                  ) : (
                    getInitials(`${user?.name || ''} ${user?.surname || ''}`)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-semibold text-text-primary">{fullName}</h2>
                  <p className="truncate text-xs text-text-tertiary">{user?.email || ''}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border-light pt-3 text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium text-text-secondary">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isPremium ? 'bg-status-warning' : 'bg-secondary-400'
                    }`}
                    aria-hidden
                  />
                  {isPremium ? plan || 'Premium' : t('standard', 'Standard')}
                </span>
                <Link
                  to={ROUTES.PROFILE}
                  className="font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  {t('edit', 'Edit')}
                </Link>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="mt-3 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                className={`${CARD} flex h-11 w-full items-center justify-between px-4 text-sm font-medium text-text-primary`}
              >
                <span className="flex items-center gap-2">
                  <Menu className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                  <span>{t('account_hub', 'Account Hub')}</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-text-muted transition-transform duration-150 ${
                    mobileMenuOpen ? 'rotate-180' : ''
                  }`}
                  strokeWidth={1.5}
                  aria-hidden
                />
              </button>
              {mobileMenuOpen && (
                <nav
                  className={`${CARD} mt-2 p-2`}
                  aria-label={trEn('Hesap menüsü', 'Account navigation')}
                >
                  {renderNavContent(() => setMobileMenuOpen(false))}
                </nav>
              )}
            </div>

            {/* Desktop Sidebar Navigation */}
            <nav
              className={`${CARD} mt-4 hidden p-2 lg:block`}
              aria-label={trEn('Hesap menüsü', 'Account navigation')}
            >
              {renderNavContent(undefined)}
            </nav>
          </aside>

          {/* Main Workspace */}
          <main className="min-w-0 flex-1 space-y-6">
            {isExpiringSoon && (
              <Alert
                type="warning"
                message={`${t('your_membership_expires_soon')} — ${t('expires_on', {
                  date: new Date(expirationDate).toLocaleDateString(isTr ? 'tr-TR' : 'en-US'),
                })}${!autoRenew ? ` ${t('auto_renew_off_warning')}` : ''}`}
                action={
                  <Button variant="secondary" size="sm" onClick={() => setShowUpgrade(true)}>
                    {trEn('Yenile', 'Renew')}
                  </Button>
                }
              />
            )}

            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-text-primary">
                  {t('welcome', 'Welcome,')} {firstName}
                </h1>
                <p className="mt-0.5 text-sm text-text-secondary">
                  {t('your_personal_secondhand_space')}
                </p>
              </div>
              <Link to={ROUTES.CREATE_LISTING} className={`${buttonClasses()} shrink-0`}>
                <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                <span>{t('new_listing', 'New Listing')}</span>
              </Link>
            </div>

            {/* Quick Links Strip */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <QuickActionLink
                to={ROUTES.MY_LISTINGS}
                icon={Package}
                title={t('my_listings', 'My Listings')}
              />
              <QuickActionLink
                to={ROUTES.FAVORITES}
                icon={Heart}
                title={t('favorites', 'Favorites')}
              />
              <QuickActionLink
                to={ROUTES.INBOX}
                icon={MessageSquare}
                title={t('inbox', 'Inbox')}
              />
            </div>

            {/* Primary Operational Grid: Recent Orders + Plan Summary */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Recent Orders (2 cols on desktop) */}
              <section className={`${CARD} flex flex-col p-5 lg:col-span-2`}>
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-border-light pb-3">
                  <h2 className="text-lg font-semibold text-text-primary">
                    {t('recent_orders', 'Recent Orders')}
                  </h2>
                  <Link
                    to={ROUTES.MY_ORDERS}
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
                  >
                    <span>{t('view_all', 'View All')}</span>
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                  </Link>
                </div>

                {ordersLoading ? (
                  <div className="space-y-3">
                    {['a', 'b', 'c'].map((k) => (
                      <Skeleton key={k} className="h-14" />
                    ))}
                  </div>
                ) : ordersError ? (
                  <Alert
                    type="error"
                    message={trEn(
                      'Siparişler yüklenirken bir hata oluştu.',
                      'Failed to load recent orders.'
                    )}
                    action={
                      <Button variant="secondary" size="sm" onClick={() => refetchOrders()}>
                        {trEn('Tekrar Dene', 'Retry')}
                      </Button>
                    }
                  />
                ) : recentOrders.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                    <ShoppingBag
                      className="mb-3 h-5 w-5 text-text-muted"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <h3 className="text-sm font-medium text-text-primary">
                      {t('your_shopping_bag_is_waiting')}
                    </h3>
                    <p className="mt-1 max-w-xs text-xs text-text-secondary">
                      {t('explore_our_second_hand_listings_to_find')}
                    </p>
                    <Link
                      to={ROUTES.LISTINGS}
                      className={`${buttonClasses('secondary', 'sm')} mt-4`}
                    >
                      {t('explore_listings')}
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-border-light">
                    {recentOrders.map((order) => {
                      const items = order.orderItems || order.items || [];
                      const firstItem = items[0];
                      const listing = firstItem?.listing;
                      const thumbUrl = listing?.imageUrl || firstItem?.imageUrl;
                      const lineTitle = listing?.title || firstItem?.title;
                      const statusLabel =
                        {
                          COMPLETED: t('completed', 'Completed'),
                          DELIVERED: trEn('Teslim Edildi', 'Delivered'),
                          SHIPPED: trEn('Kargoya Verildi', 'Shipped'),
                          IN_TRANSIT: trEn('Kargoda', 'In Transit'),
                          PROCESSING: trEn('Hazırlanıyor', 'Processing'),
                          CANCELLED: trEn('İptal Edildi', 'Cancelled'),
                        }[order.status] || order.status?.replace(/_/g, ' ');

                      return (
                        <li key={order.id}>
                          <Link
                            to={ROUTES.MY_ORDERS}
                            className="-mx-2 flex items-center justify-between gap-4 rounded px-2 py-3 transition-colors duration-150 hover:bg-background-secondary"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded border border-border-light bg-background-secondary">
                                {thumbUrl ? (
                                  <img
                                    src={thumbUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <ShoppingBag
                                    className="h-4 w-4 text-text-muted"
                                    strokeWidth={1.5}
                                    aria-hidden
                                  />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h3 className="truncate text-sm font-medium text-text-primary">
                                  {order.name || lineTitle || trEn('Siparişiniz', 'Your Order')}
                                </h3>
                                {order.createdAt ? (
                                  <time
                                    dateTime={order.createdAt}
                                    className="mt-0.5 block text-xs tabular-nums text-text-tertiary"
                                  >
                                    {formatOrderDate(order.createdAt)}
                                  </time>
                                ) : null}
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold tabular-nums text-text-primary">
                                {formatCurrency(
                                  order.totalAmount ?? order.total ?? 0,
                                  order.currency || 'TRY'
                                )}
                              </p>
                              <p className="mt-0.5 inline-flex items-center justify-end gap-1.5 text-xs text-text-secondary">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    ORDER_STATUS_DOT[order.status] || 'bg-secondary-400'
                                  }`}
                                  aria-hidden
                                />
                                <span>{statusLabel}</span>
                              </p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Membership & Plan Summary (1 col on desktop) */}
              <section className={`${CARD} flex flex-col justify-between p-5`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-border-light pb-3">
                    <div>
                      <h2 className="text-base font-semibold text-text-primary">
                        {t('membership_and_privileges', 'Membership')}
                      </h2>
                      <p className="mt-0.5 text-xs text-text-tertiary">
                        {isPremium
                          ? trEn('Aktif üyelik ayrıcalıklarınız', 'Your active membership privileges')
                          : trEn('Hesap planınız ve yükseltme seçenekleri', 'Your plan and upgrade options')}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-border bg-background-secondary px-2 py-0.5 text-xs font-medium text-text-primary">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isPremium ? 'bg-status-warning' : 'bg-secondary-400'
                        }`}
                        aria-hidden
                      />
                      {isPremium ? plan || 'PRO' : t('standard', 'Standard')}
                    </span>
                  </div>

                  {!isPremium ? (
                    <div className="divide-y divide-border-light text-sm">
                      <DetailRow
                        label={t('fast_shipping', 'Fast Shipping')}
                        value={`${estimatedShippingDays} ${t('day', 'day')}`}
                      />
                      <DetailRow
                        label={t('showcase_slot', 'Showcase Slot')}
                        value={`${activeShowcasesCount} / ${maxShowcaseSlots}`}
                      />
                      <DetailRow
                        label={t('aura_ai_message_limit', 'Aura AI Limit')}
                        value={`${dailyAuraUsage} / ${dailyAuraLimit || 2}`}
                      />
                    </div>
                  ) : (
                    /* Active PRO Member View */
                    <div className="divide-y divide-border-light text-sm">
                      <DetailRow
                        label={t('fast_shipping', 'Fast Shipping')}
                        value={`${estimatedShippingDays} ${t('day', 'day')}`}
                      />
                      <DetailRow
                        label={t('showcase_slot', 'Showcase Slot')}
                        value={`${activeShowcasesCount} / ${maxShowcaseSlots}`}
                      />
                      <DetailRow
                        label={t('aura_ai_message_limit', 'Aura AI Limit')}
                        value={`${dailyAuraUsage} / ${dailyAuraLimit || 8}`}
                      />
                      {expirationDate && (
                        <DetailRow
                          label={t('end_date', 'End Date')}
                          value={formatDate(expirationDate)}
                        />
                      )}
                      <DetailRow
                        label={t('auto_renew', 'Auto Renewal')}
                        value={autoRenew ? trEn('Açık', 'Enabled') : t('disabled', 'Disabled')}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-2">
                  {isPremium ? (
                    autoRenew ? (
                      <Button
                        variant="danger"
                        className="w-full"
                        onClick={() => setConfirmCancel(true)}
                        disabled={isCancelling}
                      >
                        {isCancelling
                          ? t('processing_progress', 'Processing…')
                          : t('cancel_subscription', 'Cancel Subscription')}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => toggleAutoRenew(true)}
                        disabled={isTogglingAutoRenew}
                      >
                        {isTogglingAutoRenew
                          ? t('enabling', 'Enabling...')
                          : t('reactivate', 'Reactivate')}
                      </Button>
                    )
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => setShowUpgrade(true)}
                    >
                      <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                      <span>{trEn('Premium Avantajları için tıklayın', 'Click for Premium Privileges')}</span>
                    </Button>
                  )}
                </div>
              </section>
            </div>

            <MyShowcasesPanel userId={user?.id} />
          </main>
        </div>
      </PageContainer>

      <PremiumUpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />

      <Modal
        isOpen={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title={t('cancel_subscription', 'Cancel Subscription')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmCancel(false)}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmCancel(false);
                cancelSubscription();
              }}
            >
              {t('cancel_subscription', 'Cancel Subscription')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">{t('confirm_cancel_subscription')}</p>
      </Modal>
    </div>
  );
};

export default AccountHubPage;
