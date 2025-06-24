import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const useProtocols = () => {
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/protocols`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setProtocols(data.protocols || []);
      } catch (error) {
        console.error('Failed to load protocols:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProtocols();
  }, []);

  return { protocols, loading, error };
};

export default useProtocols;