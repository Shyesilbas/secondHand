
const ErrorMessage = ({ message, className = '' }) => {
    if (!message) return null;
    
    return (
        <div className={`mb-6 p-4 bg-status-error-bg border border-status-error-border rounded-lg ${className}`}>
            <p className="text-status-error">{message}</p>
        </div>
    );
};

export default ErrorMessage;
