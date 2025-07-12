import React from 'react';
import { Button, Checkbox, Card } from '../../../../../shared/components/ui';
import { cn } from '../../../../../shared/design-system';
import { Beef, Fish, Salad, Apple, Droplets, Wheat } from 'lucide-react';

const FoodsStep = ({ setupData, updateSetupData, onNext, onBack, isLast }) => {
  const commonFoods = [
    { 
      id: 'chicken', 
      name: 'Chicken breast', 
      category: 'Protein',
      icon: <Beef className="w-4 h-4" />,
      color: 'text-orange-600 bg-orange-100'
    },
    { 
      id: 'beef', 
      name: 'Ground beef', 
      category: 'Protein',
      icon: <Beef className="w-4 h-4" />,
      color: 'text-red-600 bg-red-100'
    },
    { 
      id: 'salmon', 
      name: 'Salmon', 
      category: 'Protein',
      icon: <Fish className="w-4 h-4" />,
      color: 'text-pink-600 bg-pink-100'
    },
    { 
      id: 'broccoli', 
      name: 'Broccoli', 
      category: 'Vegetable',
      icon: <Salad className="w-4 h-4" />,
      color: 'text-green-600 bg-green-100'
    },
    { 
      id: 'avocado', 
      name: 'Avocado', 
      category: 'Fat',
      icon: <Apple className="w-4 h-4" />,
      color: 'text-lime-600 bg-lime-100'
    },
    { 
      id: 'bone_broth', 
      name: 'Bone broth', 
      category: 'Beverage',
      icon: <Droplets className="w-4 h-4" />,
      color: 'text-amber-600 bg-amber-100'
    }
  ];

  const handleFoodChange = (food, isChecked) => {
    const newFoods = isChecked
      ? [...setupData.foods, food]
      : setupData.foods.filter(f => f.id !== food.id);
    updateSetupData({ foods: newFoods });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Common Foods
        </h3>
        <p className="text-gray-600">
          Select foods you eat regularly for quick tracking and correlation analysis.
        </p>
      </div>

      {/* Foods Grid */}
      <div className="grid grid-cols-1 gap-3">
        {commonFoods.map((food) => {
          const isSelected = setupData.foods.some(f => f.id === food.id);
          
          return (
            <Card
              key={food.id}
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
                  food.color
                )}>
                  {food.icon}
                </div>
                
                <div className="flex-1">
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) => handleFoodChange(food, e.target.checked)}
                    label={food.name}
                    description={food.category}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          <strong>Don't see your foods?</strong> You can add any food when logging 
          your meals. We'll track correlations with your symptoms automatically.
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

export default FoodsStep;
