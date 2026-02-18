'use client';

import { useState, useEffect } from 'react';

interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  onUpdateAvailable: (callback: () => void) => () => void;
  onUpdateDownloaded: (callback: () => void) => () => void;
  installUpdate: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export function UpdateNotification() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!window.electronAPI) return;

    const removeListener = window.electronAPI.onUpdateDownloaded(() => {
      setUpdateReady(true);
    });

    return removeListener;
  }, []);

  if (!updateReady) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-amber-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
      <span className="text-sm font-medium">
        Actualización disponible
      </span>
      <button
        onClick={() => window.electronAPI?.installUpdate()}
        className="bg-white text-amber-700 px-3 py-1 rounded text-sm font-medium hover:bg-amber-50 transition-colors"
      >
        Reiniciar
      </button>
    </div>
  );
}
