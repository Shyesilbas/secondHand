import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useAuthState } from '../../../auth/AuthContext.jsx';
import { getForumVisibilitySettings } from '../utils/forumVisibilitySettings.js';

const categoryLabel = {
  SUGGESTIONS: 'Öneriler',
  COMPLAINTS: 'Şikayetler',
};

export const ThreadComposerModal = ({ isOpen, onClose, category, onSubmit }) => {
  const { user } = useAuthState();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const catLabel = categoryLabel[category] || String(category || '');

  const canSubmit = useMemo(() => {
    return String(title || '').trim().length >= 3 && String(description || '').trim().length >= 3 && !submitting;
  }, [description, submitting, title]);

  const authorPreview = useMemo(() => {
    const authorVisibility = getForumVisibilitySettings().threadAuthorVisibility;
    const name = String(user?.name || '').trim();
    const surname = String(user?.surname || '').trim();
    if (authorVisibility === 'ANONYMOUS') return 'Anonymous';
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
        setError(res?.error || 'Unable to publish thread');
        setSubmitting(false);
        return;
      }
      reset();
      onClose?.();
    } catch (e) {
      setError(e?.message || 'Unable to publish thread');
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 tracking-tight truncate">New thread</p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{catLabel}</p>
          </div>
          <button
            type="button"
            className="h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 inline-flex items-center justify-center transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleClose}
            disabled={submitting}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              placeholder="Write a clear title"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[140px] rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              placeholder="Add details"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Author</label>
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2">
              <p className="text-xs text-slate-600">
                Preview:
                <span className="ml-2 font-semibold text-slate-900">by {authorPreview}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 bg-white flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
};

