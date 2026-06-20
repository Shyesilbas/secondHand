import { Link, useLocation } from 'react-router-dom';

const HeaderNavLink = ({ to, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to || location.pathname.startsWith(to.split('?')[0]);

    return (
        <Link
            to={to}
            className={`text-sm font-medium px-3.5 py-2 rounded-lg transition-all duration-200 ${
                isActive
                    ? 'text-text-primary bg-tertiary'
                    : 'text-text-muted hover:text-text-primary hover:bg-secondary'
            }`}
        >
            {children}
        </Link>
    );
};

export default HeaderNavLink;
