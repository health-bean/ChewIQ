/**
 * Standardized error types and handling for the health platform
 * SECURITY: Ensures consistent error responses without data leakage
 */

// Error types
const ErrorTypes = {
  // Authentication & Authorization
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED: 'MISSING_REQUIRED',
  
  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD: 'DUPLICATE_RECORD',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  
  // Business Logic
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  
  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
};

// Error messages (user-safe, no sensitive data)
const ErrorMessages = {
  [ErrorTypes.AUTH_REQUIRED]: 'Authentication required',
  [ErrorTypes.AUTH_INVALID]: 'Invalid authentication credentials',
  [ErrorTypes.AUTH_EXPIRED]: 'Authentication session expired',
  [ErrorTypes.ACCESS_DENIED]: 'Access denied',
  
  [ErrorTypes.VALIDATION_ERROR]: 'Invalid input data',
  [ErrorTypes.INVALID_INPUT]: 'Invalid input format',
  [ErrorTypes.MISSING_REQUIRED]: 'Required fields missing',
  
  [ErrorTypes.DATABASE_ERROR]: 'Database operation failed',
  [ErrorTypes.RECORD_NOT_FOUND]: 'Record not found',
  [ErrorTypes.DUPLICATE_RECORD]: 'Record already exists',
  [ErrorTypes.CONSTRAINT_VIOLATION]: 'Data constraint violation',
  
  [ErrorTypes.BUSINESS_RULE_VIOLATION]: 'Business rule violation',
  [ErrorTypes.OPERATION_NOT_ALLOWED]: 'Operation not allowed',
  
  [ErrorTypes.INTERNAL_ERROR]: 'Internal server error',
  [ErrorTypes.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
  [ErrorTypes.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded'
};

// HTTP status codes for each error type
const ErrorStatusCodes = {
  [ErrorTypes.AUTH_REQUIRED]: 401,
  [ErrorTypes.AUTH_INVALID]: 401,
  [ErrorTypes.AUTH_EXPIRED]: 401,
  [ErrorTypes.ACCESS_DENIED]: 403,
  
  [ErrorTypes.VALIDATION_ERROR]: 400,
  [ErrorTypes.INVALID_INPUT]: 400,
  [ErrorTypes.MISSING_REQUIRED]: 400,
  
  [ErrorTypes.DATABASE_ERROR]: 500,
  [ErrorTypes.RECORD_NOT_FOUND]: 404,
  [ErrorTypes.DUPLICATE_RECORD]: 409,
  [ErrorTypes.CONSTRAINT_VIOLATION]: 400,
  
  [ErrorTypes.BUSINESS_RULE_VIOLATION]: 422,
  [ErrorTypes.OPERATION_NOT_ALLOWED]: 403,
  
  [ErrorTypes.INTERNAL_ERROR]: 500,
  [ErrorTypes.SERVICE_UNAVAILABLE]: 503,
  [ErrorTypes.RATE_LIMIT_EXCEEDED]: 429
};

/**
 * Create a standardized application error
 */
class AppError extends Error {
  constructor(type, message = null, details = null, originalError = null) {
    const errorMessage = message || ErrorMessages[type] || 'Unknown error';
    super(errorMessage);
    
    this.name = 'AppError';
    this.type = type;
    this.statusCode = ErrorStatusCodes[type] || 500;
    this.details = details;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
    
    // Don't expose internal error details in production
    if (process.env.NODE_ENV === 'production' && originalError) {
      this.originalError = null;
    }
  }
  
  toJSON() {
    return {
      error: {
        type: this.type,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        ...(this.details && { details: this.details }),
        ...(this.originalError && process.env.NODE_ENV !== 'production' && { 
          originalError: this.originalError.message 
        })
      }
    };
  }
}

/**
 * Database error handler with security considerations
 */
const handleDatabaseError = (error, operation = 'database operation') => {
  console.error(`Database error during ${operation}:`, error);
  
  // Map PostgreSQL error codes to our error types
  switch (error.code) {
    case '23505': // unique_violation
      return new AppError(ErrorTypes.DUPLICATE_RECORD, 'Record already exists', null, error);
    case '23503': // foreign_key_violation
      return new AppError(ErrorTypes.CONSTRAINT_VIOLATION, 'Referenced record not found', null, error);
    case '23502': // not_null_violation
      return new AppError(ErrorTypes.MISSING_REQUIRED, 'Required field missing', null, error);
    case '42P01': // undefined_table
      return new AppError(ErrorTypes.DATABASE_ERROR, 'Database schema error', null, error);
    case '42703': // undefined_column
      return new AppError(ErrorTypes.DATABASE_ERROR, 'Database schema error', null, error);
    default:
      // Don't expose internal database errors
      return new AppError(ErrorTypes.DATABASE_ERROR, null, null, error);
  }
};

/**
 * Authentication error handler
 */
const handleAuthError = (error, operation = 'authentication') => {
  console.error(`Auth error during ${operation}:`, error);
  
  if (error.name === 'JsonWebTokenError') {
    return new AppError(ErrorTypes.AUTH_INVALID);
  }
  
  if (error.name === 'TokenExpiredError') {
    return new AppError(ErrorTypes.AUTH_EXPIRED);
  }
  
  return new AppError(ErrorTypes.AUTH_INVALID, null, null, error);
};

/**
 * Validation error handler
 */
const handleValidationError = (validationResult, operation = 'validation') => {
  console.error(`Validation error during ${operation}:`, validationResult);
  
  const details = validationResult.errors || validationResult.details || null;
  return new AppError(ErrorTypes.VALIDATION_ERROR, 'Invalid input data', details);
};

module.exports = {
  ErrorTypes,
  ErrorMessages,
  ErrorStatusCodes,
  AppError,
  handleDatabaseError,
  handleAuthError,
  handleValidationError
};
