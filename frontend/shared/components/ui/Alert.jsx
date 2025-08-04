import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn, getSemanticColor } from '../../design-system';

const Alert = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
  ...props
}) => {
  // FILO semantic color variants - chronic illness friendly
  const variants = {
    info: {
      container: 'border-primary-200 bg-primary-50 text-primary-800',
      icon: 'text-primary-600',
      IconComponent: Info,
      dismissButton: 'text-primary-500 hover:bg-primary-100 focus:ring-primary-600',
    },
    success: {
      container: 'border-sage-200 bg-sage-50 text-sage-800',
      icon: 'text-sage-600',
      IconComponent: CheckCircle,
      dismissButton: 'text-sage-500 hover:bg-sage-100 focus:ring-sage-600',
    },
    warning: {
      container: 'border-amber-200 bg-amber-50 text-amber-800',
      icon: 'text-amber-600',
      IconComponent: AlertTriangle,
      dismissButton: 'text-amber-500 hover:bg-amber-100 focus:ring-amber-600',
    },
    error: {
      container: 'border-coral-200 bg-coral-50 text-coral-800',
      icon: 'text-coral-600',
      IconComponent: AlertCircle,
      dismissButton: 'text-coral-500 hover:bg-coral-100 focus:ring-coral-600',
    },
  };

  const { container, icon, IconComponent, dismissButton } = variants[variant];

  return (
    <div
      className={cn(
        'rounded-lg border p-4 reduced-motion',
        container,
        className
      )}
      {...props}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent className={cn('h-5 w-5', icon)} />
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          
          <div className="text-sm">
            {children}
          </div>
        </div>
        
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={cn(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 touch-target transition-standard reduced-motion',
                  dismissButton
                )}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
