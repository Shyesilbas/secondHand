import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { Badge, Button } from '../../common/components/ui/index.js';
import { formatDateTime, formatSmartEmailDate } from '../../common/formatters.js';
import { CHAT_ROOM_TYPES } from '../chatConstants.js';
import { sameChatId } from '../chatIdUtils.js';

const getInitials = (title) => {
  const cleaned = String(title || '').trim();
  if (!cleaned) return '?';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

const ChatRoomListItem = ({
  room,
  isSelected,
  onClick,
  userId,
  onDeleteConversation
}) => {
  const { t } = useTranslation();
  const unreadCount = room.unreadCount || 0;
  const hasUnread = unreadCount > 0;

  const title =
    room.otherParticipantName ||
    room.listingTitle ||
    room.roomName ||
    room.title ||
    t('user', 'Kullanıcı');

  const subtitle =
    room.roomType === CHAT_ROOM_TYPES.LISTING
      ? t('chat_listing_subtitle', 'İlan sohbeti')
      : room.roomType === CHAT_ROOM_TYPES.DIRECT
        ? t('chat_direct_subtitle', 'Direkt mesaj')
        : '';

  const lastMessageSender = room.lastMessageSenderId
    ? sameChatId(room.lastMessageSenderId, userId)
      ? t('you', 'Siz')
      : room.lastMessageSenderName || `${t('user', 'Kullanıcı')} #${room.lastMessageSenderId}`
    : '';

  return (
    <li className="group relative">
      <button
        type="button"
        onClick={onClick}
        aria-current={isSelected ? 'true' : undefined}
        className={`flex w-full items-start gap-3 border-l-2 px-4 py-3.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus ${
          isSelected
            ? 'border-l-accent-teal bg-accent-teal-50'
            : 'border-l-transparent bg-background-primary hover:bg-background-secondary'
        }`}
      >
        <div
          aria-hidden
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            isSelected
              ? 'bg-accent-teal-100 text-accent-teal-800'
              : 'bg-background-tertiary text-text-secondary'
          }`}
        >
          {getInitials(title)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`truncate text-sm ${
                hasUnread || isSelected
                  ? 'font-semibold text-text-primary'
                  : 'font-medium text-text-primary'
              }`}
            >
              {title}
            </span>

            <div className="flex shrink-0 items-center gap-1.5 transition-opacity duration-150 md:group-hover:opacity-0 md:group-focus-within:opacity-0">
              {hasUnread && (
                <Badge variant="primary" size="sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
              {room.lastMessageTime && (
                <time
                  dateTime={room.lastMessageTime}
                  className={`whitespace-nowrap text-xs tabular-nums ${
                    hasUnread ? 'font-medium text-text-primary' : 'text-text-tertiary'
                  }`}
                >
                  {formatSmartEmailDate(room.lastMessageTime) || formatDateTime(room.lastMessageTime)}
                </time>
              )}
            </div>
          </div>

          {room.listingTitle && (
            <p
              className={`mt-0.5 truncate text-xs font-medium ${
                isSelected ? 'text-accent-teal-800' : 'text-text-secondary'
              }`}
            >
              {room.listingTitle}
            </p>
          )}

          <p className="mt-0.5 line-clamp-1 text-sm text-text-tertiary">
            {room.lastMessageRemoved ? (
              <span className="italic">
                {t('last_message_removed_by_moderation', 'Bu mesaj sistem tarafından silindi.')}
              </span>
            ) : room.lastMessage ? (
              <>
                {lastMessageSender ? (
                  <span className="font-medium text-text-secondary">{lastMessageSender}: </span>
                ) : null}
                {room.lastMessage}
              </>
            ) : (
              subtitle
            )}
          </p>
        </div>
      </button>

      {onDeleteConversation && (
        <div className="pointer-events-none absolute right-2.5 top-3 hidden opacity-0 transition-opacity duration-150 md:block group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
          <Button
            variant="danger"
            size="icon"
            onClick={() => onDeleteConversation(room.id)}
            title={t('delete_chat', 'Sohbeti sil')}
            aria-label={`${t('delete_chat', 'Sohbeti sil')}: ${title}`}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          </Button>
        </div>
      )}
    </li>
  );
};

export default ChatRoomListItem;
