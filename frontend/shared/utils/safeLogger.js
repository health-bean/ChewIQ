/**
 * frontend/shared/utils/safeLogger.js
 * Safe logging utility that prevents sensitive data exposure
 */

/**
 * Determines if we're in production environment
 */
const isProduction = () => {
  return import.meta.env.VITE_APP_ENV === 'production';
};

/**
 * Sanitize data to remove sensitive information
 * @param {Object} data - Data to sanitize
 * @returns {Object} Sanitized data
 */
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveKeys = [
    'password', 'token', 'secret', 'key', 'auth', 'authorization',
    'jwt', 'refresh_token', 'access_token', 'bearer', 'api_key'
  ];

  const sanitized = { ...data };

  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    for (const key in obj) {
      const lowerKey = key.toLowerCase();
      
      // Remove sensitive keys
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = sanitizeObject(obj[key]);
      }
    }
    return obj;
  };

  return sanitizeObject(structuredClone(sanitized));
};

/**
 * Safe logger that respects environment and sanitizes sensitive data
 */
const safeLogger = {
  /**
   * Debug level logging - only in development
   */
  debug: (message, data) => {
    if (!isProduction()) {
      console.log(`[DEBUG] ${message}`, data ? sanitizeData(data) : '');
    }
  },

  /**
   * Info level logging - minimal in production
   */
  info: (message, data) => {
    if (!isProduction()) {
      console.info(`[INFO] ${message}`, data ? sanitizeData(data) : '');
    } else {
      // In production, only log the message without data
      console.info(`[INFO] ${message}`);
    }
  },

  /**
   * Warning level logging - shown in all environments
   */
  warn: (message, data) => {
    console.warn(`[WARN] ${message}`, data ? sanitizeData(data) : '');
  },

  /**
   * Error level logging - shown in all environments
   */
  error: (message, data) => {
    console.error(`[ERROR] ${message}`, data ? sanitizeData(data) : '');
  },

  /**
   * Special auth logging - extra careful with sensitive data
   */
  auth: (message, data) => {
    if (!isProduction()) {
      // In development, show sanitized auth data
      const sanitized = data ? sanitizeData(data) : {};
      
      // Extra protection for emails - only show first 2 chars
      if (sanitized.email && typeof sanitized.email === 'string') {
        sanitized.email = `${sanitized.email.substring(0, 2)}***@***`;
      }
      
      console.log(`[AUTH] ${message}`, sanitized);
    } else {
      // In production, just log that auth happened without details
      console.log(`[AUTH] ${message}`);
    }
  }
};

export default safeLogger;