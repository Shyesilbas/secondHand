// Field classes for inputs, selects and textareas (DESIGN.md: 1px border, rounded, 2px focus ring).
const inputBase = 'w-full rounded border bg-background-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus';
export const inputNormal = `${inputBase} border-border hover:border-card-border-hover focus:border-border-focus`;
export const inputError = `${inputBase} border-status-error focus:border-status-error`;
