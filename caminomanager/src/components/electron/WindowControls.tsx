'use client';

import { useState, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';

export function WindowControls() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    if (!window.electronAPI) return;
    setIsElectron(true);

    window.electronAPI.windowIsMaximized().then(setIsMaximized);

    const removeListener = window.electronAPI.onMaximizedChange(setIsMaximized);
    return removeListener;
  }, []);

  if (!isElectron) return null;

  return (
    <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
      <button
        onClick={() => window.electronAPI?.windowMinimize()}
        className="inline-flex items-center justify-center w-[44px] h-[32px] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Minimizar"
      >
        <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>
      <button
        onClick={() => window.electronAPI?.windowMaximize()}
        className="inline-flex items-center justify-center w-[44px] h-[32px] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label={isMaximized ? 'Restaurar' : 'Maximizar'}
      >
        {isMaximized ? (
          <Copy className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
        ) : (
          <Square className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
        )}
      </button>
      <button
        onClick={() => window.electronAPI?.windowClose()}
        className="inline-flex items-center justify-center w-[44px] h-[32px] hover:bg-red-500 hover:text-white transition-colors group"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-white" />
      </button>
    </div>
  );
}
