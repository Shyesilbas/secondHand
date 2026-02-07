
const BackButton = ({ onClick, className = '', children = 'Go Back' }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center text-text-secondary hover:text-text-primary transition-colors mb-4 ${className}`}
        >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {children}
        </button>
    );
};

export default BackButton;
