/**
 * StatusMessage component
 * Displays success, error, or loading messages with appropriate styling
 */
const StatusMessage = ({ type, message, link, onDismiss }) => {
  const styles = {
    success: {
      container: 'bg-green-900/30 border-green-500/50 text-green-400',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      container: 'bg-red-900/30 border-red-500/50 text-red-400',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    loading: {
      container: 'bg-blue-900/30 border-blue-500/50 text-blue-400',
      icon: (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ),
    },
  };

  const style = styles[type] || styles.error;

  return (
    <div
      className={`flex items-start gap-3 p-4 border rounded-lg animate-fade-in ${style.container}`}
      role="alert"
    >
      <span className="flex-shrink-0">{style.icon}</span>
      <div className="flex-1">
        <p className="text-sm">{message}</p>
        {link && (
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline hover:no-underline mt-1 inline-block"
          >
            {link.text}
          </a>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default StatusMessage;
