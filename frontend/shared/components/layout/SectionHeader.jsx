import React from 'react';
import { cn } from '../../design-system';

const SectionHeader = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  variant = 'default',
  children,
  className,
  ...props 
}) => {
  // FILO variant styles for different section types
  const variantStyles = {
    default: 'border-neutral-200 bg-neutral-100',
    info: 'border-primary-200 bg-primary-50',
    success: 'border-sage-200 bg-sage-50',
    warning: 'border-amber-200 bg-amber-50',
    error: 'border-coral-200 bg-coral-50',
    feature: 'border-primary-200 bg-primary-50',
    health: 'border-accent-200 bg-accent-50'
  };

  const textStyles = {
    default: 'text-neutral-800',
    info: 'text-primary-800',
    success: 'text-sage-800',
    warning: 'text-amber-800',
    error: 'text-coral-800',
    feature: 'text-primary-800',
    health: 'text-accent-800'
  };

  const iconStyles = {
    default: 'text-neutral-600',
    info: 'text-primary-600',
    success: 'text-sage-600',
    warning: 'text-amber-600',
    error: 'text-coral-600',
    feature: 'text-primary-600',
    health: 'text-accent-600'
  };

  return (
    <div 
      className={cn(
        'flex-between p-4 border-b reduced-motion',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <div className="flex-start tight-spacing">
        {Icon && (
          <Icon className={cn('w-5 h-5', iconStyles[variant])} />
        )}
        <div>
          <h3 className={cn(
            'text-lg font-semibold heading-comfortable',
            textStyles[variant]
          )}>
            {title}
          </h3>
          {subtitle && (
            <p className={cn(
              'text-sm text-readable mt-1',
              variant === 'default' ? 'text-neutral-600' : `${textStyles[variant]} opacity-80`
            )}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex-center tight-spacing">
          {children}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;