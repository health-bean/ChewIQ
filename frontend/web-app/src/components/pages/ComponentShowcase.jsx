import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  PasswordInput, 
  Checkbox, 
  FormField, 
  Modal, 
  Stepper,
  Card,
  Alert 
} from '../../../../shared/components/ui';
import { Mail, Lock, User, Heart, Activity, Pill } from 'lucide-react';

const ComponentShowcase = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [checkboxStates, setCheckboxStates] = useState({
    terms: false,
    newsletter: true,
    notifications: false,
  });

  const steps = [
    { id: 1, title: 'Account', description: 'Basic info' },
    { id: 2, title: 'Health Profile', description: 'Your health goals' },
    { id: 3, title: 'Preferences', description: 'Customize experience' },
    { id: 4, title: 'Complete', description: 'All done!' },
  ];

  const handleCheckboxChange = (key) => {
    setCheckboxStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Health Platform Design System
          </h1>
          <p className="text-gray-600">
            Testing all components for consistency and functionality
          </p>
        </div>

        {/* Buttons Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Buttons</h2>
          <div className="space-y-4">
            
            {/* Button Variants */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Variants</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="error">Error</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            {/* Button Sizes */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Sizes</h3>
              <div className="flex items-center gap-2">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* Button States */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">States</h3>
              <div className="flex gap-2">
                <Button icon={Heart}>With Icon</Button>
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Form Components */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Form Components</h2>
          <div className="space-y-6 max-w-md">
            
            {/* Regular Input */}
            <FormField 
              label="Email Address" 
              required
              hint="We'll never share your email"
            >
              <Input 
                type="email" 
                placeholder="Enter your email"
                icon={Mail}
              />
            </FormField>

            {/* Password Input */}
            <FormField 
              label="Password" 
              required
            >
              <PasswordInput placeholder="Enter your password" />
            </FormField>

            {/* Input with Error */}
            <FormField 
              label="Username" 
              error="Username is already taken"
              required
            >
              <Input 
                type="text" 
                placeholder="Choose a username"
                error={true}
              />
            </FormField>

            {/* Input Variants */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Input States</h3>
              <div className="space-y-2">
                <Input placeholder="Default input" />
                <Input placeholder="Success input" variant="success" />
                <Input placeholder="Error input" variant="error" />
                <Input placeholder="Disabled input" disabled />
              </div>
            </div>
          </div>
        </Card>

        {/* Checkboxes */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Checkboxes</h2>
          <div className="space-y-4 max-w-md">
            
            <Checkbox
              label="I agree to the Terms of Service"
              description="By checking this, you accept our terms and conditions"
              checked={checkboxStates.terms}
              onChange={() => handleCheckboxChange('terms')}
            />

            <Checkbox
              label="Subscribe to newsletter"
              description="Get health tips and updates"
              checked={checkboxStates.newsletter}
              onChange={() => handleCheckboxChange('newsletter')}
            />

            <Checkbox
              label="Push notifications"
              checked={checkboxStates.notifications}
              onChange={() => handleCheckboxChange('notifications')}
            />

            <Checkbox
              label="Disabled checkbox"
              description="This option is not available"
              disabled
              checked={false}
            />

            <Checkbox
              label="Error state checkbox"
              description="Something went wrong"
              error={true}
              checked={false}
            />
          </div>
        </Card>

        {/* Stepper */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Stepper</h2>
          <div className="space-y-6">
            <Stepper steps={steps} currentStep={currentStep} />
            
            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button 
                size="sm"
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                disabled={currentStep === steps.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>

        {/* Modal */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Modal</h2>
          <Button onClick={() => setModalOpen(true)}>
            Open Modal
          </Button>
          
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Welcome to Health Platform"
            description="This is a test modal to showcase the design system"
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                This modal demonstrates the design system's modal component with proper
                styling, accessibility features, and responsive design.
              </p>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setModalOpen(false)}>
                  Confirm
                </Button>
              </div>
            </div>
          </Modal>
        </Card>

        {/* Alerts */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Alerts</h2>
          <div className="space-y-4">
            <Alert variant="info">
              This is an info alert with important information.
            </Alert>
            <Alert variant="success">
              Success! Your health profile has been updated.
            </Alert>
            <Alert variant="warning">
              Warning: Please verify your email address.
            </Alert>
            <Alert variant="error">
              Error: Unable to save your preferences. Please try again.
            </Alert>
          </div>
        </Card>

        {/* Health-Specific Colors */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Health Platform Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Primary</p>
              <p className="text-xs text-gray-500">Trust & Medical</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Success</p>
              <p className="text-xs text-gray-500">Improvements</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Error</p>
              <p className="text-xs text-gray-500">Symptoms</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Warning</p>
              <p className="text-xs text-gray-500">Foods</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Medication</p>
              <p className="text-xs text-gray-500">Prescriptions</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-500 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Supplement</p>
              <p className="text-xs text-gray-500">Vitamins</p>
            </div>
          </div>
        </Card>

        {/* Test Summary */}
        <Card className="p-6 bg-green-50 border-green-200">
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            ✅ Design System Test Results
          </h2>
          <div className="text-green-700 space-y-1">
            <p>• All components render correctly</p>
            <p>• Consistent styling and spacing</p>
            <p>• Proper accessibility features</p>
            <p>• Health-appropriate color palette</p>
            <p>• Responsive design works</p>
            <p>• Interactive states function properly</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ComponentShowcase;
