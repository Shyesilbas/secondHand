import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { AI_AGENT_MODE_ENABLED } from '../config/agentConfig.js';
import { aiChatService } from '../services/aiChatService.js';
import { Bot, RotateCcw, Send, Sparkles, Trash2, UserRound, Zap, Shield, PanelLeftClose, PanelLeft, PanelRightClose, PanelRight, Info, Layers } from 'lucide-react';
import { useAuraChat } from '../hooks/useAuraChat.js';
import { clearAuraPersistedMessages, createChatMessage, getApiErrorMessage } from '../utils/auraChatUtils.js';
import AuraSuggestedPrompts from '../components/AuraSuggestedPrompts.jsx';
import AuraListingContextCard from '../components/AuraListingContextCard.jsx';
import AuraSuggestedListingChips from '../components/AuraSuggestedListingChips.jsx';
import { buildAuraListingSessionContext } from '../utils/auraListingContext.js';
const AuraChatPage = () => {
  const {
    t
  } = useTranslation();
  const {
    user
  } = useAuthState();
  const location = useLocation();
  const listing = location?.state?.listing || null;
  const [agentMode, setAgentMode] = React.useState(AI_AGENT_MODE_ENABLED);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [rightPanelOpen, setRightPanelOpen] = React.useState(true);
  const userId = user?.id ?? null;
  const listingContext = useMemo(() => buildAuraListingSessionContext(listing), [listing]);
  const buildPayload = useMemo(() => {
    return text => {
      const trimmed = text.trim();
      return {
        message: trimmed,
        context: listingContext || undefined,
        agentMode,
        uiContext: {
          currentPage: 'AuraChatPage',
          route: location.pathname,
          listingId: listing?.id ? String(listing.id) : undefined
        }
      };
    };
  }, [agentMode, listing?.id, listingContext, location.pathname]);
  const sendApi = useMemo(() => {
    return async payload => {
      const message = typeof payload === 'object' && payload != null ? payload.message : payload;
      const context = typeof payload === 'object' && payload != null ? payload.context : undefined;
      const uiContext = typeof payload === 'object' && payload != null ? payload.uiContext : undefined;
      if (AI_AGENT_MODE_ENABLED && agentMode) {
        return aiChatService.agentQuery({
          message,
          context,
          uiContext,
          agentMode: true
        });
      }
      return aiChatService.chat({
        message,
        context
      });
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
    scrollToBottom
  } = useAuraChat({
    userId,
    isAuthenticated: userId != null,
    initialMessages: [{
      id: 'aura-welcome',
      role: 'assistant',
      content: "Hi, I'm Aura. I'm here to help you with listing search, offers, secure payment, and showcases on SecondHand. What do you need today?",
      createdAt: Date.now()
    }],
    withTyping: true,
    buildPayload,
    sendApi,
    echoUserMessageWhenUnauthed: false,
    persistMessagesSurface: 'page'
  });
  const hasUserTurn = useMemo(() => messages.some(m => m.role === 'user'), [messages]);
  const showQuickPrompts = userId != null && !hasUserTurn && !isSending;
  const handleNewChat = async () => {
    if (userId == null) {
      setMessages([createChatMessage({
        role: 'assistant',
        content: 'Please log in to continue.'
      })]);
      return;
    }
    setIsSending(true);
    try {
      await aiChatService.newChat();
      clearAuraPersistedMessages(userId, 'page');
      localStorage.removeItem(storageKey);
      setMessages([createChatMessage({
        role: 'assistant',
        content: 'New chat started. What are we looking at today?'
      })]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Could not create new chat.');
      setMessages(prev => [...prev, createChatMessage({
        role: 'assistant',
        content: errorMessage
      })]);
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
      setMessages([createChatMessage({
        role: 'assistant',
        content: 'History cleared. You can start a new conversation below.'
      })]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Could not delete history.');
      setMessages(prev => [...prev, createChatMessage({
        role: 'assistant',
        content: errorMessage
      })]);
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
      setMessages([createChatMessage({
        role: 'assistant',
        content: "Memory reset. Start a new chat below if you'd like."
      })]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Could not delete memory.');
      setMessages(prev => [...prev, createChatMessage({
        role: 'assistant',
        content: errorMessage
      })]);
    } finally {
      setIsSending(false);
    }
  };
  return <div className="h-[calc(100vh-68px)] bg-background-primary flex overflow-hidden min-h-0 relative w-full text-slate-800">

      {/* ── 1. LEFT SIDEBAR PANEL (Navigation & Session) ─────── */}
      <div className={`
        ${sidebarOpen ? 'w-64 border-r opacity-100 p-5' : 'w-0 border-r-0 opacity-0 p-0 pointer-events-none'}
        hidden lg:flex flex-col h-full bg-background-secondary border-border-light overflow-y-auto shrink-0 justify-between transition-all duration-300 ease-in-out z-25
      `}>
        <div className="space-y-6">
          {/* Brand header inside sidebar */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary leading-none">{t("aura_workspace")}</p>
              <span className="text-[9px] text-text-muted font-semibold tracking-wider uppercase mt-1 inline-block">{t("ai_console")}</span>
            </div>
          </div>

          {/* New Chat Button */}
          <button type="button" onClick={handleNewChat} disabled={isSending} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm active:scale-95">
            <RotateCcw className="w-3.5 h-3.5" />{t("new_conversation")}</button>

          {/* Settings Section */}
          <div className="space-y-2 pt-4 border-t border-border-light">
            <p className="text-caption font-bold text-text-muted uppercase tracking-wider mb-2">{t("controls")}</p>
            
            <button type="button" onClick={handleDeleteHistory} disabled={isSending} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border-light bg-background-primary hover:bg-secondary-light text-xs font-semibold text-text-secondary transition-all active:scale-95">
              <Trash2 className="w-3.5 h-3.5 text-text-muted" />{t("clear_history")}</button>

            <button type="button" onClick={handleDeleteMemory} disabled={isSending} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border-light bg-background-primary hover:bg-secondary-light text-xs font-semibold text-text-secondary transition-all active:scale-95">
              <Shield className="w-3.5 h-3.5 text-text-muted" />{t("reset_memory_cache")}</button>
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="pt-4 border-t border-border-light">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-background-tertiary flex items-center justify-center text-caption font-bold text-text-secondary uppercase">
              {user?.name?.slice(0, 2) || 'US'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-text-primary truncate">{user?.name || 'Guest User'}</p>
              <p className="text-[9px] text-text-muted font-medium truncate">{user?.email || 'Sync enabled'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. MIDDLE PANEL (Main Conversational Lane) ───────── */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 h-full bg-background-primary relative z-10">
        
        {/* Workspace Toolbar (Header) */}
        <div className="shrink-0 bg-background-primary border-b border-border-light px-4 py-3 flex items-center justify-between gap-4 z-20">
          
          {/* Left tools: sidebar toggle + Brand */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen(prev => !prev)} className="hidden lg:inline-flex items-center justify-center p-1.5 rounded-lg text-text-secondary hover:bg-secondary-light hover:text-text-primary transition-all active:scale-95" title={sidebarOpen ? 'Collapse Navigation' : 'Expand Navigation'}>
              {sidebarOpen ? <PanelLeftClose className="w-4.5 h-4.5" /> : <PanelLeft className="w-4.5 h-4.5" />}
            </button>

            <span className="lg:hidden w-1.5 h-1.5 rounded-full bg-status-success-bg" />
            <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("aura_assistant")}</h2>
            <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-text-muted bg-background-tertiary border border-border-light rounded">{t("pro")}</span>
          </div>

          {/* Center tools: Agent switch */}
          {AI_AGENT_MODE_ENABLED && <button type="button" role="switch" aria-checked={agentMode} onClick={() => setAgentMode(v => !v)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 ${agentMode ? 'bg-primary text-white border border-transparent shadow-sm' : 'bg-background-primary text-text-secondary border border-border-light hover:bg-secondary-light'}`}>
              <Zap className="w-3.5 h-3.5" />{t("agent_mode")}{agentMode ? 'ON' : 'OFF'}
            </button>}

          {/* Right tools: context toggle */}
          <button type="button" onClick={() => setRightPanelOpen(prev => !prev)} className="hidden lg:inline-flex items-center justify-center p-1.5 rounded-lg text-text-secondary hover:bg-secondary-light hover:text-text-primary transition-all active:scale-95" title={rightPanelOpen ? 'Collapse Information' : 'Expand Information'}>
            {rightPanelOpen ? <PanelRightClose className="w-4.5 h-4.5" /> : <PanelRight className="w-4.5 h-4.5" />}
          </button>
        </div>

        {/* Mobile active context view banner (shown inline only on mobile) */}
        {listing && <div className="lg:hidden p-4 pb-0 shrink-0">
            <AuraListingContextCard listing={listing} />
          </div>}

        {/* Conversation Stream */}
        <div ref={listRef} className="flex-1 overflow-y-auto w-full custom-scrollbar">
          <PageContainer narrow className="py-8 w-full space-y-6">
            
            {/* Elegant Welcome Greeting Card if there is only 1 message (initial welcome) */}
            {messages.length === 1 && <div className="rounded-xl border border-border-light bg-background-tertiary p-6 text-center space-y-4 mb-6 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-md">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-text-primary">{t("secure_agentic_trade_companion")}</h3>
                  <p className="text-xs text-text-secondary leading-normal max-w-md mx-auto">{t("aura_provides_automated_database_queries")}</p>
                </div>
              </div>}

            {/* Conversation Messages */}
            {messages.map(m => {
            const isUser = m.role === 'user';
            return <div key={m.id} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                  {/* Avatar */}
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm border ${isUser ? 'bg-background-tertiary border-border-light text-text-primary' : 'bg-primary border-primary text-white'}`}>
                    {isUser ? <UserRound className="h-4.5 w-4.5" /> : <Sparkles className="h-4 w-4" />}
                  </div>

                  {/* Bubble content */}
                  <div className={`min-w-0 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
                    <div className={`inline-block rounded-xl px-4 py-3.5 text-sm leading-relaxed text-left whitespace-pre-wrap ${isUser ? 'bg-primary text-white shadow-md rounded-br-sm' : 'bg-background-tertiary border border-border-light text-text-primary rounded-bl-sm shadow-sm'}`}>
                      {m.typing ? <div className="flex items-center gap-1.5 py-1 px-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{
                      animationDelay: '0ms'
                    }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{
                      animationDelay: '150ms'
                    }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{
                      animationDelay: '300ms'
                    }} />
                        </div> : <>
                          {m.content}
                          {Array.isArray(m.meta?.suggestedListings) && m.meta.suggestedListings.length > 0 ? <AuraSuggestedListingChips listings={m.meta.suggestedListings} /> : null}
                          {Array.isArray(m.meta?.dataSources) && m.meta.dataSources.length > 0 ? <div className="mt-3 flex flex-wrap gap-1 pt-2 border-t border-border-light">
                              {m.meta.dataSources.map(source => <span key={`${m.id}-${source.source}`} className="rounded bg-background-secondary px-2 py-0.5 text-[9px] font-bold font-mono text-text-muted border border-border-light">
                                  {source.source.toUpperCase()}:{source.status}
                                </span>)}
                            </div> : null}
                        </>}
                    </div>
                  </div>
                </div>;
          })}
          </PageContainer>
        </div>

        {/* Mobile quick prompts feed panel (only visible if prompts exist and screen is mobile) */}
        {showQuickPrompts && <div className="lg:hidden shrink-0 border-t border-border-light px-4 py-4 bg-background-secondary">
            <p className="text-caption font-bold text-text-muted uppercase tracking-wider mb-2">{t("suggested_questions")}</p>
            <AuraSuggestedPrompts disabled={isSending} onPick={msg => sendMessage({
          text: msg
        })} dense />
          </div>}

        {/* Floating Chat Input Section */}
        <div className="shrink-0 bg-transparent p-4 sm:p-6 pb-6 mt-auto">
          <div className="max-w-3xl mx-auto flex items-end gap-3 bg-surface-elevated shadow-lg rounded-2xl border border-border-light p-2 transition-all">
            <div className="flex-1 relative">
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder={t("type_a_message_or_ask_a_shopping_questio")} className="w-full resize-none rounded-xl bg-transparent px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-0 min-h-[44px] max-h-[120px]" rows={1} />
            </div>
            <button type="button" onClick={() => sendMessage()} disabled={isSending || !input.trim()} className="inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm hover:bg-primary-hover active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:active:scale-100 mb-0.5">
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
          <p className="mt-3 text-[9px] text-text-muted text-center font-medium">{t("aura_agent_will_guide_you_securely_verif")}</p>
        </div>
      </div>

      {/* ── 3. RIGHT PANEL (Listing Information Canvas) ───────── */}
      <div className={`
        ${rightPanelOpen ? 'w-80 border-l opacity-100 p-5' : 'w-0 border-l-0 opacity-0 p-0 pointer-events-none'}
        hidden lg:flex flex-col h-full bg-background-secondary border-border-light overflow-y-auto shrink-0 space-y-6 transition-all duration-300 ease-in-out z-25
      `}>
        
        {/* Active Product Analysis section */}
        {listing ? <div>
            <p className="text-caption font-bold text-text-muted uppercase tracking-wider mb-2">{t("workspace_context")}</p>
            <AuraListingContextCard listing={listing} />
          </div> : <div className="rounded-xl border border-border-light bg-background-primary p-4 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-text-primary font-bold text-xs">
              <Layers className="w-4 h-4 text-text-muted" />{t("general_workspace")}</div>
            <p className="text-caption text-text-secondary leading-normal">{t("no_product_is_currently_active_in_your_c")}</p>
          </div>}

        {/* Quick Suggestions Cards */}
        {showQuickPrompts && <div>
            <p className="text-caption font-bold text-text-muted uppercase tracking-wider mb-2">{t("suggested_queries")}</p>
            <AuraSuggestedPrompts disabled={isSending} onPick={msg => sendMessage({
          text: msg
        })} dense />
          </div>}

        {/* Secure shopping widget info */}
        <div className="rounded-xl border border-border-light bg-background-primary p-4 shadow-sm space-y-2">
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-primary font-bold text-xs">
              <Info className="w-4 h-4 text-text-muted" />{t("security_shield")}</div>
            <p className="text-caption text-text-secondary leading-normal">{t("for_secure_payments_always_checkout_usin")}</p>
          </div>
        </div>

      </div>

    </div>;
};
export default AuraChatPage;