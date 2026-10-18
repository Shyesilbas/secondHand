
const ErrorMessage = ({ message, className = '' }) => {
 if (!message) return null;
 
 return (
 <div className={`mb-6 p-4 bg-background-secondary border border-border rounded ${className}`}>
 <p className="text-status-error">{message}</p>
 </div>
 );
};

export default ErrorMessage;
