import { useCallback } from 'react';
import { useStralioForm } from '../hooks/useStralioForm';
import { useWallet } from '../hooks/useWallet';
import { donate } from '../utils/stellar';
import { validateForm } from '../utils/validation';
import { MIN_DONATION, MAX_DONATION, MESSAGES } from '../config/constants';
import FormField from './FormField';
import StatusMessage from './StatusMessage';

const RECIPIENT = 'GA2V3EN2ZZN2262CHL2GNO32T4EJDHN266FYTRYR2L7HOVUYQMMYXVJL';

/**
 * StralioForm component
 * Donation form with multi-wallet support (desktop + mobile) via stellar-wallets-kit.
 */
const StralioForm = () => {
  const form = useStralioForm();
  const wallet = useWallet();
  const { formData } = form;

  const handleConnectWallet = useCallback(
    async (e) => {
      e.preventDefault();
      await wallet.connect();
    },
    [wallet]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // 1. Validate form fields
      const fieldErrors = validateForm(formData);
      const hasErrors = Object.values(fieldErrors).some((err) => err !== null);
      if (hasErrors) {
        form.markAllTouched();
        form.setErrors(fieldErrors);
        return;
      }

      // 2. Ensure wallet is connected (opens modal if not)
      if (!wallet.isConnected || !wallet.publicKey) {
        const result = await wallet.connect();
        if (!result.success) return;
      }

      // 3. Build, sign and submit
      form.setSubmitting(true);
      wallet.clearError();

      try {
        const result = await donate(
          wallet.publicKey,
          RECIPIENT,
          formData.amount,
          formData.username,
          formData.message,
          wallet.signTransaction
        );

        if (result.success) {
          form.setSuccess();
          form.resetForm();
        }
      } catch (error) {
        form.setSubmitting(false);
        const message = error?.message || MESSAGES.TRANSACTION_ERROR;
        form.setErrors({ submit: message });
      }
    },
    [formData, form, wallet]
  );

  const isButtonDisabled = !form.isValid || form.isSubmitting;

  const getButtonText = () => {
    if (form.isSubmitting) return 'Processing...';
    if (!wallet.isConnected) return 'Connect Wallet & Donate';
    return 'Confirm Donation';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Wallet status bar */}
      {wallet.isConnected ? (
        <div className="flex items-center justify-between p-3 bg-blue-900/30 border border-blue-500/50 rounded-lg">
          <span className="text-sm text-blue-400">
            ● Connected: {wallet.publicKey?.slice(0, 6)}…{wallet.publicKey?.slice(-6)}
          </span>
          <button
            type="button"
            onClick={wallet.disconnect}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleConnectWallet}
          className="w-full py-3 px-4 rounded-lg border border-blue-500/60 text-blue-400 text-sm font-medium hover:bg-blue-900/30 transition-colors"
        >
          Connect Wallet (Freighter, Lobstr, mobile…)
        </button>
      )}

      {/* Form fields */}
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
      {wallet.error && (
        <StatusMessage
          type="error"
          message={wallet.error}
          onDismiss={wallet.clearError}
        />
      )}

      {form.errors.submit && !form.isSubmitting && (
        <StatusMessage
          type="error"
          message={form.errors.submit}
          onDismiss={() => form.setErrors({})}
        />
      )}

      {form.isSubmitting && (
        <StatusMessage
          type="loading"
          message="Please confirm the transaction in your wallet…"
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
