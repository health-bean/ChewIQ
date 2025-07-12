import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../design-system';

const Modal = ({
  isOpen = false,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className,
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* Modal */}
      <div
        className={cn(
          'relative bg-white rounded-lg shadow-xl w-full',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500">
                  {description}
                </p>
              )}
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
