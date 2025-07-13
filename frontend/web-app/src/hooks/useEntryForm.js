import { useState } from 'react';
import { ENTRY_TYPES, SEVERITY_LEVELS } from '../../../shared/constants/constants';

export const useEntryForm = () => {
  const [formData, setFormData] = useState({
    time: new Date().toTimeString().slice(0, 5),
    type: ENTRY_TYPES.FOOD,
    selectedFoods: [],
    customText: '',
    severity: SEVERITY_LEVELS.DEFAULT
  });

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const toggleSelectedFood = (food) => {
    const isSelected = formData.selectedFoods.includes(food);
    updateFormData({
      selectedFoods: isSelected 
        ? formData.selectedFoods.filter(f => f !== food)
        : [...formData.selectedFoods, food]
    });
  };

  const handleQuickSelect = (itemName) => {
    updateFormData({
      customText: formData.customText ? `${formData.customText}, ${itemName}` : itemName
    });
  };

  const resetForm = () => {
    setFormData({
      time: new Date().toTimeString().slice(0, 5),
      type: ENTRY_TYPES.FOOD,
      selectedFoods: [],
      customText: '',
      severity: SEVERITY_LEVELS.DEFAULT
    });
  };

  const buildEntryData = (selectedDate) => {
    // Process foods to extract names and categories
    const foodItems = formData.selectedFoods.map(food => {
      if (typeof food === 'string') return food;
      if (typeof food === 'object' && food.name) {
        // Create proper food content structure
        return {
          name: food.name,
          category: food.category || 'unknown',
          compliance_status: food.compliance_status || food.protocol_status || 'unknown'
        };
      }
      return String(food);
    });
    
    const allItems = [...foodItems];
    if (formData.customText.trim()) {
      allItems.push(formData.customText.trim());
    }
    
    // For display, create a simple string of food names
    const displayContent = formData.selectedFoods.map(food => {
      if (typeof food === 'string') return food;
      if (typeof food === 'object' && food.name) return food.name;
      return String(food);
    }).join(', ') + (formData.customText.trim() ? ', ' + formData.customText.trim() : '');
    
    return {
      entryDate: selectedDate,
      entryTime: formData.time,
      entryType: formData.type,
      content: displayContent, // Simple string for display
      selectedFoods: formData.selectedFoods, // Keep original objects for data
      severity: formData.type === ENTRY_TYPES.SYMPTOM ? formData.severity : null
    };
  };

  return {
    formData,
    updateFormData,
    toggleSelectedFood,
    handleQuickSelect,
    resetForm,
    buildEntryData
  };
};