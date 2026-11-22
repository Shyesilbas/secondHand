import { useTranslation } from 'react-i18next';
import { SendHorizontal } from 'lucide-react';
import { Button } from '../../common/components/ui/index.js';
import { inputNormal } from '../../common/components/forms/inputStyles.js';

const ChatInput = ({
  messageText,
  setMessageText,
  handleKeyPress,
  handleSendMessage,
  inputRef,
  isEmbedded = false,
  disabledReason = null
}) => {
  const { t } = useTranslation();
  const isDisabled = Boolean(disabledReason);

  return (
    <div className={`shrink-0 border-t border-border-light bg-background-primary ${isEmbedded ? 'px-5 py-3.5' : 'p-3.5'}`}>
      <div className="flex items-end gap-2.5">
        <textarea
          ref={inputRef}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyPress}
          aria-label={t('type_your_message', 'Mesajınızı yazın')}
          placeholder={disabledReason || t('type_your_message', 'Mesajınızı yazın...')}
          disabled={isDisabled}
          rows={1}
          className={`${inputNormal} min-h-10 flex-1 resize-none disabled:cursor-not-allowed disabled:opacity-50`}
        />
        <Button
          onClick={handleSendMessage}
          disabled={isDisabled || !messageText.trim()}
          aria-label={t('send', 'Gönder')}
          title={t('send', 'Gönder')}
          className="shrink-0"
        >
          <SendHorizontal className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          {isEmbedded && <span className="hidden sm:inline">{t('send', 'Gönder')}</span>}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
