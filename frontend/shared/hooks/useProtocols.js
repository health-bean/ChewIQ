import { useState, useEffect } from 'react';
import { apiClient } from '../services/api.js';

const useProtocols = (isAuthenticated = false) => {
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    
    const fetchProtocols = async () => {
      // Always try to fetch if we have a token, regardless of isAuthenticated flag
      const hasToken = sessionStorage.getItem('auth_token'); // Fixed: was 'authToken', should be 'auth_token'
      
      if (!isAuthenticated && !hasToken) {
        console.log('🔧 useProtocols: No auth, skipping fetch');
        setLoading(false);
        return;
      }
      
      // Prevent duplicate calls
      if (loading) {
        console.log('🔧 useProtocols: Already loading, skipping duplicate call');
        return;
      }
      
      console.log('🔧 useProtocols: Fetching protocols...', { isAuthenticated, hasToken: !!hasToken });
      
      try {
        setLoading(true);
        const data = await apiClient.get('/api/v1/protocols');
        
        // Only update state if component is still mounted
        if (!isCancelled) {
          console.log('🔧 useProtocols: Received protocols:', data.protocols?.length || 0);
          setProtocols(data.protocols || []);
          setError(null);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('🔧 useProtocols: Error fetching protocols:', error);
          setError(error.message);
          setProtocols([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchProtocols();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  return { protocols, loading, error };
};

export default useProtocols;