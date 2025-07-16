const { successResponse, errorResponse } = require('../utils/responses');
const { getCurrentUser } = require('../middleware/auth');

/**
 * Simple test handler to verify authentication is working
 */
async function handleTestAuth(queryParams, event) {
  try {
    console.log('TEST AUTH: Starting handler with event headers:', JSON.stringify(event.headers, null, 2));
    
    // Use auth middleware to get current user (handles both demo and Cognito users)
    console.log('TEST AUTH: About to call getCurrentUser');
    const user = await getCurrentUser(event);
    console.log('TEST AUTH: getCurrentUser returned:', user ? JSON.stringify(user, null, 2) : 'null');
    
    if (!user) {
      console.log('TEST AUTH: Authentication failed - no user found');
      return errorResponse('Authentication required', 401);
    }
    
    // Return the authenticated user info
    return successResponse({
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || user.first_name,
        lastName: user.lastName || user.last_name,
        userType: user.userType || user.user_type,
        isDemo: user.isDemo || false,
        isCognito: user.isCognito || false
      }
    });
  } catch (error) {
    console.error('Test auth error:', error);
    return errorResponse('Authentication test failed', 500);
  }
}

module.exports = {
  handleTestAuth
};