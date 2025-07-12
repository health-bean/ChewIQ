import { useState, useEffect } from 'react';
import { apiClient } from '../services/api.js';

const useExposureTypes = () => {
  const [exposureTypes, setExposureTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExposureTypes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.get('/api/v1/detox-types/search?search=');
      setExposureTypes(data.detox_types || []);
    } catch (err) {
      console.error('Failed to fetch exposure types:', err);
      setError(err.message);
      // DON'T use mock data fallback - let the UI handle the error state
      setExposureTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExposureTypes();
  }, []);

  return { 
    exposureTypes, 
    loading, 
    error,
    refetch: fetchExposureTypes,
    isEmpty: exposureTypes.length === 0 && !loading && !error
  };
};

export default useExposureTypes;