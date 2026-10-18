import { FORUM_DEFAULTS, FORUM_REACTIONS } from '../forumConstants.js';

export const clampReaction = (v) => (v === FORUM_REACTIONS.LIKE || v === FORUM_REACTIONS.DISLIKE ? v : null);

export const reactionToRequest = (reaction) => clampReaction(reaction) || FORUM_REACTIONS.CLEAR;

// Accepts both Spring pages and plain arrays; a short page without totals means it was the last one.
const normalizePage = (pageData) => {
 const content = Array.isArray(pageData?.content) ? pageData.content : Array.isArray(pageData) ? pageData : [];
 const number = Number.isFinite(Number(pageData?.number)) ? Number(pageData.number) : 0;
 const size = Number.isFinite(Number(pageData?.size)) ? Number(pageData.size) : FORUM_DEFAULTS.PAGE_SIZE;
 const totalPages = Number.isFinite(Number(pageData?.totalPages)) ? Number(pageData.totalPages) : (content.length < size ? number + 1 : number + 2);
 return { content, number, totalPages };
};

export const nextPageParam = (lastPage) => {
 const { number, totalPages } = normalizePage(lastPage);
 return number + 1 < totalPages ? number + 1 : undefined;
};

export const flattenPages = (data) => data?.pages.flatMap((page) => normalizePage(page).content) || [];
