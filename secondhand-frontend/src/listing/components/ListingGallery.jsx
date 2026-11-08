import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Expand, Package } from 'lucide-react';
import Modal from '../../common/components/ui/Modal.jsx';
import { optimizeCloudinaryUrl } from '../../common/utils/imageOptimizer.js';

const SWIPE_THRESHOLD_PX = 40;

const NAV_BUTTON =
  'absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded border border-border bg-background-primary text-text-primary transition-opacity duration-150 hover:bg-background-secondary focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus';

// Listing photo gallery: main image with swipe/arrow navigation, thumbnail strip and a full-size viewer.
// Render it with `key={listing.id}` so the selected photo resets when the listing changes.
const ListingGallery = ({ images, title }) => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const touchStartX = useRef(null);
  const count = images.length;
  const current = images[index];

  useEffect(() => {
    setFailed(false);
  }, [current]);

  const showPrevious = useCallback(() => setIndex(i => (i === 0 ? Math.max(count - 1, 0) : i - 1)), [count]);
  const showNext = useCallback(() => setIndex(i => (i + 1 >= count ? 0 : i + 1)), [count]);

  useEffect(() => {
    if (count < 2) return undefined;
    const handler = e => {
      if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
      if (e.target.closest?.('[role="dialog"]') && !isViewerOpen) return;
      if (e.key === 'ArrowLeft') showPrevious();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [count, isViewerOpen, showPrevious, showNext]);

  const onTouchStart = e => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = e => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    if (delta > 0) showPrevious();
    else showNext();
  };

  const hasImage = current && !failed;
  const counter = `${index + 1} / ${count}`;

  return (
    <div className="space-y-3">
      <div
        className="group relative -mx-4 aspect-4/3 overflow-hidden border-y border-border bg-background-tertiary sm:mx-0 sm:rounded sm:border"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {hasImage ? (
          <button
            type="button"
            onClick={() => setIsViewerOpen(true)}
            className="block h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus"
            aria-label={t('open_full_size_photo', 'Fotoğrafı büyüt')}
          >
            <img
              key={current}
              src={optimizeCloudinaryUrl(current, { width: 1400 })}
              onError={() => setFailed(true)}
              alt={`${title} - ${index + 1}`}
              className="h-full w-full object-contain"
              fetchPriority={index === 0 ? 'high' : 'auto'}
              decoding="async"
              loading="eager"
            />
          </button>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <Package className="mb-3 h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
            <p className="text-sm font-medium text-text-secondary">{t('no_image_available', 'Fotoğraf bulunmuyor')}</p>
            <p className="mt-1 text-sm text-text-tertiary">{t('seller_no_upload', 'Satıcı bu ilan için görsel eklemedi.')}</p>
          </div>
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              className={`${NAV_BUTTON} left-3 sm:opacity-0 sm:group-hover:opacity-100`}
              aria-label={t('previous', 'Önceki')}
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </button>
            <button
              type="button"
              onClick={showNext}
              className={`${NAV_BUTTON} right-3 sm:opacity-0 sm:group-hover:opacity-100`}
              aria-label={t('next', 'Sonraki')}
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </button>
          </>
        )}

        {hasImage && (
          <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-sm border border-border bg-background-primary px-2 py-1 text-xs font-medium tabular-nums text-text-primary">
            <Expand className="h-3.5 w-3.5 text-text-tertiary" strokeWidth={1.5} aria-hidden />
            {count > 1 ? counter : t('enlarge', 'Büyüt')}
          </div>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, idx) => (
            <button
              type="button"
              key={url}
              onClick={() => setIndex(idx)}
              className={`h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded border bg-background-tertiary transition-colors duration-150 ${
                idx === index ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-card-border-hover opacity-75 hover:opacity-100'
              }`}
              aria-label={t('photo_n', { defaultValue: 'Fotoğraf {{n}}', n: idx + 1 })}
              aria-current={idx === index ? 'true' : undefined}
            >
              <img src={optimizeCloudinaryUrl(url, { width: 160 })} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <Modal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        title={title}
        description={count > 1 ? counter : undefined}
        size="2xl"
      >
        <div className="relative flex items-center justify-center" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {current && (
            <img
              src={optimizeCloudinaryUrl(current, { width: 2000 })}
              alt={`${title} - ${index + 1}`}
              className="max-h-[75vh] w-full object-contain"
            />
          )}
          {count > 1 && (
            <>
              <button type="button" onClick={showPrevious} className={`${NAV_BUTTON} left-0`} aria-label={t('previous', 'Önceki')}>
                <ChevronLeft className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </button>
              <button type="button" onClick={showNext} className={`${NAV_BUTTON} right-0`} aria-label={t('next', 'Sonraki')}>
                <ChevronRight className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ListingGallery;
