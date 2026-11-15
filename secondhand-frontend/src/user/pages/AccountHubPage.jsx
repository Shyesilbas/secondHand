import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Heart, MessageSquare, Package, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usePlan } from '@/common/hooks/usePlan';
import PremiumUpgradeModal from '@/common/components/ui/PremiumUpgradeModal';
import Alert from '@/common/components/ui/Alert';
import Button, { buttonClasses } from '@/common/components/ui/Button';
import Modal from '@/common/components/ui/Modal';
import Skeleton from '@/common/components/ui/Skeleton';
import { Card, PageHeader } from '../../common/components/ui/index.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { getAccountHubNavGroups } from '../utils/accountHubSections.js';
import { isAdminUser } from '../../common/utils/admin.js';
import { orderService } from '../../order/services/orderService.js';
import MyShowcasesPanel from '../../showcase/components/MyShowcasesPanel.jsx';
import { useMyShowcases } from '../../showcase/hooks/useMyShowcases.js';
import { useRestrictionFlags } from '../../complaint/hooks/useComplaints.js';
import AccountHubSidebar from '../components/hub/AccountHubSidebar.jsx';
import AccountHubRecentOrders from '../components/hub/AccountHubRecentOrders.jsx';
import AccountHubPlanCard from '../components/hub/AccountHubPlanCard.jsx';

const QuickActionLink = ({ to, icon: Icon, title }) => (
  <Card
    as={Link}
    to={to}
    padding="none"
    shadow={false}
    interactive
    className="group flex items-center justify-between gap-3 px-4 py-3"
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
  </Card>
);

const AccountHubPage = () => {
  const { t, i18n } = useTranslation();
  const restrictionFlags = useRestrictionFlags();
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
      isAdmin: isAdminUser(user)
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
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['myOrders', user?.id, 0, 5],
    queryFn: () => orderService.myOrders(0, 5),
    enabled: Boolean(user?.id),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
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
    isTogglingAutoRenew
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

  return (
    <div className="min-h-screen bg-background-secondary">
      <PageContainer className="py-6 lg:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <AccountHubSidebar
            user={user}
            fullName={fullName}
            isPremium={isPremium}
            plan={plan}
            isTr={isTr}
            trEn={trEn}
            pathname={pathname}
            navGroups={navGroups}
            openGroups={openGroups}
            toggleGroup={toggleGroup}
            mobileMenuOpen={mobileMenuOpen}
            onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
            onCloseMobileMenu={() => setMobileMenuOpen(false)}
          />

          <main className="min-w-0 flex-1 space-y-6">
            {isExpiringSoon && (
              <Alert
                type="warning"
                message={`${t('your_membership_expires_soon')} — ${t('expires_on', {
                  date: new Date(expirationDate).toLocaleDateString(isTr ? 'tr-TR' : 'en-US')
                })}${!autoRenew ? ` ${t('auto_renew_off_warning')}` : ''}`}
                action={
                  <Button variant="secondary" size="sm" onClick={() => setShowUpgrade(true)}>
                    {trEn('Yenile', 'Renew')}
                  </Button>
                }
              />
            )}

            <PageHeader
              title={`${t('welcome', 'Welcome,')} ${firstName}`}
              subtitle={t('your_personal_secondhand_space')}
              actions={
                restrictionFlags.canCreateListings ? (
                  <Link to={ROUTES.CREATE_LISTING} className={`${buttonClasses()} shrink-0`}>
                    <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                    <span>{t('new_listing', 'New Listing')}</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    title="Hesabınızdaki kısıtlama nedeniyle ilan oluşturamazsınız"
                    className={`${buttonClasses()} shrink-0 disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                    <span>{t('new_listing', 'New Listing')}</span>
                  </button>
                )
              }
            />

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

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <AccountHubRecentOrders
                ordersLoading={ordersLoading}
                ordersError={ordersError}
                recentOrders={recentOrders}
                refetchOrders={refetchOrders}
                trEn={trEn}
              />

              <AccountHubPlanCard
                plan={plan}
                isPremium={isPremium}
                expirationDate={expirationDate}
                dailyAuraUsage={dailyAuraUsage}
                dailyAuraLimit={dailyAuraLimit}
                maxShowcaseSlots={maxShowcaseSlots}
                activeShowcasesCount={activeShowcasesCount}
                estimatedShippingDays={estimatedShippingDays}
                autoRenew={autoRenew}
                isCancelling={isCancelling}
                isTogglingAutoRenew={isTogglingAutoRenew}
                onRequestCancel={() => setConfirmCancel(true)}
                onToggleAutoRenew={toggleAutoRenew}
                onOpenUpgrade={() => setShowUpgrade(true)}
                trEn={trEn}
              />
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
