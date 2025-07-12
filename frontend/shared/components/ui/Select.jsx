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
  // Size classes
  const sizeClasses = {
    sm: 'h-8 px-2 text-sm',
    md: 'h-10 px-3',
    lg: 'h-12 px-4 text-lg',
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
          'appearance-none bg-white pr-8 cursor-pointer',
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
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <ChevronDown 
          className={cn(
            'h-4 w-4 text-gray-400',
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
