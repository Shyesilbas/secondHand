import React, {useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {ROUTES} from '../../common/constants/routes.js';
import {campaignService} from '../../listing/services/campaignService.js';
import {listingService} from '../../listing/services/listingService.js';
import {useNotification} from '../../notification/NotificationContext.jsx';
import CreateCampaignModal from '../components/CreateCampaignModal.jsx';
import {formatDateTime} from '../../common/formatters.js';
import {ArrowLeft, CalendarDays, Clock, Edit2, Layers, Plus, RefreshCw, Tag, Target, Trash2} from 'lucide-react';

const MyCouponsPage = () => {
  const { showError, showSuccess } = useNotification();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [listingTitleById, setListingTitleById] = useState({});

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await campaignService.listMine();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (e) {
      setCampaigns([]);
      showError('Kuponlarım', e?.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const loadListingTitles = async () => {
    try {
      const res = await listingService.getMyListings(0, 50);
      const items = Array.isArray(res) ? res : (Array.isArray(res?.content) ? res.content : []);
      const map = {};
      items.forEach((l) => {
        if (l?.id) {
          map[l.id] = l.title || l.listingNo || l.id;
        }
      });
      setListingTitleById(map);
    } catch {
      setListingTitleById({});
    }
  };

  useEffect(() => {
    load();
    loadListingTitles();
  }, []);

  const deleteCampaign = async (id) => {
    try {
      await campaignService.remove(id);
      showSuccess('Deleted', 'Campaign deleted.');
      await load();
    } catch (e) {
      showError('Delete failed', e?.response?.data?.message || 'Failed to delete campaign');
    }
  };

  const stats = useMemo(() => {
    const active = campaigns.filter(c => c.active).length;
    const inactive = campaigns.filter(c => !c.active).length;
    return {
      total: campaigns.length,
      active,
      inactive
    };
  }, [campaigns]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="sticky top-0 z-20 -mx-4 mb-4 bg-[#F8FAFC]/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={ROUTES.DASHBOARD} className="text-slate-500 hover:text-slate-700">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-semibold tracking-tight text-slate-900">
                    Marketing Campaigns
                  </h1>
                  {campaigns.length > 0 && (
                    <span className="text-[11px] font-medium text-slate-500">
                      {stats.total} total
                    </span>
                  )}
                </div>
                <p className="hidden sm:block text-[11px] text-slate-500 tracking-tight">
                  Design and monitor your discount strategy for your shop.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={load}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingCampaign(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs sm:text-sm font-semibold tracking-tight text-white shadow-sm hover:bg-slate-800"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                New Campaign
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
          <div className="rounded-2xl bg-white border border-slate-100 px-4 py-3 shadow-sm/50 shadow-[0_18px_45px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Total
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            </div>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-2xl font-semibold tracking-tight text-slate-900">
                {stats.total}
              </span>
              <span className="text-[11px] text-slate-500">
                All campaigns
              </span>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-emerald-100 px-4 py-3 shadow-sm/50 shadow-[0_18px_45px_rgba(16,185,129,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-700">
                Active
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_0_4px_rgba(16,185,129,0.35)]" />
                <span className="text-[10px] font-medium text-emerald-700">Live</span>
              </span>
            </div>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-2xl font-semibold tracking-tight text-slate-900">
                {stats.active}
              </span>
              <span className="text-[11px] text-emerald-700">
                Boosting visibility
              </span>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 px-4 py-3 shadow-sm/50 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Inactive
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            </div>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-2xl font-semibold tracking-tight text-slate-900">
                {stats.inactive}
              </span>
              <span className="text-[11px] text-slate-500">
                Ready to relaunch
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-white/60 border border-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-10 sm:px-10 sm:py-14 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500/10 via-sky-500/10 to-emerald-500/10">
              <Tag className="w-7 h-7 text-indigo-500" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">
              No campaigns yet
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Create your first campaign to launch time-limited discounts and smart pricing rules for your listings.
            </p>
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setEditingCampaign(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold tracking-tight text-white shadow-sm hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create your first campaign
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {campaigns.map((c) => {
              const hasListings = c.eligibleListingIds && c.eligibleListingIds.length > 0;
              const hasTypes = c.eligibleTypes && c.eligibleTypes.length > 0;

              return (
                <div
                  key={c.id}
                  className="rounded-3xl border border-slate-100 bg-white px-4 py-4 sm:px-5 sm:py-4 shadow-sm/50 shadow-[0_22px_60px_rgba(15,23,42,0.04)] hover:shadow-[0_24px_70px_rgba(15,23,42,0.07)] transition-shadow"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="truncate text-lg font-bold tracking-tight text-slate-900">
                              {c.name}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                c.active
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  c.active
                                    ? 'bg-emerald-500 animate-pulse shadow-[0_0_0_4px_rgba(16,185,129,0.35)]'
                                    : 'bg-slate-400'
                                }`}
                              />
                              {c.active ? 'Active' : 'Inactive'}
                            </span>
                            {c.applyToFutureListings && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">
                                <Clock className="w-3 h-3" />
                                Future listings
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                            Discount
                          </div>
                          <div className="mt-1 flex items-baseline gap-1.5">
                            <span className="text-2xl font-semibold tracking-tight text-indigo-600">
                              {c.discountKind === 'PERCENT' ? `${c.value}%` : `₺${c.value}`}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {c.discountKind === 'PERCENT' ? 'off' : 'per item'}
                            </span>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                            <CalendarDays className="w-3 h-3" />
                            <span>Period</span>
                          </div>
                          <div className="mt-1 text-xs text-slate-600">
                            {c.startsAt || c.endsAt
                              ? `${c.startsAt ? formatDateTime(c.startsAt) : 'Anytime'} → ${c.endsAt ? formatDateTime(c.endsAt) : 'Anytime'}`
                              : 'No time limit'}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                            {hasListings ? (
                              <Target className="w-3 h-3" />
                            ) : (
                              <Layers className="w-3 h-3" />
                            )}
                            <span>Scope</span>
                          </div>
                          <div className="mt-1 text-xs text-slate-600">
                            {hasListings
                              ? `${c.eligibleListingIds.length} listing${c.eligibleListingIds.length > 1 ? 's' : ''}`
                              : hasTypes
                                ? c.eligibleTypes.join(', ')
                                : 'All listings'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 md:flex-col md:items-end md:gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCampaign(c);
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCampaign(c.id)}
                        className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={load}
        editingCampaign={editingCampaign}
      />
    </div>
  );
};

export default MyCouponsPage;


