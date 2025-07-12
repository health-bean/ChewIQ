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
  // Size classes
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        buttonVariants(variant),
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
