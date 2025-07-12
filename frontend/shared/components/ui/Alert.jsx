import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn, cardVariants } from '../../design-system';

const Alert = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
  ...props
}) => {
  const variants = {
    info: {
      container: 'border-blue-200 bg-blue-50 text-blue-800',
      icon: 'text-blue-600',
      IconComponent: Info,
    },
    success: {
      container: 'border-green-200 bg-green-50 text-green-800',
      icon: 'text-green-600',
      IconComponent: CheckCircle,
    },
    warning: {
      container: 'border-yellow-200 bg-yellow-50 text-yellow-800',
      icon: 'text-yellow-600',
      IconComponent: AlertTriangle,
    },
    error: {
      container: 'border-red-200 bg-red-50 text-red-800',
      icon: 'text-red-600',
      IconComponent: AlertCircle,
    },
  };

  const { container, icon, IconComponent } = variants[variant];

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
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
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  variant === 'info' && 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600',
                  variant === 'success' && 'text-green-500 hover:bg-green-100 focus:ring-green-600',
                  variant === 'warning' && 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600',
                  variant === 'error' && 'text-red-500 hover:bg-red-100 focus:ring-red-600'
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
