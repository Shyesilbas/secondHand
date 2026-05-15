import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { campaignService } from '../../listing/services/campaignService.js';
import { listingService } from '../../listing/services/listingService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { formatCurrency } from '../../common/formatters.js';

const defaultForm = {
  name: '',
  active: true,
  discountKind: 'PERCENT',
  value: '',
  startsAt: '',
  endsAt: '',
  mode: 'LISTING', // ALL, LISTING, TYPE
  campaignType: 'STANDARD', // STANDARD, BUNDLE
  eligibleListingIds: [],
  eligibleTypes: [],
  minQuantity: 1,
  applyToFutureListings: false,
};

const toLocalDateTime = (value) => {
  if (!value) return null;
  return value.length === 16 ? `${value}:00` : value;
};

const normalizeCampaign = (campaign) => {
  if (!campaign) return null;
  const eligibleListingIds = Array.isArray(campaign.eligibleListingIds) ? campaign.eligibleListingIds : [];
  const eligibleTypes = Array.isArray(campaign.eligibleTypes) ? campaign.eligibleTypes : [];
  
  const isBundle = campaign.minQuantity > 1 && (!eligibleListingIds.length && !eligibleTypes.length);
  
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
    campaignType: isBundle ? 'BUNDLE' : 'STANDARD',
    eligibleListingIds,
    eligibleTypes,
    minQuantity: campaign.minQuantity != null ? Number(campaign.minQuantity) : 1,
    applyToFutureListings: Boolean(campaign.applyToFutureListings),
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
      .getMyListings(0, 50)
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
        eligibleListingIds: form.campaignType === 'STANDARD' && form.mode === 'LISTING' ? form.eligibleListingIds : null,
        eligibleTypes: form.campaignType === 'STANDARD' && form.mode === 'TYPE' ? form.eligibleTypes : null,
        minQuantity: form.campaignType === 'BUNDLE' ? (form.minQuantity || 2) : 1,
        applyToFutureListings: form.campaignType === 'BUNDLE' || Boolean(form.applyToFutureListings),
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a1918]/60 backdrop-blur-sm px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#e5e3df] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-5 border-b border-[#f0efed] bg-[#fafaf9] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1918] tracking-tight">
              {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
            </h2>
            <p className="text-sm text-[#5f5b57] mt-1">Boost your sales with attractive discounts and bundles.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-[#ebeae8] text-[#9c9894] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Sidebar - Campaign Type Selection */}
          <div className="w-72 bg-[#fafaf9] border-r border-[#f0efed] p-6 space-y-4 overflow-y-auto shrink-0">
            <div className="text-xs font-bold text-[#9c9894] uppercase tracking-widest mb-4">Choose Type</div>
            
            <button
              onClick={() => setForm(p => ({ ...p, campaignType: 'STANDARD', minQuantity: 1 }))}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                form.campaignType === 'STANDARD' 
                ? 'bg-white border-indigo-600 shadow-md' 
                : 'bg-transparent border-transparent hover:bg-[#ebeae8] text-[#5f5b57]'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${form.campaignType === 'STANDARD' ? 'bg-indigo-100 text-indigo-600' : 'bg-[#f0efed] text-[#9c9894]'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="font-bold text-sm">Standard Discount</div>
              <div className="text-xs opacity-70 mt-1">Apply to specific items or categories.</div>
            </button>

            <button
              onClick={() => setForm(p => ({ ...p, campaignType: 'BUNDLE', mode: 'ALL', minQuantity: 2 }))}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                form.campaignType === 'BUNDLE' 
                ? 'bg-white border-indigo-600 shadow-md' 
                : 'bg-transparent border-transparent hover:bg-[#ebeae8] text-[#5f5b57]'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${form.campaignType === 'BUNDLE' ? 'bg-indigo-100 text-indigo-600' : 'bg-[#f0efed] text-[#9c9894]'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="font-bold text-sm">Bundle & Save</div>
              <div className="text-xs opacity-70 mt-1">Multi-item rewards for all your listings.</div>
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
            <div className="space-y-8">
              {/* Basic Info Section */}
              <section className="space-y-4">
                <div className="text-sm font-bold text-[#1a1918]">Basic Information</div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <label className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-bold text-[#9c9894] uppercase">Campaign Name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-3.5 border border-[#e5e3df] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                      placeholder="e.g. Summer Special 2024"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-bold text-[#9c9894] uppercase">Discount Type</label>
                    <select
                      value={form.discountKind}
                      onChange={(e) => setForm((p) => ({ ...p, discountKind: e.target.value }))}
                      className="w-full px-4 py-3.5 border border-[#e5e3df] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 appearance-none bg-white"
                    >
                      <option value="PERCENT">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount</option>
                    </select>
                  </div>
                  <div className="relative">
                    <label className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-bold text-[#9c9894] uppercase">Value</label>
                    <input
                      value={form.value}
                      onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                      type="number"
                      className="w-full px-4 py-3.5 border border-[#e5e3df] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-bold text-[#9c9894] uppercase">Starts At</label>
                    <input
                      type="datetime-local"
                      value={form.startsAt}
                      onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))}
                      className="w-full px-4 py-3.5 border border-[#e5e3df] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    />
                  </div>
                  <div className="relative">
                    <label className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-bold text-[#9c9894] uppercase">Ends At</label>
                    <input
                      type="datetime-local"
                      value={form.endsAt}
                      onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))}
                      className="w-full px-4 py-3.5 border border-[#e5e3df] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    />
                  </div>
                </div>
              </section>

              {/* Type Specific Section */}
              {form.campaignType === 'BUNDLE' ? (
                <section className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="text-sm font-bold text-indigo-900">Bundle Configuration</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="absolute -top-2 left-3 px-1 bg-indigo-50 text-[10px] font-bold text-indigo-600 uppercase">Minimum Item Quantity</label>
                      <input
                        type="number"
                        min="2"
                        value={form.minQuantity}
                        onChange={(e) => setForm(p => ({ ...p, minQuantity: e.target.value }))}
                        className="w-full px-4 py-3.5 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                      />
                    </div>
                    <p className="text-xs text-indigo-700 leading-relaxed">
                      This bundle will automatically apply to <b>all your active listings</b>. Customers will receive the discount only if they add <b>{form.minQuantity || 2} or more</b> items to their cart.
                    </p>
                  </div>
                </section>
              ) : (
                <section className="space-y-4">
                  <div className="text-sm font-bold text-[#1a1918]">Select Eligibility</div>
                  <div className="flex gap-2">
                    {['ALL', 'LISTING', 'TYPE'].map((m) => (
                      <button
                        key={m}
                        onClick={() => setForm(p => ({ ...p, mode: m, eligibleListingIds: [], eligibleTypes: [] }))}
                        className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                          form.mode === m 
                          ? 'bg-[#1a1918] text-white border-[#1a1918]' 
                          : 'bg-white text-[#5f5b57] border-[#e5e3df] hover:border-[#1a1918]'
                        }`}
                      >
                        {m === 'ALL' ? 'Everything' : m === 'LISTING' ? 'Specific Listings' : 'Listing Types'}
                      </button>
                    ))}
                  </div>

                  {form.mode === 'LISTING' && (
                    <div className="border border-[#e5e3df] rounded-2xl overflow-hidden">
                      <div className="max-h-48 overflow-y-auto p-4 space-y-2">
                        {availableListings.map(l => (
                          <label key={l.id} className="flex items-center gap-3 p-2 hover:bg-[#fafaf9] rounded-lg cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={form.eligibleListingIds.includes(l.id)}
                              onChange={() => {
                                setForm(p => {
                                  const exists = p.eligibleListingIds.includes(l.id);
                                  const newList = exists ? p.eligibleListingIds.filter(id => id !== l.id) : [...p.eligibleListingIds, l.id];
                                  return { ...p, eligibleListingIds: newList };
                                });
                              }}
                              className="w-5 h-5 rounded-md border-[#e5e3df] text-indigo-600 focus:ring-indigo-600"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-[#1a1918] truncate">{l.title}</div>
                              <div className="text-[10px] text-[#9c9894]">{formatCurrency(l.price, l.currency)}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {form.mode === 'TYPE' && (
                    <div className="flex flex-wrap gap-2 p-2">
                      {availableTypes.map(t => (
                        <button
                          key={t}
                          onClick={() => {
                            setForm(p => {
                              const exists = p.eligibleTypes.includes(t);
                              const newList = exists ? p.eligibleTypes.filter(type => type !== t) : [...p.eligibleTypes, t];
                              return { ...p, eligibleTypes: newList };
                            });
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                            form.eligibleTypes.includes(t)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-[#fafaf9] text-[#5f5b57] border-[#e5e3df]'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              )}

              <section className="flex items-center justify-between p-4 bg-[#fafaf9] rounded-2xl border border-[#f0efed]">
                <div>
                  <div className="text-sm font-bold text-[#1a1918]">Active Status</div>
                  <div className="text-xs text-[#9c9894]">Campaign will be visible once saved.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, active: !p.active }))}
                  className={`w-14 h-8 rounded-full transition-all relative ${form.active ? 'bg-indigo-600' : 'bg-[#e5e3df]'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${form.active ? 'left-7' : 'left-1'}`} />
                </button>
              </section>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[#f0efed] bg-[#fafaf9] flex items-center justify-end gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-[#5f5b57] hover:text-[#1a1918] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={isSaving}
            className="px-8 py-3 bg-[#1a1918] text-white rounded-2xl text-sm font-bold hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-black/10"
          >
            {isSaving ? 'Processing...' : editingCampaign ? 'Save Changes' : 'Launch Campaign'}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default CreateCampaignModal;
