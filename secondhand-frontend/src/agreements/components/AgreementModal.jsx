import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Loader2 } from 'lucide-react';
import { agreementLabel } from '../agreements.js';
import { formatDate } from '../../common/formatters.js';
import { Button, Modal } from '../../common/components/ui/index.js';
import { sanitizeHtml } from '../../common/utils/sanitizeHtml.js';

const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;

const parsePlainAgreementBlocks = (rawContent) => {
  if (!rawContent) return [];
  const normalized = String(rawContent)
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\?s\b/g, '’s')
    .replace(/(\d)\?(\d)/g, '$1–$2')
    .trim();

  if (!normalized) return [];

  const paragraphs = normalized.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const blocks = [];

  paragraphs.forEach((chunk) => {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    const listItems = [];
    const textLines = [];

    lines.forEach((line) => {
      const numberedMatch = line.match(/^(\d+)[.)]\s+(.*)$/);
      if (numberedMatch) {
        listItems.push({ index: numberedMatch[1], text: numberedMatch[2] });
      } else {
        textLines.push(line);
      }
    });

    if (textLines.length > 0) {
      const joined = textLines.join(' ');
      const isHeading = textLines.length === 1 && joined.length <= 80 && joined.endsWith(':');
      blocks.push({
        type: isHeading ? 'heading' : 'paragraph',
        text: isHeading ? joined.slice(0, -1) : joined,
      });
    }

    if (listItems.length > 0) {
      blocks.push({
        type: 'list',
        items: listItems,
      });
    }
  });

  return blocks;
};

const AgreementModal = ({
  agreement,
  open,
  onClose,
  onAccept,
  accepting = false,
  isAccepted = false,
  // Reading only (footer for guests): no accept action and no acceptance hint.
  readOnly = false,
}) => {
  const { t } = useTranslation();

  const content = agreement?.content || '';
  const isHtmlContent = useMemo(() => HTML_TAG_PATTERN.test(content), [content]);
  const safeHtml = useMemo(() => (isHtmlContent ? sanitizeHtml(content) : ''), [content, isHtmlContent]);
  const plainBlocks = useMemo(
    () => (isHtmlContent ? [] : parsePlainAgreementBlocks(content)),
    [content, isHtmlContent]
  );

  if (!agreement) return null;

  const title = agreementLabel(t, agreement.agreementType);
  const updatedLabel = formatDate(agreement.updatedDate || agreement.createdDate);

  const handleAcceptClick = async () => {
    if (onAccept) {
      await onAccept(agreement);
    } else {
      onClose?.();
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <div className={`flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center ${readOnly ? 'sm:justify-end' : 'sm:justify-between'}`}>
          {!readOnly && (
            <p className="inline-flex items-center gap-2 text-sm text-text-tertiary">
              {isAccepted && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-status-success" aria-hidden />
              )}
              <span>
                {isAccepted
                  ? t('agreement_already_accepted', 'Bu sözleşmeyi onayladınız.')
                  : t('please_read_carefully_before_accepting', 'Onaylamadan önce metni dikkatle okuyun.')}
              </span>
            </p>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              {t('close', 'Kapat')}
            </Button>
            {!readOnly && !isAccepted && (
              <Button onClick={handleAcceptClick} disabled={Boolean(accepting)}>
                {accepting ? (
                  <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" strokeWidth={1.5} aria-hidden />
                ) : (
                  <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                )}
                <span>
                  {accepting
                    ? t('accepting', 'Onaylanıyor...')
                    : t('i_accept', 'Okudum, onaylıyorum')}
                </span>
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div>
        {(agreement.version || updatedLabel) && (
          <div className="mb-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-b border-border-light pb-3 text-sm tabular-nums text-text-tertiary">
            {agreement.version && <span>v{agreement.version}</span>}
            {agreement.version && updatedLabel && <span aria-hidden>·</span>}
            {updatedLabel && (
              <span>
                {t('updated', 'Güncelleme')}: {updatedLabel}
              </span>
            )}
          </div>
        )}

        {isHtmlContent ? (
          <div
            className="legal-prose max-w-prose text-base leading-relaxed text-text-secondary"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        ) : (
          <div className="max-w-prose space-y-4 text-base leading-relaxed text-text-secondary">
            {plainBlocks.map((block, idx) => {
              if (block.type === 'heading') {
                return (
                  <h3 key={idx} className="pt-2 text-base font-semibold text-text-primary first:pt-0">
                    {block.text}
                  </h3>
                );
              }
              if (block.type === 'list') {
                return (
                  <ol key={idx} className="space-y-2.5 pl-0">
                    {block.items.map((item) => (
                      <li key={item.index} className="flex items-start gap-3 text-base">
                        <span className="mt-0.5 min-w-5 shrink-0 text-sm font-medium tabular-nums text-text-tertiary">
                          {item.index}.
                        </span>
                        <span className="flex-1 text-text-secondary">{item.text}</span>
                      </li>
                    ))}
                  </ol>
                );
              }
              return (
                <p key={idx} className="text-base text-text-secondary">
                  {block.text}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AgreementModal;
