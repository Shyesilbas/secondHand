import React from 'react';

const EmptyState = ({
  icon: Icon,
  title = 'Nothing Found',
  description,
  children
}) => {
  return (
    <div className="p-8 text-center text-gray-500">
      {Icon && <Icon className="w-12 h-12 mx-auto mb-4 text-gray-300" />}
      <p>{title}</p>
      {description && <p className="text-sm">{description}</p>}
      {children}
    </div>
  );
};

export default EmptyState;
