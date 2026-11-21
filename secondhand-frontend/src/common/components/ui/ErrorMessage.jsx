
const ErrorMessage = ({ message, className = '' }) => {
 if (!message) return null;
 
 return (
 <div role="alert" className={`mb-6 rounded border border-status-error-border bg-status-error-bg p-4 ${className}`}>
 <p className="text-sm text-status-error-text">{message}</p>
 </div>
 );
};

export default ErrorMessage;
