import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DropdownMenu = ({ trigger, children, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-1 text-text-secondary hover:text-btn-primary transition-colors"
            >
                <span>{trigger}</span>
                <svg
                    className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-sidebar-border py-2 z-50">
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

export { DropdownMenu, DropdownItem, DropdownDivider };
export default DropdownMenu;