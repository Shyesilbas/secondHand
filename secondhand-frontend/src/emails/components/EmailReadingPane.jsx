import { useTranslation } from 'react-i18next';
import { ArrowLeft, MailOpen } from 'lucide-react';
import { Button, EmptyState } from '../../common/components/ui/index.js';
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
      aria-label={t('email_content', 'E-posta içeriği')}
      className={`h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background-primary lg:col-span-7 xl:col-span-8 ${
        !selectedEmail ? 'hidden lg:flex' : 'flex'
      }`}
    >
      {selectedEmail ? (
        <>
          <div className="flex shrink-0 items-center border-b border-border-light bg-background-primary px-3 py-2 lg:hidden">
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              <span>{t('list', 'Mesaj listesine dön')}</span>
            </Button>
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
        <div className="flex flex-1 items-center justify-center p-6">
          <EmptyState
            icon={MailOpen}
            title={t('select_an_item_to_read', 'Okumak için bir e-posta seçin')}
            description={t(
              'nothing_is_selected_choose_a_message_in_',
              'Sol taraftaki listeden görüntülemek istediğiniz e-postaya tıklayın.'
            )}
            className="border-0"
          />
        </div>
      )}
    </section>
  );
};

export default EmailReadingPane;
