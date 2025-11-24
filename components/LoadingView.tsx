import React from 'react';

interface LoadingViewProps {
  status: string;
}

const LoadingView: React.FC<LoadingViewProps> = ({ status }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
        <div className="absolute inset-2 bg-primary/40 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-10 h-10 text-primary animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">Locating Relief...</h2>
      <p className="text-slate-500 max-w-xs">{status}</p>
    </div>
  );
};

export default LoadingView;