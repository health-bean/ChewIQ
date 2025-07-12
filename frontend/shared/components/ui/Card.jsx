import React from 'react';
import { cn, cardVariants } from '../../design-system';

const Card = React.forwardRef(({
  variant = 'default',
  padding = 'default',
  children,
  className,
  ...props
}, ref) => {
  // Padding variants
  const paddingVariants = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      ref={ref}
      className={cn(
        cardVariants(variant),
        paddingVariants[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Card sub-components for better composition
const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 pb-6', className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ children, className, ...props }) => (
  <p className={cn('text-sm text-gray-500', className)} {...props}>
    {children}
  </p>
);

const CardContent = ({ children, className, ...props }) => (
  <div className={cn('pt-0', className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className, ...props }) => (
  <div className={cn('flex items-center pt-6', className)} {...props}>
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
