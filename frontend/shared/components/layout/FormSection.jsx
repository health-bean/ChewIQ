import React from 'react';
import { cn } from '../../design-system';

const FormSection = ({ 
  title, 
  description,
  children, 
  className,
  spacing = 'default',
  ...props 
}) => {
  // Spacing options for different form contexts
  const spacingClasses = {
    tight: 'tight-spacing',
    default: 'form-spacing',
    comfortable: 'card-spacing'
  };

  return (
    <div 
      className={cn(
        spacingClasses[spacing],
        className
      )} 
      {...props}
    >
      {(title || description) && (
        <div className="mb-3">
          {title && (
            <h4 className="form-label text-base font-medium">
              {title}
            </h4>
          )}
          {description && (
            <p className="form-hint mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default FormSection;