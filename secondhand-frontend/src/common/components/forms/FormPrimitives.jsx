import { AlertCircle } from 'lucide-react';

// Shared by the listing and location forms so every field error and section looks the same.
export const FieldError = ({ error }) => {
  if (!error) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-status-error">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
      {error}
    </p>
  );
};

export const SectionCard = ({ title, description, icon: Icon, children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {(title || description) && (
      <div className="border-b border-border-light pb-2.5">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-text-secondary" strokeWidth={1.5} aria-hidden />}
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{title}</h3>
        </div>
        {description && <p className="mt-0.5 text-xs text-text-muted">{description}</p>}
      </div>
    )}
    <div>{children}</div>
  </div>
);
