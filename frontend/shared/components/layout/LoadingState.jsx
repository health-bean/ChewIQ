import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../design-system';

const LoadingState = ({ 
  message = 'Loading...',
  size = 'md',
  variant = 'default',
  className,
  ...props 
}) => {
  // Size options for different contexts
  const sizeClasses = {
    sm: {
      container: 'py-4',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    md: {
      container: 'py-8',
      icon: 'w-6 h-6',
      text: 'text-base'
    },
    lg: {
      container: 'py-12',
      icon: 'w-8 h-8',
      text: 'text-lg'
    }
  };

  // Color variants using FILO colors
  const variantClasses = {
    default: 'text-neutral-500',
    primary: 'text-primary-600',
    success: 'text-sage-600',
    warning: 'text-amber-600',
    error: 'text-coral-600'
  };

  const { container, icon, text } = sizeClasses[size];

  return (
    <div 
      className={cn(
        'flex-col-center text-center',
        container,
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <Loader2 
        className={cn(
          icon,
          'animate-spin mb-3 reduced-motion'
        )} 
      />
      <p className={cn(text, 'text-comfortable')}>
        {message}
      </p>
    </div>
  );
};

export default LoadingState;