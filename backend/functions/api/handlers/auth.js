const { successResponse, errorResponse } = require('../utils/responses');

const handleAuth = async (body) => {
    const { action, email, password, firstName, lastName } = body;
    
    if (action === 'register') {
        return successResponse({
            message: 'User registration initiated',
            email: email,
            status: 'pending_verification'
        }, 201);
    }
    
    if (action === 'login') {
        return successResponse({
            message: 'Login successful',
            token: 'mock-jwt-token',
            user: {
                id: 'user-123',
                email: email,
                role: 'patient'
            }
        });
    }
    
    return errorResponse('Invalid action. Use "login" or "register"', 400);
};

module.exports = {
    handleAuth
};
