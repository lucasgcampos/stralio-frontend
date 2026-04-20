import StralioForm from './components/StralioForm';

/**
 * Stralio App
 * Donation form for Stellar network via Freighter Wallet
 */
function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Stralio</h1>
          <p className="text-slate-400">
            Send donations via the Stellar network
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
          <StralioForm />
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Powered by <span className="text-blue-400">Stellar</span> and{' '}
          <span className="text-cyan-400">Freighter</span>
        </p>
      </div>
    </div>
  );
}

export default App;
