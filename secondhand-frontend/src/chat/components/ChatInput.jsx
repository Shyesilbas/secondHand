import { useTranslation } from "react-i18next";
import { SendHorizontal as PaperAirplaneIcon } from 'lucide-react';
const ChatInput = ({
 messageText,
 setMessageText,
 handleKeyPress,
 handleSendMessage,
 inputRef,
 isEmbedded = false
}) => {
 const {
 t
 } = useTranslation();
 if (isEmbedded) {
 return <div className="border-t border-border-light/60 bg-background-primary p-5 flex-shrink-0">
 <div className="flex items-end space-x-3">
 <div className="flex-1">
 <textarea ref={inputRef} value={messageText} onChange={e => setMessageText(e.target.value)} onKeyPress={handleKeyPress} placeholder={t("type_your_message")} className="w-full px-4 py-3 border border-border-light rounded resize-none focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 ease-in-out tracking-tight" rows="1" />
 </div>
 <button onClick={handleSendMessage} disabled={!messageText.trim()} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4">
 <PaperAirplaneIcon className="w-5 h-5" />
 </button>
 </div>
 </div>;
 }
 return <div className="p-4 border-t border-border-light/60 bg-background-primary">
 <div className="flex items-end space-x-3">
 <div className="flex-1">
 <textarea ref={inputRef} value={messageText} onChange={e => setMessageText(e.target.value)} onKeyPress={handleKeyPress} placeholder={t("type_your_message")} className="w-full px-4 py-3 border border-border-light rounded resize-none focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 ease-in-out tracking-tight" rows="1" />
 </div>
 <button onClick={handleSendMessage} disabled={!messageText.trim()} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4">
 <PaperAirplaneIcon className="w-5 h-5" />
 </button>
 </div>
 </div>;
};
export default ChatInput;