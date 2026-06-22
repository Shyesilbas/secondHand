import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, RefreshCw, Ticket } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { formatDateTime } from '../../common/formatters.js';
import { couponService } from '../../cart/services/couponService.js';
import { formatCouponDiscount, formatCouponKindLabel } from '../utils/couponUiFormat.js';
const TABS = {
  ACTIVE: 'active',
  PARTICIPATED: 'participated'
};
function sortActive(list) {
  return [...(list || [])].sort((a, b) => String(a.code).localeCompare(String(b.code)));
}

/** limit null → sınırsız; aksi halde kalan / limit */
function LimitCell({
  limit,
  remaining
}) {
  const {
    t
  } = useTranslation();
  if (limit == null) {
    return <span className="text-text-muted">{t("s_n_rs_z")}</span>;
  }
  const r = remaining != null ? remaining : '—';
  return <span className="tabular-nums">
      <span className="font-semibold text-text-primary">{r}</span>
      <span className="font-normal text-text-muted"> / {limit}</span>
    </span>;
}
function CouponPeriod({
  startsAt,
  endsAt
}) {
  const {
    t
  } = useTranslation();
  if (!startsAt && !endsAt) {
    return <span className="text-text-muted">{t("s_re_s_n_r_yok")}</span>;
  }
  return <div className="text-xs leading-snug text-text-secondary">
      {startsAt ? <div>{t("ba_lang")}{formatDateTime(startsAt)}</div> : null}
      {endsAt ? <div>{t("biti")}{formatDateTime(endsAt)}</div> : null}
      {!startsAt && endsAt ? <div>{t("biti")}{formatDateTime(endsAt)}</div> : null}
    </div>;
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
  const loading = tab === TABS.ACTIVE ? activeQ.isLoading : participationsQ.isLoading;
  const error = tab === TABS.ACTIVE ? activeQ.error : participationsQ.error;
  const ordersHref = orderId => orderId != null ? `${ROUTES.MY_ORDERS}?orderId=${encodeURIComponent(String(orderId))}` : null;
  const tableShell = 'rounded-2xl border border-border-light bg-background-primary shadow-sm overflow-hidden';
  return <div className="min-h-screen bg-background-secondary">
      <PageContainer className="pb-10">
        <div className="sticky top-0 z-10 -mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border-light bg-background-secondary/90 px-4 py-4 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <Link to={ROUTES.DASHBOARD} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-primary">
              <ArrowLeft className="h-4 w-4" />{t("hesap")}</Link>
            <div className="hidden h-8 w-px bg-border-light sm:block" />
            <div className="flex min-w-0 items-center gap-2">
              <div className="shrink-0 rounded-xl bg-primary text-white p-2 shadow-sm">
                <Ticket className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-text-primary truncate tracking-tight">{t("platform_kuponlar")}</h1>
                <p className="truncate text-xs text-text-muted">{t("size_uygun_kodlar_ve_kullan_m_ge_mi_iniz")}</p>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center gap-1.5 rounded-xl border border-border-light bg-background-primary px-3 py-2 text-sm font-semibold text-text-primary shadow-sm hover:bg-background-secondary disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />{t("yenile")}</button>
        </div>

        <div className="mb-6 flex w-full max-w-md rounded-2xl border border-border-light bg-background-primary p-1 shadow-sm">
          <button type="button" onClick={() => setTab(TABS.ACTIVE)} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${tab === TABS.ACTIVE ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>{t("kullan_labilir")}</button>
          <button type="button" onClick={() => setTab(TABS.PARTICIPATED)} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${tab === TABS.PARTICIPATED ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>{t("kulland_klar_m")}</button>
        </div>

        {loading && <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>}

        {!loading && error && <div className="rounded-2xl border border-status-error-border bg-status-error-bg px-4 py-3 text-sm text-status-error-text">
            {error?.response?.data?.message || error?.message || 'Yüklenemedi.'}
          </div>}

        {!loading && !error && tab === TABS.ACTIVE && activeList.length === 0 && <div className="rounded-2xl border border-dashed border-border-light bg-background-primary px-6 py-12 text-center text-sm text-text-secondary">{t("u_an_size_atanm_kullan_labilir_kupon_yok")}</div>}

        {!loading && !error && tab === TABS.PARTICIPATED && participationsList.length === 0 && <div className="rounded-2xl border border-dashed border-border-light bg-background-primary px-6 py-12 text-center text-sm text-text-secondary">{t("hen_z_bir_sipari_te_kupon_kullanmad_n_z")}</div>}

        {!loading && !error && tab === TABS.ACTIVE && activeList.length > 0 && <div className={tableShell}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border-light bg-background-secondary text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    <th className="whitespace-nowrap px-4 py-3">{t("kod")}</th>
                    <th className="min-w-[180px] px-4 py-3">{t("kampanya")}</th>
                    <th className="whitespace-nowrap px-4 py-3">{t("i_ndirim")}</th>
                    <th className="whitespace-nowrap px-4 py-3">{t("genel_hak")}<span className="mt-0.5 block font-normal normal-case tracking-normal text-text-muted">{t("global_kalan_limit")}</span>
                    </th>
                    <th className="whitespace-nowrap px-4 py-3">{t("size_zel")}<span className="mt-0.5 block font-normal normal-case tracking-normal text-text-muted">{t("ki_i_ba_kalan_limit")}</span>
                    </th>
                    <th className="min-w-[140px] px-4 py-3">{t("ge_erlilik")}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">{t("i_lem")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {activeList.map(c => <tr key={c.id} className="bg-background-primary transition-colors hover:bg-background-secondary">
                      <td className="align-top px-4 py-3 font-mono text-sm font-bold text-text-primary">{c.code}</td>
                      <td className="align-top px-4 py-3">
                        <div className="max-w-[220px] truncate font-semibold text-text-primary" title={c.title}>
                          {c.title?.trim() || '—'}
                        </div>
                        {c.description?.trim() && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary" title={c.description.trim()}>
                            {c.description.trim()}
                          </p>}
                        {Array.isArray(c.eligibleTypes) && c.eligibleTypes.length > 0 && <p className="mt-1 text-caption text-text-muted">{c.eligibleTypes.join(', ')}</p>}
                      </td>
                      <td className="align-top whitespace-nowrap px-4 py-3">
                        <span className="inline-flex flex-col gap-1">
                          <span className="w-fit rounded-lg border border-primary/20 bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">
                            {formatCouponKindLabel(c.discountKind)}
                          </span>
                          <span className="text-xs font-semibold tabular-nums text-text-primary">{formatCouponDiscount(c)}</span>
                        </span>
                      </td>
                      <td className="align-top whitespace-nowrap px-4 py-3 text-sm">
                        <LimitCell limit={c.usageLimitGlobal} remaining={c.usageRemainingGlobal} />
                      </td>
                      <td className="align-top whitespace-nowrap px-4 py-3 text-sm">
                        <LimitCell limit={c.usageLimitPerUser} remaining={c.usageRemainingPerUser} />
                      </td>
                      <td className="align-top px-4 py-3">
                        <CouponPeriod startsAt={c.startsAt} endsAt={c.endsAt} />
                      </td>
                      <td className="align-top whitespace-nowrap px-4 py-3 text-right">
                        <Link to={ROUTES.CHECKOUT} className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover transition">{t("deme")}<ExternalLink className="h-3.5 w-3.5 opacity-90" />
                        </Link>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
            <p className="border-t border-border-light bg-background-secondary px-4 py-2.5 text-caption text-text-muted">{t("genel_hak_kampanyan_n_t_m_kullan_c_lar_i")}</p>
          </div>}

        {!loading && !error && tab === TABS.PARTICIPATED && participationsList.length > 0 && <div className={tableShell}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border-light bg-background-secondary text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    <th className="whitespace-nowrap px-4 py-3">{t("kod")}</th>
                    <th className="min-w-[200px] px-4 py-3">{t("kampanya")}</th>
                    <th className="whitespace-nowrap px-4 py-3">{t("kullan_ld")}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">{t("sipari")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {participationsList.map(row => <tr key={row.redemptionId} className="bg-background-primary transition-colors hover:bg-background-secondary">
                      <td className="align-top px-4 py-3 font-mono text-sm font-bold text-text-primary">{row.couponCode}</td>
                      <td className="align-top px-4 py-3">
                        <div className="max-w-[280px] truncate font-semibold text-text-primary">
                          {row.couponTitle?.trim() || '—'}
                        </div>
                        {row.couponDescription?.trim() && <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{row.couponDescription.trim()}</p>}
                      </td>
                      <td className="align-top whitespace-nowrap px-4 py-3 text-xs text-text-secondary">
                        {row.redeemedAt ? formatDateTime(row.redeemedAt) : '—'}
                      </td>
                      <td className="align-top whitespace-nowrap px-4 py-3 text-right text-sm font-semibold">
                        {ordersHref(row.orderId) ? <Link to={ordersHref(row.orderId)} className="inline-flex items-center gap-1 text-primary hover:text-primary-hover hover:underline">
                            {row.orderNumber ? `#${row.orderNumber}` : `#${row.orderId}`}
                            <ExternalLink className="h-3.5 w-3.5" />
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