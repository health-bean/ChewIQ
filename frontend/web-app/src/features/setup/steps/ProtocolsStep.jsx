import React from 'react';
import { Button, Checkbox, Card } from '../../../../../shared/components/ui';
import { cn } from '../../../../../shared/design-system';

const ProtocolsStep = ({ setupData, updateSetupData, protocols, onNext, onBack, isLast, disabled }) => {
  // Just sort protocols alphabetically - no filtering or hardcoding
  const availableProtocols = protocols.sort((a, b) => a.name.localeCompare(b.name));

  const handleProtocolChange = (protocolId, isChecked) => {
    // Special handling for "no protocol" option
    if (protocolId === 'no_protocol') {
      if (isChecked) {
        // If selecting "no protocol", clear all other protocols
        updateSetupData({ protocols: ['no_protocol'] });
      } else {
        // If deselecting "no protocol", just remove it
        updateSetupData({ protocols: [] });
      }
      return;
    }
    
    // For regular protocols, automatically unselect "no protocol" if it was selected
    const currentProtocols = setupData.protocols.filter(id => id !== 'no_protocol');
    const newProtocols = isChecked
      ? [...currentProtocols, protocolId]
      : currentProtocols.filter(id => id !== protocolId);
    
    updateSetupData({ protocols: newProtocols });
  };

  const isNoProtocolSelected = setupData.protocols.includes('no_protocol');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Health Protocols
        </h3>
        <p className="text-gray-600">
          Select any health protocols you're currently following or interested in exploring.
        </p>
      </div>

      {/* Protocol Options */}
      <div className="space-y-3">
        {/* No Protocol Option */}
        <Card 
          variant="outlined" 
          padding="sm"
          className={cn(
            "transition-all duration-200",
            isNoProtocolSelected && "border-primary-300 bg-primary-50"
          )}
        >
          <Checkbox
            checked={isNoProtocolSelected}
            onChange={(e) => handleProtocolChange('no_protocol', e.target.checked)}
            label="I'm not following any specific protocol"
            description="Just want to track my general health and symptoms"
          />
        </Card>

        {/* Available Protocols */}
        {availableProtocols.map((protocol) => {
          const isSelected = setupData.protocols.includes(protocol.id);
          const isDisabled = isNoProtocolSelected;
          
          return (
            <Card
              key={protocol.id}
              variant="outlined"
              padding="sm"
              className={cn(
                "transition-all duration-200",
                isSelected && !isDisabled && "border-primary-300 bg-primary-50",
                isDisabled && "opacity-50"
              )}
            >
              <Checkbox
                checked={isSelected}
                disabled={isDisabled}
                onChange={(e) => handleProtocolChange(protocol.id, e.target.checked)}
                label={protocol.name}
                description={protocol.description}
              />
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Don't see your protocol?</strong> No worries! You can track any foods, 
          supplements, and symptoms regardless of the protocol you select.
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
          disabled={disabled}
        >
          {isLast ? 'Complete Setup' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default ProtocolsStep;
