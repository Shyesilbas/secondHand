import { useTranslation } from 'react-i18next';
import { memo, useLayoutEffect, useRef } from 'react';
import { Flag, MessageCircle, ShieldAlert, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '../../common/utils/dateFormat.js';
import { sameChatId } from '../chatIdUtils.js';
import { InChatOfferCard } from './InChatOfferCard.jsx';
import { EmptyState, Skeleton } from '../../common/components/ui/index.js';

const MessageBubble = memo(({
  message,
  isOwnMessage,
  onDeleteMessage,
  onReportMessage,
  currentUserId
}) => {
  const { t } = useTranslation();

  if (message.removedByModeration) {
    return (
      <div className={`mb-3 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <div className="flex max-w-xs items-start gap-2 rounded border border-border-light bg-background-primary px-3 py-2 text-sm text-text-tertiary lg:max-w-md">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
          <p>{t('message_removed_by_moderation', 'Bu mesaj topluluk kuralları ihlali nedeniyle sistem tarafından silindi.')}</p>
        </div>
      </div>
    );
  }

  if (message.deletedBySender) {
    // The text stays on the server for moderation, so the recipient can still report a deleted message.
    return (
      <div className={`mb-3 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <div className="flex max-w-xs items-start gap-2 rounded border border-border-light bg-background-primary px-3 py-2 text-sm text-text-tertiary lg:max-w-md">
          <Trash2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
          <p className="italic">{t('message_deleted_by_sender', 'Bu mesaj gönderen tarafından silindi.')}</p>
          {!isOwnMessage && onReportMessage && (
            <button
              type="button"
              onClick={() => onReportMessage(message)}
              className="ml-1 shrink-0 rounded-sm p-0.5 text-text-tertiary transition-colors duration-150 hover:text-status-error-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              title={t('report_message', 'Mesajı bildir')}
              aria-label={t('report_message', 'Mesajı bildir')}
            >
              <Flag className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (message.messageType === 'OFFER') {
    return (
      <div className={`mb-3 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <InChatOfferCard message={message} currentUserId={currentUserId} />
      </div>
    );
  }

  return (
    <div className={`mb-3 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`group relative max-w-xs rounded px-4 py-2.5 lg:max-w-md ${
          isOwnMessage
            ? 'rounded-br-sm bg-primary text-white'
            : 'rounded-bl-sm border border-border-light bg-background-primary text-text-primary shadow-sm'
        }`}
      >
        <p className="break-words text-sm leading-relaxed">{message.content}</p>
        <div className="mt-1.5 flex items-center justify-end gap-1.5">
          <time
            dateTime={message.createdAt || undefined}
            className={`text-xs tabular-nums ${isOwnMessage ? 'text-secondary-300' : 'text-text-tertiary'}`}
          >
            {formatRelativeTime(message.createdAt)}
          </time>
        </div>

        {!isOwnMessage && onReportMessage && (
          <button
            type="button"
            onClick={() => onReportMessage(message)}
            className="absolute -right-2 -top-2 rounded-full border border-border bg-background-primary p-1.5 text-text-secondary opacity-0 shadow-sm transition-opacity duration-150 hover:text-status-error-text focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus group-hover:opacity-100 group-focus-within:opacity-100"
            title={t('report_message', 'Mesajı bildir')}
            aria-label={t('report_message', 'Mesajı bildir')}
          >
            <Flag className="h-3 w-3" strokeWidth={1.5} aria-hidden />
          </button>
        )}

        {isOwnMessage && onDeleteMessage && (
          <button
            type="button"
            onClick={() => onDeleteMessage(message.id)}
            className="absolute -right-2 -top-2 rounded-full border border-status-error-border bg-status-error-bg p-1.5 text-status-error-text opacity-0 shadow-sm transition-opacity duration-150 hover:bg-status-error hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus group-hover:opacity-100 group-focus-within:opacity-100"
            title={t('delete_message', 'Mesajı sil')}
            aria-label={t('delete_message', 'Mesajı sil')}
          >
            <Trash2 className="h-3 w-3" strokeWidth={1.5} aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
});
MessageBubble.displayName = 'MessageBubble';

const MessageList = memo(({
  messages,
  isLoadingMessages,
  messagesEndRef,
  messagesContainerRef,
  user,
  onDeleteMessage,
  onReportMessage,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
}) => {
  const { t } = useTranslation();
  const prevScrollHeightRef = useRef(0);
  const prevScrollTopRef = useRef(0);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop } = messagesContainerRef.current;
    prevScrollTopRef.current = scrollTop;

    if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage?.();
    }
  };

  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const currentScrollHeight = container.scrollHeight;
    if (prevScrollHeightRef.current > 0 && prevScrollHeightRef.current < currentScrollHeight) {
      if (prevScrollTopRef.current === 0) {
        container.scrollTop = currentScrollHeight - prevScrollHeightRef.current;
      }
    }

    prevScrollHeightRef.current = currentScrollHeight;
  }, [messages, isFetchingNextPage, messagesContainerRef]);

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background-secondary p-5 sm:p-6"
    >
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary motion-reduce:animate-none" />
        </div>
      )}

      {isLoadingMessages ? (
        <div className="space-y-3" aria-busy="true" aria-label={t('loading_messages', 'Mesajlar yükleniyor')}>
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="ml-auto h-10 w-1/2" />
          <Skeleton className="h-10 w-3/5" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <EmptyState
            icon={MessageCircle}
            size="compact"
            title={t('no_messages_yet', 'Henüz mesaj yok')}
            description={t('send_the_first_message', 'Sohbeti başlatmak için ilk mesajı gönderin.')}
            className="border-0 bg-transparent"
          />
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={sameChatId(message.senderId, user?.id)}
            currentUserId={user?.id}
            onDeleteMessage={onDeleteMessage}
            onReportMessage={onReportMessage}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
});
MessageList.displayName = 'MessageList';
export default MessageList;
