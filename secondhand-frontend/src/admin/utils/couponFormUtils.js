export const AUDIENCES = [
  {
    value: 'ALL_USERS',
    labelKey: 'admin_audience_all_users',
    hintKey: 'admin_audience_all_users_hint'
  },
  {
    value: 'USER_ID_LIST',
    labelKey: 'admin_audience_id_list',
    hintKey: 'admin_audience_id_list_hint'
  },
  {
    value: 'NEVER_ORDERED_FIRST_ORDER',
    labelKey: 'admin_audience_first_order',
    hintKey: 'admin_audience_first_order_hint'
  }
];

export const FIRST_ORDER_PRESET = {
  titleKey: 'admin_first_order_preset_title',
  descriptionKey: 'admin_first_order_preset_desc',
  discountKind: 'ORDER_FIXED',
  value: '300',
  usageLimitPerUser: '1',
  usageLimitGlobal: '',
  startsAt: '',
  endsAt: '',
  minSubtotal: '',
  maxDiscount: ''
};

export const DISCOUNT_KINDS = [
  'ORDER_PERCENT',
  'ORDER_FIXED',
  'TYPE_PERCENT',
  'TYPE_FIXED',
  'THRESHOLD_FIXED',
  'THRESHOLD_PERCENT'
];

export const emptyCouponForm = () => ({
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
  usageLimitPerUser: ''
});

export const couponRowToForm = (row) => {
  const inferredAudience = row.audience || (row.forAllUsers !== false ? 'ALL_USERS' : 'USER_ID_LIST');
  return {
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
    usageLimitPerUser: row.usageLimitPerUser != null ? String(row.usageLimitPerUser) : ''
  };
};

export const parseIds = (text) => {
  if (!text?.trim()) return [];
  return [...new Set(text.split(/[\s,]+/).map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0))];
};

export const toInputDateTime = (v) => {
  if (!v) return '';
  const s = typeof v === 'string' ? v : String(v);
  if (s.length >= 16) return s.slice(0, 16);
  return s;
};

export const numOrUndef = (raw) => {
  if (raw === '' || raw == null) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
};

export const audienceSummary = (row, t) => {
  const a = row.audience || (row.forAllUsers !== false ? 'ALL_USERS' : 'USER_ID_LIST');
  if (a === 'NEVER_ORDERED_FIRST_ORDER') {
    return { label: t('admin_audience_first_order_short'), hint: '' };
  }
  if (a === 'USER_ID_LIST') {
    const n = row.eligibleUserIds?.length ?? 0;
    return { label: t('admin_audience_id_list'), hint: `${n} ${t('admin_users_count')}` };
  }
  return { label: t('admin_audience_all_users'), hint: '' };
};

const validateAudienceFields = (form, audience, eligibleUserIds, t) => {
  if (audience === 'USER_ID_LIST' && eligibleUserIds.length === 0) {
    throw new Error(t('admin_err_id_list_empty'));
  }
  if (audience === 'NEVER_ORDERED_FIRST_ORDER') {
    const v = Number(form.value);
    if (form.discountKind !== 'ORDER_FIXED' || !Number.isFinite(v) || v !== 300) {
      throw new Error(t('admin_err_first_order_discount'));
    }
    if (numOrUndef(form.usageLimitPerUser) !== 1) {
      throw new Error(t('admin_err_per_user_limit_one'));
    }
    if (form.startsAt || form.endsAt) {
      throw new Error(t('admin_err_first_order_no_dates'));
    }
    if (numOrUndef(form.usageLimitGlobal) != null) {
      throw new Error(t('admin_err_first_order_no_global_limit'));
    }
    if (numOrUndef(form.minSubtotal) != null || numOrUndef(form.maxDiscount) != null) {
      throw new Error(t('admin_err_first_order_no_min_max'));
    }
  }
};

export const buildCreateCouponBody = (form, t) => {
  const code = form.code.trim().toUpperCase();
  if (!code) throw new Error(t('admin_err_code_required'));
  if (!form.title?.trim()) throw new Error(t('admin_err_title_required'));
  const audience = form.audience || 'ALL_USERS';
  const eligibleUserIds = parseIds(form.eligibleUserIdsText);
  validateAudienceFields(form, audience, eligibleUserIds, t);
  const firstOrderAudience = audience === 'NEVER_ORDERED_FIRST_ORDER';

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
    usageLimitPerUser: numOrUndef(form.usageLimitPerUser)
  };
};

export const buildUpdateCouponBody = (form, t) => {
  const audience = form.audience || 'ALL_USERS';
  const eligibleUserIds = parseIds(form.eligibleUserIdsText);
  validateAudienceFields(form, audience, eligibleUserIds, t);
  const firstOrderAudience = audience === 'NEVER_ORDERED_FIRST_ORDER';

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
    usageLimitPerUser: numOrUndef(form.usageLimitPerUser)
  };
};
