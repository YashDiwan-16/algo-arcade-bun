interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-linear-to-br from-black via-gray-900 to-black text-white overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-20 -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 -bottom-48 -right-48 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center mb-8 px-4">
        {/* Logo/Title */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-block p-6 bg-linear-to-br from-cyan-500 to-cyan-600 rounded-full mb-6 shadow-2xl animate-bounce-slow">
            <svg
              className="w-20 h-20 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
          </div>
          <h1 className="text-7xl font-bold mb-4 bg-linear-to-r from-cyan-400 via-cyan-300 to-cyan-400 bg-clip-text text-transparent animate-gradient">
            Slither.io
          </h1>
          <p className="text-2xl text-gray-300 mb-2">Enter the Arena</p>
          <p className="text-lg text-cyan-400 animate-pulse">
            Compete, Grow, Dominate!
          </p>
        </div>

        {/* Start Button */}
        <div className="mb-8 animate-fade-in-delay">
          <button
            onClick={onStart}
            className="group relative px-12 py-4 text-2xl bg-linear-to-r from-cyan-500 to-cyan-600 text-white font-bold rounded-full hover:from-cyan-400 hover:to-cyan-500 transition-all transform hover:scale-110 shadow-2xl hover:shadow-cyan-500/50 animate-pulse-slow"
          >
            <span className="relative z-10">🚀 Start Game</span>
            <div className="absolute inset-0 rounded-full bg-linear-to-r from-cyan-400 to-cyan-500 blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </div>
    </div>
  );
}
