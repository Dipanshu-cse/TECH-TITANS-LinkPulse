import React from 'react';

// --- Added by Nikita: One-Time Burn Link Component ---
export default function BurnLinkToggle({ isBurnEnabled, setIsBurnEnabled }) {
  return (
    <div className="my-3 flex items-center gap-3 rounded-lg border border-purple-500/30 bg-gray-800/50 p-3">
      <input 
        type="checkbox" 
        id="burnToggle"
        checked={isBurnEnabled}
        onChange={(e) => setIsBurnEnabled(e.target.checked)}
        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
      />
      <div>
        <label htmlFor="burnToggle" className="cursor-pointer text-sm font-medium text-white">
          One-Time Burn Link (Self-Destruct)
        </label>
        <p className="text-xs text-gray-400">URL automatically deletes after 1 click to prevent data leaks.</p>
      </div>
    </div>
  );
}
