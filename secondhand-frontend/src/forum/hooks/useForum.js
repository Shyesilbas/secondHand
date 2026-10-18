import { useCallback, useState } from 'react';
import { useForumThreads } from './useForumThreads.js';
import { useForumThread } from './useForumThread.js';

/** Forum page state: the thread list plus the selected thread; selection is the only shared concern. */
export const useForum = () => {
 const [selectedThreadId, setSelectedThreadId] = useState(null);
 const list = useForumThreads();
 const detail = useForumThread(selectedThreadId);
 const selectedThread = detail.thread || list.threads.find((t) => t?.id === selectedThreadId) || null;

 const publishThread = useCallback(async (input) => {
 const res = await list.publishThread(input);
 if (res.ok) setSelectedThreadId(res.data.id);
 return res;
 }, [list]);

 const deleteThread = useCallback(async (threadId) => {
 const res = await list.deleteThread(threadId);
 if (res.ok && threadId === selectedThreadId) setSelectedThreadId(null);
 return res;
 }, [list, selectedThreadId]);

 const reactToThread = useCallback((threadId, reaction) => {
 const thread = threadId === selectedThread?.id ? selectedThread : list.threads.find((t) => t?.id === threadId);
 return list.reactToThread(thread || { id: threadId }, reaction);
 }, [list, selectedThread]);

 return {
 ...list,
 ...detail,
 selectedThreadId,
 selectedThread,
 selectThread: setSelectedThreadId,
 publishThread,
 deleteThread,
 reactToThread,
 };
};
