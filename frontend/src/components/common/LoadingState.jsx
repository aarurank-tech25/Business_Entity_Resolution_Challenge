import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading backend data...', rows = 3 }) => {
  return (
    <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-3 animate-spin">
        <Loader2 className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800">{message}</h4>
      <p className="text-xs text-slate-500 mt-1">Connecting to FastAPI service...</p>

      {rows > 0 && (
        <div className="w-full max-w-md mt-6 space-y-2.5">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="h-9 bg-slate-100 rounded-lg animate-pulse"
              style={{ opacity: 1 - i * 0.2 }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LoadingState;
