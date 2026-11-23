const HeaderDropdownPanel = ({ children, className = '' }) => (
  <div
    className={`absolute right-0 top-full z-tooltip mt-2 w-60 rounded border border-border bg-background-primary p-1.5 shadow-md ${className}`.trim()}
  >
    {children}
  </div>
);

export default HeaderDropdownPanel;
