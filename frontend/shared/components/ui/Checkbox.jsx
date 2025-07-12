import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../design-system';

const Checkbox = React.forwardRef(({
  checked = false,
  disabled = false,
  label,
  description,
  error = false,
  className,
  onChange,
  ...props
}, ref) => {
  return (
    <div className={cn('flex items-start space-x-3', className)}>
      <div className="flex items-center h-5">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors',
            checked
              ? 'bg-primary-600 border-primary-600'
              : 'bg-white border-gray-300 hover:border-gray-400',
            error && 'border-red-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => !disabled && onChange?.({ target: { checked: !checked } })}
        >
          {checked && (
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          )}
        </div>
      </div>
      
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label className={cn(
              'text-sm font-medium cursor-pointer',
              error ? 'text-red-700' : 'text-gray-700',
              disabled && 'cursor-not-allowed opacity-50'
            )}>
              {label}
            </label>
          )}
          {description && (
            <p className={cn(
              'text-sm',
              error ? 'text-red-600' : 'text-gray-500',
              disabled && 'opacity-50'
            )}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
