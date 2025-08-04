import React from 'react';
import { cn } from '../../design-system';

const ContentSection = ({ 
  children, 
  spacing = 'default',
  className,
  ...props 
}) => {
  // Spacing options for different content contexts
  const spacingClasses = {
    tight: 'tight-spacing',      // 8px - for compact content
    default: 'card-spacing',     // 16px - for standard content
    comfortable: 'section-spacing', // 24px - for major sections
    loose: 'space-y-8'          // 32px - for very spaced content
  };

  return (
    <div 
      className={cn(
        spacingClasses[spacing],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default ContentSection;