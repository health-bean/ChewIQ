import { useState, useEffect, useCallback } from 'react';
import { timelineService } from '../../../shared/services/timelineService';
import safeLogger from '../../../shared/utils/safeLogger';

export const useTimelineEntries = (selectedDate, isAuthenticated = false) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEntries = useCallback(async () => {
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
      const data = await timelineService.getEntries(selectedDate);
      setEntries(data.entries || []);
      safeLogger.debug('Timeline entries loaded', { count: data.entries?.length || 0 });
    } catch (err) {
      safeLogger.error('Failed to load timeline entries', { error: err.message, date: selectedDate });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, isAuthenticated]);

  const addEntry = useCallback(async (entryData) => {
    try {
      await timelineService.createEntry(entryData);
      await loadEntries(); // Refresh entries after adding
    } catch (err) {
      console.error('Failed to add entry:', err);
      setError(err.message);
      throw err;
    }
  }, [loadEntries]);

  const hasCriticalInsights = useCallback(() => {
    return entries.some(entry => entry.protocol_compliant === false);
  }, [entries]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  return {
    entries,
    loading,
    error,
    addEntry,
    hasCriticalInsights,
    refreshEntries: loadEntries
  };
};
