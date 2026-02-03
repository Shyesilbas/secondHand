import React, {useMemo, useState} from 'react';
import {X} from 'lucide-react';
import {
  getForumVisibilitySettings,
  setForumCommentAuthorVisibility,
  setForumThreadAuthorVisibility,
} from '../utils/forumVisibilitySettings.js';

const normalize = (value) => (value === 'DISPLAY_NAME' ? 'DISPLAY_NAME' : 'ANONYMOUS');

const ChoiceButton = ({ active, disabled, onClick, children }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-10 rounded-lg border px-3 text-sm font-semibold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
        active ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
};

export const ForumVisibilitySettingsModal = ({ isOpen, onClose }) => {
  const initial = useMemo(() => getForumVisibilitySettings(), []);
  const [threadVisibility, setThreadVisibility] = useState(normalize(initial.threadAuthorVisibility));
  const [commentVisibility, setCommentVisibility] = useState(normalize(initial.commentAuthorVisibility));

  const handleClose = () => {
    onClose?.();
  };

  const setThread = (v) => {
    const next = normalize(v);
    setThreadVisibility(next);
    setForumThreadAuthorVisibility(next);
  };

  const setComment = (v) => {
    const next = normalize(v);
    setCommentVisibility(next);
    setForumCommentAuthorVisibility(next);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 tracking-tight truncate">Forum settings</p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">Choose how your name appears when posting</p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">! Updates not effects the current threads or comments</p>
          </div>
          <button
            type="button"
            className="h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 inline-flex items-center justify-center transition-colors duration-300"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">New thread author</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ChoiceButton active={threadVisibility === 'ANONYMOUS'} onClick={() => setThread('ANONYMOUS')}>
                Anonymous
              </ChoiceButton>
              <ChoiceButton active={threadVisibility === 'DISPLAY_NAME'} onClick={() => setThread('DISPLAY_NAME')}>
                Display name
              </ChoiceButton>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Comment author</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ChoiceButton active={commentVisibility === 'ANONYMOUS'} onClick={() => setComment('ANONYMOUS')}>
                Anonymous
              </ChoiceButton>
              <ChoiceButton active={commentVisibility === 'DISPLAY_NAME'} onClick={() => setComment('DISPLAY_NAME')}>
                Display name
              </ChoiceButton>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 bg-white flex items-center justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors duration-300"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

