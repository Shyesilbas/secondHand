import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
 AlertTriangle,
 ArrowRight,
 ChevronDown,
 ChevronRight,
 Heart,
 MessageSquare,
 Package,
 Plus,
 ShoppingBag,
 Sparkles,
 Truck,
 Wallet
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usePlan } from '@/common/hooks/usePlan';
import PremiumUpgradeModal from '@/common/components/ui/PremiumUpgradeModal';
import Button, { buttonClasses } from '@/common/components/ui/Button';
import Modal from '@/common/components/ui/Modal';
import Skeleton from '@/common/components/ui/Skeleton';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { USER_DEFAULTS } from '../userConstants.js';
import { getAccountHubNavGroups } from '../utils/accountHubSections.js';
import { isAdminUser } from '../../common/utils/admin.js';
import { orderService } from '../../order/services/orderService.js';
import { listingService } from '../../listing/services/listingService.js';
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

const CARD = 'rounded border border-border bg-background-primary';

const ORDER_STATUS_DOT = {
 COMPLETED: 'bg-status-success',
 DELIVERED: 'bg-status-success',
 SHIPPED: 'bg-primary',
 IN_TRANSIT: 'bg-primary',
 PROCESSING: 'bg-status-warning',
 CANCELLED: 'bg-status-error',
};

const MetricCard = ({ to, icon: Icon, label, value, hint }) => (
 <Link to={to} className={`${CARD} flex flex-col gap-3 p-5 transition-colors duration-150 ease-out hover:border-card-border-hover`}>
 <div className="flex items-center justify-between">
 <span className="text-sm text-text-secondary">{label}</span>
 <Icon className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 </div>
 <div className="text-2xl font-semibold tabular-nums text-text-primary">{value}</div>
 <p className="flex items-center justify-between text-sm text-text-tertiary">
 <span className="truncate">{hint}</span>
 <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
 </p>
 </Link>
);

const UtilityLink = ({ to, icon: Icon, title, hint }) => (
 <Link to={to} className={`${CARD} flex items-center gap-4 p-5 transition-colors duration-150 ease-out hover:border-card-border-hover`}>
 <Icon className="h-5 w-5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 <div className="min-w-0 flex-1">
 <h3 className="truncate text-sm font-medium text-text-primary">{title}</h3>
 <p className="truncate text-sm text-text-tertiary">{hint}</p>
 </div>
 <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
 </Link>
);

const DetailRow = ({ label, value }) => (
 <div className="flex items-center justify-between gap-4 py-2 text-sm">
 <span className="text-text-secondary">{label}</span>
 <span className="text-right font-medium tabular-nums text-text-primary">{value}</span>
 </div>
);

const QuotaBar = ({ label, used, limit }) => (
 <div className="space-y-2">
 <div className="flex justify-between text-sm">
 <span className="text-text-secondary">{label}</span>
 <span className="font-medium tabular-nums text-text-primary">{used} / {limit}</span>
 </div>
 <div className="h-1.5 w-full overflow-hidden rounded-sm bg-background-tertiary">
 <div className="h-full bg-primary transition-all duration-200 ease-out" style={{ width: `${Math.min(100, (used / limit) * 100)}%` }} />
 </div>
 </div>
);

