import React from 'react';
import { cn, inputVariants } from '../../design-system';

const Input = React.forwardRef(({
  type = 'text',
  variant = 'default',
  size = 'md',
  disabled = false,
  error = false,
  className,
  ...props
}, ref) => {
  // Size classes - all meet 44px minimum touch target for chronic illness accessibility
  const sizeClasses = {
    sm: 'h-11 px-2 text-sm',  // 44px minimum
    md: 'h-11 px-3',         // 44px minimum
    lg: 'h-12 px-4 text-lg', // 48px for larger inputs
  };

  // Determine variant based on error state
  const inputVariant = error ? 'error' : variant;

  return (
    <input
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        inputVariants(inputVariant),
        sizeClasses[size],
        'reduced-motion text-comfortable', // Chronic illness accessibility
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
