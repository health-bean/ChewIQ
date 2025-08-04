import React from 'react';
import { Button, Card, Input, Select } from '../../../../shared/components/ui';
import { FormSection } from '../../../../shared/components/layout';
import UnifiedSmartSelector from '../../components/common/UnifiedSmartSelector';
import QuickChecks from '../../components/common/QuickChecks';
import { ENTRY_TYPES } from '../../../../shared/constants/constants';

const AddEntryForm = ({ 
  formData, 
  updateFormData, 
  toggleSelectedFood, 
  handleQuickSelect,
  onSubmit,
  onCancel,
  preferences,
  exposureTypes,
  detoxTypes
}) => {
  return (
    <Card variant="success" padding="default">
      <FormSection spacing="comfortable">
        {/* Time and Type Selection */}
        <FormSection title="Entry Details">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Time</label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => updateFormData({ time: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Type</label>
              <Select
                value={formData.type}
                onChange={(e) => updateFormData({ type: e.target.value })}
              >
                <option value={ENTRY_TYPES.FOOD}>Food</option>
                <option value={ENTRY_TYPES.SYMPTOM}>Symptom</option>
                <option value={ENTRY_TYPES.SUPPLEMENT}>Supplement</option>
                <option value={ENTRY_TYPES.MEDICATION}>Medication</option>
                <option value={ENTRY_TYPES.EXPOSURE}>Exposure</option>
                <option value={ENTRY_TYPES.DETOX}>Detox</option>
              </Select>
            </div>
          </div>
        </FormSection>

        {/* Selection Interface - No nested cards */}
        <FormSection title="Select Items">
          <QuickChecks 
            type={formData.type} 
            preferences={preferences} 
            onQuickSelect={handleQuickSelect}
          />
          <UnifiedSmartSelector
            type={formData.type}
            selectedItems={formData.selectedItems || []}
            onItemsChange={(items) => {
              console.log('🔧 AddEntryForm: Items changed:', items);
              updateFormData({ selectedItems: items });
            }}
            selectedProtocols={preferences.protocols}
            prioritizeUserHistory={true}
          />
        </FormSection>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="success" onClick={onSubmit}>
            Add Entry
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </FormSection>
    </Card>
  );
};

export default AddEntryForm;