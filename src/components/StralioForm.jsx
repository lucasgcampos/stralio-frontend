import { useCallback } from 'react';
import { useStralioForm } from '../hooks/useStralioForm';
import { useFreighter } from '../hooks/useFreighter';
import { donate } from '../utils/stellar';
import { validateForm } from '../utils/validation';
import { MIN_DONATION, MAX_DONATION, MESSAGES } from '../config/constants';
import { Horizon } from "@stellar/stellar-sdk";
import FormField from './FormField';
import StatusMessage from './StatusMessage';

/**
 * StralioForm component
 * Main donation form with Freighter wallet integration
 */
const StralioForm = () => {
  const form = useStralioForm();
  const freighter = useFreighter();
  const { formData, charCounts } = form;

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Validate form
      const fieldErrors = validateForm(formData);
      const hasErrors = Object.values(fieldErrors).some((err) => err !== null);

      if (hasErrors) {
        form.markAllTouched();
        form.setErrors(fieldErrors);
        return;
      }

      // Start submission
      form.setSubmitting();
      freighter.clearError();

      try {
        const result = await donate(
          "GA2V3EN2ZZN2262CHL2GNO32T4EJDHN266FYTRYR2L7HOVUYQMMYXVJL",
          formData.amount,
          formData.username,
          formData.message        
        );

        if (result.success) {
          form.setSuccess();
          form.resetForm();
        }
      } catch (error) {
        // Error handled by useFreighter hook
        form.setSubmitting(false);
      }
    },
    [formData, form, freighter]
  );

  // Determine button state
  const isButtonDisabled = !form.isValid || form.isSubmitting || !freighter.isInstalled;

  // Get button text
  const getButtonText = () => {
    if (!freighter.isInstalled) return 'Install Freighter Wallet';
    if (form.isSubmitting) return 'Processing...';
    return 'Confirm Donation';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Wallet connection status */}
      {!freighter.isInstalled && (
        <StatusMessage
          type="error"
          message={MESSAGES.WALLET_NOT_INSTALLED}
          link={{
            text: 'Get Freighter Wallet',
            url: 'https://www.freighter.app/',
          }}
        />
      )}

      {!freighter.isConnected && freighter.isInstalled && (
        <div className="flex items-center justify-between p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
          <span className="text-sm text-blue-400">Wallet connected: {freighter.publicKey?.slice(0, 4)}...{freighter.publicKey?.slice(-4)}</span>
          <button
            type="button"
            onClick={freighter.disconnect}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}

      {/* Username field */}
      <FormField
        label="Username"
        name="username"
        type="text"
        value={formData.username}
        error={form.errors.username}
        touched={form.touched.username}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        placeholder="Enter your username"
        maxLength={30}
        showCounter
        disabled={form.isSubmitting}
      />

      {/* Message field */}
      <FormField
        label="Message"
        name="message"
        type="textarea"
        value={formData.message}
        error={form.errors.message}
        touched={form.touched.message}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        placeholder="Leave a message for the recipient (optional)"
        maxLength={200}
        showCounter
        rows={5}
        disabled={form.isSubmitting}
      />

      {/* Donation amount field */}
      <FormField
        label="Donation Amount (XLM)"
        name="amount"
        type="number"
        value={formData.amount}
        error={form.errors.amount}
        touched={form.touched.amount}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        placeholder={`Enter amount (${MIN_DONATION} - ${MAX_DONATION} XLM)`}
        disabled={form.isSubmitting}
      />

      {/* Status messages */}
      {freighter.error && (
        <StatusMessage
          type="error"
          message={freighter.error}
          onDismiss={freighter.clearError}
        />
      )}

      {form.isSuccess && (
        <StatusMessage
          type="success"
          message={MESSAGES.TRANSACTION_SUCCESS}
          link={{
            text: 'View on StellarExpert',
            url: `https://stellar.expert/explorer/public/tx/${form.transactionHash}`,
          }}
        />
      )}

      {form.isSubmitting && (
        <StatusMessage
          type="loading"
          message="Please confirm the transaction in your Freighter Wallet..."
        />
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isButtonDisabled}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-white
          transition-all duration-200 transform
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${
            isButtonDisabled
              ? 'bg-slate-600'
              : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 hover:scale-[1.02] active:scale-[0.98]'
          }
        `}
      >
        {getButtonText()}
      </button>
    </form>
  );
};

export default StralioForm;
