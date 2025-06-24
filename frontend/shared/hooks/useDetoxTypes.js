import { useState } from 'react';
import { MOCK_DETOX_TYPES } from '../constants/mockData';

const useDetoxTypes = () => {
  const [detoxTypes, setDetoxTypes] = useState(MOCK_DETOX_TYPES);
  const [loading, setLoading] = useState(false);

  // Future: Replace with real API
  // const fetchDetoxTypes = async () => {
  //   const response = await fetch(`${API_BASE_URL}/api/v1/detox-types`);
  //   const data = await response.json();
  //   setDetoxTypes(data.detox_types);
  // };

  return { detoxTypes, loading };
};

export default useDetoxTypes;