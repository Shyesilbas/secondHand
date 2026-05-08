import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Plus, RefreshCw, Shield, Tag } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { formatDateTime } from '../../common/formatters.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { adminCouponApi } from '../services/adminCouponApi.js';

const LISTING_TYPES = ['VEHICLE', 'ELECTRONICS', 'REAL_ESTATE', 'CLOTHING', 'BOOKS', 'SPORTS', 'OTHER'];

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

const AdminCouponsPage = () => {
  const { showError, showSuccess } = useNotification();
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(() => emptyForm());

  const { data: coupons = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => adminCouponApi.list(),
    select: (d) => (Array.isArray(d) ? d : []),
    staleTime: 30_000,
  });

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
  }, [qc]);

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
    setForm({
      code: row.code || '',
      title: row.title || '',
      description: row.description || '',
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

  const buildCreateBody = () => {
    const code = form.code.trim().toUpperCase();
    if (!code) throw new Error('Code is required');
    if (!form.title?.trim()) throw new Error('Title is required');
    const eligibleUserIds = parseIds(form.eligibleUserIdsText);
    if (!form.forAllUsers && eligibleUserIds.length === 0) {
      throw new Error('Add at least one user id, or enable “All users”.');
    }
    return {
      code,
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      forAllUsers: form.forAllUsers,
      eligibleUserIds: form.forAllUsers ? undefined : eligibleUserIds,
      active: form.active,
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
      discountKind: form.discountKind,
      value: numOrUndef(form.value),
      minSubtotal: numOrUndef(form.minSubtotal),
      maxDiscount: numOrUndef(form.maxDiscount),
      eligibleTypes: form.eligibleTypes?.length ? [...form.eligibleTypes] : undefined,
      usageLimitGlobal: numOrUndef(form.usageLimitGlobal),
      usageLimitPerUser: numOrUndef(form.usageLimitPerUser),
    };
  };

  const buildUpdateBody = () => {
    const eligibleUserIds = parseIds(form.eligibleUserIdsText);
    if (!form.forAllUsers && eligibleUserIds.length === 0) {
      throw new Error('Add at least one user id, or enable “All users”.');
    }
    return {
      title: form.title?.trim() || undefined,
      description: form.description?.trim() || undefined,
      forAllUsers: form.forAllUsers,
      eligibleUserIds: form.forAllUsers ? [] : eligibleUserIds,
      active: form.active,
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
      discountKind: form.discountKind,
      value: numOrUndef(form.value),
      minSubtotal: numOrUndef(form.minSubtotal),
      maxDiscount: numOrUndef(form.maxDiscount),
      eligibleTypes: form.eligibleTypes?.length ? [...form.eligibleTypes] : [],
      usageLimitGlobal: numOrUndef(form.usageLimitGlobal),
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Code</th>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Discount</th>
                    <th className="px-4 py-3 font-semibold">Audience</th>
                    <th className="px-4 py-3 font-semibold">Period</th>
                    <th className="px-4 py-3 font-semibold">Active</th>
                    <th className="px-4 py-3 font-semibold w-[100px]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sorted.map((row) => (
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
                      <td className="px-4 py-3 text-slate-700">
                        {row.forAllUsers ? (
                          <span className="text-emerald-700 text-xs font-medium">All users</span>
                        ) : (
                          <span className="text-xs">
                            {(row.eligibleUserIds?.length || 0) > 0
                              ? `${row.eligibleUserIds.length} user(s)`
                              : '—'}
                          </span>
                        )}
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
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="sticky top-0 flex items-center justify-between gap-2 px-5 py-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2 min-w-0">
                <Tag className="w-5 h-5 text-indigo-600 shrink-0" />
                <h2 className="font-semibold text-slate-900 truncate">{modal === 'create' ? 'New coupon' : 'Edit coupon'}</h2>
              </div>
              <button
                type="button"
                className="text-sm text-slate-500 hover:text-slate-800"
                onClick={() => {
                  setModal(null);
                  setForm(emptyForm());
                }}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {modal === 'create' && (
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Code*</span>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono uppercase"
                    value={form.code}
                    onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                    placeholder="SAVE20"
                    required
                  />
                </label>
              )}

              <label className="block">
                <span className="text-xs font-medium text-slate-600">Title*</span>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-600">Description</span>
                <textarea
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[72px]"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.forAllUsers}
                  onChange={(e) => setForm((p) => ({ ...p, forAllUsers: e.target.checked }))}
                />
                <span className="text-sm text-slate-800">All users</span>
              </label>

              {!form.forAllUsers && (
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Eligible user IDs (comma-separated)</span>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
                    value={form.eligibleUserIdsText}
                    onChange={(e) => setForm((p) => ({ ...p, eligibleUserIdsText: e.target.value }))}
                    placeholder="1, 42, 100"
                  />
                </label>
              )}

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                />
                <span className="text-sm text-slate-800">Active</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Starts</span>
                  <input
                    type="datetime-local"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    value={form.startsAt}
                    onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Ends</span>
                  <input
                    type="datetime-local"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    value={form.endsAt}
                    onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))}
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-medium text-slate-600">Discount kind</span>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.discountKind}
                  onChange={(e) => setForm((p) => ({ ...p, discountKind: e.target.value }))}
                >
                  {DISCOUNT_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {k.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Value</span>
                  <input
                    type="number"
                    step="any"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={form.value}
                    onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Min subtotal</span>
                  <input
                    type="number"
                    step="any"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={form.minSubtotal}
                    onChange={(e) => setForm((p) => ({ ...p, minSubtotal: e.target.value }))}
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-medium text-slate-600">Max discount</span>
                <input
                  type="number"
                  step="any"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.maxDiscount}
                  onChange={(e) => setForm((p) => ({ ...p, maxDiscount: e.target.value }))}
                />
              </label>

              <div>
                <span className="text-xs font-medium text-slate-600">Eligible listing types (empty = any)</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LISTING_TYPES.map((t) => (
                    <label key={t} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.eligibleTypes.includes(t)}
                        onChange={() => toggleListingType(t)}
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Global usage limit</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={form.usageLimitGlobal}
                    onChange={(e) => setForm((p) => ({ ...p, usageLimitGlobal: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Per-user limit</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={form.usageLimitPerUser}
                    onChange={(e) => setForm((p) => ({ ...p, usageLimitPerUser: e.target.value }))}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setModal(null);
                    setForm(emptyForm());
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
                >
                  {submitting ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouponsPage;
