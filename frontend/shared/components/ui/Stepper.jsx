import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../design-system';

const Stepper = ({
  steps = [],
  currentStep = 0,
  variant = 'default',
  className,
}) => {
  return (
    <nav className={cn('flex items-center justify-center', className)}>
      <ol className="flex items-center space-x-2 sm:space-x-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <li key={step.id || index} className="flex items-center">
              {/* Step Circle */}
              <div className="flex items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors',
                    isCompleted && 'bg-primary-600 border-primary-600 text-white',
                    isCurrent && 'border-primary-600 text-primary-600 bg-white',
                    isUpcoming && 'border-gray-300 text-gray-500 bg-white'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" strokeWidth={3} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                
                {/* Step Label */}
                {step.title && (
                  <div className="ml-3 hidden sm:block">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        isCompleted && 'text-primary-600',
                        isCurrent && 'text-primary-600',
                        isUpcoming && 'text-gray-500'
                      )}
                    >
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="text-xs text-gray-500">
                        {step.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-8 sm:w-12 h-0.5 ml-2 sm:ml-4 transition-colors',
                    index < currentStep ? 'bg-primary-600' : 'bg-gray-300'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;
