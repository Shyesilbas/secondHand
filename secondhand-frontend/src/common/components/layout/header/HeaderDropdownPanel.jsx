const HeaderDropdownPanel = ({ children, className = '' }) => (
 <div className={`absolute top-full right-0 mt-2 w-56 bg-background-primary rounded-md shadow-md border border-border-light/50 p-2 z-tooltip ${className}`}>
 {children}
 </div>
);

export default HeaderDropdownPanel;
