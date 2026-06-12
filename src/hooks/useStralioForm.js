import { useState, useCallback, useMemo } from 'react';
import { validateForm } from '../utils/validation';
import { USERNAME_MAX_LENGTH, MESSAGE_MAX_LENGTH } from '../config/constants';

const initialFormState = {
  username: '',
  message: '',
  amount: '',
};

/**
 * Hook for Stralio donation form state management
 * @returns {Object} - Form state, handlers, and validation status
 */
export const useStralioForm = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * Handle input change
   */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  /**
   * Handle input blur
   */
  const handleBlur = useCallback((e) => {
    const { name } = e.target;

    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate on blur
    const fieldErrors = validateForm(formData);
    if (fieldErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
    }
  }, [formData]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsSuccess(false);
  }, []);

  /**
   * Mark all fields as touched (for submit validation)
   */
  const markAllTouched = useCallback(() => {
    setTouched({
      username: true,
      message: true,
      amount: true,
    });
  }, []);

  /**
   * Check if form is valid
   */
  const isValid = useMemo(() => {
    const fieldErrors = validateForm(formData);
    return (
      formData.username.trim() !== '' &&
      formData.message.trim() !== '' &&
      formData.amount !== '' &&
      !fieldErrors.username &&
      !fieldErrors.message &&
      !fieldErrors.amount
    );
  }, [formData]);

  /**
   * Character counts
   */
  const charCounts = useMemo(() => ({
    username: formData.username.length,
    message: formData.message.length,
  }), [formData.username, formData.message]);

  return {
    // State
    formData,
    errors,
    touched,
    isSubmitting,
    isSuccess,
    isValid,
    charCounts,

    // Handlers
    handleChange,
    handleBlur,
    setSubmitting: (value = true) => setIsSubmitting(value),
    setSuccess: () => setIsSuccess(true),
    setErrors,
    resetForm,
    markAllTouched,
  };
};
