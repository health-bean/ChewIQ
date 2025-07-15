/**
 * Input validation utilities for health platform
 * SECURITY: Prevents injection attacks and ensures data integrity
 */

const { AppError, ErrorTypes } = require('./errorTypes');

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate UUID format
 */
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate date format (YYYY-MM-DD)
 */
const isValidDate = (dateString) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Validate time format (HH:MM or HH:MM:SS)
 */
const isValidTime = (timeString) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  return timeRegex.test(timeString);
};

/**
 * Sanitize string input (remove potentially dangerous characters)
 */
const sanitizeString = (input, maxLength = 1000) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>\"'&]/g, ''); // Remove potentially dangerous characters
};

/**
 * Validate and sanitize user input for timeline entries
 */
const validateTimelineEntry = (data) => {
  const errors = [];
  
  // Required fields
  if (!data.entry_type) {
    errors.push('entry_type is required');
  } else if (!['symptom', 'food', 'supplement', 'medication', 'detox', 'exposure'].includes(data.entry_type)) {
    errors.push('entry_type must be one of: symptom, food, supplement, medication, detox, exposure');
  }
  
  if (!data.entry_time) {
    errors.push('entry_time is required');
  } else if (!isValidTime(data.entry_time)) {
    errors.push('entry_time must be in HH:MM format');
  }
  
  if (!data.content) {
    errors.push('content is required');
  }
  
  // Optional fields validation
  if (data.severity !== undefined) {
    const severity = parseInt(data.severity);
    if (isNaN(severity) || severity < 1 || severity > 10) {
      errors.push('severity must be a number between 1 and 10');
    }
  }
  
  if (errors.length > 0) {
    throw new AppError(ErrorTypes.VALIDATION_ERROR, 'Invalid timeline entry data', errors);
  }
  
  // Return sanitized data
  return {
    entry_type: data.entry_type,
    entry_time: data.entry_time,
    content: typeof data.content === 'object' ? data.content : { name: sanitizeString(data.content) },
    severity: data.severity ? parseInt(data.severity) : null
  };
};

/**
 * Validate user registration data
 */
const validateUserRegistration = (data) => {
  const errors = [];
  
  if (!data.email) {
    errors.push('email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('email must be a valid email address');
  }
  
  if (!data.password) {
    errors.push('password is required');
  } else if (data.password.length < 8) {
    errors.push('password must be at least 8 characters long');
  }
  
  if (!data.first_name) {
    errors.push('first_name is required');
  } else if (data.first_name.length < 1 || data.first_name.length > 100) {
    errors.push('first_name must be between 1 and 100 characters');
  }
  
  if (!data.last_name) {
    errors.push('last_name is required');
  } else if (data.last_name.length < 1 || data.last_name.length > 100) {
    errors.push('last_name must be between 1 and 100 characters');
  }
  
  if (data.user_type && !['patient', 'practitioner'].includes(data.user_type)) {
    errors.push('user_type must be either patient or practitioner');
  }
  
  if (errors.length > 0) {
    throw new AppError(ErrorTypes.VALIDATION_ERROR, 'Invalid registration data', errors);
  }
  
  return {
    email: data.email.toLowerCase().trim(),
    password: data.password,
    first_name: sanitizeString(data.first_name, 100),
    last_name: sanitizeString(data.last_name, 100),
    user_type: data.user_type || 'patient'
  };
};

/**
 * Validate user preferences data
 */
const validateUserPreferences = (data) => {
  if (!data || typeof data !== 'object') {
    throw new AppError(ErrorTypes.VALIDATION_ERROR, 'Preferences must be an object');
  }
  
  // Ensure preferences don't contain dangerous data
  const allowedKeys = [
    'protocols', 'quick_supplements', 'quick_medications', 
    'quick_foods', 'quick_symptoms', 'quick_detox', 'setup_complete'
  ];
  
  const sanitizedPreferences = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (allowedKeys.includes(key)) {
      sanitizedPreferences[key] = value;
    }
  }
  
  return sanitizedPreferences;
};

/**
 * Validate pagination parameters
 */
const validatePagination = (queryParams) => {
  const limit = parseInt(queryParams.limit) || 50;
  const offset = parseInt(queryParams.offset) || 0;
  
  return {
    limit: Math.min(Math.max(limit, 1), 100), // Between 1 and 100
    offset: Math.max(offset, 0) // Non-negative
  };
};

/**
 * Validate date range parameters
 */
const validateDateRange = (queryParams) => {
  const result = {};
  
  if (queryParams.start_date) {
    if (!isValidDate(queryParams.start_date)) {
      throw new AppError(ErrorTypes.VALIDATION_ERROR, 'start_date must be in YYYY-MM-DD format');
    }
    result.start_date = queryParams.start_date;
  }
  
  if (queryParams.end_date) {
    if (!isValidDate(queryParams.end_date)) {
      throw new AppError(ErrorTypes.VALIDATION_ERROR, 'end_date must be in YYYY-MM-DD format');
    }
    result.end_date = queryParams.end_date;
  }
  
  if (result.start_date && result.end_date && result.start_date > result.end_date) {
    throw new AppError(ErrorTypes.VALIDATION_ERROR, 'start_date must be before end_date');
  }
  
  return result;
};

module.exports = {
  isValidEmail,
  isValidUUID,
  isValidDate,
  isValidTime,
  sanitizeString,
  validateTimelineEntry,
  validateUserRegistration,
  validateUserPreferences,
  validatePagination,
  validateDateRange
};
