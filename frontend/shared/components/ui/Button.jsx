import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn, buttonVariants } from '../../design-system';

const Button = React.forwardRef(({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  children,
  className,
  ...props
}, ref) => {
  // Size classes - all meet 44px minimum touch target for chronic illness accessibility
  const sizeClasses = {
    sm: 'h-11 px-3 text-sm',  // 44px minimum
    md: 'h-11 px-4',         // 44px minimum
    lg: 'h-12 px-6 text-lg', // 48px for larger buttons
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        buttonVariants(variant),
        sizeClasses[size],
        'reduced-motion', // Support for reduced motion preferences
        className
      )}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin reduced-motion" />
      )}
      {Icon && !loading && (
        <Icon className="mr-2 h-4 w-4" />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
