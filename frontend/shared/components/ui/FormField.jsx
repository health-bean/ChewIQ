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
    <div className={cn('form-spacing', className)} {...props}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-coral-500 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {hint && !error && (
        <p className="form-hint">{hint}</p>
      )}
      
      {error && (
        <p className="form-error">{error}</p>
      )}
    </div>
  );
};

export default FormField;
