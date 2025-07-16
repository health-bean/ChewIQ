import { useState, useEffect } from 'react';
import { useTimelineApi } from '../../../shared/hooks/useSimpleApi';
import safeLogger from '../../../shared/utils/safeLogger';

export const useTimelineEntries = (selectedDate, isAuthenticated = false) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use the proper API hook that sends demo headers
  const { getTimelineEntries, addTimelineEntry } = useTimelineApi();

  const loadEntries = async () => {
    safeLogger.debug('Loading timeline entries', { selectedDate, isAuthenticated });
    
    if (!selectedDate || !isAuthenticated) {
      safeLogger.debug('Skipping timeline load - no date or not authenticated');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      safeLogger.debug('Fetching timeline entries', { date: selectedDate });
      const data = await getTimelineEntries(selectedDate);
      setEntries(data.entries || []);
      safeLogger.debug('Timeline entries loaded', { count: data.entries?.length || 0 });
    } catch (err) {
      safeLogger.error('Failed to load timeline entries', { error: err.message, date: selectedDate });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (entryData) => {
    try {
      await addTimelineEntry(entryData);
      await loadEntries(); // Refresh entries after adding
    } catch (err) {
      console.error('Failed to add entry:', err);
      setError(err.message);
      throw err;
    }
  };

  const hasCriticalInsights = () => {
    return entries.some(entry => entry.protocol_compliant === false);
  };

  useEffect(() => {
    loadEntries();
  }, [selectedDate, isAuthenticated]);

  return {
    entries,
    loading,
    error,
    addEntry,
    hasCriticalInsights,
    refreshEntries: loadEntries
  };
};