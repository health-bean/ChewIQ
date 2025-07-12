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
  // Size classes
  const sizeClasses = {
    sm: 'h-8 px-2 text-sm',
    md: 'h-10 px-3',
    lg: 'h-12 px-4 text-lg',
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
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
