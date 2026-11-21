import { AlertCircle, Check } from 'lucide-react';

// Shared by the listing and location forms so every field error and section looks the same.
export const FieldError = ({ error, id, className = '' }) => {
  if (!error) return null;
  return (
    <p role="alert" id={id} className={`mt-1.5 flex items-center gap-1.5 text-xs text-status-error-text ${className}`}>
      <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
      <span>{error}</span>
    </p>
  );
};

/**
 * One form section: title and description on the left, fields on the right from `lg` up (stacked below).
 * Put sections inside `SectionStack` so they get one divider between them instead of a card each.
 */
export const SectionCard = ({ title, description, children, className = '' }) => {
  const hasHeader = Boolean(title || description);
  return (
    <section className={`grid grid-cols-1 gap-x-8 gap-y-4 py-6 first:pt-0 last:pb-0 lg:grid-cols-3 ${className}`}>
      {hasHeader && (
        <div className="lg:pr-2">
          {title && <h3 className="text-sm font-semibold text-text-primary">{title}</h3>}
          {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
        </div>
      )}
      <div className={`min-w-0 ${hasHeader ? 'lg:col-span-2' : 'lg:col-span-3'}`}>{children}</div>
    </section>
  );
};

export const SectionStack = ({ children, className = '' }) => (
  <div className={`divide-y divide-border-light ${className}`}>{children}</div>
);

/** Checkbox as a selectable card: teal edge and check when on. `children` renders under the description. */
export const OptionToggle = ({ name, checked, onChange, label, description, children }) => (
  <label
    className={`flex cursor-pointer select-none items-start gap-3 rounded border p-3.5 transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-border-focus ${
      checked ? 'border-accent-teal bg-accent-teal-50 ring-1 ring-accent-teal' : 'border-border-light bg-background-primary hover:border-border'
    }`}
  >
    <input
      id={name}
      type="checkbox"
      name={name}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="sr-only"
    />
    <span
      aria-hidden
      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors duration-150 ${
        checked ? 'border-accent-teal bg-accent-teal text-white' : 'border-border bg-background-primary'
      }`}
    >
      {checked && <Check className="h-3 w-3" strokeWidth={2.5} />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-medium text-text-primary">{label}</span>
      {description && <span className="mt-0.5 block text-sm text-text-secondary">{description}</span>}
      {children}
    </span>
  </label>
);
