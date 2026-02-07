
const LoadingIndicator = ({ size = 'h-6 w-6', className = '' }) => {
  return (
    <div className={`animate-spin rounded-full ${size} border-b-2 border-blue-500 mx-auto ${className}`}></div>
  );
};

export default LoadingIndicator;



