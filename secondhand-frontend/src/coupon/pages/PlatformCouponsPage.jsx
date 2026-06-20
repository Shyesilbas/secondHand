import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, RefreshCw, Ticket } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
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
    return <span className="text-slate-400">{t("s_n_rs_z")}</span>;
  }
  const r = remaining != null ? remaining : '—';
  return <span className="tabular-nums">
      <span className="font-semibold text-slate-900">{r}</span>
      <span className="font-normal text-slate-400"> / {limit}</span>
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
    return <span className="text-slate-500">{t("s_re_s_n_r_yok")}</span>;
  }
  return <div className="text-xs leading-snug text-slate-600">
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
  const tableShell = 'rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden ring-1 ring-slate-900/[0.04]';
  return <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-5xl px-4 pb-10">
        <div className="sticky top-0 z-10 -mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-[#F8FAFC]/90 px-4 py-4 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <Link to={ROUTES.DASHBOARD} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-violet-600">
              <ArrowLeft className="h-4 w-4" />{t("hesap")}</Link>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="flex min-w-0 items-center gap-2">
              <div className="shrink-0 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 p-2 text-white shadow-md shadow-violet-500/20">
                <Ticket className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-text-primary truncate tracking-tight">{t("platform_kuponlar")}</h1>
                <p className="truncate text-xs text-slate-500">{t("size_uygun_kodlar_ve_kullan_m_ge_mi_iniz")}</p>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />{t("yenile")}</button>
        </div>

        <div className="mb-6 flex w-full max-w-md rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <button type="button" onClick={() => setTab(TABS.ACTIVE)} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${tab === TABS.ACTIVE ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}>{t("kullan_labilir")}</button>
          <button type="button" onClick={() => setTab(TABS.PARTICIPATED)} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${tab === TABS.PARTICIPATED ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}>{t("kulland_klar_m")}</button>
        </div>

        {loading && <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
          </div>}

        {!loading && error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error?.response?.data?.message || error?.message || 'Yüklenemedi.'}
          </div>}

        {!loading && !error && tab === TABS.ACTIVE && activeList.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-600">{t("u_an_size_atanm_kullan_labilir_kupon_yok")}</div>}

        {!loading && !error && tab === TABS.PARTICIPATED && participationsList.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-600">{t("hen_z_bir_sipari_te_kupon_kullanmad_n_z")}</div>}

        {!loading && !error && tab === TABS.ACTIVE && activeList.length > 0 && <div className={tableShell}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="whitespace-nowrap px-4 py-3">{t("kod")}</th>
                    <th className="min-w-[180px] px-4 py-3">{t("kampanya")}</th>
                    <th className="whitespace-nowrap px-4 py-3">{t("i_ndirim")}</th>
                    <th className="whitespace-nowrap px-4 py-3">{t("genel_hak")}<span className="mt-0.5 block font-normal normal-case tracking-normal text-slate-400">{t("global_kalan_limit")}</span>
                    </th>
                    <th className="whitespace-nowrap px-4 py-3">{t("size_zel")}<span className="mt-0.5 block font-normal normal-case tracking-normal text-slate-400">{t("ki_i_ba_kalan_limit")}</span>
                    </th>
                    <th className="min-w-[140px] px-4 py-3">{t("ge_erlilik")}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">{t("i_lem")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeList.map(c => <tr key={c.id} className="bg-white transition-colors hover:bg-violet-50/40">
                      <td className="align-top px-4 py-3 font-mono text-sm font-bold text-slate-900">{c.code}</td>
                      <td className="align-top px-4 py-3">
                        <div className="max-w-[220px] truncate font-semibold text-slate-900" title={c.title}>
                          {c.title?.trim() || '—'}
                        </div>
                        {c.description?.trim() && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600" title={c.description.trim()}>
                            {c.description.trim()}
                          </p>}
                        {Array.isArray(c.eligibleTypes) && c.eligibleTypes.length > 0 && <p className="mt-1 text-caption text-slate-500">{c.eligibleTypes.join(', ')}</p>}
                      </td>
                      <td className="align-top whitespace-nowrap px-4 py-3">
                        <span className="inline-flex flex-col gap-1">
                          <span className="w-fit rounded-lg border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-800">
                            {formatCouponKindLabel(c.discountKind)}
                          </span>
                          <span className="text-xs font-semibold tabular-nums text-slate-900">{formatCouponDiscount(c)}</span>
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
                        <Link to={ROUTES.CHECKOUT} className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-violet-500/25 transition hover:from-violet-500 hover:to-indigo-500">{t("deme")}<ExternalLink className="h-3.5 w-3.5 opacity-90" />
                        </Link>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
            <p className="border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-caption text-slate-500">{t("genel_hak_kampanyan_n_t_m_kullan_c_lar_i")}</p>
          </div>}

        {!loading && !error && tab === TABS.PARTICIPATED && participationsList.length > 0 && <div className={tableShell}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="whitespace-nowrap px-4 py-3">{t("kod")}</th>
                    <th className="min-w-[200px] px-4 py-3">{t("kampanya")}</th>
                    <th className="whitespace-nowrap px-4 py-3">{t("kullan_ld")}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">{t("sipari")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {participationsList.map(row => <tr key={row.redemptionId} className="bg-white transition-colors hover:bg-slate-50/80">
                      <td className="align-top px-4 py-3 font-mono text-sm font-bold text-slate-900">{row.couponCode}</td>
                      <td className="align-top px-4 py-3">
                        <div className="max-w-[280px] truncate font-semibold text-slate-900">
                          {row.couponTitle?.trim() || '—'}
                        </div>
                        {row.couponDescription?.trim() && <p className="mt-1 line-clamp-2 text-xs text-slate-600">{row.couponDescription.trim()}</p>}
                      </td>
                      <td className="align-top whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                        {row.redeemedAt ? formatDateTime(row.redeemedAt) : '—'}
                      </td>
                      <td className="align-top whitespace-nowrap px-4 py-3 text-right text-sm font-semibold">
                        {ordersHref(row.orderId) ? <Link to={ordersHref(row.orderId)} className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline">
                            {row.orderNumber ? `#${row.orderNumber}` : `#${row.orderId}`}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link> : <span className="text-slate-400 font-normal">{t("ba_l_sipari_yok")}</span>}
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>}
      </div>
    </div>;
};
export default PlatformCouponsPage;