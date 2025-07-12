import React from 'react';
import { Button, Checkbox, Card } from '../../../../../shared/components/ui';
import { cn } from '../../../../../shared/design-system';
import { Flame, Thermometer, Droplets, Waves, Snowflake, Hand, Sparkles, Heart } from 'lucide-react';

const DetoxStep = ({ setupData, updateSetupData, onNext, onBack, isLast }) => {
  const commonDetoxActivities = [
    { 
      id: 'sauna', 
      name: 'Sauna', 
      category: 'Heat Therapy',
      icon: <Flame className="w-4 h-4" />,
      color: 'text-red-600 bg-red-100'
    },
    { 
      id: 'infrared', 
      name: 'Infrared Sauna', 
      category: 'Heat Therapy',
      icon: <Thermometer className="w-4 h-4" />,
      color: 'text-orange-600 bg-orange-100'
    },
    { 
      id: 'coffee_enema', 
      name: 'Coffee Enema', 
      category: 'Internal Cleansing',
      icon: <Droplets className="w-4 h-4" />,
      color: 'text-amber-600 bg-amber-100'
    },
    { 
      id: 'epsom_bath', 
      name: 'Epsom Bath', 
      category: 'Bath Therapy',
      icon: <Waves className="w-4 h-4" />,
      color: 'text-blue-600 bg-blue-100'
    },
    { 
      id: 'detox_bath', 
      name: 'Detox Bath', 
      category: 'Bath Therapy',
      icon: <Sparkles className="w-4 h-4" />,
      color: 'text-purple-600 bg-purple-100'
    },
    { 
      id: 'dry_brushing', 
      name: 'Dry Brushing', 
      category: 'Manual Therapy',
      icon: <Hand className="w-4 h-4" />,
      color: 'text-green-600 bg-green-100'
    },
    { 
      id: 'cold_plunge', 
      name: 'Cold Plunge', 
      category: 'Cold Therapy',
      icon: <Snowflake className="w-4 h-4" />,
      color: 'text-cyan-600 bg-cyan-100'
    },
    { 
      id: 'lymphatic', 
      name: 'Lymphatic Massage', 
      category: 'Manual Therapy',
      icon: <Heart className="w-4 h-4" />,
      color: 'text-pink-600 bg-pink-100'
    }
  ];

  const handleDetoxChange = (detox, isChecked) => {
    const newDetox = isChecked
      ? [...setupData.detox, detox]
      : setupData.detox.filter(d => d.id !== detox.id);
    updateSetupData({ detox: newDetox });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Detox Activities
        </h3>
        <p className="text-gray-600">
          Select detox activities you do regularly to track their impact on your health.
        </p>
      </div>

      {/* Detox Activities Grid */}
      <div className="grid grid-cols-1 gap-3">
        {commonDetoxActivities.map((detox) => {
          const isSelected = setupData.detox.some(d => d.id === detox.id);
          
          return (
            <Card
              key={detox.id}
              variant="outlined"
              padding="sm"
              className={cn(
                "transition-all duration-200",
                isSelected && "border-primary-300 bg-primary-50"
              )}
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  detox.color
                )}>
                  {detox.icon}
                </div>
                
                <div className="flex-1">
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) => handleDetoxChange(detox, e.target.checked)}
                    label={detox.name}
                    description={detox.category}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800">
          <strong>Track your detox journey!</strong> We'll help you correlate these 
          activities with your symptoms and overall wellness patterns.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex space-x-3">
        <Button 
          variant="secondary" 
          onClick={onBack} 
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={onNext} 
          className="flex-1"
        >
          {isLast ? 'Complete Setup' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default DetoxStep;
