import { useState, useEffect } from 'react';
import { apiClient } from '../services/api.js';

const useReflectionData = (selectedDate, isAuthenticated = false) => {
  const [reflectionData, setReflectionData] = useState({
    bedtime: '',
    wake_time: '',
    sleep_quality: '',
    sleep_symptoms: [],
    energy_level: 5,
    mood_level: 5,
    physical_comfort: 5,
    personal_reflection: '',
    activity_level: '',
    meditation_practice: false,
    meditation_duration: 0,
    cycle_day: '',
    ovulation: false,
    stress_level: 5
  });

  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load reflection data for selected date from API
  useEffect(() => {
    let isCancelled = false;
    
    const loadReflectionData = async () => {
      if (!isAuthenticated || !selectedDate) {
        // Reset to defaults when not authenticated or no date
        setReflectionData({
          bedtime: '',
          wake_time: '',
          sleep_quality: '',
          sleep_symptoms: [],
          energy_level: 5,
          mood_level: 5,
          physical_comfort: 5,
          personal_reflection: '',
          activity_level: '',
          meditation_practice: false,
          meditation_duration: 0,
          cycle_day: '',
          ovulation: false,
          stress_level: 5
        });
        setHasUnsavedChanges(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get(`/api/v1/journal/entries/${selectedDate}`);
        
        if (!isCancelled) {
          if (response.entry) {
            // Map API response to component format
            const apiData = response.entry;
            setReflectionData({
              bedtime: apiData.bedtime || '',
              wake_time: apiData.wake_time || '',
              sleep_quality: apiData.sleep_quality || '',
              sleep_symptoms: [], // This comes from timeline entries, handle separately if needed
              energy_level: apiData.energy_level || 5,
              mood_level: apiData.mood_level || 5,
              physical_comfort: apiData.physical_comfort || 5,
              personal_reflection: '', // Map from notes field if available
              activity_level: apiData.activity_level || '',
              meditation_practice: apiData.meditation_practice || false,
              meditation_duration: apiData.meditation_minutes || 0,
              cycle_day: apiData.cycle_day || '',
              ovulation: apiData.ovulation || false,
              stress_level: apiData.stress_level || 5
            });
          } else {
            // No existing entry for this date, use defaults
            setReflectionData({
              bedtime: '',
              wake_time: '',
              sleep_quality: '',
              sleep_symptoms: [],
              energy_level: 5,
              mood_level: 5,
              physical_comfort: 5,
              personal_reflection: '',
              activity_level: '',
              meditation_practice: false,
              meditation_duration: 0,
              cycle_day: '',
              ovulation: false,
              stress_level: 5
            });
          }
          setHasUnsavedChanges(false);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load reflection data:', error);
          
          // Check if it's a 500 error (backend issue) vs other errors
          if (error.message && error.message.includes('500')) {
            console.warn('Journal API returning 500 error - backend issue. Using defaults for now.');
          }
          
          // Use defaults on error
          setReflectionData({
            bedtime: '',
            wake_time: '',
            sleep_quality: '',
            sleep_symptoms: [],
            energy_level: 5,
            mood_level: 5,
            physical_comfort: 5,
            personal_reflection: '',
            activity_level: '',
            meditation_practice: false,
            meditation_duration: 0,
            cycle_day: '',
            ovulation: false,
            stress_level: 5
          });
          setHasUnsavedChanges(false);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadReflectionData();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isCancelled = true;
    };
  }, [selectedDate, isAuthenticated]);

  const updateReflectionData = (updates) => {
    setReflectionData(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const saveReflectionData = async () => {
    if (!isAuthenticated || !selectedDate) {
      console.error('Cannot save reflection data: not authenticated or no date selected');
      return false;
    }

    setLoading(true);
    try {
      // Map component data to API format
      const apiData = {
        entry_date: selectedDate,
        bedtime: reflectionData.bedtime,
        wake_time: reflectionData.wake_time,
        sleep_quality: reflectionData.sleep_quality,
        energy_level: reflectionData.energy_level,
        mood_level: reflectionData.mood_level,
        physical_comfort: reflectionData.physical_comfort,
        activity_level: reflectionData.activity_level,
        stress_level: reflectionData.stress_level,
        meditation_practice: reflectionData.meditation_practice,
        meditation_minutes: reflectionData.meditation_duration,
        cycle_day: reflectionData.cycle_day,
        ovulation: reflectionData.ovulation,
        sleep_symptoms: reflectionData.sleep_symptoms || []
      };

      // Save to API
      const response = await apiClient.post('/api/v1/journal/entries', apiData);
      
      if (response && response.message) {
        console.log('Reflection data saved successfully:', response.message);
        setHasUnsavedChanges(false);
        return true;
      } else {
        console.error('Unexpected API response:', response);
        return false;
      }
    } catch (error) {
      console.error('Failed to save reflection data:', error);
      
      // Check if it's a 500 error (backend issue)
      if (error.message && error.message.includes('500')) {
        console.warn('Journal API save returning 500 error - backend issue. Data not saved to database.');
        // Could add temporary localStorage fallback here if needed
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    reflectionData,
    updateReflectionData,
    saveReflectionData,
    loading,
    hasUnsavedChanges
  };
};

export default useReflectionData;