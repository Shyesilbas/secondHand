import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, RefreshCw, Shield } from 'lucide-react';
import { useEnums } from '../../common/hooks/useEnums.js';
import { ROUTES } from '../../common/constants/routes.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { adminCouponApi } from '../services/adminCouponApi.js';
import { Button, PageHeader } from '../../common/components/ui/index.js';
import AdminCouponsTable from '../components/AdminCouponsTable.jsx';
import AdminCouponFormModal from '../components/AdminCouponFormModal.jsx';
import {
  buildCreateCouponBody,
  buildUpdateCouponBody,
  couponRowToForm,
  emptyCouponForm,
  FIRST_ORDER_PRESET
} from '../utils/couponFormUtils.js';

const AdminCouponsPage = () => {
  const { t } = useTranslation();
  const { discountableListingTypes } = useEnums();
  const { showError, showSuccess } = useNotification();
  const qc = useQueryClient();

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(() => emptyCouponForm());
  const [codeFilter, setCodeFilter] = useState('');

  const {
    data: coupons = [],
    isLoading,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => adminCouponApi.list(),
    select: (d) => (Array.isArray(d) ? d : []),
    staleTime: 30_000
  });

  const {
    data: audienceStats,
    isFetching: audienceStatsLoading
  } = useQuery({
    queryKey: ['admin', 'coupons', 'audience-stats', form.audience],
    queryFn: () => adminCouponApi.audienceStats(form.audience),
    enabled: !!modal && form.audience === 'NEVER_ORDERED_FIRST_ORDER',
    staleTime: 15_000
  });

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    qc.invalidateQueries({ queryKey: ['admin', 'coupons', 'audience-stats'] });
  }, [qc]);

  const setAudienceSelection = useCallback(
    (value) => {
      setForm((p) => {
        if (value === 'NEVER_ORDERED_FIRST_ORDER') {
          return {
            ...p,
            audience: value,
            forAllUsers: false,
            eligibleUserIdsText: '',
            ...FIRST_ORDER_PRESET,
            title: t(FIRST_ORDER_PRESET.titleKey),
            description: t(FIRST_ORDER_PRESET.descriptionKey)
          };
        }
        if (value === 'ALL_USERS') {
          return { ...p, audience: value, forAllUsers: true, eligibleUserIdsText: '' };
        }
        return { ...p, audience: value, forAllUsers: false };
      });
    },
    [t]
  );

  const closeCouponModal = useCallback(() => {
    setModal(null);
    setForm(emptyCouponForm());
  }, []);

  const createMut = useMutation({
    mutationFn: (body) => adminCouponApi.create(body),
    onSuccess: () => {
      showSuccess('Saved', 'Coupon created.');
      invalidate();
      closeCouponModal();
    },
    onError: (e) => showError('Create failed', e?.response?.data?.message || e.message)
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }) => adminCouponApi.update(id, body),
    onSuccess: () => {
      showSuccess('Saved', 'Coupon updated.');
      invalidate();
      closeCouponModal();
    },
    onError: (e) => showError('Update failed', e?.response?.data?.message || e.message)
  });

  const openCreate = () => {
    setForm(emptyCouponForm());
    setModal('create');
  };

  const openEdit = (row) => {
    setForm(couponRowToForm(row));
    setModal({ mode: 'edit', id: row.id });
  };

  const firstOrderAudience = form.audience === 'NEVER_ORDERED_FIRST_ORDER';

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      if (modal === 'create') {
        createMut.mutate(buildCreateCouponBody(form, t));
      } else if (modal?.mode === 'edit') {
        updateMut.mutate({ id: modal.id, body: buildUpdateCouponBody(form, t) });
      }
    } catch (err) {
      showError('Validation', err.message);
    }
  };

  const toggleListingType = (typeCode) => {
    setForm((prev) => {
      const next = new Set(prev.eligibleTypes || []);
      if (next.has(typeCode)) next.delete(typeCode);
      else next.add(typeCode);
      return { ...prev, eligibleTypes: [...next] };
    });
  };

  const submitting = createMut.isPending || updateMut.isPending;
  const sorted = useMemo(
    () => [...coupons].sort((a, b) => String(b.code || '').localeCompare(String(a.code || ''))),
    [coupons]
  );
  const normalizedCodeQuery = codeFilter.trim().toLowerCase();
  const filteredSorted = useMemo(() => {
    if (!normalizedCodeQuery) return sorted;
    return sorted.filter((c) => String(c.code || '').toLowerCase().includes(normalizedCodeQuery));
  }, [sorted, normalizedCodeQuery]);

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-border-light bg-background-secondary px-4 py-4">
          <PageHeader
            back={
              <Link
                to={ROUTES.DASHBOARD}
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('account')}
              </Link>
            }
            icon={Shield}
            title={t('coupon_management')}
            subtitle={t('admin_only_platform_coupons')}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isFetching}>
                  <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                  {t('refresh')}
                </Button>
                <Button size="sm" onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  {t('new_coupon')}
                </Button>
              </div>
            }
          />
        </div>

        <AdminCouponsTable
          isLoading={isLoading}
          sorted={sorted}
          filteredSorted={filteredSorted}
          codeFilter={codeFilter}
          normalizedCodeQuery={normalizedCodeQuery}
          onCodeFilterChange={setCodeFilter}
          onClearFilter={() => setCodeFilter('')}
          onOpenCreate={openCreate}
          onOpenEdit={openEdit}
        />
      </div>

      <AdminCouponFormModal
        modal={modal}
        form={form}
        setForm={setForm}
        submitting={submitting}
        firstOrderAudience={firstOrderAudience}
        audienceStats={audienceStats}
        audienceStatsLoading={audienceStatsLoading}
        discountableListingTypes={discountableListingTypes}
        onClose={closeCouponModal}
        onSubmit={handleSubmit}
        onAudienceSelect={setAudienceSelection}
        onToggleListingType={toggleListingType}
      />
    </div>
  );
};

export default AdminCouponsPage;
