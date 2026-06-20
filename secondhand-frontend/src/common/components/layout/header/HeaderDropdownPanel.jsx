const HeaderDropdownPanel = ({ children, className = '' }) => (
    <div className={`absolute top-full right-0 mt-2 w-56 bg-background-primary/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border-light/50 p-2 z-50 ${className}`}>
        {children}
    </div>
);

export default HeaderDropdownPanel;
