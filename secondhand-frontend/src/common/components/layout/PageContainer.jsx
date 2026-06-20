const PageContainer = ({ children, className = '', narrow = false, full = false }) => {
  const hasCustomMaxWidth = className.includes('max-w-');
  const width = full
    ? 'w-full'
    : narrow
    ? 'max-w-3xl'
    : hasCustomMaxWidth
    ? ''
    : 'max-w-7xl';

  return (
    <div className={`${width} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
