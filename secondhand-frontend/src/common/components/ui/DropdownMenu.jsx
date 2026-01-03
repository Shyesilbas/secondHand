import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DropdownMenu = ({
    trigger,
    children,
    className = '',
    align = 'left',
    showChevron = true,
    menuClassName = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            if (menuRef.current && align === 'right') {
                const rect = menuRef.current.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                if (rect.right > viewportWidth) {
                    menuRef.current.style.right = '0';
                    menuRef.current.style.left = 'auto';
                }
            }
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, align]);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-text-secondary hover:text-btn-primary transition-colors cursor-pointer"
            >
                <span className="flex items-center">{trigger}</span>
                {showChevron && (
                    <svg
                        className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </div>

            {isOpen && (
                <div
                    ref={menuRef}
                    className={`absolute top-full ${align === 'right' ? 'right-0' : 'left-0'} mt-2 w-56 bg-background-primary rounded-lg shadow-lg border border-sidebar-border py-2 z-50 ${menuClassName || ''}`}
                    style={{
                        maxWidth: 'min(100vw - 2rem, 14rem)'
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

const DropdownItem = ({ to, children, onClick, icon }) => {
    if (to) {
        return (
            <Link
                to={to}
                className="flex items-center px-4 py-2 text-sm text-text-secondary hover:bg-blue-50 hover:text-btn-primary transition-colors"
            >
                {icon && <span className="mr-3">{icon}</span>}
                {children}
            </Link>
        );
    }

    return (
        <button
            onClick={onClick}
            className="flex items-center w-full px-4 py-2 text-sm text-text-secondary hover:bg-blue-50 hover:text-btn-primary transition-colors text-left"
        >
            {icon && <span className="mr-3">{icon}</span>}
            {children}
        </button>
    );
};

const DropdownDivider = () => (
    <div className="border-t border-sidebar-border my-1" />
);

const DropdownDividerWhite = () => (
    <div className="border-t border-white/10 my-1" />
);

export { DropdownMenu, DropdownItem, DropdownDivider, DropdownDividerWhite };
export default DropdownMenu;