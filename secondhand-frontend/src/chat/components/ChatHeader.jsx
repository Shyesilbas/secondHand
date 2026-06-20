import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { EllipsisVertical as EllipsisVerticalIcon, Trash2 as TrashIcon, X as XMarkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { CHAT_DEFAULTS, CHAT_MESSAGES } from '../chatConstants.js';
const ChatHeader = ({
  selectedChatRoom,
  isConnected,
  onClose,
  onDeleteConversation,
  onConversationDeleted
}) => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const notification = useNotification();
  const [showOptions, setShowOptions] = useState(false);
  const handleListingTitleClick = () => {
    if (selectedChatRoom?.listingId) {
      navigate(ROUTES.LISTING_DETAIL(selectedChatRoom.listingId));
      onClose();
    }
  };
  const handleUserClick = () => {
    if (selectedChatRoom?.otherParticipantId) {
      navigate(ROUTES.USER_PROFILE(selectedChatRoom.otherParticipantId));
      onClose();
    }
  };
  const handleDeleteConversation = () => {
    if (!onDeleteConversation) {
      setShowOptions(false);
      return;
    }
    notification.showConfirmation(CHAT_MESSAGES.DELETE_CONVERSATION_TITLE, CHAT_MESSAGES.DELETE_CONVERSATION_CONFIRMATION, () => {
      onDeleteConversation(selectedChatRoom.id);
      onConversationDeleted?.(selectedChatRoom.id);
      onClose();
      notification.showSuccess(CHAT_MESSAGES.SUCCESS_TITLE, CHAT_MESSAGES.CONVERSATION_DELETED);
    });
    setShowOptions(false);
  };
  const getHeaderName = () => selectedChatRoom?.otherParticipantName || selectedChatRoom?.title || 'Chat';
  const listingLabel = selectedChatRoom?.listingTitle || '';
  const profileId = selectedChatRoom?.otherParticipantId;
  return <div className="flex items-center justify-between p-4 border-b border-border-light/60 bg-background-primary/80 backdrop-blur-md text-text-primary flex-shrink-0">
      <div className="flex items-center space-x-4">
        <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-status-success-bg' : 'bg-text-muted'}`}></div>
        <div>
          {profileId ? <button type="button" onClick={handleUserClick} className="font-bold text-base hover:text-slate-700 transition-all duration-300 ease-in-out tracking-tight" title={t("view_user_profile")}>
            {getHeaderName()}
          </button> : <span className="font-bold text-base tracking-tight">{getHeaderName()}</span>}
          {Boolean(listingLabel) && selectedChatRoom?.listingId && <button onClick={handleListingTitleClick} className="block text-xs text-slate-500 hover:text-slate-700 hover:underline cursor-pointer transition-all duration-300 ease-in-out mt-0.5 tracking-tight" title={`View listing: ${listingLabel}`}>
              📦 {listingLabel.length > CHAT_DEFAULTS.MAX_LISTING_TITLE_PREVIEW ? `${listingLabel.substring(0, CHAT_DEFAULTS.MAX_LISTING_TITLE_PREVIEW)}...` : listingLabel}
            </button>}
          <p className="text-xs font-medium text-slate-500 mt-1 tracking-tight">
            {isConnected ? CHAT_MESSAGES.ONLINE : CHAT_MESSAGES.OFFLINE}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {onDeleteConversation && <div className="relative">
          <button type="button" onClick={() => setShowOptions(!showOptions)} className="text-slate-600 hover:text-text-primary hover:bg-slate-100/50 transition-all duration-300 ease-in-out p-2 rounded-xl" title={t("options")}>
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>
          {showOptions && <div className="absolute right-0 top-full mt-1 bg-background-primary/95 backdrop-blur-md border border-border-light/60 rounded-xl shadow-2xl z-10 min-w-[150px]">
              <button type="button" onClick={handleDeleteConversation} className="flex items-center space-x-2 w-full px-4 py-2.5 text-sm text-status-error hover:bg-status-error-bg/80 transition-all duration-300 ease-in-out rounded-lg mx-1 my-1 tracking-tight">
                <TrashIcon className="w-4 h-4" />
                <span>{t("delete_chat")}</span>
              </button>
            </div>}
        </div>}
        <button type="button" onClick={onClose} className="text-slate-600 hover:text-text-primary hover:bg-slate-100/50 transition-all duration-300 ease-in-out p-2 rounded-xl">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>;
};
export default ChatHeader;