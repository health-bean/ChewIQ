// File: frontend/web-app/src/hooks/useApi.js
// API hook for clean auth integration

import { useEffect } from 'react';
import { apiClient } from '../../../shared/services/simpleApi';
import { useAuth } from '../contexts/AuthProvider';
import safeLogger from '../../../shared/utils/safeLogger';

// Hook to automatically sync API client with auth state
export const useApi = () => {
  const { getUserContext, isAuthenticated } = useAuth();

  // Sync API client with auth state
  useEffect(() => {
    const userContext = getUserContext();
    
    if (isAuthenticated && userContext) {
      apiClient.setUserContext(userContext);
      safeLogger.debug('API client synced with auth', { 
        userId: userContext.userId 
      });
    } else {
      apiClient.clearUserContext();
      safeLogger.debug('API client cleared - no auth');
    }
  }, [isAuthenticated, getUserContext]);

  return apiClient;
};

// Hook for journal/reflection data
export const useJournalApi = () => {
  const api = useApi();
  const { getUserContext } = useAuth();

  const getJournalEntry = async (date) => {
    const userContext = getUserContext();
    if (!userContext) throw new Error('Not authenticated');
    
    // Use proper API method based on user type
    if (userContext.isDemo) {
      return api.getDemoData(userContext.userId, `/api/v1/journal/entries/${date}`);
    } else {
      return api.get(`/api/v1/journal/entries/${date}`);
    }
  };

  const saveJournalEntry = async (date, data) => {
    const userContext = getUserContext();
    if (!userContext) throw new Error('Not authenticated');
    
    if (userContext.isDemo) {
      const entryData = {
        entry_date: date,
        demo_user: userContext.userId,
        ...data
      };
      return api.saveDemoData(userContext.userId, '/api/v1/journal/entries', entryData);
    } else {
      const entryData = {
        entry_date: date,
        ...data
      };
      return api.post('/api/v1/journal/entries', entryData);
    }
  };

  return {
    getJournalEntry,
    saveJournalEntry
  };
};

// Hook for timeline data
export const useTimelineApi = () => {
  const api = useApi();
  const { getUserContext } = useAuth();

  const getTimelineEntries = async (date) => {
    const userContext = getUserContext();
    if (!userContext) throw new Error('Not authenticated');
    
    // Use proper API method based on user type
    if (userContext.isDemo) {
      return api.getDemoData(userContext.userId, `/api/v1/timeline/entries?date=${date}`);
    } else {
      return api.get(`/api/v1/timeline/entries?date=${date}`);
    }
  };

  const addTimelineEntry = async (entryData) => {
    const userContext = getUserContext();
    if (!userContext) throw new Error('Not authenticated');
    
    if (userContext.isDemo) {
      return api.saveDemoData(userContext.userId, '/api/v1/timeline/entries', entryData);
    } else {
      return api.post('/api/v1/timeline/entries', entryData);
    }
  };

  return {
    getTimelineEntries,
    addTimelineEntry
  };
};

// Hook for user preferences
export const usePreferencesApi = () => {
  const api = useApi();
  const { getUserContext } = useAuth();

  const getPreferences = async () => {
    const userContext = getUserContext();
    if (!userContext) throw new Error('Not authenticated');
    
    // Use proper API method based on user type
    if (userContext.isDemo) {
      return api.getDemoData(userContext.userId, '/api/v1/users/preferences');
    } else {
      return api.get('/api/v1/user/preferences');
    }
  };

  const updatePreferences = async (preferences) => {
    const userContext = getUserContext();
    if (!userContext) throw new Error('Not authenticated');
    
    if (userContext.isDemo) {
      return api.saveDemoData(userContext.userId, '/api/v1/users/preferences', preferences);
    } else {
      return api.post('/api/v1/user/preferences', preferences);
    }
  };

  return {
    getPreferences,
    updatePreferences
  };
};

// Hook for protocols
export const useProtocolsApi = () => {
  const api = useApi();

  const getProtocols = async () => {
    return api.get('/api/v1/protocols');
  };

  const getProtocolFoods = async (protocolId) => {
    return api.get(`/api/v1/foods/by-protocol?protocol_id=${protocolId}`);
  };

  return {
    getProtocols,
    getProtocolFoods
  };
};