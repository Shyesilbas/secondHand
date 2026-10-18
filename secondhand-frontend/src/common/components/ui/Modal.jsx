import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const SIZES = {
 sm: 'max-w-md',
 md: 'max-w-lg',
 lg: 'max-w-2xl',
 xl: 'max-w-4xl',
 '2xl': 'max-w-6xl',
};

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

// Shared dialog shell: Esc and backdrop close it, focus moves in and stays inside while open.
// Esc is handled on the panel and stopped there, so a dialog opened from another dialog closes alone.
// `header` replaces the default title row; `title` still names the dialog for screen readers.
const Modal = ({ isOpen, onClose, title, description, header, footer, size = 'md', children }) => {
 const panelRef = useRef(null);

 useEffect(() => {
 if (!isOpen) return;
 const previous = document.activeElement;
 const overflow = document.body.style.overflow;
 document.body.style.overflow = 'hidden';
 // Keep focus on an autoFocus field inside the dialog; otherwise focus the panel itself.
 if (!panelRef.current?.contains(previous)) panelRef.current?.focus();
 return () => {
 document.body.style.overflow = overflow;
 previous?.focus?.();
 };
 }, [isOpen]);

 if (!isOpen) return null;

 const handleKeyDown = (e) => {
 if (e.key === 'Escape') {
 e.stopPropagation();
 onClose();
 return;
 }
 if (e.key !== 'Tab') return;
 const items = panelRef.current.querySelectorAll(FOCUSABLE);
 if (!items.length) return;
 const first = items[0];
 const last = items[items.length - 1];
 if (e.shiftKey && document.activeElement === first) {
 e.preventDefault();
 last.focus();
 } else if (!e.shiftKey && document.activeElement === last) {
 e.preventDefault();
 first.focus();
 }
 };

 return createPortal(
 <div
 className="fixed inset-0 z-modal flex items-center justify-center bg-black/40 p-4"
 onMouseDown={(e) => e.target === e.currentTarget && onClose()}
 >
 <div
 ref={panelRef}
 role="dialog"
 aria-modal="true"
 aria-label={title}
 tabIndex={-1}
 onKeyDown={handleKeyDown}
 className={`flex max-h-[90vh] w-full ${SIZES[size]} flex-col rounded-md border border-border bg-background-primary shadow-md outline-none`}
 >
 {header || (title ? (
 <header className="flex items-center justify-between gap-4 border-b border-border-light px-5 py-4">
 <div className="min-w-0">
 <h2 className="truncate text-lg font-semibold text-text-primary">{title}</h2>
 {description ? <p className="mt-0.5 truncate text-sm text-text-secondary">{description}</p> : null}
 </div>
 <button
 type="button"
 onClick={onClose}
 aria-label="Close"
 className="rounded p-2 text-text-tertiary transition-colors hover:bg-background-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
 >
 <X className="h-4 w-4" strokeWidth={1.5} />
 </button>
 </header>
 ) : null)}
 <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
 {footer ? <footer className="flex justify-end gap-2 border-t border-border-light px-5 py-4">{footer}</footer> : null}
 </div>
 </div>,
 document.body
 );
};

export default Modal;
