import React, { useState } from 'react';
import { Plus, X, Pill } from 'lucide-react';
import { Button, Input, FormField, Card } from '../../../../../shared/components/ui';
import { cn } from '../../../../../shared/design-system';

const MedicationsStep = ({ setupData, updateSetupData, onNext, onBack, isLast }) => {
  const [newMedication, setNewMedication] = useState('');

  const handleAddMedication = () => {
    if (newMedication.trim()) {
      const medication = {
        id: Date.now().toString(),
        name: newMedication.trim(),
        addedAt: new Date().toISOString()
      };
      
      const currentMedications = setupData.medications || [];
      updateSetupData({ 
        medications: [...currentMedications, medication] 
      });
      setNewMedication('');
    }
  };

  const handleRemoveMedication = (medicationId) => {
    const currentMedications = setupData.medications || [];
    updateSetupData({ 
      medications: currentMedications.filter(med => med.id !== medicationId) 
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMedication();
    }
  };

  const medications = setupData.medications || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Medications
        </h3>
        <p className="text-gray-600">
          Add any medications you take regularly for comprehensive health tracking.
        </p>
      </div>

      {/* Add Medication */}
      <Card variant="outlined" padding="default">
        <FormField 
          label="Add Medication" 
          hint="Include prescription medications, over-the-counter drugs, etc."
        >
          <div className="flex space-x-2">
            <Input
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Levothyroxine, Metformin, Ibuprofen"
              className="flex-1"
            />
            <Button 
              onClick={handleAddMedication}
              disabled={!newMedication.trim()}
              icon={Plus}
              variant="primary"
            >
              Add
            </Button>
          </div>
        </FormField>
      </Card>

      {/* Current Medications */}
      {medications.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Your Medications ({medications.length})
          </h4>
          <div className="space-y-2">
            {medications.map((medication) => (
              <Card
                key={medication.id}
                variant="outlined"
                padding="sm"
                className="bg-purple-50 border-purple-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Pill className="w-4 h-4 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {medication.name}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMedication(medication.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800">
          <strong>Privacy Note:</strong> Your medication information is stored securely 
          and only used to help identify potential correlations with your symptoms and health patterns.
        </p>
      </div>

      {/* Skip Option */}
      {medications.length === 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">
            Don't take any regular medications?
          </p>
          <Button variant="ghost" size="sm" onClick={onNext}>
            Skip this step
          </Button>
        </div>
      )}

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

export default MedicationsStep;
