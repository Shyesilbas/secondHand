import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Clock,
  Gauge,
  Layers,
  Pencil,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Tag,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { formatDateTime } from '../../common/formatters.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { adminCouponApi } from '../services/adminCouponApi.js';

const LISTING_TYPES = ['VEHICLE', 'ELECTRONICS', 'REAL_ESTATE', 'CLOTHING', 'BOOKS', 'SPORTS', 'OTHER'];

const AUDIENCES = [
  { value: 'ALL_USERS', label: 'Tüm kullanıcılar', hint: 'Kuralları sağlayan herkes kullanabilir' },
  {
    value: 'USER_ID_LIST',
    label: 'ID listesi',
    hint: 'Sadece yazdığınız kullanıcı kimlikleri',
  },
  {
    value: 'NEVER_ORDERED_FIRST_ORDER',
    label: 'İlk sipariş (kural)',
    hint: 'Tamamlanmış ödemeli siparişi hiç olmayan alıcılar',
  },
];

const FIRST_ORDER_PRESET = {
  title: 'İlk siparişe 300 TL indirim',
  description:
    'Daha önce ödemesi tamamlanmış siparişi olmayan alıcılar içindir. Yalnızca ilk siparişte kullanılır; sepet tutarı 300 TL altındaysa indirim sepete kadar uygulanır. Süre sınırı yoktur; kişi başı tek kullanım.',
  discountKind: 'ORDER_FIXED',
  value: '300',
  usageLimitPerUser: '1',
  usageLimitGlobal: '',
  startsAt: '',
  endsAt: '',
  minSubtotal: '',
  maxDiscount: '',
};

const DISCOUNT_KINDS = [
  'ORDER_PERCENT',
  'ORDER_FIXED',
  'TYPE_PERCENT',
  'TYPE_FIXED',
  'THRESHOLD_FIXED',
  'THRESHOLD_PERCENT',
];

const emptyForm = () => ({
  code: '',
  title: '',
  description: '',
  audience: 'ALL_USERS',
  forAllUsers: true,
  eligibleUserIdsText: '',
  active: true,
  startsAt: '',
  endsAt: '',
  discountKind: 'ORDER_PERCENT',
  value: '',
  minSubtotal: '',
  maxDiscount: '',
  eligibleTypes: [],
  usageLimitGlobal: '',
  usageLimitPerUser: '',
});

const parseIds = (text) => {
  if (!text?.trim()) return [];
  return [...new Set(text.split(/[\s,]+/).map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0))];
};

const toInputDateTime = (v) => {
  if (!v) return '';
  const s = typeof v === 'string' ? v : String(v);
  if (s.length >= 16) return s.slice(0, 16);
  return s;
};

const numOrUndef = (raw) => {
  if (raw === '' || raw == null) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
};

const audienceSummary = (row) => {
  const a = row.audience || (row.forAllUsers !== false ? 'ALL_USERS' : 'USER_ID_LIST');
  if (a === 'NEVER_ORDERED_FIRST_ORDER') {
    return { label: 'İlk sipariş', hint: '' };
  }
  if (a === 'USER_ID_LIST') {
    const n = row.eligibleUserIds?.length ?? 0;
    return { label: 'ID listesi', hint: `${n} kullanıcı` };
  }
  return { label: 'Tüm kullanıcılar', hint: '' };
};

/** Tutarlı form kontrolleri */
const inputCn =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-[3px] focus:ring-indigo-500/15 disabled:cursor-not-allowed disabled:bg-slate-100/90 disabled:text-slate-500';

