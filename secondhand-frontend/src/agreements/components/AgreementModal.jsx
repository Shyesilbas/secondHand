import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Clock as ClockIcon, FileText } from 'lucide-react';
import { AGREEMENT_TYPE_LABELS } from '../agreements.js';
import { formatDate } from '../../common/formatters.js';
import { Button, Modal } from '../../common/components/ui/index.js';

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
}) => {
  const { t } = useTranslation();

  const content = agreement?.content || '';
  const isHtmlContent = useMemo(() => HTML_TAG_PATTERN.test(content), [content]);
  const plainBlocks = useMemo(
    () => (isHtmlContent ? [] : parsePlainAgreementBlocks(content)),
    [content, isHtmlContent]
  );

  if (!agreement) return null;

  const title = AGREEMENT_TYPE_LABELS[agreement.agreementType] || agreement.agreementType;
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
        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-tertiary">
            {isAccepted
              ? t('agreement_already_accepted', 'Bu sözleşmeyi onayladınız.')
              : t('please_read_carefully_before_accepting', 'Onaylamadan önce metni dikkatle okuyun.')}
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              {t('close', 'Kapat')}
            </Button>
            {(onAccept || !isAccepted) && (
              <Button onClick={handleAcceptClick} disabled={Boolean(accepting)}>
                <Check className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                {accepting
                  ? t('accepting', 'Onaylanıyor…')
                  : isAccepted
                    ? t('accepted', 'Onaylandı')
                    : t('i_accept', 'Okudum, onaylıyorum')}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-border-light bg-background-secondary px-3.5 py-2.5 text-xs text-text-secondary">
          <div className="inline-flex items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
            <span className="font-medium text-text-primary">{title}</span>
            {agreement.version && (
              <span className="rounded-sm border border-border bg-background-primary px-1.5 py-0.5 font-medium tabular-nums text-text-secondary">
                v{agreement.version}
              </span>
            )}
          </div>
          {updatedLabel && (
            <div className="inline-flex items-center gap-1.5 tabular-nums text-text-tertiary">
              <ClockIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
              <span>{t('updated', 'Güncelleme')}: {updatedLabel}</span>
            </div>
          )}
        </div>

        <div className="rounded border border-border-light bg-background-primary p-4 sm:p-5">
          {isHtmlContent ? (
            <div
              className="prose prose-sm max-w-none text-sm leading-relaxed text-text-secondary prose-headings:text-text-primary"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="space-y-4 text-sm leading-relaxed text-text-secondary">
              {plainBlocks.map((block, idx) => {
                if (block.type === 'heading') {
                  return (
                    <h3 key={idx} className="text-sm font-semibold text-text-primary">
                      {block.text}
                    </h3>
                  );
                }
                if (block.type === 'list') {
                  return (
                    <ol key={idx} className="divide-y divide-border-light rounded border border-border-light bg-background-secondary/50">
                      {block.items.map((item) => (
                        <li key={item.index} className="flex items-start gap-3 px-3.5 py-2.5 text-sm">
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-border bg-background-primary text-xs font-semibold tabular-nums text-text-secondary">
                            {item.index}
                          </span>
                          <span className="flex-1 text-text-primary">{item.text}</span>
                        </li>
                      ))}
                    </ol>
                  );
                }
                return (
                  <p key={idx} className="text-sm text-text-secondary">
                    {block.text}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AgreementModal;
