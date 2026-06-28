import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '../../common/constants/routes.js';
import { campaignService } from '../../listing/services/campaignService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import CreateCampaignModal from '../components/CreateCampaignModal.jsx';
import { formatDateTime, formatCurrency } from '../../common/formatters.js';
import { ArrowLeft, CalendarDays, Clock, Edit2, Layers, Plus, Search, Tag, Target, Trash2 } from 'lucide-react';
import Pagination from '../../common/components/ui/Pagination.jsx';
import { SkeletonList } from '@/common/components/ui/Skeleton';

const MyCouponsPage = () => {
  const {
    t
  } = useTranslation();
  const {
    showError,
    showSuccess
  } = useNotification();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const size = 5;

  // 1. Fetch campaigns using React Query
  const {
    data: campaignsPage,
    isLoading,
  } = useQuery({
    queryKey: ['campaigns', 'my', page, size],
    queryFn: () => campaignService.listMine(page, size),
  });

  const campaigns = useMemo(() => campaignsPage?.content || [], [campaignsPage]);
  const totalPages = campaignsPage?.totalPages || 0;
  const totalElements = campaignsPage?.totalElements || 0;



  // 3. Delete mutation using React Query
  const deleteCampaignMutation = useMutation({
    mutationFn: (id) => campaignService.remove(id),
    onSuccess: () => {
      showSuccess('Deleted', 'Campaign deleted.');
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (e) => {
      showError('Delete failed', e?.response?.data?.message || 'Failed to delete campaign');
    }
  });

  const deleteCampaign = (id) => {
    deleteCampaignMutation.mutate(id);
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
    return campaigns.filter(campaign => {
      const statusMatch = statusFilter === 'ALL' || statusFilter === 'ACTIVE' && campaign.active || statusFilter === 'INACTIVE' && !campaign.active;
      if (!statusMatch) {
        return false;
      }
      if (!q) {
        return true;
      }
      const typeText = Array.isArray(campaign.eligibleTypes) ? campaign.eligibleTypes.join(' ') : '';
      return [campaign.name, campaign.discountKind, String(campaign.value ?? ''), typeText].filter(Boolean).join(' ').toLowerCase().includes(q);
    });
  }, [campaigns, searchTerm, statusFilter]);

  const statStyles = {
    indigo: 'bg-primary-light text-primary',
    slate: 'bg-background-tertiary text-text-secondary',
    blue: 'bg-primary-light text-primary'
  };

  return <div className="min-h-screen bg-background-secondary">
      <PageContainer className="relative py-6">
        {/* Header Section */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-text-muted">
              <Link to={ROUTES.DASHBOARD} className="p-1.5 hover:bg-background-primary rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <span className="text-caption font-bold tracking-wider uppercase opacity-70">{t("selling_tools")}</span>
            </div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{t("campaigns")}<span className="text-primary">{t("promotions")}</span>
            </h1>
          </div>

          <button type="button" onClick={() => {
          setEditingCampaign(null);
          setIsModalOpen(true);
        }} className="group inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold transition-all hover:bg-primary-hover active:scale-95 shadow-sm">
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" strokeWidth={3} />{t("new_campaign")}</button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[{
          label: 'Active',
          value: stats.active,
          icon: Target,
          color: 'indigo'
        }, {
          label: 'Inactive',
          value: stats.inactive,
          icon: Clock,
          color: 'slate'
        }, {
          label: 'Total',
          value: stats.total,
          icon: Layers,
          color: 'blue'
        }].map((stat) => <div key={`stat-${stat.label}`} className="bg-background-primary rounded-2xl p-4 border border-border-light shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statStyles[stat.color] || 'bg-background-secondary text-text-secondary'}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <span className="text-caption font-bold text-text-muted uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className="text-xl font-bold text-text-primary">{stat.value}</div>
            </div>)}
        </div>

        {/* Filters & Actions */}
        <div className="mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-1.5 bg-background-primary p-1 rounded-xl border border-border-light">
            {['ALL', 'ACTIVE', 'INACTIVE'].map(status => <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === status ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>)}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t("search")} className="w-full bg-background-primary border border-border-light rounded-xl py-2 pl-9 pr-3 text-xs font-medium focus:outline-none focus:border-primary transition-all text-text-primary placeholder:text-text-muted" />
          </div>
        </div>

        {/* Content List */}
        {isLoading ? <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonList key={`campaign-skeleton-${i}`} />)}
          </div> : filteredCampaigns.length === 0 ? <div className="bg-background-primary rounded-2xl p-12 text-center border-2 border-dashed border-border-light">
            <div className="w-12 h-12 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-6 h-6 text-text-muted" />
            </div>
            <h3 className="text-sm font-medium text-text-primary mb-1">{t("no_campaigns")}</h3>
            <p className="text-text-secondary text-sm mb-6">{t("adjust_your_filters_to_see_more_results")}</p>
            <button onClick={() => {
          setSearchTerm('');
          setStatusFilter('ALL');
        }} className="text-xs text-primary font-bold hover:text-primary-hover">{t("clear_all_filters")}</button>
          </div> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCampaigns.map(c => {
          const isBundle = c.minQuantity > 1;
          const hasListings = c.eligibleListingIds?.length > 0;
          return <div key={c.id} className="group bg-background-primary rounded-2xl border border-border-light p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 ${c.active ? 'bg-primary' : 'bg-border-light'}`} />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {isBundle ? <span className="px-2 py-0.5 rounded-lg bg-primary-light text-primary text-[9px] font-bold uppercase tracking-wider border border-primary/20">{t("bundle")}</span> : <span className="px-2 py-0.5 rounded-lg bg-background-secondary text-text-secondary text-[9px] font-bold uppercase tracking-wider border border-border-light">{t("standard")}</span>}
                        {!c.active && <span className="px-1.5 py-0.5 rounded-lg bg-status-error-bg text-status-error text-[9px] font-bold">{t("paused")}</span>}
                      </div>
                      <h3 className="text-sm font-medium text-text-primary truncate">
                        {c.name}
                      </h3>
                    </div>
                    
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => {
                  setEditingCampaign(c);
                  setIsModalOpen(true);
                }} className="p-1.5 rounded-lg border border-border-light hover:bg-background-secondary text-text-muted hover:text-text-primary transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteCampaign(c.id)} className="p-1.5 rounded-lg border border-border-light hover:bg-status-error-bg text-status-error hover:text-status-error-text transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-background-secondary rounded-xl p-3">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-0.5">{t("benefit")}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-primary">
                          {c.discountKind === 'PERCENT' ? `${c.value}%` : formatCurrency(c.value, 'TRY')}
                        </span>
                        <span className="text-[9px] font-bold text-text-muted uppercase">{t("off")}</span>
                      </div>
                    </div>
                    <div className="bg-background-secondary rounded-xl p-3">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-0.5">{t("requirement")}</span>
                      <div className="text-xs font-bold text-text-primary">
                        {isBundle ? `${c.minQuantity}+ Items` : 'None'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <div className="flex items-center gap-2 text-caption text-text-secondary font-medium">
                      <CalendarDays className="w-3.5 h-3.5 text-text-muted" />
                      <span>{c.endsAt ? formatDateTime(c.endsAt) : 'No expiry'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-caption text-text-secondary font-medium">
                      <Target className="w-3.5 h-3.5 text-text-muted" />
                      <span>{hasListings ? `${c.eligibleListingIds.length} items` : 'Global'}</span>
                    </div>
                  </div>
                </div>;
        })}
          </div>}

        {totalPages > 1 && <div className="mt-8 flex justify-center">
            <div className="bg-background-primary px-4 py-2 rounded-2xl border border-border-light shadow-sm scale-90">
              <Pagination page={page} totalPages={totalPages} onPageChange={p => {
            const next = Math.max(0, Math.min(p, Math.max(0, totalPages - 1)));
            setPage(next);
          }} />
            </div>
          </div>}
      </PageContainer>

      <CreateCampaignModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['campaigns'] })} editingCampaign={editingCampaign} />
    </div>;
};

export default MyCouponsPage;