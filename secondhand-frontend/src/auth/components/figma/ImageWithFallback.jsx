import React from 'react';

export const ImageWithFallback = ({ src, alt, className = '' }) => {
    const [hasError, setHasError] = React.useState(false);

    if (hasError) {
        return (
            <div className={`bg-slate-200/40 ${className}`} aria-label={alt} />
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
        />
    );
};
