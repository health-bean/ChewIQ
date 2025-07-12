// File: frontend/web-app/src/components/pages/PreferencesPage.jsx

import React from 'react';
import { ArrowLeft, Settings, Sparkles, Zap, Shield, Bell, User } from 'lucide-react';
import { Button, Card } from '../../../../shared/components/ui';
import { cn } from '../../../../shared/design-system';
import useAuth from '../../../../shared/hooks/useAuth';

const PreferencesPage = ({ onBack }) => {
  const { user } = useAuth();

  const upcomingFeatures = [
    {
      icon: <Settings className="w-5 h-5" />,
      title: 'Account Settings',
      description: 'Update your profile, email, and password preferences',
      color: 'text-gray-600 bg-gray-100'
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: 'Notifications',
      description: 'Customize alerts for symptoms, medications, and insights',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: 'AI Insights',
      description: 'Configure how AI analyzes your health patterns',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Quick Actions',
      description: 'Customize your frequently used foods, supplements, and symptoms',
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Privacy & Data',
      description: 'Control how your health data is stored and shared',
      color: 'text-green-600 bg-green-100'
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-200 shadow-sm">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-3 p-2 -ml-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">Preferences</h1>
            <p className="text-sm text-gray-500">Customize your experience</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4">
          <Card padding="default" className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Coming Soon Features */}
      <div className="p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h2>
          <p className="text-sm text-gray-600">
            These features are in development and will be available in future updates.
          </p>
        </div>

        <div className="space-y-3">
          {upcomingFeatures.map((feature, index) => (
            <Card 
              key={index}
              variant="outlined"
              padding="default"
              className={cn(
                "transition-all duration-200 opacity-75",
                "hover:opacity-90 hover:shadow-sm"
              )}
            >
              <div className="flex items-start space-x-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  feature.color
                )}>
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Soon
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Beta Notice */}
      <div className="p-4">
        <Card variant="warning" padding="default">
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-yellow-800 mb-1">
              Beta Version
            </h3>
            <p className="text-xs text-yellow-700 leading-relaxed">
              You're using an early version of FILO Health. More features and 
              customization options are coming soon!
            </p>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="p-4 pb-8">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">
            Have feedback or feature requests?
          </p>
          <Button variant="outline" size="sm">
            Send Feedback
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;
