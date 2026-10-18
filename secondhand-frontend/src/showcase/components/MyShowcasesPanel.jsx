import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  X,
  Sparkles,
  Image as ImageIcon,
  RotateCcw,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../common/formatters.js';
import { useMyShowcases } from '../hooks/useMyShowcases.js';
import ShowcaseModal from './ShowcaseModal.jsx';
import { Button, Modal, SkeletonGrid, EmptyState } from '../../common/components/ui/index.js';
import { useState, useMemo } from 'react';

const calculateRemainingDays = (endDate) => {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const MyShowcasesPanel = ({ userId }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');
  const [extendDays, setExtendDays] = useState({});
  const [localError, setLocalError] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [activeExtendShowcase, setActiveExtendShowcase] = useState(null);

  const {
    showcases,
    isLoading,
    error,
    cancelShowcase,
    isMutating,
    cancelError,
    refresh,
  } = useMyShowcases(userId);

  const actionError = localError || cancelError || error;

  const handleExtend = (showcaseId) => {
    const raw = extendDays[showcaseId];
    const parsed = Number.parseInt(raw, 10);
    const days = Number.isFinite(parsed) ? Math.min(30, Math.max(1, parsed)) : 7;
    const showcase = showcases.find((s) => s.id === showcaseId);
    if (showcase) {
      setActiveExtendShowcase({
        id: showcaseId,
        listingId: showcase.listing?.id,
        listingTitle: showcase.listing?.title || '',
        days,
      });
    }
  };

  const handleCancel = async () => {
    if (!confirmCancelId) return;
    try {
      setLocalError(null);
      await cancelShowcase(confirmCancelId);
      setConfirmCancelId(null);
    } catch (err) {
      setLocalError(err?.response?.data?.message || err?.message || 'Cancel failed');
      setConfirmCancelId(null);
    }
  };

  const processedShowcases = useMemo(() => {
    const now = new Date();
    const items = showcases.map((item) => {
      const remaining = calculateRemainingDays(item.endDate);
      const isExpired = new Date(item.endDate) < now || remaining === 0;
      return { ...item, remaining, isExpired };
    });

    return items.sort((a, b) => {
      if (a.isExpired && !b.isExpired) return 1;
      if (!a.isExpired && b.isExpired) return -1;
      if (!a.isExpired && !b.isExpired) return a.remaining - b.remaining;
      return new Date(b.endDate) - new Date(a.endDate);
    });
  }, [showcases]);

  const filteredShowcases = useMemo(() => {
    if (activeTab === 'active') return processedShowcases.filter((s) => !s.isExpired);
    if (activeTab === 'expired') return processedShowcases.filter((s) => s.isExpired);
    return processedShowcases;
  }, [processedShowcases, activeTab]);

  const counts = useMemo(() => {
    const active = processedShowcases.filter((s) => !s.isExpired).length;
    const expired = processedShowcases.filter((s) => s.isExpired).length;
    return { all: processedShowcases.length, active, expired };
  }, [processedShowcases]);

  const tabs = [
    { id: 'all', label: t('all', 'Tümü'), count: counts.all },
    { id: 'active', label: t('active', 'Aktif'), count: counts.active },
    { id: 'expired', label: t('expired', 'Süresi Dolan'), count: counts.expired },
  ];

  return (
    <section className="rounded border border-border-light bg-background-primary p-5 sm:p-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-border-light">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-text-primary tracking-tight">
              {t('my_showcases', 'Vitrin İlanlarım')}
            </h2>
            <span className="rounded-sm border border-border bg-background-secondary px-1.5 py-0.5 text-xs font-semibold tabular-nums text-text-primary">
              {counts.active} {t('active', 'aktif')}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-text-tertiary">
            {t(
              'manage_and_track_your_active_listing_pro',
              'Öne çıkarılan vitrin ilanlarınızı yönetin ve kalan süreleri takip edin.'
            )}
          </p>
        </div>

        {/* ─── Tabs ─── */}
        <div className="flex items-center gap-1 rounded bg-background-secondary p-1 border border-border-light">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-background-primary text-text-primary shadow-sm font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-sm px-1.5 py-0.2 text-xs tabular-nums ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-background-tertiary text-text-tertiary'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Error Alert ─── */}
      {actionError && (
        <div className="mt-4 flex items-start gap-2.5 rounded border border-status-error/30 bg-background-secondary p-3 text-xs text-status-error-text">
          <AlertTriangle className="h-4 w-4 shrink-0 text-status-error mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">{t('operation_error', 'İşlem Hatası')}</span>
            <p className="mt-0.5">{actionError}</p>
          </div>
        </div>
      )}

      {/* ─── Content ─── */}
      <div className="mt-5">
        {isLoading ? (
          <SkeletonGrid count={2} columns="grid-cols-1 md:grid-cols-2 gap-4" />
        ) : filteredShowcases.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title={t('no_showcases_found', 'Vitrin ilanı bulunamadı')}
            description={
              activeTab === 'expired'
                ? t('no_expired_showcases', 'Süresi dolmuş vitrin ilanınız bulunmuyor.')
                : activeTab === 'active'
                ? t('no_active_showcases', 'Şu anda yayında olan vitrin ilanınız yok. İlanlarınızı vitrine taşıyarak daha hızlı satış yapabilirsiniz.')
                : t('no_showcases_desc', 'İlanlarınızı vitrine taşıyarak ana sayfa ve arama sonuçlarında en üst sıralarda gösterin.')
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredShowcases.map((showcase) => {
              const thumbUrl = showcase.listing?.imageUrl;
              const title = showcase.listing?.title || t('promoted_listing', 'Öne Çıkarılan İlan');

              return (
                <div
                  key={showcase.id}
                  className={`flex flex-col justify-between rounded border transition-colors ${
                    showcase.isExpired
                      ? 'border-border-light bg-background-secondary/30'
                      : 'border-border-light bg-background-primary hover:border-border-strong'
                  } p-4`}
                >
                  {/* Top: Image + Info */}
                  <div>
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded border border-border-light bg-background-secondary">
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt=""
                            className={`h-full w-full object-cover ${
                              showcase.isExpired ? 'grayscale opacity-60' : ''
                            }`}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-text-muted">
                            <ImageIcon className="h-5 w-5 opacity-40" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-text-primary" title={title}>
                          {title}
                        </h3>

                        {/* Status dot + text */}
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                          {showcase.isExpired ? (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-text-muted" aria-hidden />
                              <span className="text-text-muted">{t('expired', 'Süresi doldu')}</span>
                            </>
                          ) : showcase.remaining <= 3 ? (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-status-warning" aria-hidden />
                              <span className="font-medium tabular-nums text-status-warning-text">
                                {showcase.remaining} {t('days_left', 'gün kaldı (Yakında Bitiyor)')}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-status-success" aria-hidden />
                              <span className="font-medium tabular-nums text-text-secondary">
                                {showcase.remaining} {t('days_left', 'gün kaldı')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metrics Strip */}
                    <div className="mt-3.5 grid grid-cols-2 gap-2 border-y border-border-light/60 py-2.5 text-xs">
                      <div>
                        <span className="text-text-tertiary block">{t('spent_cost', 'Harcanan')}</span>
                        <span className="mt-0.5 font-medium tabular-nums text-text-primary block">
                          {formatCurrency(showcase.totalCost, 'TRY')}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-tertiary block">{t('ended_on', 'Bitiş Tarihi')}</span>
                        <span className="mt-0.5 font-medium tabular-nums text-text-secondary block">
                          {formatDate(showcase.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Action Controls */}
                  <div className="mt-3.5 flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={extendDays[showcase.id] ?? 7}
                        onChange={(e) =>
                          setExtendDays((prev) => ({ ...prev, [showcase.id]: e.target.value }))
                        }
                        className="h-8 w-14 rounded border border-border bg-background-primary px-1.5 text-center text-xs font-medium tabular-nums text-text-primary focus:border-border-focus focus:outline-none"
                      />
                      <span>{t('days', 'gün')}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleExtend(showcase.id)}
                        disabled={isMutating}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <RotateCcw className="h-3 w-3" strokeWidth={1.5} />
                        <span>
                          {showcase.isExpired
                            ? t('re_boost', 'Yeniden Öne Çıkar')
                            : t('extend', 'Süreyi Uzat')}
                        </span>
                      </Button>

                      {!showcase.isExpired && (
                        <button
                          type="button"
                          onClick={() => setConfirmCancelId(showcase.id)}
                          disabled={isMutating}
                          className="flex h-8 w-8 items-center justify-center rounded border border-border-light text-text-tertiary transition-colors hover:border-border hover:bg-background-secondary hover:text-status-error cursor-pointer"
                          title={t('cancel_showcase', 'Vitrini İptal Et')}
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={Boolean(confirmCancelId)}
        onClose={() => setConfirmCancelId(null)}
        title={t('cancel_boosting', 'Vitrini İptal Et')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmCancelId(null)}>
              {t('give_up', 'Vazgeç')}
            </Button>
            <Button variant="danger" onClick={handleCancel}>
              {t('yes_cancel', 'Evet, İptal Et')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          {t(
            'are_you_sure_you_want_to_stop_boosting_t',
            'Bu ilanın vitrin öne çıkarmasını durdurmak istediğinize emin misiniz?'
          )}
        </p>
      </Modal>

      {/* Extend Showcase Modal */}
      {activeExtendShowcase && (
        <ShowcaseModal
          isOpen={Boolean(activeExtendShowcase)}
          onClose={() => setActiveExtendShowcase(null)}
          listingId={activeExtendShowcase.listingId}
          listingTitle={activeExtendShowcase.listingTitle}
          isExtension={true}
          showcaseId={activeExtendShowcase.id}
          initialDays={activeExtendShowcase.days}
          onSuccess={() => {
            setActiveExtendShowcase(null);
            refresh();
          }}
        />
      )}
    </section>
  );
};

export default MyShowcasesPanel;