import { MIN_DONATION, MAX_DONATION, USERNAME_MAX_LENGTH, MESSAGE_MAX_LENGTH } from '../config/constants';

/**
 * Validate username field
 * @param {string} value - The username value
 * @returns {string|null} - Error message or null if valid
 */
export const validateUsername = (value) => {
  if (!value || value.trim() === '') {
    return 'Username is required';
  }
  if (value.length > USERNAME_MAX_LENGTH) {
    return `Username must be ${USERNAME_MAX_LENGTH} characters or less`;
  }
  return null;
};

/**
 * Validate message field
 * @param {string} value - The message value
 * @returns {string|null} - Error message or null if valid
 */
export const validateMessage = (value) => {
  if (!value || value.trim() === '') {
    return 'Message is required';
  }
  if (value.length > MESSAGE_MAX_LENGTH) {
    return `Message must be ${MESSAGE_MAX_LENGTH} characters or less`;
  }
  return null;
};

/**
 * Validate donation amount field
 * @param {string|number} value - The amount value
 * @returns {string|null} - Error message or null if valid
 */
export const validateAmount = (value) => {
  if (value === '' || value === null || value === undefined) {
    return 'Donation amount is required';
  }

  const numValue = Number(value);

  if (isNaN(numValue)) {
    return 'Please enter a valid number';
  }

  if (numValue < MIN_DONATION) {
    return `Minimum donation is ${MIN_DONATION} XLM`;
  }

  if (numValue > MAX_DONATION) {
    return `Maximum donation is ${MAX_DONATION} XLM`;
  }

  return null;
};

/**
 * Validate all form fields
 * @param {Object} formData - Form data object with username, message, amount
 * @returns {Object} - Object with error messages for each field
 */
export const validateForm = (formData) => {
  return {
    username: validateUsername(formData.username),
    message: validateMessage(formData.message),
    amount: validateAmount(formData.amount),
  };
};
