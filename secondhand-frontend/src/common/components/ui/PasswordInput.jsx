import React, {useState} from 'react';
import {Eye as EyeIcon, EyeOff as EyeSlashIcon} from 'lucide-react';

const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">
        {label} {required && <span className="text-status-error">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={isVisible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 ${error ? 'border-status-error-border bg-status-error-bg focus:ring-status-error' : 'border-header-border bg-background-primary hover:border-border-DEFAULT'}`}
      />
      <button
        type="button"
        className="absolute right-3 top-9 text-text-muted hover:text-text-secondary transition-colors"
        onClick={() => setIsVisible(prev => !prev)}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
      >
        {isVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
      {error && (
        <p className="text-sm text-status-error mt-1">{error}</p>
      )}
    </div>
  );
};

export default PasswordInput;


