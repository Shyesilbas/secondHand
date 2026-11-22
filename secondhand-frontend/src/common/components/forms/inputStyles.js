// Field classes for inputs, selects and textareas (1px border, rounded ceiling, 2px focus ring).
const inputCore = 'rounded border bg-background-primary px-3 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus';
const inputBase = `w-full py-2 ${inputCore}`;
export const inputNormal = `${inputBase} border-border hover:border-card-border-hover focus:border-border-focus`;
export const inputError = `${inputBase} border-status-error focus:border-status-error focus:ring-status-error-border`;
export const selectCompact = `h-9 w-auto shrink-0 py-1 font-medium text-text-secondary ${inputCore} border-border hover:border-card-border-hover focus:border-border-focus`;
