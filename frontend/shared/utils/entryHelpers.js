export const getEntryIcon = (type) => ({
  food: '🍽️',
  symptom: '⚠️',
  supplement: '💊',
  medication: '💉',
  exposure: '🏭',
  detox: '🧘'
}[type] || '📝');

// FILO semantic colors for entry types - chronic illness friendly
export const getEntryColor = (type) => ({
  food: 'health-food',           // FILO terracotta
  symptom: 'health-symptom',     // Soft coral
  supplement: 'health-supplement', // FILO teal
  medication: 'health-medication', // Gentle lavender
  exposure: 'health-food',       // FILO terracotta (similar to food)
  detox: 'health-improvement'    // Sage green (positive action)
}[type] || 'health-neutral');

export const getProtocolDisplayText = (selectedProtocols, protocols) => {
  if (!selectedProtocols || selectedProtocols.length === 0) return 'No protocols selected';
  
  // Handle "No Protocol" selection
  if (selectedProtocols.includes('no_protocol')) {
    return 'No Protocol';
  }
  
  const selectedProtocolObjects = protocols.filter(p => 
    selectedProtocols.includes(p.id)
  );
  
  if (selectedProtocols.length === 1) {
    return selectedProtocolObjects[0]?.name || 'Protocol';
  }
  if (selectedProtocols.length === 2) {
    const names = selectedProtocolObjects.map(p => p.name.split(' ')[0]);
    return names.join(' + ');
  }
  return `${selectedProtocols.length} Active Protocols`;
};