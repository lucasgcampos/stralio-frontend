/**
 * CharacterCounter component
 * Displays current/max characters with color coding near limit
 */
const CharacterCounter = ({ current, max, warningThreshold = 0.8 }) => {
  const percentage = current / max;
  const isWarning = percentage >= warningThreshold;
  const isOver = current > max;

  const getColorClass = () => {
    if (isOver) return 'text-red-400';
    if (isWarning) return 'text-yellow-400';
    return 'text-slate-400';
  };

  return (
    <span className={`text-xs ${getColorClass()} transition-colors duration-200`}>
      {current} / {max}
    </span>
  );
};

export default CharacterCounter;