function FormSection({ Icon, title, subtitle, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-white to-slate-50/60 p-4 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/[0.04] ${className}`}
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25">
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      <div className="space-y-3.5">{children}</div>
    </section>
  );
}

const AdminCouponsPage = () => {
  const { showError, showSuccess } = useNotification();
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(() => emptyForm());
  const [codeFilter, setCodeFilter] = useState('');

  const { data: coupons = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => adminCouponApi.list(),
    select: (d) => (Array.isArray(d) ? d : []),
    staleTime: 30_000,
  });

  const { data: audienceStats, isFetching: audienceStatsLoading } = useQuery({
    queryKey: ['admin', 'coupons', 'audience-stats', form.audience],
    queryFn: () => adminCouponApi.audienceStats(form.audience),
    enabled: !!modal && form.audience === 'NEVER_ORDERED_FIRST_ORDER',
    staleTime: 15_000,
  });

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    qc.invalidateQueries({ queryKey: ['admin', 'coupons', 'audience-stats'] });
  }, [qc]);

  const setAudienceSelection = useCallback((value) => {
    setForm((p) => {
      if (value === 'NEVER_ORDERED_FIRST_ORDER') {
        return {
          ...p,
          audience: value,
          forAllUsers: false,
          eligibleUserIdsText: '',
          ...FIRST_ORDER_PRESET,
        };
      }
      if (value === 'ALL_USERS') {
        return { ...p, audience: value, forAllUsers: true, eligibleUserIdsText: '' };
      }
      return { ...p, audience: value, forAllUsers: false };
    });
  }, []);

  const createMut = useMutation({
    mutationFn: (body) => adminCouponApi.create(body),
    onSuccess: () => {
      showSuccess('Saved', 'Coupon created.');
      invalidate();
      setModal(null);
      setForm(emptyForm());
    },
    onError: (e) => showError('Create failed', e?.response?.data?.message || e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }) => adminCouponApi.update(id, body),
    onSuccess: () => {
      showSuccess('Saved', 'Coupon updated.');
      invalidate();
      setModal(null);
      setForm(emptyForm());
    },
    onError: (e) => showError('Update failed', e?.response?.data?.message || e.message),
  });

  const openCreate = () => {
    setForm(emptyForm());
    setModal('create');
  };

  const openEdit = (row) => {
    const inferredAudience =
      row.audience || (row.forAllUsers !== false ? 'ALL_USERS' : 'USER_ID_LIST');
    setForm({
      code: row.code || '',
      title: row.title || '',
      description: row.description || '',
      audience: inferredAudience,
      forAllUsers: row.forAllUsers !== false,
      eligibleUserIdsText: Array.isArray(row.eligibleUserIds) ? [...row.eligibleUserIds].join(', ') : '',
      active: !!row.active,
      startsAt: toInputDateTime(row.startsAt),
      endsAt: toInputDateTime(row.endsAt),
      discountKind: row.discountKind || 'ORDER_PERCENT',
      value: row.value != null ? String(row.value) : '',
      minSubtotal: row.minSubtotal != null ? String(row.minSubtotal) : '',
      maxDiscount: row.maxDiscount != null ? String(row.maxDiscount) : '',
      eligibleTypes: Array.isArray(row.eligibleTypes) ? [...row.eligibleTypes] : [],
      usageLimitGlobal: row.usageLimitGlobal != null ? String(row.usageLimitGlobal) : '',
      usageLimitPerUser: row.usageLimitPerUser != null ? String(row.usageLimitPerUser) : '',
    });
    setModal({ mode: 'edit', id: row.id });
  };

  const firstOrderAudience = form.audience === 'NEVER_ORDERED_FIRST_ORDER';

  const buildCreateBody = () => {
    const code = form.code.trim().toUpperCase();
    if (!code) throw new Error('Kod zorunlu');
    if (!form.title?.trim()) throw new Error('Başlık zorunlu');
    const audience = form.audience || 'ALL_USERS';
    const eligibleUserIds = parseIds(form.eligibleUserIdsText);
    if (audience === 'USER_ID_LIST' && eligibleUserIds.length === 0) {
      throw new Error('ID listesi hedef kitle için en az bir kullanıcı ID girin.');
    }
    if (audience === 'NEVER_ORDERED_FIRST_ORDER') {
      const v = Number(form.value);
      if (form.discountKind !== 'ORDER_FIXED' || !Number.isFinite(v) || v !== 300) {
        throw new Error('İlk sipariş kuponu: indirim türü sipariş sabit (ORDER_FIXED), tutar 300 olmalı.');
      }
      if (numOrUndef(form.usageLimitPerUser) !== 1) {
        throw new Error('Kişi başı kullanım limiti tam olarak 1 olmalı.');
      }
      if (form.startsAt || form.endsAt) {
        throw new Error('İlk sipariş kuponunda başlangıç/bitiş tarihi olmamalı.');
      }
      if (numOrUndef(form.usageLimitGlobal) != null) {
        throw new Error('İlk sipariş kuponunda global kullanım limiti olmamalı.');
      }
      if (numOrUndef(form.minSubtotal) != null || numOrUndef(form.maxDiscount) != null) {
        throw new Error('İlk sipariş kuponunda min. sepet veya max indirim alanı dolu olmamalı.');
      }
    }
    return {
      code,
      audience,
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      forAllUsers: audience === 'ALL_USERS',
      eligibleUserIds: audience === 'USER_ID_LIST' ? eligibleUserIds : undefined,
      active: form.active,
      startsAt: firstOrderAudience ? null : form.startsAt || null,
      endsAt: firstOrderAudience ? null : form.endsAt || null,
      discountKind: form.discountKind,
      value: numOrUndef(form.value),
      minSubtotal: firstOrderAudience ? undefined : numOrUndef(form.minSubtotal),
      maxDiscount: firstOrderAudience ? undefined : numOrUndef(form.maxDiscount),
      eligibleTypes: form.eligibleTypes?.length ? [...form.eligibleTypes] : undefined,
      usageLimitGlobal: firstOrderAudience ? undefined : numOrUndef(form.usageLimitGlobal),
      usageLimitPerUser: numOrUndef(form.usageLimitPerUser),
    };
  };

  const buildUpdateBody = () => {
    const audience = form.audience || 'ALL_USERS';
    const eligibleUserIds = parseIds(form.eligibleUserIdsText);
    if (audience === 'USER_ID_LIST' && eligibleUserIds.length === 0) {
      throw new Error('ID listesi hedef kitle için en az bir kullanıcı ID girin.');
    }
    if (audience === 'NEVER_ORDERED_FIRST_ORDER') {
      const v = Number(form.value);
      if (form.discountKind !== 'ORDER_FIXED' || !Number.isFinite(v) || v !== 300) {
        throw new Error('İlk sipariş kuponu: indirim türü sipariş sabit, tutar 300 olmalı.');
      }
      if (numOrUndef(form.usageLimitPerUser) !== 1) {
        throw new Error('Kişi başı kullanım limiti tam olarak 1 olmalı.');
      }
      if (form.startsAt || form.endsAt) {
        throw new Error('İlk sipariş kuponunda başlangıç/bitiş tarihi olmamalı.');
      }
      if (numOrUndef(form.usageLimitGlobal) != null) {
        throw new Error('İlk sipariş kuponunda global kullanım limiti olmamalı.');
      }
      if (numOrUndef(form.minSubtotal) != null || numOrUndef(form.maxDiscount) != null) {
        throw new Error('İlk sipariş kuponunda min. sepet veya max indirim alanı dolu olmamalı.');
      }
    }
    return {
      audience,
      title: form.title?.trim() || undefined,
      description: form.description?.trim() || undefined,
      forAllUsers: audience === 'ALL_USERS',
      eligibleUserIds: audience === 'USER_ID_LIST' ? eligibleUserIds : [],
      active: form.active,
      startsAt: firstOrderAudience ? null : form.startsAt || null,
      endsAt: firstOrderAudience ? null : form.endsAt || null,
      discountKind: form.discountKind,
      value: numOrUndef(form.value),
      minSubtotal: firstOrderAudience ? null : numOrUndef(form.minSubtotal),
      maxDiscount: firstOrderAudience ? null : numOrUndef(form.maxDiscount),
      eligibleTypes: form.eligibleTypes?.length ? [...form.eligibleTypes] : [],
      usageLimitGlobal: firstOrderAudience ? null : numOrUndef(form.usageLimitGlobal),
      usageLimitPerUser: numOrUndef(form.usageLimitPerUser),
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      if (modal === 'create') {
        createMut.mutate(buildCreateBody());
      } else if (modal?.mode === 'edit') {
        updateMut.mutate({ id: modal.id, body: buildUpdateBody() });
      }
    } catch (err) {
      showError('Validation', err.message);
    }
  };

  const toggleListingType = (t) => {
    setForm((prev) => {
      const next = new Set(prev.eligibleTypes || []);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return { ...prev, eligibleTypes: [...next] };
    });
  };

  const submitting = createMut.isPending || updateMut.isPending;

  const sorted = useMemo(() => [...coupons].sort((a, b) => String(b.code || '').localeCompare(String(a.code || ''))), [coupons]);

  const normalizedCodeQuery = codeFilter.trim().toLowerCase();
  const filteredSorted = useMemo(() => {
    if (!normalizedCodeQuery) return sorted;
    return sorted.filter((c) => String(c.code || '').toLowerCase().includes(normalizedCodeQuery));
  }, [sorted, normalizedCodeQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="sticky top-0 z-10 -mx-4 mb-4 px-4 py-4 bg-[#F8FAFC]/90 backdrop-blur border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={ROUTES.DASHBOARD}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              Account
            </Link>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <Shield className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-slate-900 truncate">Coupon management</h1>
                <p className="text-xs text-slate-500">Admin-only — platform coupons</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New coupon
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-16 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="p-16 text-center text-slate-500 text-sm">
              No coupons yet. Create one with &quot;New coupon&quot;.
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="relative block min-w-0 flex-1 sm:max-w-sm">
                  <span className="sr-only">Filter by coupon code</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                  <input
                    type="search"
                    value={codeFilter}
                    onChange={(e) => setCodeFilter(e.target.value)}
                    placeholder="Filter by code…"
                    autoComplete="off"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-[3px] focus:ring-indigo-500/15"
                  />
                </label>
                {normalizedCodeQuery ? (
                  <span className="shrink-0 text-xs font-medium tabular-nums text-slate-500">
                    {filteredSorted.length} of {sorted.length}
                  </span>
                ) : null}
              </div>
              {filteredSorted.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-slate-600">
                  <p>
                    No coupon code matches &quot;
                    <span className="font-mono font-medium text-slate-900">{codeFilter.trim()}</span>
                    &quot;.
                  </p>
                  <button
                    type="button"
                    className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                    onClick={() => setCodeFilter('')}
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Code</th>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Discount</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Global left</th>
                    <th className="px-4 py-3 font-semibold">Audience</th>
                    <th className="px-4 py-3 font-semibold">Period</th>
                    <th className="px-4 py-3 font-semibold">Active</th>
                    <th className="px-4 py-3 font-semibold w-[100px]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSorted.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono font-medium text-slate-900">{row.code}</td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="truncate text-slate-800">{row.title}</div>
                        {row.description && <div className="truncate text-xs text-slate-500">{row.description}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        <span className="text-xs text-slate-500 uppercase">{String(row.discountKind || '').replace(/_/g, ' ')}</span>
                        <div>{row.value != null ? row.value : '—'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums text-xs text-slate-700">
                        {row.usageLimitGlobal != null ? (
                          <>
                            <span className="font-semibold text-slate-900">{row.usageRemainingGlobal ?? '—'}</span>
                            <span className="text-slate-400"> / {row.usageLimitGlobal}</span>
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {(() => {
                          const { label, hint } = audienceSummary(row);
                          const a =
                            row.audience || (row.forAllUsers !== false ? 'ALL_USERS' : 'USER_ID_LIST');
                          return (
                            <div className="text-xs">
                              <span
                                className={
                                  a === 'NEVER_ORDERED_FIRST_ORDER'
                                    ? 'text-indigo-700 font-medium'
                                    : a === 'ALL_USERS'
                                      ? 'text-emerald-700 font-medium'
                                      : 'text-slate-800'
                                }
                              >
                                {label}
                              </span>
                              {hint ? <div className="text-slate-500 mt-0.5">{hint}</div> : null}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                        <div>{formatDateTime(row.startsAt)}</div>
                        <div>{formatDateTime(row.endsAt)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            row.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {row.active ? 'On' : 'Off'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-0 backdrop-blur-[3px] sm:items-center sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="coupon-modal-title"
        >
          <div className="flex max-h-[min(92vh,880px)] w-full max-w-2xl flex-col overflow-hidden rounded-t-[1.75rem] border border-white/70 bg-white shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.15)] ring-1 ring-slate-900/[0.06] sm:rounded-[1.75rem] sm:shadow-2xl">
            <header className="relative shrink-0 overflow-hidden border-b border-white/10 bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-5 py-5 text-white">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-48 rounded-full bg-violet-500/30 blur-xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                    <Ticket className="h-6 w-6 opacity-95" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <h2 id="coupon-modal-title" className="text-lg font-bold tracking-tight">
                      {modal === 'create' ? 'Yeni kupon' : 'Kuponu düzenle'}
                    </h2>
                    <p className="mt-1 text-sm font-medium leading-snug text-indigo-100/95">
                      {modal === 'create'
                        ? 'Kod, hedef kitle ve indirim kurallarını tanımlayın.'
                        : 'Metin, indirim ve limitleri güncelleyin. Hedef kitle sabittir.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
                  onClick={() => {
                    setModal(null);
                    setForm(emptyForm());
                  }}
                  aria-label="Kapat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col bg-slate-50/40">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
                <FormSection Icon={Tag} title="Temel bilgiler" subtitle="Kullanıcıya görünen başlık ve kupon kodu.">
                  {modal === 'create' && (
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-700">
                        Kod <span className="text-rose-500">*</span>
                      </span>
                      <input
                        className={`${inputCn} font-mono uppercase tracking-wide`}
                        value={form.code}
                        onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                        placeholder="ILK300"
                        required
                      />
                    </label>
                  )}
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">
                      Başlık <span className="text-rose-500">*</span>
                    </span>
                    <input
                      className={inputCn}
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Liste ve ödeme adımlarında görünür"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">Açıklama</span>
                    <textarea
                      className={`${inputCn} min-h-[88px] resize-y leading-relaxed`}
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Kuponun şartlarını kısaca yazın."
                    />
                  </label>
                </FormSection>

                <FormSection
                  Icon={Users}
                  title="Hedef kitle"
                  subtitle="Kuponu kimler görebilir ve kullanabilir?"
                >
                  <fieldset className="space-y-2.5" disabled={modal?.mode === 'edit'}>
                    <legend className="sr-only">Hedef kitle</legend>
                    <div className="grid gap-2 sm:grid-cols-1">
                      {AUDIENCES.map((opt) => {
                        const selected = form.audience === opt.value;
                        return (
                          <label
                            key={opt.value}
                            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all sm:p-4 ${
                              selected
                                ? 'border-indigo-400 bg-indigo-50/90 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                            } ${modal?.mode === 'edit' ? 'cursor-default opacity-95' : ''}`}
                          >
                            <input
                              type="radio"
                              name="coupon-audience"
                              className="mt-1 h-4 w-4 shrink-0 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              checked={selected}
                              onChange={() => setAudienceSelection(opt.value)}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-slate-900">{opt.label}</span>
                              <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{opt.hint}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  {modal?.mode === 'edit' && (
                    <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                      Hedef kitle oluşturulduktan sonra değiştirilemez. Farklı kitle için yeni kupon açın.
                    </p>
                  )}

                  {form.audience === 'NEVER_ORDERED_FIRST_ORDER' && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3.5">
                      <div className="flex items-center gap-2.5 text-sm text-indigo-950">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-indigo-100">
                          <Users className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Anlık uygun kullanıcı</p>
                          <p className="text-xs text-indigo-800/80">Tamamlanmış ödemeli siparişi olmayan kayıtlı alıcılar</p>
                        </div>
                      </div>
                      <div className="rounded-xl bg-white px-4 py-2 text-center shadow-sm ring-1 ring-indigo-100">
                        <span className="block text-2xl font-bold tabular-nums tracking-tight text-indigo-700">
                          {audienceStatsLoading ? '…' : (audienceStats?.eligibleUserCount ?? '—')}
                        </span>
                        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">kişi</span>
                      </div>
                    </div>
                  )}

                  {form.audience === 'USER_ID_LIST' && (
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-700">Kullanıcı ID’leri</span>
                      <span className="mt-0.5 block text-[11px] font-normal text-slate-500">
                        Virgül veya boşlukla ayırın; yinelenenler birleştirilir.
                      </span>
                      <input
                        className={`${inputCn} font-mono text-[13px]`}
                        value={form.eligibleUserIdsText}
                        onChange={(e) => setForm((p) => ({ ...p, eligibleUserIdsText: e.target.value }))}
                        placeholder="örn. 12, 48, 102"
                      />
                    </label>
                  )}
                </FormSection>

                <FormSection
                  Icon={Clock}
                  title="Yayın ve süre"
                  subtitle="Ne zaman geçerli olsun? İlk sipariş kuralında tarih kapalıdır."
                >
                  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition hover:border-slate-300">
                    <span className="text-sm font-semibold text-slate-800">Kupon yayında</span>
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                      className="h-5 w-5 shrink-0 rounded-md border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0"
                    />
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-700">Başlangıç</span>
                      <input
                        type="datetime-local"
                        className={inputCn}
                        value={form.startsAt}
                        onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))}
                        disabled={firstOrderAudience}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-700">Bitiş</span>
                      <input
                        type="datetime-local"
                        className={inputCn}
                        value={form.endsAt}
                        onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))}
                        disabled={firstOrderAudience}
                      />
                    </label>
                  </div>
                  {firstOrderAudience && (
                    <p className="text-xs text-slate-500">Bu kuralda süre sınırı yok; alanlar kilitlidir.</p>
                  )}
                </FormSection>

                <FormSection
                  Icon={Percent}
                  title="İndirim"
                  subtitle="Tür ve tutar. İlk sipariş kuralı sabit ₺300 sipariş indirimidir."
                >
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">İndirim türü</span>
                    <select
                      className={inputCn}
                      value={form.discountKind}
                      onChange={(e) => setForm((p) => ({ ...p, discountKind: e.target.value }))}
                      disabled={firstOrderAudience}
                    >
                      {DISCOUNT_KINDS.map((k) => (
                        <option key={k} value={k}>
                          {k.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-700">Değer</span>
                      <input
                        type="number"
                        step="any"
                        className={inputCn}
                        value={form.value}
                        onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                        disabled={firstOrderAudience}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-700">Min. sepet</span>
                      <input
                        type="number"
                        step="any"
                        className={inputCn}
                        value={form.minSubtotal}
                        onChange={(e) => setForm((p) => ({ ...p, minSubtotal: e.target.value }))}
                        disabled={firstOrderAudience}
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">Maks. indirim</span>
                    <input
                      type="number"
                      step="any"
                      className={inputCn}
                      value={form.maxDiscount}
                      onChange={(e) => setForm((p) => ({ ...p, maxDiscount: e.target.value }))}
                      disabled={firstOrderAudience}
                    />
                  </label>
                </FormSection>

                <FormSection
                  Icon={Layers}
                  title="Ürün kapsamı"
                  subtitle="Boş bırakılırsa uygun tüm ilan türleri (gayrimenkul ve araç hariç) geçerlidir."
                >
                  <div className="flex flex-wrap gap-2">
                    {LISTING_TYPES.map((t) => {
                      const on = form.eligibleTypes.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleListingType(t)}
                          className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                            on
                              ? 'border-indigo-400 bg-indigo-50 text-indigo-900 shadow-sm ring-1 ring-indigo-500/15'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {t.replace(/_/g, ' ')}
                        </button>
                      );
                    })}
                  </div>
                </FormSection>

                <FormSection
                  Icon={Gauge}
                  title="Kullanım limitleri"
                  subtitle="Global tavan ve kişi başı. İlk sipariş kuralında yalnızca 1 kullanım / kişi."
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-700">Global limit</span>
                      <span className="mt-0.5 block text-[11px] font-normal text-slate-500">Boş = sınırsız</span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        className={inputCn}
                        value={form.usageLimitGlobal}
                        onChange={(e) => setForm((p) => ({ ...p, usageLimitGlobal: e.target.value }))}
                        disabled={firstOrderAudience}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-700">Kişi başı limit</span>
                      <span className="mt-0.5 block text-[11px] font-normal text-slate-500">Boş = sınırsız</span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        className={inputCn}
                        value={form.usageLimitPerUser}
                        onChange={(e) => setForm((p) => ({ ...p, usageLimitPerUser: e.target.value }))}
                        disabled={firstOrderAudience}
                      />
                    </label>
                  </div>
                </FormSection>
              </div>

              <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-md sm:px-5">
                <button
                  type="button"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  onClick={() => {
                    setModal(null);
                    setForm(emptyForm());
                  }}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-[44px] min-w-[120px] items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500 disabled:pointer-events-none disabled:opacity-50"
                >
                  {submitting ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouponsPage;