const AccountHubPage = () => {
 const { t, i18n } = useTranslation();
 const { user } = useAuthState();
 const { pathname } = useLocation();
 const [openGroups, setOpenGroups] = useState(() => new Set(['overview', 'selling', 'buying']));
 const [showUpgrade, setShowUpgrade] = useState(false);
 const [confirmCancel, setConfirmCancel] = useState(false);

 const navGroups = useMemo(() => {
 const id = user?.id;
 return getAccountHubNavGroups(id ?? 0, {
 isAdmin: isAdminUser(user)
 });
 }, [user]);

 const toggleGroup = (id) => {
 setOpenGroups(prev => {
 const next = new Set(prev);
 if (next.has(id)) next.delete(id);
 else next.add(id);
 return next;
 });
 };

 // Recent orders query
 const {
 data: ordersData,
 isLoading: ordersLoading
 } = useQuery({
 queryKey: ['myOrders', user?.id, 0, 5],
 queryFn: () => orderService.myOrders(0, 5),
 enabled: !!user?.id,
 staleTime: 60 * 1000,
 gcTime: 10 * 60 * 1000,
 refetchOnWindowFocus: false
 });
 const recentOrders = useMemo(() => ordersData?.content || [], [ordersData]);
 const totalOrdersCount = ordersData?.totalElements ?? recentOrders.length;

 // Active listings count query
 const {
 data: myListingsData
 } = useQuery({
 queryKey: ['myListings', user?.id, 0, 1, 'ACTIVE'],
 queryFn: () => listingService.getMyListings(0, 1, null, null, 'ACTIVE'),
 enabled: !!user?.id,
 staleTime: 60 * 1000,
 gcTime: 10 * 60 * 1000,
 refetchOnWindowFocus: false
 });
 const activeListingsCount = myListingsData?.totalElements ?? 0;

 // In-transit / active orders count
 const inTransitOrdersCount = useMemo(() => {
 return recentOrders.filter(o => 
 o.status === 'SHIPPED' || 
 o.status === 'PROCESSING' || 
 o.status === 'MEETUP_PENDING' ||
 o.status === 'IN_TRANSIT'
 ).length;
 }, [recentOrders]);

 const {
 plan,
 isPremium,
 purchaseDate,
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
 orderProcessingSpeed,
 premiumMaxShowcaseSlots,
 premiumEstimatedShippingDays
 } = usePlan();

 const { showcases } = useMyShowcases(user?.id);
 const activeShowcasesCount = useMemo(() => 
 showcases ? showcases.filter(s => new Date(s.endDate) > new Date()).length : 0, 
 [showcases]
 );

 const isExpiringSoon = useMemo(() => {
 if (!isPremium || !expirationDate) return false;
 const diff = new Date(expirationDate) - new Date();
 const days = diff / (1000 * 60 * 60 * 24);
 return days > 0 && days <= 3;
 }, [isPremium, expirationDate]);

 const fullName = user?.name ? `${user.name}${user.surname ? ` ${user.surname}` : ''}` : 'User';

 if (!user) {
 return (
 <PageContainer className="max-w-5xl py-8">
 <Skeleton className="h-8 w-64" />
 <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
 {['a', 'b', 'c', 'd'].map(k => <Skeleton key={k} className="h-32" />)}
 </div>
 </PageContainer>
 );
 }

 return (
 <div className="flex min-h-screen flex-col bg-background-secondary lg:flex-row">
 <aside className="flex w-full flex-shrink-0 flex-col p-4 sm:p-6 lg:w-72 lg:py-8 lg:pl-8 lg:pr-4 xl:w-80">
 <div className={`${CARD} mb-6 p-4`}>
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background-tertiary text-sm font-medium text-text-secondary">
 {user?.profilePicture ? (
 <img src={user.profilePicture} alt="" className="h-full w-full object-cover" />
 ) : (
 getInitials(`${user?.name || ''} ${user?.surname || ''}`)
 )}
 </div>
 <div className="min-w-0 flex-1">
 <h2 className="truncate text-sm font-medium text-text-primary">{fullName}</h2>
 <p className="truncate text-sm text-text-tertiary">{user?.email || ''}</p>
 </div>
 </div>
 <div className="mt-3 flex items-center justify-between text-sm">
 <span className="inline-flex items-center gap-1.5 text-text-secondary">
 <span className={`h-1.5 w-1.5 rounded-full ${isPremium ? 'bg-status-warning' : 'bg-secondary-400'}`} aria-hidden />
 {isPremium ? (plan || 'Premium') : t('standard_plan', 'Standart')}
 </span>
 <Link to={ROUTES.PROFILE} className="text-text-secondary underline-offset-2 transition-colors hover:text-text-primary hover:underline">
 {t('edit', 'Düzenle')}
 </Link>
 </div>
 </div>

 <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-4 lg:hidden">
 {navGroups.map(group => group.items.map(item => {
 const active = isRouteActive(pathname, item.route);
 const ItemIcon = item.icon;
 return (
 <Link
 key={`mobile-${group.id}-${item.route}`}
 to={item.route}
 aria-current={active ? 'page' : undefined}
 className={`flex h-11 shrink-0 items-center gap-2 rounded px-3 text-sm transition-colors duration-150 ${active ? 'bg-primary text-white' : 'border border-border bg-background-primary text-text-secondary hover:bg-background-secondary'}`}
 >
 <ItemIcon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 <span>{t(item.nameKey || item.name)}</span>
 </Link>
 );
 }))}
 </nav>

 <nav className="hidden flex-col gap-1 lg:flex" aria-label={t("navigation", "Navigasyon")}>
 {navGroups.map(group => {
 const GroupIcon = group.icon;
 const isOpen = openGroups.has(group.id);
 const hasActiveChild = group.items.some(item => isRouteActive(pathname, item.route));
 return (
 <div key={group.id}>
 <button
 type="button"
 onClick={() => toggleGroup(group.id)}
 aria-expanded={isOpen}
 className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm font-medium transition-colors duration-150 ${hasActiveChild ? 'text-text-primary' : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'}`}
 >
 <span className="flex min-w-0 items-center gap-2.5">
 <GroupIcon className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 <span className="truncate">{t(group.labelKey || group.label)}</span>
 </span>
 <ChevronDown className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-150 ${isOpen ? '' : '-rotate-90'}`} strokeWidth={1.5} aria-hidden />
 </button>
 {isOpen && (
 <div className="ml-5 mt-1 space-y-0.5 border-l border-border pl-3">
 {group.items.map(item => {
 const ItemIcon = item.icon;
 const active = isRouteActive(pathname, item.route);
 return (
 <Link
 key={`${group.id}-${item.route}`}
 to={item.route}
 aria-current={active ? 'page' : undefined}
 className={`flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors duration-150 ${active ? 'bg-primary font-medium text-white' : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'}`}
 >
 <ItemIcon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
 <span className="truncate">{t(item.nameKey || item.name)}</span>
 </Link>
 );
 })}
 </div>
 )}
 </div>
 );
 })}
 </nav>
 </aside>

 <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 lg:pl-2">
 <PageContainer className="max-w-5xl">
 {isExpiringSoon && (
 <div className={`${CARD} mb-6 flex items-start gap-3 p-4`}>
 <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-status-warning" strokeWidth={1.5} aria-hidden />
 <div className="min-w-0 flex-1">
 <h2 className="text-sm font-medium text-text-primary">{t("your_membership_expires_soon", "Üyeliğiniz Yakında Sona Eriyor")}</h2>
 <p className="mt-1 text-sm text-text-secondary">
 {t('expires_on', { date: new Date(expirationDate).toLocaleDateString(i18n?.language?.startsWith('tr') ? 'tr-TR' : 'en-US') })}
 {!autoRenew && ` • ${t("auto_renew_off_warning", "Otomatik yenileme kapalı.")}`}
 </p>
 </div>
 <Button variant="secondary" size="sm" onClick={() => setShowUpgrade(true)}>{t('renew_now', 'Yenile')}</Button>
 </div>
 )}

 <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl font-semibold text-text-primary">
 {t("welcome", "Hoş Geldiniz, ")} {user?.name?.split(' ')[0] || 'Kullanıcı'}
 </h1>
 <p className="mt-1 text-sm text-text-secondary">
 {t("your_personal_secondhand_space", "İlanlarınızı, siparişlerinizi, bakiye hareketlerinizi ve ayrıcalıklarınızı buradan takip edin.")}
 </p>
 </div>
 <Link to={ROUTES.CREATE_LISTING} className={`${buttonClasses()} shrink-0`}>
 <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 <span>{t("sell_item", "Yeni İlan Ver")}</span>
 </Link>
 </div>

 <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <MetricCard to={ROUTES.MY_LISTINGS} icon={Package} label={t('active', 'Aktif')} value={activeListingsCount} hint={t('active_listings_sub', 'Yayında olan ilanlar')} />
 <MetricCard to={ROUTES.MY_ORDERS} icon={Truck} label={t('in_transit_tab', 'Süreçte')} value={inTransitOrdersCount} hint={t('in_transit_orders_sub', 'Devam eden teslimatlar')} />
 <MetricCard to={ROUTES.MY_ORDERS} icon={ShoppingBag} label={t('all_orders', 'Siparişler')} value={totalOrdersCount} hint={t('all_orders_sub', 'Toplam alışveriş sayısı')} />
 <MetricCard to={ROUTES.AURA_CHAT} icon={Sparkles} label="Aura AI" value={`${dailyAuraUsage} / ${dailyAuraLimit || 8}`} hint={t('aura_quota_sub', 'Günlük mesaj kotası')} />
 </div>

 <section className={`${CARD} mb-8 p-5`}>
 <div className="mb-5 border-b border-border-light pb-4">
 <h2 className="text-lg font-semibold text-text-primary">{t("membership_and_privileges", "Üyelik ve Ayrıcalıklar")}</h2>
 <p className="mt-1 text-sm text-text-secondary">
 {isPremium ? t('premium_status_desc', 'Premium üyeliğinize ait limitler ve teslimat öncelikleri') : t('standard_status_desc', 'Standart plan ve premium avantaj karşılaştırması')}
 </p>
 </div>

 {isPremium ? (
 <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
 <div className="space-y-5 lg:col-span-2">
 <div>
 <h3 className="text-sm font-medium text-text-primary">
 {t("premium_membership_active", "Premium Üyelik Aktif")} <span className="text-text-tertiary">· {plan || 'PRO'}</span>
 </h3>
 <p className="mt-1 text-sm text-text-secondary">{t("enjoy_premium_perks", "Öncelikli kargo, ek vitrin slotları ve genişletilmiş AI desteği aktif.")}</p>
 </div>
 <QuotaBar label={t("aura_ai_message", "Aura AI Günlük Kullanım")} used={dailyAuraUsage} limit={dailyAuraLimit || 8} />
 <div className="divide-y divide-border-light">
 <DetailRow label={t("fast_shipping", "Teslimat Süresi")} value={`${estimatedShippingDays} ${t('days_priority', 'Gün (Öncelikli)')}`} />
 <DetailRow label={t("shipping_process", "İşleme Hızı")} value={orderProcessingSpeed || 'Aynı Gün'} />
 <DetailRow label={t("aura_ai_message_limit", "Aura AI Limiti")} value={`${dailyAuraLimit} ${t('messages_daily', 'Mesaj / Gün')}`} />
 <DetailRow label={t("showcase_slot", "Vitrin Slotu")} value={`${activeShowcasesCount} / ${maxShowcaseSlots} ${t('slot_active', 'Slot')}`} />
 </div>
 </div>
 <div className="flex flex-col justify-between rounded border border-border-light p-4">
 <div className="divide-y divide-border-light">
 <h3 className="pb-2 text-sm font-medium text-text-primary">{t('subscription_details', 'Abonelik Bilgileri')}</h3>
 {purchaseDate && <DetailRow label={t("start_date", "Başlangıç")} value={formatDate(purchaseDate)} />}
 {expirationDate && <DetailRow label={t("end_date", "Bitiş")} value={formatDate(expirationDate)} />}
 <DetailRow label={t("auto_renew", "Otomatik Yenileme")} value={autoRenew ? t("enabled_default", "Açık") : t("disabled", "Kapalı")} />
 </div>
 {autoRenew ? (
 <Button variant="danger" className="mt-4 w-full" onClick={() => setConfirmCancel(true)} disabled={isCancelling}>
 {isCancelling ? t("processing_progress", "İşleniyor...") : t("cancel_subscription", "Yenilemeyi Kapat")}
 </Button>
 ) : (
 <Button variant="secondary" className="mt-4 w-full" onClick={() => toggleAutoRenew(true)} disabled={isTogglingAutoRenew}>
 {isTogglingAutoRenew ? t("enabling", "Açılıyor...") : t("reactivate", "Tekrar Aç")}
 </Button>
 )}
 </div>
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
 <div className="space-y-5 lg:col-span-2">
 <div>
 <h3 className="text-sm font-medium text-text-primary">{t('current_plan_standard', 'Mevcut Plan: Standart (Ücretsiz)')}</h3>
 <p className="mt-1 text-sm text-text-secondary">{t('standard_limits_summary', 'Temel alım-satım, güvenli ödeme ve kargo özellikleri devrededir.')}</p>
 </div>
 <QuotaBar label={t('aura_ai_daily_limit', 'Aura AI Mesaj Kotası')} used={dailyAuraUsage} limit={dailyAuraLimit || 2} />
 <div className="divide-y divide-border-light">
 <DetailRow label={t('delivery_time', 'Teslimat Süresi')} value={`${estimatedShippingDays} ${t('days', 'Gün')} (${t('with_premium', 'Premium ile')} ${premiumEstimatedShippingDays} ${t('days', 'Gün')})`} />
 <DetailRow label={t('showcase_slot_limit', 'Vitrin Slot Limiti')} value={`${maxShowcaseSlots} ${t('slot', 'Slot')} (${t('with_premium', 'Premium ile')} ${premiumMaxShowcaseSlots} ${t('slot', 'Slot')})`} />
 </div>
 </div>
 <div className="flex flex-col justify-between rounded border border-border-light p-4">
 <div>
 <h3 className="text-sm font-medium text-text-primary">{t('why_upgrade_premium', 'Neden Premium?')}</h3>
 <p className="mt-1 text-sm text-text-secondary">
 {t('premium_benefit_highlight', 'İlanlarınız %40 daha hızlı alıcı bulsun. Öncelikli kargo, ekstra vitrin slotları ve sınırsız Aura AI desteği kazanın.')}
 </p>
 </div>
 <Button variant="secondary" className="mt-4 w-full" onClick={() => setShowUpgrade(true)}>
 {t('upgrade_to_premium', 'Premium\'a Yükselt')}
 </Button>
 </div>
 </div>
 )}
 </section>

 <PremiumUpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />

 <Modal
 isOpen={confirmCancel}
 onClose={() => setConfirmCancel(false)}
 title={t("cancel_subscription", "Yenilemeyi Kapat")}
 size="sm"
 footer={<>
 <Button variant="secondary" onClick={() => setConfirmCancel(false)}>{t("cancel")}</Button>
 <Button variant="danger" onClick={() => { setConfirmCancel(false); cancelSubscription(); }}>{t("cancel_subscription", "Yenilemeyi Kapat")}</Button>
 </>}
 >
 <p className="text-sm text-text-secondary">
 {t('confirm_cancel_subscription', 'Aboneliğinizi iptal etmek istediğinize emin misiniz? Gelecek dönem için otomatik yenileme kapatılacaktır.')}
 </p>
 </Modal>

 <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
 <UtilityLink to={ROUTES.EWALLET} icon={Wallet} title={t("my_wallet", "Cüzdan & Bakiye")} hint={t("wallet_sub", "Escrow ve bakiye hareketleri")} />
 <UtilityLink to={ROUTES.FAVORITES} icon={Heart} title={t("my_favorites", "Favorilerim")} hint={t("favorites_sub", "Takip ettiğiniz ürünler")} />
 <UtilityLink to={ROUTES.INBOX} icon={MessageSquare} title={t("inbox", "Mesajlar & Teklifler")} hint={t("inbox_sub", "Alıcı ve satıcı görüşmeleri")} />
 </div>

 <section className={`${CARD} mb-8 p-5`}>
 <div className="mb-4 flex items-center justify-between gap-4">
 <div>
 <h2 className="text-lg font-semibold text-text-primary">{t("recent_orders", "Son Siparişler")}</h2>
 <p className="mt-1 text-sm text-text-secondary">{t("recent_orders_desc", "Son alışverişleriniz ve anlık kargo durumları")}</p>
 </div>
 <Link to={ROUTES.MY_ORDERS} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary">
 <span>{t("view_all", "Tümünü Gör")}</span>
 <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 </Link>
 </div>

 {ordersLoading ? (
 <div className="space-y-3">
 {['a', 'b', 'c'].map(k => <Skeleton key={k} className="h-16" />)}
 </div>
 ) : recentOrders.length === 0 ? (
 <div className="py-10 text-center">
 <h3 className="text-sm font-medium text-text-primary">{t("your_shopping_bag_is_waiting", "Henüz bir siparişiniz bulunmuyor")}</h3>
 <p className="mx-auto mt-1 max-w-sm text-sm text-text-secondary">
 {t("explore_our_second_hand_listings_to_find", "Avantajlı ikinci el ürünleri ve fırsatları keşfetmeye hemen başlayın.")}
 </p>
 <Link to={ROUTES.LISTINGS} className={`${buttonClasses('secondary')} mt-5`}>
 {t("explore_listings", "İlanları Keşfet")}
 </Link>
 </div>
 ) : (
 <ul className="divide-y divide-border-light">
 {recentOrders.map(order => {
 const items = order.orderItems || order.items || [];
 const firstItem = items[0];
 const listing = firstItem?.listing;
 const thumbUrl = listing?.imageUrl || firstItem?.imageUrl;
 const lineTitle = listing?.title || firstItem?.title;
 const statusLabel = {
 COMPLETED: t('status_completed', 'Teslim Edildi'),
 DELIVERED: t('status_delivered', 'Teslim Edildi'),
 SHIPPED: t('status_shipped', 'Kargoya Verildi'),
 IN_TRANSIT: t('status_in_transit', 'Kargoda'),
 PROCESSING: t('status_processing', 'Hazırlanıyor'),
 CANCELLED: t('status_cancelled', 'İptal Edildi'),
 }[order.status] || order.status?.replace(/_/g, ' ');

 return (
 <li key={order.id}>
 <Link to={ROUTES.MY_ORDERS} className="-mx-2 flex items-center justify-between gap-4 rounded px-2 py-3 transition-colors duration-150 hover:bg-background-secondary">
 <div className="flex min-w-0 items-center gap-3">
 <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-border-light bg-background-secondary">
 {thumbUrl ? (
 <img src={thumbUrl} alt="" className="h-full w-full object-cover" />
 ) : (
 <ShoppingBag className="h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
 )}
 </div>
 <div className="min-w-0">
 <h3 className="truncate text-sm font-medium text-text-primary">
 {order.name || lineTitle || `Order #${order.orderNumber}`}
 </h3>
 <p className="mt-0.5 flex items-center gap-2 text-sm text-text-tertiary">
 <span className="tabular-nums">#{order.orderNumber}</span>
 {order.createdAt ? <span className="tabular-nums">{formatDate(order.createdAt)}</span> : null}
 </p>
 <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-text-secondary">
 <span className={`h-1.5 w-1.5 rounded-full ${ORDER_STATUS_DOT[order.status] || 'bg-secondary-400'}`} aria-hidden />
 {statusLabel}
 </p>
 </div>
 </div>
 <div className="shrink-0 text-right">
 <p className="text-sm font-semibold tabular-nums text-text-primary">
 {formatCurrency(order.totalAmount ?? order.total ?? 0, order.currency || 'TRY')}
 </p>
 <p className="text-sm tabular-nums text-text-tertiary">
 {items.length} {items.length > 1 ? t('items', 'Ürün') : t('item', 'Ürün')}
 </p>
 </div>
 </Link>
 </li>
 );
 })}
 </ul>
 )}
 </section>

 <MyShowcasesPanel userId={user?.id} />
 </PageContainer>
 </main>
 </div>
 );
};

export default AccountHubPage;
