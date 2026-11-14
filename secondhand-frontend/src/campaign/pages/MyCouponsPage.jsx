import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Tag } from 'lucide-react';
import PageContainer from '@/common/components/layout/PageContainer';
import { campaignService } from '../../listing/services/campaignService.js';
import { listingService } from '../../listing/services/listingService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import Button from '../../common/components/ui/Button.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import CreateCampaignModal from '../components/CreateCampaignModal.jsx';
import CampaignCard from '../components/CampaignCard.jsx';
import { refreshCampaignAffectedQueries } from '../campaignQueries.js';

const PAGE_SIZE = 10;

const CardSkeleton = () => (
  <div className="space-y-3 rounded border border-border bg-background-primary p-5">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-5 w-48" />
    <Skeleton className="h-7 w-32" />
    <Skeleton className="h-20 w-full" />
  </div>
);

const MyCouponsPage = () => {
  const { t } = useTranslation();
  const { showError, showSuccess, showConfirmation } = useNotification();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [page, setPage] = useState(0);

  const { data: campaignsPage, isLoading, isError, refetch } = useQuery({
    queryKey: ['campaigns', 'my', page, PAGE_SIZE],
    queryFn: () => campaignService.listMine(page, PAGE_SIZE),
  });
  const campaigns = useMemo(() => campaignsPage?.content || [], [campaignsPage]);
  const totalPages = campaignsPage?.totalPages || 0;
  const totalElements = campaignsPage?.totalElements || 0;

  // Titles are looked up for the picked ids only; the seller's full listing list is paged and can miss them.
  const pickedIds = useMemo(
    () => [...new Set(campaigns.flatMap(c => c.eligibleListingIds || []))].sort(),
    [campaigns]
  );
  const { data: pickedListings = [] } = useQuery({
    queryKey: ['campaignPickedListings', pickedIds],
    queryFn: () => listingService.getListingsByIds(pickedIds),
    enabled: pickedIds.length > 0,
    staleTime: 2 * 60 * 1000,
  });
  const listingsById = useMemo(() => new Map((pickedListings || []).map(l => [l.id, l])), [pickedListings]);

  const deleteMutation = useMutation({
    mutationFn: (id) => campaignService.remove(id),
    onSuccess: () => {
      showSuccess(t('campaign_deleted_title', 'Kampanya silindi'), t('campaign_deleted_text', 'İndirim artık ilanlarına uygulanmıyor.'));
      refreshCampaignAffectedQueries(queryClient);
    },
    onError: (e) => showError(t('campaign_delete_failed', 'Silinemedi'), e?.response?.data?.message || t('campaign_delete_failed_text', 'Kampanya silinemedi. Lütfen tekrar dene.')),
  });

  const confirmDelete = (campaign) => {
    showConfirmation(
      t('campaign_delete_title', 'Kampanya silinsin mi?'),
      t('campaign_delete_text', { defaultValue: '"{{name}}" silinecek ve indirim hemen kalkacak.', name: campaign.name }),
      () => deleteMutation.mutate(campaign.id),
      { confirmLabel: t('campaign_delete', 'Sil'), cancelLabel: t('cancel', 'Vazgeç') }
    );
  };

  const openCreate = () => { setEditingCampaign(null); setIsModalOpen(true); };
  const openEdit = (campaign) => { setEditingCampaign(campaign); setIsModalOpen(true); };

  let content;
  if (isLoading) {
    content = (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  } else if (isError) {
    content = (
      <Alert
        type="error"
        message={t('campaign_load_error', 'Kampanyalar yüklenemedi.')}
        action={<Button variant="secondary" size="sm" onClick={() => refetch()}>{t('try_again', 'Tekrar dene')}</Button>}
      />
    );
  } else if (campaigns.length === 0) {
    content = (
      <EmptyState
        icon={Tag}
        title={t('campaign_empty_title', 'Henüz kampanyan yok')}
        description={t('campaign_empty_text', 'Tüm ilanlarına, bir kategoriye ya da seçtiğin ilanlara indirim tanımlayabilirsin.')}
        primaryAction={{ label: t('campaign_new', 'Yeni kampanya'), onClick: openCreate }}
      />
    );
  } else {
    content = (
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        {campaigns.map(campaign => (
          <CampaignCard key={campaign.id} campaign={campaign} listingsById={listingsById} onEdit={openEdit} onDelete={confirmDelete} />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      <PageContainer className="space-y-6 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{t('campaign_page_title', 'Kampanyalar')}</h1>
            <p className="mt-1 text-sm text-text-secondary">
              {totalElements > 0
                ? t('campaign_page_count', { defaultValue: '{{count}} kampanya', count: totalElements })
                : t('campaign_page_subtitle', 'İlanlarına indirim tanımla.')}
            </p>
          </div>
          {campaigns.length > 0 && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              {t('campaign_new', 'Yeni kampanya')}
            </Button>
          )}
        </div>

        {content}

        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination page={page} totalPages={totalPages} onPageChange={p => setPage(Math.max(0, Math.min(p, totalPages - 1)))} />
          </div>
        )}
      </PageContainer>

      <CreateCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingCampaign={editingCampaign}
      />
    </div>
  );
};

export default MyCouponsPage;
