const HeaderDropdownPanel = ({ children, className = '' }) => (
 <div className={`absolute top-full right-0 mt-2 w-56 rounded border border-border bg-background-primary shadow-md p-2 z-tooltip ${className}`}>
 {children}
 </div>
);

export default HeaderDropdownPanel;
