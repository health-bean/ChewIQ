import React from 'react';
import { cn } from '../../design-system';

const EmptyState = ({ 
  icon: Icon,
  title,
  message,
  action,
  size = 'md',
  variant = 'default',
  className,
  ...props 
}) => {
  // Size options for different contexts
  const sizeClasses = {
    sm: {
      container: 'py-6',
      icon: 'w-8 h-8',
      title: 'text-base',
      message: 'text-sm'
    },
    md: {
      container: 'py-8',
      icon: 'w-12 h-12',
      title: 'text-lg',
      message: 'text-sm'
    },
    lg: {
      container: 'py-12',
      icon: 'w-16 h-16',
      title: 'text-xl',
      message: 'text-base'
    }
  };

  // Color variants using FILO colors
  const variantClasses = {
    default: {
      icon: 'text-neutral-300',
      title: 'text-neutral-600',
      message: 'text-neutral-500'
    },
    primary: {
      icon: 'text-primary-300',
      title: 'text-primary-700',
      message: 'text-primary-600'
    },
    success: {
      icon: 'text-sage-300',
      title: 'text-sage-700',
      message: 'text-sage-600'
    },
    warning: {
      icon: 'text-amber-300',
      title: 'text-amber-700',
      message: 'text-amber-600'
    },
    error: {
      icon: 'text-coral-300',
      title: 'text-coral-700',
      message: 'text-coral-600'
    }
  };

  const { container, icon: iconSize, title: titleSize, message: messageSize } = sizeClasses[size];
  const colors = variantClasses[variant];

  return (
    <div 
      className={cn(
        'empty-state',
        container,
        className
      )}
      {...props}
    >
      {Icon && (
        <Icon 
          className={cn(
            'empty-state-icon',
            iconSize,
            colors.icon
          )} 
        />
      )}
      
      {title && (
        <h3 className={cn(
          'empty-state-title font-medium mb-2 heading-comfortable',
          titleSize,
          colors.title
        )}>
          {title}
        </h3>
      )}
      
      {message && (
        <p className={cn(
          'empty-state-message text-readable',
          messageSize,
          colors.message
        )}>
          {message}
        </p>
      )}
      
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;