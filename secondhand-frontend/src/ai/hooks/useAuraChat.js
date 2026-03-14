import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { aiChatService } from '../services/aiChatService.js';
import { createAuraChatId, createChatMessage, getApiErrorMessage, getAuraChatStorageKey } from '../utils/auraChatUtils.js';

export const useAuraChat = ({
  userId,
  isAuthenticated,
  initialMessages = [],
  withTyping = false,
  buildPayload = (text) => text,
  sendApi = null,
  echoUserMessageWhenUnauthed = false,
}) => {
  const [messages, setMessages] = useState(() => initialMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const listRef = useRef(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const storageKey = useMemo(() => getAuraChatStorageKey(userId), [userId]);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    queueMicrotask(scrollToBottom);
  }, [messages.length, scrollToBottom]);

  const addTyping = useCallback(() => {
    const id = createAuraChatId('typing');
    setMessages((prev) => [
      ...prev,
      {
        id,
        role: 'assistant',
        content: '',
        typing: true,
        createdAt: Date.now(),
      },
    ]);
    return id;
  }, []);

  const removeTyping = useCallback((typingId) => {
    if (!typingId) {
      setMessages((prev) => prev.filter((m) => !m.typing));
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== typingId));
  }, []);

  const replaceTypingWith = useCallback((typingId, content, meta) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === typingId);
      const without = idx >= 0 ? prev.filter((_, i) => i !== idx) : prev;
      return [...without, createChatMessage({ role: 'assistant', content, meta })];
    });
  }, []);

  const appendAssistant = useCallback((content, meta) => {
    setMessages((prev) => [...prev, createChatMessage({ role: 'assistant', content, meta })]);
  }, []);

  const sendMessage = useCallback(
    async ({ text, includeUserMessage = true, includeTyping = withTyping } = {}) => {
      const baseText = text != null ? text : input;
      const trimmed = (baseText || '').trim();
      if (!trimmed || isSending) return;

      const authed = !!isAuthenticated && userId != null;
      if (!authed) {
        if (echoUserMessageWhenUnauthed && includeUserMessage) {
          setMessages((prev) => [...prev, createChatMessage({ role: 'user', content: trimmed })]);
        }
        setInput('');
        appendAssistant('Please log in to continue this chat.');
        return;
      }

      if (includeUserMessage) {
        setMessages((prev) => [...prev, createChatMessage({ role: 'user', content: trimmed })]);
      }
      setInput('');
      setIsSending(true);

      const typingId = includeTyping ? addTyping() : null;

      try {
        const payload = buildPayload(trimmed);
        const response = sendApi
          ? await sendApi(payload)
          : await aiChatService.chat(
              typeof payload === 'object' && payload != null
                ? { message: payload.message, context: payload.context }
                : { message: payload }
            );
        const answer = response?.answer || response?.message || 'No response.';
        const dataSources = Array.isArray(response?.dataSources) ? response.dataSources : undefined;
        const meta = dataSources?.length ? { dataSources } : undefined;

        if (typingId) {
          replaceTypingWith(typingId, answer, meta);
        } else {
          appendAssistant(answer, meta);
        }
      } catch (e) {
        if (typingId) {
          removeTyping(typingId);
        }
        const errorMessage = getApiErrorMessage(
          e,
          'An error occurred while sending your message. Please try again later.'
        );
        appendAssistant(errorMessage);
      } finally {
        setIsSending(false);
      }
    },
    [
      addTyping,
      appendAssistant,
      buildPayload,
      echoUserMessageWhenUnauthed,
      input,
      isAuthenticated,
      isSending,
      removeTyping,
      replaceTypingWith,
      sendApi,
      userId,
      withTyping,
    ]
  );

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  return {
    storageKey,
    messages,
    setMessages,
    messagesRef,
    input,
    setInput,
    isSending,
    setIsSending,
    listRef,
    scrollToBottom,
    sendMessage,
    onKeyDown,
  };
};

