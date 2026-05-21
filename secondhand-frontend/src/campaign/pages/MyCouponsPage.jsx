import React, {useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {ROUTES} from '../../common/constants/routes.js';
import {campaignService} from '../../listing/services/campaignService.js';
import {listingService} from '../../listing/services/listingService.js';
import {useNotification} from '../../notification/NotificationContext.jsx';
import CreateCampaignModal from '../components/CreateCampaignModal.jsx';
import {formatDateTime} from '../../common/formatters.js';
import {ArrowLeft, CalendarDays, Clock, Edit2, Layers, Plus, RefreshCw, Search, Tag, Target, Trash2} from 'lucide-react';
import Pagination from '../../common/components/ui/Pagination.jsx';

const MyCouponsPage = () => {
  const { showError, showSuccess } = useNotification();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [listingTitleById, setListingTitleById] = useState({});
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const size = 5;

  const load = async (nextPage = page) => {
    setIsLoading(true);
    try {
      const res = await campaignService.listMine(nextPage, size);
      const items = Array.isArray(res) ? res : (Array.isArray(res?.content) ? res.content : []);
      setCampaigns(items);
      setPage(Number.isFinite(res?.number) ? res.number : nextPage);
      setTotalPages(Number.isFinite(res?.totalPages) ? res.totalPages : 0);
      setTotalElements(Number.isFinite(res?.totalElements) ? res.totalElements : items.length);
    } catch (e) {
      setCampaigns([]);
      showError('Campaigns', e?.response?.data?.message || 'Failed to load campaigns');
      setTotalPages(0);
      setTotalElements(0);
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
      await load(page);
    } catch (e) {
      showError('Delete failed', e?.response?.data?.message || 'Failed to delete campaign');
    }
  };

  const stats = useMemo(() => {
    const active = campaigns.filter(c => c.active).length;
    const inactive = campaigns.filter(c => !c.active).length;
    return {
      total: totalElements,
      active,
      inactive
    };
  }, [campaigns, totalElements]);

  const filteredCampaigns = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      const statusMatch =
          statusFilter === 'ALL' ||
          (statusFilter === 'ACTIVE' && campaign.active) ||
          (statusFilter === 'INACTIVE' && !campaign.active);

      if (!statusMatch) {
        return false;
      }

      if (!q) {
        return true;
      }

      const typeText = Array.isArray(campaign.eligibleTypes) ? campaign.eligibleTypes.join(' ') : '';
      return [
        campaign.name,
        campaign.discountKind,
        String(campaign.value ?? ''),
        typeText,
      ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q);
    });
  }, [campaigns, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-[120px]" />
        <div className="absolute top-[20%] -left-[10%] w-[30%] h-[30%] rounded-full bg-blue-50/50 blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500">
              <Link to={ROUTES.DASHBOARD} className="p-1.5 hover:bg-white rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <span className="text-[10px] font-bold tracking-wider uppercase opacity-70">Selling Tools</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Campaigns & <span className="text-indigo-600">Promotions</span>
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingCampaign(null);
              setIsModalOpen(true);
            }}
            className="group inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold transition-all hover:bg-black active:scale-95 shadow-lg shadow-slate-900/10"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" strokeWidth={3} />
            New Campaign
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active', value: stats.active, icon: Target, color: 'indigo' },
            { label: 'Inactive', value: stats.inactive, icon: Clock, color: 'slate' },
            { label: 'Total', value: stats.total, icon: Layers, color: 'blue' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className="text-xl font-black text-slate-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filters & Actions */}
        <div className="mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
            {['ALL', 'ACTIVE', 'INACTIVE'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === status 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-medium focus:outline-none focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        {/* Content List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-48 rounded-2xl bg-white border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-100">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-6 h-6 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No campaigns</h3>
            <p className="text-slate-500 text-sm mb-6">Adjust your filters to see more results.</p>
            <button onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }} className="text-xs text-indigo-600 font-bold hover:underline">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCampaigns.map((c) => {
              const isBundle = c.minQuantity > 1;
              const hasListings = c.eligibleListingIds?.length > 0;
              
              return (
                <div key={c.id} className="group bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 ${c.active ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {isBundle ? (
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-wider border border-indigo-100">
                            Bundle
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-wider border border-slate-100">
                            Standard
                          </span>
                        )}
                        {!c.active && (
                          <span className="px-1.5 py-0.5 rounded-lg bg-red-50 text-red-600 text-[9px] font-bold">Paused</span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {c.name}
                      </h3>
                    </div>
                    
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingCampaign(c); setIsModalOpen(true); }}
                        className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => deleteCampaign(c.id)}
                        className="p-1.5 rounded-lg border border-red-50 hover:bg-red-50 text-red-300 hover:text-red-600 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Benefit</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-indigo-600">
                          {c.discountKind === 'PERCENT' ? `${c.value}%` : formatCurrency(c.value, 'TRY')}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">OFF</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Requirement</span>
                      <div className="text-xs font-bold text-slate-900">
                        {isBundle ? `${c.minQuantity}+ Items` : 'None'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>{c.endsAt ? formatDateTime(c.endsAt) : 'No expiry'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                      <Target className="w-3.5 h-3.5" />
                      <span>{hasListings ? `${c.eligibleListingIds.length} items` : 'Global'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm scale-90">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(p) => {
                  const next = Math.max(0, Math.min(p, Math.max(0, totalPages - 1)));
                  setPage(next);
                  load(next);
                }}
              />
            </div>
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


