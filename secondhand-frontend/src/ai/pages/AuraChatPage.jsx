import React, {useMemo} from 'react';
import {useLocation} from 'react-router-dom';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {AI_AGENT_MODE_ENABLED} from '../config/agentConfig.js';
import {aiChatService} from '../services/aiChatService.js';
import {
  Bot,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
  UserRound,
  Zap,
  Shield,
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
  Info,
  Layers
} from 'lucide-react';
import {useAuraChat} from '../hooks/useAuraChat.js';
import {clearAuraPersistedMessages, createChatMessage, getApiErrorMessage} from '../utils/auraChatUtils.js';
import AuraSuggestedPrompts from '../components/AuraSuggestedPrompts.jsx';
import AuraListingContextCard from '../components/AuraListingContextCard.jsx';
import AuraSuggestedListingChips from '../components/AuraSuggestedListingChips.jsx';
import {buildAuraListingSessionContext} from '../utils/auraListingContext.js';

const AuraChatPage = () => {
  const {user} = useAuthState();
  const location = useLocation();
  const listing = location?.state?.listing || null;
  const [agentMode, setAgentMode] = React.useState(AI_AGENT_MODE_ENABLED);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [rightPanelOpen, setRightPanelOpen] = React.useState(true);

  const userId = user?.id ?? null;

  const listingContext = useMemo(() => buildAuraListingSessionContext(listing), [listing]);

  const buildPayload = useMemo(() => {
    return (text) => {
      const trimmed = text.trim();
      return {
        message: trimmed,
        context: listingContext || undefined,
        agentMode,
        uiContext: {
          currentPage: 'AuraChatPage',
          route: location.pathname,
          listingId: listing?.id ? String(listing.id) : undefined,
        },
      };
    };
  }, [agentMode, listing?.id, listingContext, location.pathname]);

  const sendApi = useMemo(() => {
    return async (payload) => {
      const message = typeof payload === 'object' && payload != null ? payload.message : payload;
      const context = typeof payload === 'object' && payload != null ? payload.context : undefined;
      const uiContext = typeof payload === 'object' && payload != null ? payload.uiContext : undefined;

      if (AI_AGENT_MODE_ENABLED && agentMode) {
        return aiChatService.agentQuery({message, context, uiContext, agentMode: true});
      }
      return aiChatService.chat({message, context});
    };
  }, [agentMode]);

  const {
    storageKey,
    messages,
    setMessages,
    input,
    setInput,
    isSending,
    setIsSending,
    listRef,
    sendMessage,
    onKeyDown,
    scrollToBottom,
  } = useAuraChat({
    userId,
    isAuthenticated: userId != null,
    initialMessages: [
      {
        id: 'aura-welcome',
        role: 'assistant',
        content:
          "Hi, I'm Aura. I'm here to help you with listing search, offers, secure payment, and showcases on SecondHand. What do you need today?",
        createdAt: Date.now(),
      },
    ],
    withTyping: true,
    buildPayload,
    sendApi,
    echoUserMessageWhenUnauthed: false,
    persistMessagesSurface: 'page',
  });

  const hasUserTurn = useMemo(() => messages.some((m) => m.role === 'user'), [messages]);
  const showQuickPrompts = userId != null && !hasUserTurn && !isSending;

  const handleNewChat = async () => {
    if (userId == null) {
      setMessages([createChatMessage({role: 'assistant', content: 'Please log in to continue.'})]);
      return;
    }
    setIsSending(true);
    try {
      await aiChatService.newChat();
      clearAuraPersistedMessages(userId, 'page');
      localStorage.removeItem(storageKey);
      setMessages([createChatMessage({role: 'assistant', content: 'New chat started. What are we looking at today?'})]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Could not create new chat.');
      setMessages((prev) => [...prev, createChatMessage({role: 'assistant', content: errorMessage})]);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteHistory = async () => {
    if (userId == null) return;
    if (!window.confirm('Do you want to delete all chat history?')) return;
    setIsSending(true);
    try {
      await aiChatService.deleteHistory();
      clearAuraPersistedMessages(userId, 'page');
      localStorage.removeItem(storageKey);
      setMessages([createChatMessage({role: 'assistant', content: 'History cleared. You can start a new conversation below.'})]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Could not delete history.');
      setMessages((prev) => [...prev, createChatMessage({role: 'assistant', content: errorMessage})]);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMemory = async () => {
    if (userId == null) return;
    if (!window.confirm('Memory and chat history will be deleted. Continue?')) return;
    setIsSending(true);
    try {
      await aiChatService.deleteMemory();
      clearAuraPersistedMessages(userId, 'page');
      localStorage.removeItem(storageKey);
      setMessages([createChatMessage({role: 'assistant', content: "Memory reset. Start a new chat below if you'd like."})]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Could not delete memory.');
      setMessages((prev) => [...prev, createChatMessage({role: 'assistant', content: errorMessage})]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-68px)] bg-white flex overflow-hidden min-h-0 relative w-full text-slate-800">

      {/* ── 1. LEFT SIDEBAR PANEL (Navigation & Session) ─────── */}
      <div className={`
        ${sidebarOpen ? 'w-64 border-r opacity-100 p-5' : 'w-0 border-r-0 opacity-0 p-0 pointer-events-none'}
        hidden lg:flex flex-col h-full bg-slate-50 border-slate-200 overflow-y-auto shrink-0 justify-between transition-all duration-300 ease-in-out z-25
      `}>
        <div className="space-y-6">
          {/* Brand header inside sidebar */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-none">Aura Workspace</p>
              <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase mt-1 inline-block">AI Console</span>
            </div>
          </div>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleNewChat}
            disabled={isSending}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Conversation
          </button>

          {/* Settings Section */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Controls</p>
            
            <button
              type="button"
              onClick={handleDeleteHistory}
              disabled={isSending}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              Clear History
            </button>

            <button
              type="button"
              onClick={handleDeleteMemory}
              disabled={isSending}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:border-slate-50 text-xs font-semibold text-slate-600 transition-all"
            >
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Reset Memory Cache
            </button>
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600 uppercase">
              {user?.name?.slice(0, 2) || 'US'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.name || 'Guest User'}</p>
              <p className="text-[9px] text-slate-400 font-medium truncate">{user?.email || 'Sync enabled'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. MIDDLE PANEL (Main Conversational Lane) ───────── */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 h-full bg-white relative z-10">
        
        {/* Workspace Toolbar (Header) */}
        <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-4 z-20">
          
          {/* Left tools: sidebar toggle + Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="hidden lg:inline-flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
              title={sidebarOpen ? 'Collapse Navigation' : 'Expand Navigation'}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4.5 h-4.5" /> : <PanelLeft className="w-4.5 h-4.5" />}
            </button>

            <span className="lg:hidden w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Aura Assistant</h2>
            <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 rounded">
              PRO
            </span>
          </div>

          {/* Center tools: Agent switch */}
          {AI_AGENT_MODE_ENABLED && (
            <button
              type="button"
              role="switch"
              aria-checked={agentMode}
              onClick={() => setAgentMode((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                agentMode
                  ? 'bg-slate-900 text-white border border-transparent shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Agent Mode: {agentMode ? 'ON' : 'OFF'}
            </button>
          )}

          {/* Right tools: context toggle */}
          <button
            type="button"
            onClick={() => setRightPanelOpen((prev) => !prev)}
            className="hidden lg:inline-flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
            title={rightPanelOpen ? 'Collapse Information' : 'Expand Information'}
          >
            {rightPanelOpen ? <PanelRightClose className="w-4.5 h-4.5" /> : <PanelRight className="w-4.5 h-4.5" />}
          </button>
        </div>

        {/* Mobile active context view banner (shown inline only on mobile) */}
        {listing && (
          <div className="lg:hidden p-4 pb-0 shrink-0">
            <AuraListingContextCard listing={listing} />
          </div>
        )}

        {/* Conversation Stream */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto w-full custom-scrollbar"
        >
          <div className="max-w-3xl mx-auto px-4 py-8 w-full space-y-6">
            
            {/* Elegant Welcome Greeting Card if there is only 1 message (initial welcome) */}
            {messages.length === 1 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-6 text-center space-y-4 mb-6 shadow-inner">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto shadow-md">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">Secure Agentic Trade Companion</h3>
                  <p className="text-xs text-slate-500 leading-normal max-w-md mx-auto">
                    Aura provides automated database queries, pricing checks, trade analysis, and secure shopping support natively.
                  </p>
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div key={m.id} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                  {/* Avatar */}
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm border ${
                    isUser
                      ? 'bg-slate-100 border-slate-200 text-slate-800'
                      : 'bg-slate-900 border-slate-800 text-white'
                  }`}>
                    {isUser ? <UserRound className="h-4.5 w-4.5" /> : <Sparkles className="h-4 w-4" />}
                  </div>

                  {/* Bubble content */}
                  <div className={`min-w-0 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
                    <div className={`inline-block rounded-xl px-4 py-3.5 text-sm leading-relaxed text-left whitespace-pre-wrap ${
                      isUser
                        ? 'bg-slate-900 text-white shadow-sm rounded-br-sm'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                    }`}>
                      {m.typing ? (
                        <div className="flex items-center gap-1.5 py-1 px-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: '0ms'}} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: '150ms'}} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: '300ms'}} />
                        </div>
                      ) : (
                        <>
                          {m.content}
                          {Array.isArray(m.meta?.suggestedListings) && m.meta.suggestedListings.length > 0 ? (
                            <AuraSuggestedListingChips listings={m.meta.suggestedListings} />
                          ) : null}
                          {Array.isArray(m.meta?.dataSources) && m.meta.dataSources.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-1 pt-2 border-t border-slate-200">
                              {m.meta.dataSources.map((source) => (
                                <span
                                  key={`${m.id}-${source.source}`}
                                  className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold font-mono text-slate-500 border border-slate-200"
                                >
                                  {source.source.toUpperCase()}:{source.status}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile quick prompts feed panel (only visible if prompts exist and screen is mobile) */}
        {showQuickPrompts && (
          <div className="lg:hidden shrink-0 border-t border-slate-100 px-4 py-4 bg-slate-50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Suggested Questions</p>
            <AuraSuggestedPrompts disabled={isSending} onPick={(msg) => sendMessage({text: msg})} dense />
          </div>
        )}

        {/* Floating Chat Input Section */}
        <div className="shrink-0 border-t border-slate-200 bg-white p-4 sm:p-5">
          <div className="max-w-3xl mx-auto flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a message or ask a shopping question..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-450 focus:bg-white min-h-[46px] max-h-[120px] transition-all duration-200 shadow-inner"
                rows={1}
              />
            </div>
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={isSending || !input.trim()}
              className="inline-flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow hover:bg-slate-950 active:scale-95 transition-all duration-200"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
          <p className="mt-2.5 text-[9px] text-slate-400 text-center font-medium">
            Aura agent will guide you securely. Verify important terms during payment.
          </p>
        </div>
      </div>

      {/* ── 3. RIGHT PANEL (Listing Information Canvas) ───────── */}
      <div className={`
        ${rightPanelOpen ? 'w-80 border-l opacity-100 p-5' : 'w-0 border-l-0 opacity-0 p-0 pointer-events-none'}
        hidden lg:flex flex-col h-full bg-slate-50 border-slate-200 overflow-y-auto shrink-0 space-y-6 transition-all duration-300 ease-in-out z-25
      `}>
        
        {/* Active Product Analysis section */}
        {listing ? (
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Workspace context</p>
            <AuraListingContextCard listing={listing} />
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <Layers className="w-4 h-4 text-slate-400" />
              General Workspace
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              No product is currently active in your chat context. Enter an item description to fetch listings, or select a listing to personalize the AI context.
            </p>
          </div>
        )}

        {/* Quick Suggestions Cards */}
        {showQuickPrompts && (
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Suggested Queries</p>
            <AuraSuggestedPrompts disabled={isSending} onPick={(msg) => sendMessage({text: msg})} dense />
          </div>
        )}

        {/* Secure shopping widget info */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <Info className="w-4 h-4 text-slate-400" />
              Security Shield
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              For secure payments, always checkout using our integrated Secure Checkout option. Aura will analyze offers, check listing criteria, and guide you away from high-risk external deals.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AuraChatPage;
