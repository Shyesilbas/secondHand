import { useTranslation } from 'react-i18next';
import { ArrowLeft, MailOpen } from 'lucide-react';
import { EmptyState } from '../../common/components/ui/index.js';
import EmailContent from './EmailContent.jsx';

const EmailReadingPane = ({
  selectedEmail,
  onClearSelection,
  onDelete,
  isDeleting,
  onSelectPrev,
  onSelectNext,
  hasPrev,
  hasNext
}) => {
  const { t } = useTranslation();

  return (
    <section
      className={`flex min-h-0 min-w-0 flex-1 flex-col bg-background-primary ${
        !selectedEmail ? 'hidden lg:flex' : 'flex'
      }`}
    >
      {selectedEmail ? (
        <>
          <div className="flex shrink-0 items-center justify-between border-b border-border-light bg-background-secondary px-4 py-2.5 lg:hidden">
            <button
              type="button"
              onClick={onClearSelection}
              className="flex items-center gap-1.5 text-sm font-semibold text-text-primary"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              <span>{t('list', 'Mesaj Listesine Dön')}</span>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            <EmailContent
              email={selectedEmail}
              onDelete={onDelete}
              isDeleting={isDeleting}
              onSelectPrev={onSelectPrev}
              onSelectNext={onSelectNext}
              hasPrev={hasPrev}
              hasNext={hasNext}
            />
          </div>
        </>
      ) : (
        <EmptyState
          icon={MailOpen}
          title={t('select_an_item_to_read', 'Okumak İçin Bir E-Posta Seçin')}
          description={t(
            'nothing_is_selected_choose_a_message_in_',
            'Sol taraftaki listeden görüntülemek istediğiniz e-postaya tıklayın.'
          )}
          className="min-h-72 flex-1"
        />
      )}
    </section>
  );
};

export default EmailReadingPane;
