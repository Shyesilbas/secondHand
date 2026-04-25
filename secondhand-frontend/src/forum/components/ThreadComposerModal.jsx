import React, {useMemo, useState} from 'react';
import {X, Send, Sparkles, AlertTriangle} from 'lucide-react';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {getForumVisibilitySettings} from '../utils/forumVisibilitySettings.js';
import {FORUM_AUTHOR_VISIBILITY, FORUM_CATEGORIES, FORUM_MESSAGES} from '../forumConstants.js';

const categoryConfig = {
  [FORUM_CATEGORIES.SUGGESTIONS]: {label: 'Suggestion', icon: Sparkles, color: 'from-amber-500 to-orange-500'},
  [FORUM_CATEGORIES.COMPLAINTS]: {label: 'Complaint', icon: AlertTriangle, color: 'from-red-500 to-rose-500'},
};

export const ThreadComposerModal = ({isOpen, onClose, category, onSubmit}) => {
  const {user} = useAuthState();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const catConfig = categoryConfig[category] || categoryConfig[FORUM_CATEGORIES.SUGGESTIONS];
  const CatIcon = catConfig.icon;

  const canSubmit = useMemo(() => {
    return String(title || '').trim().length >= 3 && String(description || '').trim().length >= 3 && !submitting;
  }, [description, submitting, title]);

  const authorPreview = useMemo(() => {
    const authorVisibility = getForumVisibilitySettings().threadAuthorVisibility;
    const name = String(user?.name || '').trim();
    const surname = String(user?.surname || '').trim();
    if (authorVisibility === FORUM_AUTHOR_VISIBILITY.ANONYMOUS) return 'Anonymous';
    const initial = surname ? `${surname.slice(0, 1).toUpperCase()}.` : '';
    const display = `${name}${initial ? ` ${initial}` : ''}`.trim();
    return display || 'User';
  }, [user?.name, user?.surname]);

  const reset = () => {
    setTitle('');
    setDescription('');
    setError('');
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose?.();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await onSubmit?.({
        category,
        title: String(title || '').trim(),
        description: String(description || '').trim(),
      });
      if (res?.ok === false) {
        setError(res?.error || FORUM_MESSAGES.PUBLISH_THREAD_FAILED);
        setSubmitting(false);
        return;
      }
      reset();
      onClose?.();
    } catch (e) {
      setError(e?.message || FORUM_MESSAGES.PUBLISH_THREAD_FAILED);
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const titleLen = String(title || '').trim().length;
  const descLen = String(description || '').trim().length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header with gradient accent */}
        <div className="relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r ${catConfig.color} opacity-10`} />
          <div className="relative px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${catConfig.color} flex items-center justify-center shadow-lg`}>
                <CatIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">{FORUM_MESSAGES.NEW_THREAD}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{catConfig.label}</p>
              </div>
            </div>
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 inline-flex items-center justify-center transition-all duration-200 disabled:opacity-50"
              onClick={handleClose}
              disabled={submitting}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</label>
              <span className={`text-[11px] tabular-nums font-medium ${titleLen >= 3 ? 'text-gray-400' : 'text-amber-500'}`}>{titleLen}/3 min</span>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50/60 px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 focus:bg-white transition-all duration-200"
              placeholder="Write a clear, descriptive title"
              disabled={submitting}
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</label>
              <span className={`text-[11px] tabular-nums font-medium ${descLen >= 3 ? 'text-gray-400' : 'text-amber-500'}`}>{descLen}/3 min</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[140px] rounded-xl border border-gray-200 bg-gray-50/60 p-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 focus:bg-white transition-all duration-200 resize-none"
              placeholder="Add details about your thread..."
              disabled={submitting}
            />
          </div>

          {/* Author preview */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-xs font-bold text-violet-700">
              {authorPreview.charAt(0).toUpperCase()}
            </div>
            <div className="text-xs text-gray-500">
              Posting as <span className="font-semibold text-gray-800">{authorPreview}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {FORUM_MESSAGES.CLOSE}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {FORUM_MESSAGES.PUBLISHING}
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                {FORUM_MESSAGES.PUBLISH}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
