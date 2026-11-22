import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { couponService } from '../../cart/services/couponService.js';
import { formatCouponDiscount } from '../utils/couponUiFormat.js';
import { SkeletonList } from '../../common/components/ui/Skeleton.jsx';
import { ErrorState, PageHeader, Tabs } from '../../common/components/ui/index.js';
import { buttonClasses } from '../../common/components/ui/Button.jsx';
import { getErrorMessage } from '../../common/utils/errorUtils.js';
const TABS = {
    ACTIVE: 'active',
    PARTICIPATED: 'participated'
};
function sortActive(list) {
    return [...(list || [])].sort((a, b) => String(a.code).localeCompare(String(b.code)));
}

const PlatformCouponsPage = () => {
    const {
        t
    } = useTranslation();
    const [tab, setTab] = useState(TABS.ACTIVE);
    const activeQ = useQuery({
        queryKey: ['coupons', 'active-for-me'],
        queryFn: () => couponService.active(),
        select: d => Array.isArray(d) ? sortActive(d) : [],
        staleTime: 30_000
    });
    const participationsQ = useQuery({
        queryKey: ['coupons', 'redemptions'],
        queryFn: () => couponService.redemptions(),
        select: d => Array.isArray(d) ? d : [],
        staleTime: 30_000
    });
    const isFetching = tab === TABS.ACTIVE ? activeQ.isFetching : participationsQ.isFetching;
    const refetch = () => {
        activeQ.refetch();
        participationsQ.refetch();
    };
    const activeList = activeQ.data ?? [];
    const participationsList = participationsQ.data ?? [];
    // Sum of the discount each redemption snapshotted at checkout (backend is the source of truth).
    const totalSavings = participationsList.reduce((sum, row) => sum + (Number(row.discountAmount) || 0), 0);
    const loading = tab === TABS.ACTIVE ? activeQ.isLoading : participationsQ.isLoading;
    const error = tab === TABS.ACTIVE ? activeQ.error : participationsQ.error;
    const ordersHref = orderId => orderId != null ? `${ROUTES.MY_ORDERS}?orderId=${encodeURIComponent(String(orderId))}` : null;
    const tableShell = 'rounded border border-border-light bg-background-primary shadow-sm overflow-hidden';
    return <div>
        <PageContainer className="py-8">
            <div className="mb-4">
                <PageHeader
                    bottomBorder
                    back={
                        <Link to={ROUTES.DASHBOARD} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-primary">
                            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />{t("hesap")}
                        </Link>
                    }
                    title={t("platform_kuponlar")}
                    subtitle={t("kupon_alt_baslik", "Kullanabileceğin kodlar ve geçmiş kullanımların")}
                    actions={
                        <button type="button" onClick={() => refetch()} disabled={isFetching} className={buttonClasses('secondary', 'sm')}>
                            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} strokeWidth={1.5} />{t("yenile")}
                        </button>
                    }
                />
            </div>

            {totalSavings > 0 && <p className="mb-4 text-sm text-text-secondary">
                {t("kupon_tasarruf_ozeti", "Şu ana kadar kuponlarla")}{' '}
                <span className="font-semibold tabular-nums text-text-price">{formatCurrency(totalSavings)}</span>{' '}
                {t("kupon_tasarruf_ozeti_son", "tasarruf ettin.")}
            </p>}

            <Tabs
                variant="segmented"
                fullWidth
                className="mb-6 max-w-md"
                ariaLabel={t("platform_kuponlar")}
                activeKey={tab}
                onChange={setTab}
                items={[
                    { key: TABS.ACTIVE, label: t("kullan_labilir") },
                    { key: TABS.PARTICIPATED, label: t("kulland_klar_m") },
                ]}
            />

            {loading && <div className="py-4" aria-busy="true">
                <SkeletonList />
            </div>}

            {!loading && error && (
                <ErrorState
                    title={t("coupons_load_failed", "Kuponlar yüklenemedi")}
                    description={getErrorMessage(error, t("coupons_load_failed", "Kuponlar yüklenemedi."))}
                    onRetry={refetch}
                />
            )}

            {!loading && !error && tab === TABS.ACTIVE && activeList.length === 0 && <div className="rounded border border-dashed border-border-light bg-background-primary px-6 py-12 text-center text-sm text-text-secondary">{t("u_an_size_atanm_kullan_labilir_kupon_yok")}</div>}

            {!loading && !error && tab === TABS.PARTICIPATED && participationsList.length === 0 && <div className="rounded border border-dashed border-border-light bg-background-primary px-6 py-12 text-center text-sm text-text-secondary">{t("hen_z_bir_sipari_te_kupon_kullanmad_n_z")}</div>}

            {!loading && !error && tab === TABS.ACTIVE && activeList.length > 0 && <ul className="space-y-3">
                {activeList.map(c => <li key={c.id} className="flex flex-col gap-4 rounded border border-border-light bg-background-primary p-5 shadow-sm sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="text-lg font-semibold tabular-nums text-text-price">{formatCouponDiscount(c)}</span>
                            <span className="text-sm font-semibold tracking-wide text-text-primary">{c.code}</span>
                        </div>
                        <p className="mt-1 truncate text-base font-medium text-text-primary" title={c.title}>{c.title?.trim() || c.code}</p>
                        {c.description?.trim() && <p className="mt-0.5 line-clamp-2 text-sm text-text-secondary">{c.description.trim()}</p>}
                        <p className="mt-2 text-sm text-text-tertiary tabular-nums">
                            {c.usageLimitPerUser != null && <>{t("kupon_kalan_hakkin", "Kalan hakkın")}: {c.usageRemainingPerUser ?? '—'} / {c.usageLimitPerUser}{' · '}</>}
                            {c.endsAt ? t("kupon_son_gun", "Son kullanım") + ': ' + formatDateTime(c.endsAt) : t("s_re_s_n_r_yok")}
                        </p>
                    </div>
                    <Link to={ROUTES.CHECKOUT} className={buttonClasses('primary', 'sm') + ' shrink-0 self-start sm:self-center'}>
                        {t("kupon_odemeye_git", "Ödemeye git")}
                    </Link>
                </li>)}
            </ul>}

            {!loading && !error && tab === TABS.PARTICIPATED && participationsList.length > 0 && <div className={tableShell}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-border-light bg-background-secondary text-xs font-semibold text-text-secondary">
                                <th className="whitespace-nowrap px-4 py-3">{t("kod")}</th>
                                <th className="min-w-48 px-4 py-3">{t("kampanya")}</th>
                                <th className="whitespace-nowrap px-4 py-3">{t("kullan_ld")}</th>
                                <th className="whitespace-nowrap px-4 py-3 text-right">{t("kupon_tasarruf_sutunu", "Tasarruf")}</th>
                                <th className="whitespace-nowrap px-4 py-3 text-right">{t("sipari")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light">
                            {participationsList.map(row => <tr key={row.redemptionId} className="bg-background-primary transition-colors hover:bg-background-secondary">
                                <td className="align-top px-4 py-3 text-sm font-semibold text-text-primary">{row.couponCode}</td>
                                <td className="align-top px-4 py-3">
                                    <div className="max-w-72 truncate font-semibold text-text-primary">
                                        {row.couponTitle?.trim() || '—'}
                                    </div>
                                    {row.couponDescription?.trim() && <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{row.couponDescription.trim()}</p>}
                                </td>
                                <td className="align-top whitespace-nowrap px-4 py-3 text-sm text-text-secondary">
                                    {row.redeemedAt ? formatDateTime(row.redeemedAt) : '—'}
                                </td>
                                <td className="align-top whitespace-nowrap px-4 py-3 text-right text-sm font-semibold tabular-nums text-text-price">
                                    {Number(row.discountAmount) > 0 ? formatCurrency(row.discountAmount) : '—'}
                                </td>
                                <td className="align-top whitespace-nowrap px-4 py-3 text-right text-sm font-semibold">
                                    {ordersHref(row.orderId) ? <Link to={ordersHref(row.orderId)} className="inline-flex items-center gap-1 text-primary hover:text-primary-hover hover:underline">
                                        {row.orderNumber ? `#${row.orderNumber}` : `#${row.orderId}`}
                                        <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                                    </Link> : <span className="text-text-muted font-normal">{t("ba_l_sipari_yok")}</span>}
                                </td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>}
        </PageContainer>
    </div>;
};
export default PlatformCouponsPage;