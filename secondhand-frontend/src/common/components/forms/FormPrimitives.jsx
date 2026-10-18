import { AlertCircle } from 'lucide-react';

// Shared by the listing and location forms so every field error and section looks the same.
export const FieldError = ({ error }) => {
 if (!error) return null;
 return <p className="mt-1 flex items-center gap-1 text-xs text-status-error-text">
 <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
 {error}
 </p>;
};

export const SectionCard = ({ title, description, icon: Icon, children }) => (
 <div className="rounded border border-border bg-background-primary">
 <div className="flex items-center gap-3 border-b border-border-light px-5 py-4">
 {Icon && <Icon className="h-5 w-5 shrink-0 text-text-secondary" strokeWidth={1.5} aria-hidden />}
 <div>
 <h3 className="text-sm font-medium text-text-primary">{title}</h3>
 {description && <p className="mt-0.5 text-xs text-text-secondary">{description}</p>}
 </div>
 </div>
 <div className="p-5 sm:p-6">{children}</div>
 </div>
);
