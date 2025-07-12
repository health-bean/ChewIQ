import React from 'react';
import { cn } from '../../design-system';

const FormField = ({
  label,
  error,
  hint,
  required = false,
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {hint && !error && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormField;
