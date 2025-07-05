const { handleLogin, handleRegister, handleLogout, handleVerify } = require('./handlers/auth');
const { handleGetJournalEntries, handleCreateJournalEntry, handleGetJournalEntry, handleUpdateJournalEntry } = require('./handlers/journal');
const { handleGetProtocols } = require('./handlers/protocols');
const { handleGetTimelineEntries, handleCreateTimelineEntry } = require('./handlers/timeline');
const { handleSearchFoods, handleGetProtocolFoods } = require('./handlers/foods');
const { handleGetCorrelationInsights } = require('./handlers/correlations');
const { handleSearchSymptoms } = require('./handlers/symptoms');
const { handleSearchSupplements } = require('./handlers/supplements');
const { handleSearchMedications } = require('./handlers/medications');
const { handleSearchDetoxTypes } = require('./handlers/detox');
const { handleGetUser, handleUpdateUser, handleGetUserProtocols, handleGetUserPreferences, handleUpdateUserPreferences } = require('./handlers/users');

// Import your auth middleware
const { getCurrentUser } = require('./middleware/auth');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
};

// Helper function to get user context for protected routes
const getUserContext = async (event) => {
  try {
    const user = await getCurrentUser(event);
    if (!user) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }
    return { user };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Authentication failed' })
    };
  }
};

exports.handler = async (event, context) => {
  try {
    const { httpMethod, path, pathParameters, queryStringParameters } = event;

    // Handle CORS preflight
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify('OK')
      };
    }

    const route = path || event.resource;
    const queryParams = queryStringParameters || {};
    const body = event.body ? JSON.parse(event.body) : {};

    // Auth routes (public)
    if (route === '/api/v1/auth/login' && httpMethod === 'POST') {
      return await handleLogin(body, event);
    }
    if (route === '/api/v1/auth/register' && httpMethod === 'POST') {
      return await handleRegister(body, event);
    }
    if (route === '/api/v1/auth/logout' && httpMethod === 'POST') {
      return await handleLogout(body, event);
    }
    if (route === '/api/v1/auth/verify' && httpMethod === 'GET') {
      return await handleVerify(queryParams, event);
    }

    // User routes (PROTECTED - need auth)
    if (route === '/api/v1/users' && httpMethod === 'GET') {
      const authResult = await getUserContext(event);
      if (authResult.statusCode) return authResult; // Return auth error
      return await handleGetUser(queryParams, event, authResult.user);
    }
    if (route === '/api/v1/users' && httpMethod === 'PUT') {
      const authResult = await getUserContext(event);
      if (authResult.statusCode) return authResult; // Return auth error
      return await handleUpdateUser(body, event, authResult.user);
    }
    if (route === '/api/v1/user/protocols' && httpMethod === 'GET') {
      const authResult = await getUserContext(event);
      if (authResult.statusCode) return authResult; // Return auth error
      return await handleGetUserProtocols(queryParams, event, authResult.user);
    }
    if (route === '/api/v1/user/preferences' && httpMethod === 'GET') {
      const authResult = await getUserContext(event);
      if (authResult.statusCode) return authResult; // Return auth error
      return await handleGetUserPreferences(queryParams, event, authResult.user);
    }
    if (route === '/api/v1/user/preferences' && httpMethod === 'PUT') {
      const authResult = await getUserContext(event);
      if (authResult.statusCode) return authResult; // Return auth error
      return await handleUpdateUserPreferences(body, event, authResult.user);
    }

    // Journal routes (PROTECTED - need auth)
    if (route === '/api/v1/journals' && httpMethod === 'GET') {
      const authResult = await getUserContext(event);
      if (authResult.statusCode) return authResult; // Return auth error
      return await handleGetJournalEntries(queryParams, event, authResult.user);
    }
    if (route === '/api/v1/journal/entries' && httpMethod === 'GET') {
      const authResult = await getUserContext(event);
      if (authResult.statusCode) return authResult; // Return auth error
      return await handleGetJournalEntries(queryParams, event, authResult.user);
    }
    if (route === '/api/v1/journals' && httpMethod === 'POST') {
      const authResult = await getUserContext(event);
      if (authResult.statusCode) return authResult; // Return auth error
      return await handleCreateJournalEntry(body, event, authResult.user);
    }
    if (route === '/api/v1/journal/entries' && httpMethod === 'POST') {
      const authResult = await getUserContext(event);
      if (authResult.statusCode) return authResult; // Return auth error
      return await handleCreateJournalEntry(body, event, authResult.user);
    }
    if (route.startsWith('/api/v1/journals/') && httpMethod === 'PUT') {
      const authResult = await getUserContext(event);
      if (authResult.statusCode) return authResult; // Return auth error
      return await handleUpdateJournalEntry(body, event, authResult.user);
    }
    if (route.startsWith('/api/v1/journals/') && httpMethod === 'DELETE') {
      const authResult = await getUserContext(event);
      if (authResult.statusCode) return authResult; // Return auth error
      return await handleDeleteJournalEntry(pathParameters, event, authResult.user);
    }

    // Protocol routes (PUBLIC)
    if (route === '/api/v1/protocols' && httpMethod === 'GET') {
      return await handleGetProtocols(queryParams, event);
    }

    // Timeline routes
    if (route === '/api/v1/timeline/entries' && httpMethod === 'GET') {
      // GET timeline can be public with userId param OR protected without it
      // Check if userId is provided in query params
      if (queryParams.userId) {
        // Public access with explicit userId
        return await handleGetTimelineEntries(queryParams, event);
      } else {
        // Protected access - needs auth to get user's own timeline
        const authResult = await getUserContext(event);
        if (authResult.statusCode) return authResult; // Return auth error
        return await handleGetTimelineEntries(queryParams, event, authResult.user);
      }
    }
    if (route === '/api/v1/timeline/entries' && httpMethod === 'POST') {
      // POST timeline ALWAYS needs auth
      const authResult = await getUserContext(event);
      if (authResult.statusCode) return authResult; // Return auth error
      return await handleCreateTimelineEntry(body, event, authResult.user);
    }

    // Food routes (PUBLIC)
    if (route === '/api/v1/foods/search' && httpMethod === 'GET') {
      return await handleSearchFoods(queryParams, event);
    }
    if (route === '/api/v1/foods/by-protocol' && httpMethod === 'GET') {
      return await handleGetProtocolFoods(queryParams, event);
    }

    // Search routes (PUBLIC)
    if (route === '/api/v1/symptoms/search' && httpMethod === 'GET') {
      return await handleSearchSymptoms(queryParams, event);
    }
    if (route === '/api/v1/supplements/search' && httpMethod === 'GET') {
      return await handleSearchSupplements(queryParams, event);
    }
    if (route === '/api/v1/medications/search' && httpMethod === 'GET') {
      return await handleSearchMedications(queryParams, event);
    }
    if (route === '/api/v1/detox/search' && httpMethod === 'GET') {
      return await handleSearchDetoxTypes(queryParams, event);
    }
    if (route === '/api/v1/detox-types' && httpMethod === 'GET') {
      return await handleSearchDetoxTypes(queryParams, event);
    }

    // Correlation routes (PUBLIC with userId param)
    if (route === '/api/v1/correlations/insights' && httpMethod === 'GET') {
      return await handleGetCorrelationInsights(queryParams, event);
    }

    // Default response for unknown routes
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Route not found',
        route: route,
        method: httpMethod,
        message: `${httpMethod} ${route} is not implemented`
      })
    };

  } catch (error) {
    console.error('Lambda error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};