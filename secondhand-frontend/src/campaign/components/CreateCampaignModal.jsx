import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { campaignService } from '../../listing/services/campaignService.js';
import { listingService } from '../../listing/services/listingService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';

const defaultForm = {
  name: '',
  active: true,
  discountKind: 'PERCENT',
  value: '',
  startsAt: '',
  endsAt: '',
  mode: 'LISTING',
  eligibleListingIds: [],
  eligibleTypes: [],
};

const toLocalDateTime = (value) => {
  if (!value) return null;
  return value.length === 16 ? `${value}:00` : value;
};

const normalizeCampaign = (campaign) => {
  if (!campaign) return null;
  const eligibleListingIds = Array.isArray(campaign.eligibleListingIds) ? campaign.eligibleListingIds : [];
  const eligibleTypes = Array.isArray(campaign.eligibleTypes) ? campaign.eligibleTypes : [];
  let mode = 'ALL';
  if (eligibleListingIds.length > 0) mode = 'LISTING';
  else if (eligibleTypes.length > 0) mode = 'TYPE';

  return {
    id: campaign.id,
    name: campaign.name || '',
    active: Boolean(campaign.active),
    discountKind: campaign.discountKind || 'PERCENT',
    value: campaign.value != null ? String(campaign.value) : '',
    startsAt: campaign.startsAt ? campaign.startsAt.slice(0, 16) : '',
    endsAt: campaign.endsAt ? campaign.endsAt.slice(0, 16) : '',
    mode,
    eligibleListingIds,
    eligibleTypes,
  };
};

const CreateCampaignModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialListingId,
  editingCampaign,
}) => {
  const { showError, showSuccess } = useNotification();
  const [form, setForm] = useState(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [myListings, setMyListings] = useState([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);

  const availableListings = useMemo(() => {
    return (myListings || []).filter((l) => l?.type !== 'VEHICLE' && l?.type !== 'REAL_ESTATE');
  }, [myListings]);

  const availableTypes = useMemo(() => {
    const types = new Set();
    availableListings.forEach((l) => {
      if (l?.type) types.add(l.type);
    });
    return Array.from(types).sort();
  }, [availableListings]);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingListings(true);
    listingService
      .getMyListings(0, 200)
      .then((res) => {
        const data = Array.isArray(res) ? res : (Array.isArray(res?.content) ? res.content : []);
        setMyListings(data);
      })
      .catch(() => setMyListings([]))
      .finally(() => setIsLoadingListings(false));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (editingCampaign) {
      setForm(normalizeCampaign(editingCampaign) || defaultForm);
      return;
    }
    if (initialListingId) {
      setForm({
        ...defaultForm,
        mode: 'LISTING',
        eligibleListingIds: [initialListingId],
      });
      return;
    }
    setForm(defaultForm);
  }, [isOpen, initialListingId, editingCampaign]);

  if (!isOpen) return null;

  const save = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: form.name?.trim(),
        active: Boolean(form.active),
        startsAt: toLocalDateTime(form.startsAt),
        endsAt: toLocalDateTime(form.endsAt),
        discountKind: form.discountKind,
        value: form.value !== '' ? Number(form.value) : null,
        eligibleListingIds: form.mode === 'LISTING' ? form.eligibleListingIds : null,
        eligibleTypes: form.mode === 'TYPE' ? form.eligibleTypes : null,
      };

      if (editingCampaign?.id) {
        await campaignService.update(editingCampaign.id, payload);
        showSuccess('Campaign updated', 'Your campaign has been updated.');
      } else {
        await campaignService.create(payload);
        showSuccess('Campaign created', 'Your campaign has been created.');
      }

      onSuccess?.();
      onClose?.();
    } catch (e) {
      showError('Campaign', e?.response?.data?.message || 'Failed to save campaign');
    } finally {
      setIsSaving(false);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">{editingCampaign ? 'Edit Campaign' : 'Create Campaign'}</div>
            <div className="text-sm text-gray-600">Discounts are not applicable to Vehicle or Real Estate.</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-700"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Winter Sale"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount kind</label>
                <select
                  value={form.discountKind}
                  onChange={(e) => setForm((p) => ({ ...p, discountKind: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="PERCENT">Percent</option>
                  <option value="FIXED">Fixed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                <input
                  value={form.value}
                  onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Starts at</label>
                <input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ends at</label>
                <input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-900">Applies to</div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, mode: 'ALL', eligibleListingIds: [], eligibleTypes: [] }))}
                className={`px-3 py-2 rounded-xl text-sm font-semibold border ${form.mode === 'ALL' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`}
              >
                All my listings
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, mode: 'LISTING', eligibleTypes: [] }))}
                className={`px-3 py-2 rounded-xl text-sm font-semibold border ${form.mode === 'LISTING' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`}
              >
                Selected listings
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, mode: 'TYPE', eligibleListingIds: [] }))}
                className={`px-3 py-2 rounded-xl text-sm font-semibold border ${form.mode === 'TYPE' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`}
              >
                Listing types
              </button>
            </div>

            {form.mode === 'LISTING' && (
              <div className="border border-gray-200 rounded-xl p-4 max-h-64 overflow-y-auto">
                {isLoadingListings ? (
                  <div className="text-sm text-gray-600">Loading…</div>
                ) : (
                  <div className="space-y-2">
                    {availableListings.length === 0 ? (
                      <div className="text-sm text-gray-600">No eligible listings found.</div>
                    ) : (
                      availableListings.map((l) => {
                        const checked = form.eligibleListingIds.includes(l.id);
                        return (
                          <label key={l.id} className="flex items-center gap-3 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setForm((p) => {
                                  const exists = p.eligibleListingIds.includes(l.id);
                                  const eligibleListingIds = exists
                                    ? p.eligibleListingIds.filter((x) => x !== l.id)
                                    : [...p.eligibleListingIds, l.id];
                                  return { ...p, eligibleListingIds };
                                });
                              }}
                              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            />
                            <span className="truncate">{l.title} {l.listingNo ? `(${l.listingNo})` : ''}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {form.mode === 'TYPE' && (
              <div className="border border-gray-200 rounded-xl p-4">
                {availableTypes.length === 0 ? (
                  <div className="text-sm text-gray-600">No eligible listing types found.</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableTypes.map((t) => {
                      const checked = form.eligibleTypes.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setForm((p) => {
                              const exists = p.eligibleTypes.includes(t);
                              const eligibleTypes = exists ? p.eligibleTypes.filter((x) => x !== t) : [...p.eligibleTypes, t];
                              return { ...p, eligibleTypes };
                            });
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${checked ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingCampaign ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default CreateCampaignModal;


