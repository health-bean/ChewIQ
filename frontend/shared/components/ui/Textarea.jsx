import React from 'react';
import { cn, inputVariants } from '../../design-system';

const Textarea = React.forwardRef(({
  variant = 'default',
  disabled = false,
  error = false,
  rows = 3,
  resize = 'vertical',
  className,
  ...props
}, ref) => {
  // Resize options
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  // Determine variant based on error state
  const textareaVariant = error ? 'error' : variant;

  return (
    <textarea
      ref={ref}
      rows={rows}
      disabled={disabled}
      className={cn(
        inputVariants(textareaVariant),
        'min-h-[80px] py-2',
        resizeClasses[resize],
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
