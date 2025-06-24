const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

const createResponse = (statusCode, data, headers = {}) => ({
    statusCode,
    headers: { ...corsHeaders, ...headers },
    body: JSON.stringify(data)
});

const successResponse = (data, statusCode = 200) => 
    createResponse(statusCode, data);

const errorResponse = (message, statusCode = 500, details = null) => 
    createResponse(statusCode, {
        error: message,
        ...(details && { details })
    });

module.exports = {
    corsHeaders,
    createResponse,
    successResponse,
    errorResponse
};
