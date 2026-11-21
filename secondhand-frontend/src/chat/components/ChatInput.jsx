import { useTranslation } from "react-i18next";
import { SendHorizontal as PaperAirplaneIcon } from 'lucide-react';
import { buttonClasses } from '../../common/components/ui/Button.jsx';
const ChatInput = ({
 messageText,
 setMessageText,
 handleKeyPress,
 handleSendMessage,
 inputRef,
 isEmbedded = false,
 disabledReason = null
}) => {
 const {
 t
 } = useTranslation();
 if (isEmbedded) {
 return <div className="border-t border-border-light bg-background-primary p-5 flex-shrink-0">
 <div className="flex items-end space-x-3">
 <div className="flex-1">
 <textarea ref={inputRef} value={messageText} onChange={e => setMessageText(e.target.value)} onKeyPress={handleKeyPress} placeholder={disabledReason || t("type_your_message")} disabled={Boolean(disabledReason)} className="w-full px-4 py-3 border border-border-light rounded resize-none focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-primary transition duration-150 ease-in-out tracking-tight" rows="1" />
 </div>
 <button onClick={handleSendMessage} disabled={Boolean(disabledReason) || !messageText.trim()} className={buttonClasses()}>
 <PaperAirplaneIcon className="w-5 h-5" strokeWidth={1.5} />
 </button>
 </div>
 </div>;
 }
 return <div className="p-4 border-t border-border-light bg-background-primary">
 <div className="flex items-end space-x-3">
 <div className="flex-1">
 <textarea ref={inputRef} value={messageText} onChange={e => setMessageText(e.target.value)} onKeyPress={handleKeyPress} placeholder={disabledReason || t("type_your_message")} disabled={Boolean(disabledReason)} className="w-full px-4 py-3 border border-border-light rounded resize-none focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-primary transition duration-150 ease-in-out tracking-tight" rows="1" />
 </div>
 <button onClick={handleSendMessage} disabled={Boolean(disabledReason) || !messageText.trim()} className={buttonClasses()}>
 <PaperAirplaneIcon className="w-5 h-5" strokeWidth={1.5} />
 </button>
 </div>
 </div>;
};
export default ChatInput;