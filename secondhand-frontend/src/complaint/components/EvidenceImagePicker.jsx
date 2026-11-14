import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { ImagePlus, X } from 'lucide-react';
import { uploadEvidenceImage } from '../services/complaintService.js';
import { COMPLAINT_DEFAULTS, COMPLAINT_MESSAGES } from '../complaintConstants.js';
import { getComplaintErrorMessage } from '../utils/complaintError.js';

/** Up to MAX_EVIDENCE_IMAGES screenshots, uploaded right away; the parent keeps the URL list. */
const EvidenceImagePicker = ({ urls, onChange, disabled }) => {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [error, setError] = useState(null);
  const upload = useMutation({ mutationFn: uploadEvidenceImage });
  const remaining = COMPLAINT_DEFAULTS.MAX_EVIDENCE_IMAGES - urls.length;

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError(COMPLAINT_MESSAGES.UPLOAD_NOT_IMAGE);
      return;
    }
    if (file.size > COMPLAINT_DEFAULTS.MAX_EVIDENCE_FILE_BYTES) {
      setError(COMPLAINT_MESSAGES.UPLOAD_TOO_LARGE);
      return;
    }
    try {
      const url = await upload.mutateAsync(file);
      onChange([...urls, url]);
    } catch (err) {
      setError(getComplaintErrorMessage(err, COMPLAINT_MESSAGES.UPLOAD_FAILED_FALLBACK));
    }
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">{t('complaint_evidence_images', 'Evidence images (optional)')}</span>
        <span className="text-xs tabular-nums text-text-tertiary">
          {urls.length}/{COMPLAINT_DEFAULTS.MAX_EVIDENCE_IMAGES}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {urls.map((url) => (
          <div key={url} className="relative h-16 w-16 overflow-hidden rounded border border-border">
            <img src={url} alt={t('complaint_evidence_image', 'Evidence image')} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(urls.filter((u) => u !== url))}
              disabled={disabled}
              className="absolute right-0.5 top-0.5 rounded-full bg-background-primary p-0.5 text-text-secondary transition-colors duration-150 hover:text-text-primary"
              aria-label={t('remove_image', 'Remove image')}
            >
              <X className="h-3 w-3" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        ))}
        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || upload.isPending}
            className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded border border-dashed border-border text-xs text-text-tertiary transition-colors duration-150 hover:text-text-primary disabled:opacity-50"
          >
            <ImagePlus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            {upload.isPending ? t('uploading', 'Uploading') : t('add', 'Add')}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {error ? (
        <p className="mt-1 text-xs text-status-error-text">{error}</p>
      ) : (
        <p className="mt-1 text-xs text-text-tertiary">
          {t('complaint_evidence_hint', 'Screenshots help Aura review your complaint.')}
        </p>
      )}
    </div>
  );
};

export default EvidenceImagePicker;
