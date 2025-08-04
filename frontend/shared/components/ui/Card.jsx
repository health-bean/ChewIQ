import React from 'react';
import { cn, cardVariants } from '../../design-system';

const Card = React.forwardRef(({
  variant = 'default',
  padding = 'default',
  interactive = false,
  selected = false,
  children,
  className,
  ...props
}, ref) => {
  // Padding variants - chronic illness friendly spacing
  const paddingVariants = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  // Determine final variant based on state
  let finalVariant = variant;
  if (selected) {
    finalVariant = 'selected';
  } else if (interactive) {
    finalVariant = 'interactive';
  }

  return (
    <div
      ref={ref}
      className={cn(
        cardVariants(finalVariant),
        paddingVariants[padding],
        'reduced-motion', // Support for reduced motion preferences
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Card sub-components for better composition - FILO styled
const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('flex flex-col form-spacing pb-6', className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn('text-lg font-semibold heading-comfortable text-neutral-900', className)} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ children, className, ...props }) => (
  <p className={cn('text-sm text-neutral-600 text-readable', className)} {...props}>
    {children}
  </p>
);

const CardContent = ({ children, className, ...props }) => (
  <div className={cn('pt-0', className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className, ...props }) => (
  <div className={cn('flex-center pt-6', className)} {...props}>
    {children}
  </div>
);

// Export all components
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
