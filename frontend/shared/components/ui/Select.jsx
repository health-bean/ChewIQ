import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn, inputVariants } from '../../design-system';

const Select = React.forwardRef(({
  variant = 'default',
  size = 'md',
  disabled = false,
  error = false,
  placeholder = 'Select an option...',
  children,
  className,
  ...props
}, ref) => {
  // Size classes - all meet 44px minimum touch target for chronic illness accessibility
  const sizeClasses = {
    sm: 'h-11 px-2 text-sm',  // 44px minimum
    md: 'h-11 px-3',         // 44px minimum
    lg: 'h-12 px-4 text-lg', // 48px for larger selects
  };

  // Determine variant based on error state
  const selectVariant = error ? 'error' : variant;

  return (
    <div className="relative">
      <select
        ref={ref}
        disabled={disabled}
        className={cn(
          inputVariants(selectVariant),
          sizeClasses[size],
          'appearance-none pr-8 cursor-pointer reduced-motion text-comfortable',
          disabled && 'cursor-not-allowed',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      
      {/* Custom dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex-center pr-2 pointer-events-none">
        <ChevronDown 
          className={cn(
            'h-4 w-4 text-neutral-400',
            disabled && 'opacity-50'
          )} 
        />
      </div>
    </div>
  );
});

Select.displayName = 'Select';

// Option component for better composition
const SelectOption = ({ children, ...props }) => (
  <option {...props}>
    {children}
  </option>
);

Select.Option = SelectOption;

export default Select;
