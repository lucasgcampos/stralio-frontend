import CharacterCounter from './CharacterCounter';

/**
 * FormField component
 * Reusable form field with label, input, error display, and optional character counter
 */
const FormField = ({
  label,
  name,
  type = 'text',
  value,
  error,
  touched,
  onChange,
  onBlur,
  placeholder,
  maxLength,
  showCounter = false,
  disabled = false,
  rows = 3,
}) => {
  const showError = touched && error;

  const baseInputClasses = `
    w-full px-4 py-3 bg-slate-800 border rounded-lg text-white
    placeholder-slate-500 transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const errorClasses = showError
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
    : 'border-slate-600 hover:border-slate-500';

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-slate-300">
        {label}
      </label>

      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={rows}
            disabled={disabled}
            className={`${baseInputClasses} ${errorClasses} resize-none`}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            className={`${baseInputClasses} ${errorClasses}`}
          />
        )}

        {showCounter && maxLength && (
          <div className="absolute right-3 top-3">
            <CharacterCounter current={value?.length || 0} max={maxLength} />
          </div>
        )}
      </div>

      {showError && (
        <p className="text-sm text-red-400 animate-fade-in" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
